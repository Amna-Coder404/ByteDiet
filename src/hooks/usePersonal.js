import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuth } from '../context/AuthContext';
import { getOnboardingData } from '../services/onboardingService';
import { saveProfileOfflineFirst } from '../services/offlineServices/syncService';
import { pending, isNetworkError } from '../services/offlineServices/offlineStore';
import { validatePersonal } from '../utils/validation';
import useNetwork from './offlineSupport/useNetwork';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function usePersonal() {
    const router = useRouter();
    const { mode } = useLocalSearchParams();
    const isEditing = mode === 'edit';

    const { user, refreshOnboarding } = useAuth();
    const { isOnline } = useNetwork();

    const [form, setForm] = useState({
        name: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
    });

    const [avatarUri, setAvatarUri] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [avatarMimeType, setAvatarMimeType] = useState('image/jpeg');

    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (key) => (value) => {
        setForm((current) => ({ ...current, [key]: value }));
    };

    // Load existing profile (server, or the copy saved on the phone)
    useEffect(() => {
        if (!user?.id) return;

        let active = true;

        getOnboardingData(user.id)
            .then(({ profile }) => {
                if (!active || !profile) return;

                setForm({
                    name: profile.name ?? '',
                    age: profile.age != null ? String(profile.age) : '',
                    gender: profile.gender ?? '',
                    height: profile.height_cm != null ? String(profile.height_cm) : '',
                    weight:
                        profile.current_weight_kg != null
                            ? String(profile.current_weight_kg)
                            : '',
                });

                setAvatarUrl(profile.avatar_url ?? null);
            })
            .catch((error) => {
                // first time + offline: nothing to load, not an error
                if (active && !isNetworkError(error.message)) {
                    setFormError(error.message);
                }
            });

        // photo that was picked offline and is not uploaded yet
        pending.get(user.id, 'profile').then((p) => {
            if (active && p?.avatarUri) {
                setAvatarUri(p.avatarUri);
                setAvatarMimeType(p.avatarMimeType || 'image/jpeg');
            }
        });

        return () => {
            active = false;
        };
    }, [user?.id]);

    // Select avatar from gallery
    const pickAvatar = async () => {
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert(
                    'Permission required',
                    'Please allow gallery access to select a profile picture.'
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled) return;

            const image = result.assets[0];
            const mimeType = image.mimeType || 'image/jpeg';

            if (!ALLOWED_TYPES.includes(mimeType)) {
                Alert.alert('Unsupported image', 'Please select a JPG, PNG or WebP image.');
                return;
            }

            if (image.fileSize && image.fileSize > 5 * 1024 * 1024) {
                Alert.alert('Image too large', 'Please select an image smaller than 5 MB.');
                return;
            }

            setAvatarUri(image.uri);
            setAvatarMimeType(mimeType);
            setFormError('');
        } catch (error) {
            Alert.alert('Error', 'Unable to select image.');
        }
    };

    // Save profile (works offline)
    const onContinue = async () => {
        const validationErrors = validatePersonal(form);

        setErrors(validationErrors);
        setFormError('');

        if (Object.keys(validationErrors).length > 0) return;

        if (!user?.id) {
            setFormError('Your session has expired. Please log in again.');
            return;
        }

        setLoading(true);

        try {
            const res = await saveProfileOfflineFirst(
                user.id,
                {
                    name: form.name.trim(),
                    age: parseInt(form.age, 10),
                    gender: form.gender,
                    heightCm: Number(form.height),
                    weightKg: Number(form.weight),
                    avatarUri,
                    avatarMimeType,
                },
                isOnline !== false
            );

            if (!res.ok) {
                setFormError(res.error);
                return;
            }

            if (res.queued) {
                Alert.alert(
                    'Saved offline',
                    'Your changes are saved on this phone and will upload when you are back online.'
                );
            } else if (res.avatarUrl) {
                setAvatarUrl(res.avatarUrl);
                setAvatarUri(null);
            }

            if (isEditing) {
                try {
                    await refreshOnboarding();
                } catch { }
                router.replace('/dashboard');
            } else {
                router.push('/fitness');
            }
        } catch (error) {
            setFormError(error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const avatarSource = avatarUri || avatarUrl;

    const initial =
        form.name.trim().charAt(0).toUpperCase() ||
        user?.email?.charAt(0).toUpperCase() ||
        'U';

    return {
        isEditing,
        form,
        set,
        errors,
        formError,
        loading,
        avatarSource,
        initial,
        pickAvatar,
        onContinue,
    };
}