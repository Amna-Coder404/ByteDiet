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

export async function deleteMeal(userId, id) {
    const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

    return error
        ? { ok: false, error: error.message }
        : { ok: true };
}

export function sumMeals(meals = []) {
    return (Array.isArray(meals) ? meals : []).reduce(
        (total, meal) => ({
            calories: total.calories + num(meal.calories),
            protein: total.protein + num(meal.protein_g),
            carbs: total.carbs + num(meal.carbs_g),
            fat: total.fat + num(meal.fat_g),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
}


export async function getMealHistory(userId) {
    const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .order('eaten_at', { ascending: false })
        .limit(100);

    if (error) throw error;

    return data ?? [];
}

