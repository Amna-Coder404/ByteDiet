import { supabase } from '../lib/supabase';

const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

export async function addMeal(userId, meal) {
    const total = meal?.total ?? {};
    const { error } = await supabase.from('meals').insert({
        user_id: userId,
        description: String(meal?.meal_name || 'Meal').slice(0, 200),
        calories: Math.max(0, Math.round(num(total.calories))),
        protein_g: Math.max(0, num(total.protein_g)),
        carbs_g: Math.max(0, num(total.carbs_g)),
        fat_g: Math.max(0, num(total.fat_g)),
    });
    return error ? { ok: false, error: error.message } : { ok: true };
}

export async function getTodayMeals(userId) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .gte('eaten_at', start.toISOString())
        .order('eaten_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export async function deleteMeal(id) {
    const { error } = await supabase.from('meals').delete().eq('id', id);
    return error ? { ok: false, error: error.message } : { ok: true };
}

export function sumMeals(meals) {
    return meals.reduce(
        (t, m) => ({
            calories: t.calories + num(m.calories),
            protein: t.protein + num(m.protein_g),
            carbs: t.carbs + num(m.carbs_g),
            fat: t.fat + num(m.fat_g),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
}