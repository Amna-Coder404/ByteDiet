
// Add as many tips as you like. Each one is shown randomly on the dashboard.
// The list is also saved in AsyncStorage so it is available offline.
// After you add or edit tips, bump TIPS_VERSION so the saved copy refreshes.

import AsyncStorage from '@react-native-async-storage/async-storage';

export const TIPS_VERSION = 1;
const TIPS_KEY = 'bytediet:tips';

export const TIPS = [
    // Hydration
    { category: 'Hydration', text: 'Drink a glass of water before every meal. It helps you feel full and eat less.' },
    { category: 'Hydration', text: 'Thirst is often mistaken for hunger. Have some water first, then decide if you are still hungry.' },
    { category: 'Hydration', text: 'Keep a water bottle with you all day. Aim for 6–8 glasses.' },
    { category: 'Hydration', text: 'Swap sugary drinks for water, lemon water or unsweetened tea.' },

    // Eating habits
    { category: 'Eating', text: 'Eat slowly. It takes about 20 minutes for your brain to know you are full.' },
    { category: 'Eating', text: 'Never skip breakfast. A protein-rich start keeps your energy steady all morning.' },
    { category: 'Eating', text: 'Use a smaller plate. It makes your portions look bigger and helps you eat less.' },
    { category: 'Eating', text: 'Stop eating when you are 80% full. Do not wait until you feel stuffed.' },
    { category: 'Eating', text: 'Avoid eating in front of the TV or phone. Mindful eating prevents overeating.' },
    { category: 'Eating', text: 'Eat your last meal 2–3 hours before bed for better sleep and digestion.' },

    // Nutrition
    { category: 'Nutrition', text: 'Fill half your plate with vegetables. They are low in calories and high in fibre.' },
    { category: 'Nutrition', text: 'Add protein to every meal. Eggs, lentils, chicken and yogurt keep you full longer.' },
    { category: 'Nutrition', text: 'Choose whole grains like brown rice, oats and whole wheat roti over refined flour.' },
    { category: 'Nutrition', text: 'Eat a fruit instead of drinking juice. You get the fibre and fewer calories.' },
    { category: 'Nutrition', text: 'Healthy fats are good for you. Nuts, olive oil and avocado in small amounts are great choices.' },
    { category: 'Nutrition', text: 'Read food labels. Check the sugar and serving size before you buy.' },
    { category: 'Nutrition', text: 'Eat the rainbow. Different colored fruits and vegetables give you different nutrients.' },

    // Cravings & snacks
    { category: 'Snacks', text: 'Keep healthy snacks ready, like nuts, fruit or roasted chana, so you do not reach for junk food.' },
    { category: 'Snacks', text: 'Craving something sweet? Try dates, a banana or a small piece of dark chocolate.' },
    { category: 'Snacks', text: 'Do not shop when you are hungry. You will buy more unhealthy food.' },
    { category: 'Snacks', text: 'A treat once in a while is fine. One slice of cake will not ruin your progress.' },

    // Activity
    { category: 'Activity', text: 'A 30-minute walk every day makes a real difference to your health.' },
    { category: 'Activity', text: 'Take the stairs when you can. Small movements add up through the day.' },
    { category: 'Activity', text: 'A short walk after meals helps digestion and keeps blood sugar steady.' },
    { category: 'Activity', text: 'Stretch for 5 minutes in the morning to wake up your body.' },

    // Sleep & mindset
    { category: 'Lifestyle', text: 'Get 7–8 hours of sleep. Poor sleep increases hunger and cravings.' },
    { category: 'Lifestyle', text: 'Stress can cause emotional eating. Try deep breaths or a short walk before reaching for food.' },
    { category: 'Lifestyle', text: 'Progress is not perfect. If you have a bad day, just start fresh with your next meal.' },
    { category: 'Lifestyle', text: 'Plan your meals ahead. It saves time, money and bad food choices.' },
    { category: 'Lifestyle', text: 'Track your meals for a week. Awareness is the first step to change.' },
    { category: 'Lifestyle', text: 'Small habits beat big plans. Change one thing at a time and keep it going.' },
];

/**
 * Loads the tips from AsyncStorage (works offline).
 * If nothing is saved yet, or the saved version is old, the bundled list is saved and returned.
 */
export async function loadTips() {
    try {
        const raw = await AsyncStorage.getItem(TIPS_KEY);
        if (raw) {
            const saved = JSON.parse(raw);
            if (saved?.version === TIPS_VERSION && Array.isArray(saved.tips) && saved.tips.length) {
                return saved.tips;
            }
        }
        await AsyncStorage.setItem(TIPS_KEY, JSON.stringify({ version: TIPS_VERSION, tips: TIPS }));
    } catch (err) {
        console.warn('[tips] storage error', err);
    }
    return TIPS;
}

// Returns a random tip. Pass the current tip to avoid showing the same one twice in a row.
export function getRandomTip(current, list = TIPS) {
    if (list.length <= 1) return list[0];
    let next;
    do {
        next = list[Math.floor(Math.random() * list.length)];
    } while (current && next.text === current.text);
    return next;
}