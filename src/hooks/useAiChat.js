
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

// suggenstions for defalt promets
export const SUGGESTIONS = [
    'How many calories do I have left today?',
    'Meal ideas for dinner',
    'High-protein snack ideas',
];

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
                        text: `Hi ${firstName}! 👋 Send me a photo of your meal and I’ll estimate the calories, or ask me anything about your nutrition.`,
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
                // ask for permissions 
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

            // result cancel ho gay then return nothing 
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
                text: message.meal ? `Meal analysis: ${message.meal.meal_name}, about ${roundCalories(message.meal.total?.calories)} kcal.`
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

            // Image-based meal analysis
            if (hasPhoto) {
                const result = await analyzeMeal(
                    {
                        role: 'user',
                        text: text || 'Estimate the calories in this meal.',
                        image: {
                            mimeType: attachedImage.mimeType,
                            data: attachedImage.base64,
                        },
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
                            text: result.meal.note || 'I could not see any food there.',
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
