import AsyncStorage from "@react-native-async-storage/async-storage";

const k = (type, userId, kind) => `bytediet:${type}:${userId}:${kind}`;

const read = async (key) => {
    try {
        const raw = await AsyncStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

const write = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value)); //that's store offlien data in async storage
    } catch { }
}

// Copy of the server rows (what the screens read when offline)
export const cache = {
    get: (userId, kind) => read(k('cache', userId, kind)),
    set: (userId, kind, value) => write(k('cache', userId, kind), value),
};

// Edits that are not on Supabase yet. kind = 'profile' | 'goals'

export const pending = {
    get: (userId, kind) => read(k('pending', userId, kind)),
    set: (userId, kind, value) => write(k('pending', userId, kind), value),
    clear: async (userId, kind) => {
        try {
            await AsyncStorage.removeItem(k('pending', userId, kind));
        } catch { }
    },
};

export const isNetworkError = (message = '') =>
    /network|fetch|timeout|timed out|offline|internet|connection/i.test(
        String(message)
    );