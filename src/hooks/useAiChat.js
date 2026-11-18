import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { getOnboardingData } from '../services/onboardingService';
import { addMeal, getTodayMeals, sumMeals } from '../services/mealService';
import {
    analyzeMeal,
    buildSystemPrompt,
    chatWithAI,
} from '../services/geminiService';
import { calcPlan } from '../utils/nutrition';

const roundCalories = (value) => Math.round(Number(value) || 0);

// Default prompt suggestions
const POOL = [
    'How many calories do I have left today?',
    'Meal ideas for dinner',
    'High-protein snack ideas',
    'Quick breakfast ideas under 400 calories',
    'How much protein should I eat today?',
    'Healthy lunch ideas for work',
    'Low-carb dinner options',
    'Suggest a post-workout meal',
];

// New random 3 every time the app loads this file
export const SUGGESTIONS = [...POOL].sort(() => Math.random() - 0.5).slice(0, 3);

// Detects: "I eat apple", "Ieat apple", "I ate 2 rotis", "I'm eating rice", "I drank milk",
// "add this to my meal", "maine apple khaya", "chai pi li"
const MEAL_LOG_REGEX =
    /\b(i\s*(?:['’]m|['’]ve|am|have|just)?\s*(?:ate|eat|eaten|eating|had|drank|drink|drinking)|add\s+(?:this|it)|log\s+(?:this|it)|add\s+to\s+(?:my\s+)?(?:meal|meals|today|diary)|khaya|khayi|khaye|kha\s+li(?:ya)?|khaa\s+li(?:ya)?|kha\s+lia|kha\s+raha|kha\s+rahi|piya|pi\s+li(?:ya)?)\b/i;

const looksLikeMealLog = (text) => {
    const value = (text || '').trim();

    // Questions like "Can I eat an apple?" should go to normal chat
    if (value.endsWith('?')) return false;

    return MEAL_LOG_REGEX.test(value);
};

export function useAiChat(userId) {
    const idRef = useRef(1);
    const nextId = () => String(idRef.current++);

    const [ctx, setCtx] = useState(null);
    const [eaten, setEaten] = useState(0);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [image, setImage] = useState(null);
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load user nutrition context and today's meals
    useEffect(() => {
        if (!userId) return;

        let active = true;

        const loadData = async () => {
            setLoading(true);

            try {
                const [{ profile, goals }, meals] = await Promise.all([
                    getOnboardingData(userId),
                    getTodayMeals(userId),
                ]);
                if (!active) return;

                if (!profile || !goals) {
                    throw new Error('Please complete your nutrition onboarding first.');
                }

                const plan = calcPlan(profile, goals);

                setCtx({ profile, goals, plan });
                setEaten(sumMeals(meals).calories);

                const firstName = profile.name?.split(' ')[0] || 'there';

                // Default message by model
                setMessages([
                    {
                        id: nextId(),
                        role: 'model',
                        local: true,
                        text: `Hi ${firstName}! 👋 Send me a photo of your meal or tell me what you ate (like "I ate 2 rotis and dal") and I’ll estimate the calories. You can also ask me anything about your nutrition.`,
                    },
                ]);
            } catch (error) {
                if (!active) return;
                setMessages([
                    {
                        id: nextId(),
                        role: 'model',
                        local: true,
                        isError: true,
                        text: error.message || 'Could not load your nutrition data.',
                    },
                ]);
            } finally {
                if (active) setLoading(false);
            }
        };

        loadData();

        return () => {
            active = false;
        };
    }, [userId]);

    // Pick and compress a food image
    const pickImage = useCallback(async (camera = false) => {
        try {
            let result;

            if (camera) {
                // Ask for camera permission
                const permission = await ImagePicker.requestCameraPermissionsAsync();

                if (!permission.granted) {
                    Alert.alert(
                        'Camera permission needed',
                        'Allow camera access in your phone settings, or choose from the gallery.'
                    );
                    return;
                }

                result = await ImagePicker.launchCameraAsync({
                    quality: 0.5,
                });
            } else {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    quality: 0.5,
                });
            }

            // If cancelled, return nothing
            if (result.canceled || !result.assets?.[0]?.uri) return;

            const compressed = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 768 } }],
                {
                    compress: 0.6,
                    base64: true,
                    format: ImageManipulator.SaveFormat.JPEG,
                }
            );

            setImage({
                uri: compressed.uri,
                base64: compressed.base64,
                mimeType: 'image/jpeg',
            });
        } catch (error) {
            Alert.alert(
                'Could not open photo',
                error.message || 'Something went wrong.'
            );
        }
    }, []);

    // Show photo selection options
    const onPhoto = useCallback(() => {
        Alert.alert('Add a photo of your food', undefined, [
            {
                text: 'Take photo',
                onPress: () => pickImage(true),
            },
            {
                text: 'Choose from gallery',
                onPress: () => pickImage(false),
            },
            {
                text: 'Cancel',
                style: 'cancel',
            },
        ]);
    }, [pickImage]);

    // Prepare Gemini conversation history
    const prepareHistory = (history) => {
        let api = history
            .filter((message) => !message.local && !message.isError)
            .slice(-6)
            .map((message) => ({
                role: message.role,
                text: message.meal
                    ? `Meal analysis: ${message.meal.meal_name}, about ${roundCalories(message.meal.total?.calories)} kcal.`
                    : message.text,
            }))
            .filter((message) => message.text);

        // Gemini conversation must start with a user message
        while (api.length && api[0].role !== 'user') {
            api.shift();
        }

        // Merge consecutive messages with the same role
        return api.reduce((acc, message) => {
            const last = acc[acc.length - 1];

            if (last && last.role === message.role) {
                last.text += '\n' + message.text;
            } else {
                acc.push({ ...message });
            }

            return acc;
        }, []);
    };

    // Send text or image to Gemini
    const send = useCallback(async (override) => {
        const text = (
            typeof override === 'string' ? override : input
        ).trim();

        if ((!text && !image) || busy || !ctx || loading) return;

        const attachedImage = image;
        const hasPhoto = !!attachedImage;

        // Photo OR a text message that sounds like a meal log -> meal card
        const isMealLog = hasPhoto || looksLikeMealLog(text);

        const userMessage = {
            id: nextId(),
            role: 'user',
            text,
            image: attachedImage?.uri,
        };

        const history = [...messages, userMessage];

        setMessages(history);
        setInput('');
        setImage(null);
        setBusy(true);

        try {
            const system = buildSystemPrompt(
                ctx.profile,
                ctx.goals,
                ctx.plan,
                eaten
            );

            // Meal analysis (photo and/or text)
            if (isMealLog) {
                const result = await analyzeMeal(
                    {
                        role: 'user',
                        text: text || 'Estimate the calories in this meal.',
                        ...(hasPhoto && {
                            image: {
                                mimeType: attachedImage.mimeType,
                                data: attachedImage.base64,
                            },
                        }),
                    },
                    system
                );

                if (!result.ok) {
                    setMessages((current) => [
                        ...current,
                        {
                            id: nextId(),
                            role: 'model',
                            isError: true,
                            text: result.error,
                        },
                    ]);
                    return;
                }

                if (result.meal.is_food === false) {
                    setMessages((current) => [
                        ...current,
                        {
                            id: nextId(),
                            role: 'model',
                            text: result.meal.note || 'I could not find any food in that.',
                        },
                    ]);
                    return;
                }

                setMessages((current) => [
                    ...current,
                    {
                        id: nextId(),
                        role: 'model',
                        meal: result.meal,
                    },
                ]);

                return;
            }

            // Normal text-based AI chat
            const apiHistory = prepareHistory(history);
            const result = await chatWithAI(apiHistory, system);

            setMessages((current) => [
                ...current,
                {
                    id: nextId(),
                    role: 'model',
                    isError: !result.ok,
                    text: result.ok ? result.text : result.error,
                },
            ]);
        } catch (error) {
            setMessages((current) => [
                ...current,
                {
                    id: nextId(),
                    role: 'model',
                    isError: true,
                    text: error.message || 'Something went wrong. Please try again.',
                },
            ]);
        } finally {
            setBusy(false);
        }
    }, [input, image, busy, ctx, loading, messages, eaten]);

    // Save analyzed meal
    const logMeal = useCallback(async (message) => {
        if (!message.meal || message.logged) return;

        try {
            const result = await addMeal(userId, message.meal);

            if (!result.ok) {
                return Alert.alert('Could not save', result.error);
            }

            setMessages((current) =>
                current.map((item) =>
                    item.id === message.id
                        ? { ...item, logged: true }
                        : item
                )
            );

            setEaten((current) =>
                current + roundCalories(message.meal.total?.calories)
            );
        } catch (error) {
            Alert.alert('Could not save', error.message);
        }
    }, [userId]);

    const left = ctx
        ? ctx.plan.calories - eaten
        : 0;

    return {
        ctx,
        eaten,
        left,
        messages,
        input,
        setInput,
        image,
        setImage,
        busy,
        loading,
        send,
        pickImage,
        onPhoto,
        logMeal,
    };
}