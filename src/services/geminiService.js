import { supabase } from '../lib/supabase';

// Calls the "gemini" Supabase Edge Function. The Gemini key never touches the app.
export async function askGemini(prompt) {
  const { data, error } = await supabase.functions.invoke('gemini', { body: { prompt } });
  if (error) {
    let msg = error.message || 'AI request failed';
    try {
      const body = await error.context.json();
      if (body?.error) msg = body.error;
    } catch { }
    return { ok: false, error: msg };
  }
  if (data?.error) return { ok: false, error: data.error };
  if (!data?.text) return { ok: false, error: 'The AI returned an empty answer. Try again.' };
  return { ok: true, text: data.text.trim() };
}
function context(profile, goals, plan) {
  const allergies = goals.allergies?.length ? goals.allergies.join(', ') : 'none';
  return (
    `User: ${profile.age} years old, ${profile.gender}, ${profile.height_cm} cm, ${profile.current_weight_kg} kg.\n` +
    `Goal: ${goals.fitness_goal}. Activity: ${goals.activity_level}. Diet: ${goals.dietary_preference}. ` +
    `Allergies: ${allergies}.\n` +
    `Daily target: ${plan.calories} kcal, ${plan.protein} g protein, ${plan.carbs} g carbs, ${plan.fat} g fat.\n`
  );
}

const STYLE =
  'Reply in plain text only (no markdown symbols like * or #). Be concise and practical. ' +
  'Never include foods the user is allergic to or that break their diet. ';

export function buildMealPlanPrompt(profile, goals, plan) {
  return (
    'You are ByteDiet, a nutrition coach.\n' + context(profile, goals, plan) +
    'Create a one-day meal plan (breakfast, lunch, dinner, 2 snacks) close to the daily target. ' +
    'Give approximate kcal per meal and a total at the end. ' + STYLE
  );
}

export function buildQuestionPrompt(question, profile, goals, plan) {
  return (
    'You are ByteDiet, a nutrition coach. Not a doctor: for medical issues tell the user to see a professional.\n' +
    context(profile, goals, plan) + `Question: ${question}\n` + STYLE
  );
}
