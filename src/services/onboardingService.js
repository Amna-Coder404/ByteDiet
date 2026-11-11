import { supabase } from '../lib/supabase';

const has = (v) => v !== null && v !== undefined && String(v).trim() !== '';

export async function getOnboardingData(userId) {
  const [p, g] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('nutrition_goals').select('*').eq('user_id', userId).maybeSingle(),
  ]);
  if (p.error) throw p.error;
  if (g.error) throw g.error;
  return { profile: p.data, goals: g.data };
}

export async function getOnboardingStatus(userId) {
  const { profile, goals } = await getOnboardingData(userId);
  const profileDone = !!profile && ['name', 'age', 'gender', 'height_cm', 'current_weight_kg'].every((k) => has(profile[k]));
  const goalsDone = !!goals && ['fitness_goal', 'activity_level', 'dietary_preference'].every((k) => has(goals[k]));
  return { profileDone, goalsDone, complete: profileDone && goalsDone };
}

export async function saveProfile(userId, { name, age, gender, heightCm, weightKg }) {
  const { error } = await supabase.from('profiles').upsert(
    { user_id: userId, name, age, gender, height_cm: heightCm, current_weight_kg: weightKg },
    { onConflict: 'user_id' }
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function saveNutritionGoals(userId, { fitnessGoal, activityLevel, dietaryPreference, allergies }) {
  const { error } = await supabase.from('nutrition_goals').upsert(
    {
      user_id: userId,
      fitness_goal: fitnessGoal,
      activity_level: activityLevel,
      dietary_preference: dietaryPreference,
      allergies,
    },
    { onConflict: 'user_id' }
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}
