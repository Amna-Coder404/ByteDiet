// Saves and reads data in AsyncStorage, with a clearCache() for logout

// src/services/cacheService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'bytediet:cache:';

/** Save any JSON-serialisable value together with the time it was saved. */
export async function cacheSet(key, value) {
    try {
        await AsyncStorage.setItem(
            PREFIX + key,
            JSON.stringify({ value, savedAt: Date.now() })
        );
    } catch (err) {
        console.warn('[cache] set failed', key, err);
    }
}

/** Returns { value, savedAt } or null when nothing is saved. */
export async function cacheGet(key) {
    try {
        const raw = await AsyncStorage.getItem(PREFIX + key);
        return raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.warn('[cache] get failed', key, err);
        return null;
    }
}

/** Remove every cached item. Call this on logout so the next user never sees old data. */
export async function clearCache() {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const mine = keys.filter((k) => k.startsWith(PREFIX));
        if (mine.length) await AsyncStorage.multiRemove(mine);
    } catch (err) {
        console.warn('[cache] clear failed', err);
    }
}