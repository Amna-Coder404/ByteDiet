
import { Text, View, Pressable } from 'react-native';

import { colors } from '../constants/theme';
import { styles } from '../styles/Ai_chat_ui.style';

const r = (n) => Math.round(Number(n) || 0);

export const MealCard = ({ meal, logged, onLog }) => {
    const total = meal.total ?? {};

    return (
        <View style={styles.meal}>
            <Text style={styles.mealTitle}>
                {meal.meal_name || 'Meal'}
            </Text>

            {(meal.items ?? []).map((it, i) => (
                <View key={i} style={styles.itemRow}>
                    <Text style={styles.itemName} numberOfLines={2}>
                        {it.name}
                        {it.portion ? ` (${it.portion})` : ''}
                    </Text>

                    <Text style={styles.itemKcal}>
                        {r(it.calories)} kcal
                    </Text>
                </View>
            ))}

            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalKcal}>
                    {r(total.calories)} kcal
                </Text>
            </View>

            <Text style={styles.macros}>
                P {r(total.protein_g)}g · C {r(total.carbs_g)}g · F {r(total.fat_g)}g
            </Text>

            {meal.note ? (
                <Text style={styles.note}>{meal.note}</Text>
            ) : null}

            <Pressable
                onPress={onLog}
                disabled={logged}
                style={[
                    styles.logBtn,
                    logged && { backgroundColor: colors.primaryLight },
                ]}
            >
                <Text
                    style={[
                        styles.logText,
                        logged && { color: colors.primaryDark },
                    ]}
                >
                    {logged ? '✓ Added to today' : 'Add to today’s log'}
                </Text>
            </Pressable>

            <Text style={styles.estimate}>
                Estimate only. Portions are guessed from the photo.
            </Text>
        </View>
    );
};
