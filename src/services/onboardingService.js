
import { supabase } from '../lib/supabase';



import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

const AVATAR_BUCKET = 'avatars';

const has = (v) =>
  v !== null && v !== undefined && String(v).trim() !== '';

export async function getOnboardingData(userId) {
  const [p, g] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),

    supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  if (p.error) throw p.error;
  if (g.error) throw g.error;

  return {
    profile: p.data,
    goals: g.data,
  };
}

export async function getOnboardingStatus(userId) {
  const { profile, goals } = await getOnboardingData(userId);

  const profileDone =
    !!profile &&
    ['name', 'age', 'gender', 'height_cm', 'current_weight_kg']
      .every((key) => has(profile[key]));

  const goalsDone =
    !!goals &&
    ['fitness_goal', 'activity_level', 'dietary_preference']
      .every((key) => has(goals[key]));

  return {
    profileDone,
    goalsDone,
    complete: profileDone && goalsDone,
  };
}

// Upload profile avatar
export async function uploadAvatar(userId, uri, mimeType) {
  try {
    const type = mimeType || 'image/jpeg';

    const extensionMap = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    const extension = extensionMap[type];

    if (!extension) {
      return {
        ok: false,
        error: 'Only JPG, PNG and WebP images are supported.',
      };
    }

    // Read the local file as base64, then convert to real bytes
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const bytes = decode(base64);

    if (!bytes || bytes.byteLength === 0) {
      return { ok: false, error: 'Selected image is empty.' };
    }

    const filePath =
      `${userId}/avatar-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, bytes, {
        contentType: type,
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath);

    return {
      ok: true,
      url: data.publicUrl,
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || 'Avatar upload failed.',
    };
  }
}

// Save personal profile
export async function saveProfile(
  userId,
  {
    name,
    age,
    gender,
    heightCm,
    weightKg,
    avatarUrl,
  }
) {
  const profileData = {
    user_id: userId,
    name,
    age,
    gender,
    height_cm: heightCm,
    current_weight_kg: weightKg,
  };

  // Only update avatar when a new URL is supplied
  if (avatarUrl !== undefined) {
    profileData.avatar_url = avatarUrl;
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(profileData, {
      onConflict: 'user_id',
    });

  return error
    ? { ok: false, error: error.message }
    : { ok: true };
}

export async function saveNutritionGoals(
  userId,
  {
    fitnessGoal,
    activityLevel,
    dietaryPreference,
    allergies,
  }
) {
  const { error } = await supabase
    .from('nutrition_goals')
    .upsert(
      {
        user_id: userId,
        fitness_goal: fitnessGoal,
        activity_level: activityLevel,
        dietary_preference: dietaryPreference,
        allergies,
      },
      { onConflict: 'user_id' }
    );

  return error
    ? { ok: false, error: error.message }
    : { ok: true };
}
