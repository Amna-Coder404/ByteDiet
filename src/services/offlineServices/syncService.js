import { cache, pending, isNetworkError } from './offlineStore';
import {
    saveProfile,
    saveNutritionGoals,
    uploadAvatar,
} from '../onboardingService';

// ---------- build rows in the same shape as the database ----------
const profileRow = (userId, data, old, avatarUrl) => ({
    ...(old ?? {}),
    user_id: userId,
    name: data.name,
    age: data.age,
    gender: data.gender,
    height_cm: data.heightCm,
    current_weight_kg: data.weightKg,
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
});

const goalsRow = (userId, data, old) => ({
    ...(old ?? {}),
    user_id: userId,
    fitness_goal: data.fitnessGoal,
    activity_level: data.activityLevel,
    dietary_preference: data.dietaryPreference,
    allergies: data.allergies,
});

// ---------- send to Supabase ----------
async function pushProfile(userId, data) {
    let avatarUrl;

    if (data.avatarUri) {
        const up = await uploadAvatar(userId, data.avatarUri, data.avatarMimeType);
        if (!up.ok) return { ok: false, error: up.error };
        avatarUrl = up.url;
    }

    const res = await saveProfile(userId, {
        name: data.name,
        age: data.age,
        gender: data.gender,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        avatarUrl,
    });

    return res.ok
        ? { ok: true, avatarUrl }
        : { ok: false, error: res.error };
}

// ---------- save profile (online -> Supabase, offline -> queue) ----------
export async function saveProfileOfflineFirst(userId, data, isOnline = true) {
    if (isOnline) {
        const res = await pushProfile(userId, data);

        if (res.ok) {
            await pending.clear(userId, 'profile');
            const old = await cache.get(userId, 'profile');
            await cache.set(
                userId,
                'profile',
                profileRow(userId, data, old, res.avatarUrl)
            );
            return { ok: true, queued: false, avatarUrl: res.avatarUrl };
        }

        // a real error (not network): show it
        if (!isNetworkError(res.error)) return { ok: false, error: res.error };
    }

    // offline: keep on the phone, upload later
    const prev = await pending.get(userId, 'profile');
    const old = await cache.get(userId, 'profile');

    await cache.set(userId, 'profile', profileRow(userId, data, old));
    await pending.set(userId, 'profile', {
        ...data,
        avatarUri: data.avatarUri ?? prev?.avatarUri ?? null,
        avatarMimeType: data.avatarUri
            ? data.avatarMimeType
            : prev?.avatarMimeType ?? 'image/jpeg',
    });

    return { ok: true, queued: true };
}

// ---------- save goals ----------
export async function saveGoalsOfflineFirst(userId, data, isOnline = true) {
    if (isOnline) {
        const res = await saveNutritionGoals(userId, data);

        if (res.ok) {
            await pending.clear(userId, 'goals');
            const old = await cache.get(userId, 'goals');
            await cache.set(userId, 'goals', goalsRow(userId, data, old));
            return { ok: true, queued: false };
        }

        if (!isNetworkError(res.error)) return { ok: false, error: res.error };
    }

    const old = await cache.get(userId, 'goals');
    await cache.set(userId, 'goals', goalsRow(userId, data, old));
    await pending.set(userId, 'goals', data);

    return { ok: true, queued: true };
}

// ---------- run when the internet comes back ----------
export async function syncPending(userId) {
    let synced = false;

    const p = await pending.get(userId, 'profile');
    if (p) {
        const res = await pushProfile(userId, p);

        if (res.ok) {
            await pending.clear(userId, 'profile');

            if (res.avatarUrl) {
                const old = await cache.get(userId, 'profile');
                await cache.set(userId, 'profile', {
                    ...(old ?? {}),
                    avatar_url: res.avatarUrl,
                });
            }
            synced = true;
        }
    }

    const g = await pending.get(userId, 'goals');
    if (g) {
        const res = await saveNutritionGoals(userId, g);

        if (res.ok) {
            await pending.clear(userId, 'goals');
            synced = true;
        }
    }

    return synced;
}