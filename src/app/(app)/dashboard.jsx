import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { colors, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../services/authService';
import { getOnboardingData } from '../../services/onboardingService';
import { getTodayMeals, sumMeals } from '../../services/mealService';
import { calcPlan } from '../../utils/nutrition';

function Macro({ label, value, eaten }) {
  return (
    <View style={styles.macro}>
      <Text style={styles.macroValue}>{Math.round(eaten)}<Text style={styles.macroUnit}>/{value}g</Text></Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getOnboardingData(user.id).then(setData).catch((e) => setError(e.message));
  }, [user.id]);

  // reload today's meals every time this screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getTodayMeals(user.id).then((m) => active && setMeals(m)).catch(() => { });
      return () => {
        active = false;
      };
    }, [user.id])
  );

  const onLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          const res = await signOut();
          if (!res.ok) {
            setLoggingOut(false);
            Alert.alert('Error', res.error);
          }
        },
      },
    ]);
  };

  if (error) {
    return (
      <Screen contentStyle={{ justifyContent: 'center' }}>
        <Text style={{ color: colors.error, textAlign: 'center' }}>{error}</Text>
      </Screen>
    );
  }

  if (!data || !data.profile || !data.goals) {
    return (
      <Screen contentStyle={{ justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  const { profile, goals } = data;
  const plan = calcPlan(profile, goals);
  const firstName = profile.name.split(' ')[0];
  const eaten = sumMeals(meals);
  const left = plan.calories - eaten.calories;
  const pct = Math.min(100, Math.round((eaten.calories / plan.calories) * 100));

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(500)}>
        <Text style={styles.hello}>Hello, {firstName} 👋</Text>
        <Text style={styles.goal}>Goal: {goals.fitness_goal}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.hero}>
        <Text style={styles.heroLabel}>Calories today</Text>
        <Text style={styles.heroValue}>{Math.round(eaten.calories)}<Text style={styles.heroUnit}> / {plan.calories} kcal</Text></Text>
        <View style={styles.bar}><View style={[styles.barFill, { width: `${pct}%` }]} /></View>
        <Text style={styles.heroNote}>
          {left >= 0 ? `${Math.round(left)} kcal left today` : `${Math.round(-left)} kcal over your target`} · maintenance {plan.maintenance} kcal
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.card}>
        <Text style={styles.cardTitle}>Macros today (eaten / target)</Text>
        <View style={styles.macros}>
          <Macro label="Protein" value={plan.protein} eaten={eaten.protein} />
          <Macro label="Carbs" value={plan.carbs} eaten={eaten.carbs} />
          <Macro label="Fat" value={plan.fat} eaten={eaten.fat} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(420).duration(500)} style={styles.card}>
        <Text style={styles.cardTitle}>Today’s meals</Text>
        {meals.length === 0 ? (
          <Text style={styles.empty}>Nothing logged yet. Open the AI coach and send a photo of your meal.</Text>
        ) : (
          meals.map((m) => (
            <View key={m.id} style={styles.mealRow}>
              <Text style={styles.mealName} numberOfLines={1}>{m.description}</Text>
              <Text style={styles.mealKcal}>{m.calories} kcal</Text>
            </View>
          ))
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(540).duration(500)} style={styles.card}>
        <Text style={styles.cardTitle}>Your body</Text>
        <Text style={styles.row}>BMI: <Text style={styles.bold}>{plan.bmi}</Text> ({plan.bmiLabel})</Text>
        <Text style={styles.row}>Height / weight: <Text style={styles.bold}>{profile.height_cm} cm · {profile.current_weight_kg} kg</Text></Text>
        <Text style={styles.row}>Activity: <Text style={styles.bold}>{goals.activity_level}</Text></Text>
        <Text style={styles.row}>Diet: <Text style={styles.bold}>{goals.dietary_preference}</Text></Text>
        <Text style={styles.row}>
          Allergies: <Text style={styles.bold}>{goals.allergies && goals.allergies.length ? goals.allergies.join(', ') : 'None'}</Text>
        </Text>
      </Animated.View>

      <Button title="✨ AI coach & meal photo" onPress={() => router.push('/ai-plan')} />
      <Text style={styles.disclaimer}>Estimates use the Mifflin-St Jeor formula and AI photo guesses. Not medical advice.</Text>
      <Button title="Log out" variant="outline" onPress={onLogout} loading={loggingOut} style={{ marginTop: 16 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hello: { fontSize: 26, fontWeight: '800', color: colors.text },
  goal: { color: colors.muted, marginTop: 4, marginBottom: 18 },
  hero: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: 22, marginBottom: 14 },
  heroLabel: { color: '#D1FAE5', fontWeight: '600' },
  heroValue: { color: colors.white, fontSize: 42, fontWeight: '800', marginTop: 4 },
  heroUnit: { fontSize: 16, fontWeight: '600' },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 12, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: colors.white },
  heroNote: { color: '#D1FAE5', fontSize: 12, marginTop: 8 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  macros: { flexDirection: 'row', justifyContent: 'space-between' },
  macro: { flex: 1, alignItems: 'center', backgroundColor: colors.primaryLight, paddingVertical: 14, marginHorizontal: 4, borderRadius: radius.md },
  macroValue: { fontSize: 20, fontWeight: '800', color: colors.primaryDark },
  macroUnit: { fontSize: 12, fontWeight: '600' },
  macroLabel: { color: colors.muted, marginTop: 2, fontSize: 12 },
  empty: { color: colors.muted },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 8 },
  mealName: { flex: 1, color: colors.text },
  mealKcal: { color: colors.primaryDark, fontWeight: '700' },
  row: { color: colors.muted, marginBottom: 6 },
  bold: { color: colors.text, fontWeight: '600' },
  disclaimer: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 10 },
});