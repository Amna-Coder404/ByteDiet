import AsyncStorage from '@react-native-async-storage/async-storage';

const INTRO_KEY = 'bytediet:introSeen';

export async function hasSeenIntro() {
  try {
    return (await AsyncStorage.getItem(INTRO_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function markIntroSeen() {
  try {
    await AsyncStorage.setItem(INTRO_KEY, 'true');
  } catch {}
}
