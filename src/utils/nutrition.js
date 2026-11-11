const MULTIPLIERS = {
  'Sedentary': 1.2,
  'Lightly active': 1.375,
  'Moderately active': 1.55,
  'Very active': 1.725,
  'Extremely active': 1.9,
};
const GOAL_ADJUST = { 'Lose weight': -500, 'Maintain weight': 0, 'Gain weight': 400, 'Build muscle': 300 };

// Mifflin-St Jeor
export function calcBMR({ gender, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'Male') return base + 5;
  if (gender === 'Female') return base - 161;
  return base - 78;
}

export function calcPlan(profile, goals) {
  const weightKg = Number(profile.current_weight_kg);
  const heightCm = Number(profile.height_cm);
  const bmr = calcBMR({ gender: profile.gender, weightKg, heightCm, age: profile.age });
  const tdee = bmr * (MULTIPLIERS[goals.activity_level] ?? 1.2);
  const calories = Math.max(1200, Math.round(tdee + (GOAL_ADJUST[goals.fitness_goal] ?? 0)));

  const proteinPerKg = ['Build muscle', 'Lose weight'].includes(goals.fitness_goal) ? 1.8 : 1.6;
  const protein = Math.round(weightKg * proteinPerKg);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  let bmiLabel = 'Healthy range';
  if (bmi < 18.5) bmiLabel = 'Underweight';
  else if (bmi >= 30) bmiLabel = 'Obese range';
  else if (bmi >= 25) bmiLabel = 'Overweight';

  return { calories, protein, fat, carbs, bmi: Math.round(bmi * 10) / 10, bmiLabel, maintenance: Math.round(tdee) };
}
