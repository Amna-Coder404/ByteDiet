import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ALLERGIES, DIETS } from '../constants/options';
import { useAuth } from '../context/AuthContext';
import { getOnboardingData } from '../services/onboardingService';
import { saveGoalsOfflineFirst } from '../services/offlineServices/syncService';
import useNetwork from './offlineSupport/useNetwork';

export default function useFitness() {
    const router = useRouter();
    const { mode } = useLocalSearchParams();
    const isEditing = mode === 'edit';

    const { user, refreshOnboarding } = useAuth();
    const { isOnline } = useNetwork();

    const [goal, setGoal] = useState('');
    const [activity, setActivity] = useState('');
    const [diet, setDiet] = useState('');
    const [dietOther, setDietOther] = useState('');
    const [allergies, setAllergies] = useState([]);
    const [otherOn, setOtherOn] = useState(false);
    const [otherText, setOtherText] = useState('');
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [loading, setLoading] = useState(false);

    // Load saved goals (server, or the copy saved on the phone)
    useEffect(() => {
        let active = true;

        getOnboardingData(user.id)
            .then(({ goals }) => {
                if (!active || !goals) return;

                setGoal(goals.fitness_goal ?? '');
                setActivity(goals.activity_level ?? '');

                const d = goals.dietary_preference ?? '';
                if (d && !DIETS.includes(d)) {
                    setDiet('Other');
                    setDietOther(d);
                } else {
                    setDiet(d);
                }

                const saved = goals.allergies ?? [];
                setAllergies(saved.filter((a) => ALLERGIES.includes(a)));

                const custom = saved.filter((a) => !ALLERGIES.includes(a));
                if (custom.length) {
                    setOtherOn(true);
                    setOtherText(custom.join(', '));
                }
            })
            .catch(() => { });

        return () => {
            active = false;
        };
    }, [user.id]);

    const toggleAllergy = (a) =>
        setAllergies((cur) =>
            cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]
        );

    const toggleOther = () => setOtherOn((v) => !v);

    const onFinish = async () => {
        const e = {};
        if (!goal) e.goal = 'Pick a fitness goal';
        if (!activity) e.activity = 'Pick an activity level';
        if (!diet) e.diet = 'Pick a dietary preference';
        if (otherOn && !otherText.trim()) {
            e.other = 'Type your other allergy or turn Other off';
        }

        setErrors(e);
        setFormError('');
        if (Object.keys(e).length) return;

        const customAllergies = otherOn
            ? otherText.split(',').map((s) => s.trim()).filter(Boolean)
            : [];

        setLoading(true);

        const res = await saveGoalsOfflineFirst(
            user.id,
            {
                fitnessGoal: goal,
                activityLevel: activity,
                dietaryPreference:
                    diet === 'Other' && dietOther.trim() ? dietOther.trim() : diet,
                allergies: [...allergies, ...customAllergies],
            },
            isOnline !== false

        );

        if (!res.ok) {
            setLoading(false);
            setFormError(res.error);
            return;
        }

        if (res.queued) {
            Alert.alert(
                'Saved offline',
                'Your goals are saved on this phone and will upload when you are back online.'
            );
        }

        try {
            await refreshOnboarding();
        } catch { }

        setLoading(false);
        router.replace('/dashboard');
    };

    return {
        isEditing,
        goal,
        setGoal,
        activity,
        setActivity,
        diet,
        setDiet,
        dietOther,
        setDietOther,
        allergies,
        toggleAllergy,
        otherOn,
        toggleOther,
        otherText,
        setOtherText,
        errors,
        formError,
        loading,
        onFinish,
    };
}