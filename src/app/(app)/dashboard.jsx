import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { colors, radius } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { signOut } from '../../services/authService';
import { getOnboardingData } from '../../services/onboardingService';
import { calcPlan } from '../../utils/nutrition';

function Macro({ label, value, unit }) {
  return (
    <View style={styles.macro}>
      <Text style={styles.macroValue}>{value}<Text style={styles.macroUnit}>{unit}</Text></Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getOnboardingData(user.id)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [user.id]);

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
          // the gate redirects to login; the intro flag is untouched
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

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(500)}>
        <Text style={styles.hello}>Hello, {firstName} 👋</Text>
        <Text style={styles.goal}>Goal: {goals.fitness_goal}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.hero}>
        <Text style={styles.heroLabel}>Daily calorie target</Text>
        <Text style={styles.heroValue}>{plan.calories}<Text style={styles.heroUnit}> kcal</Text></Text>
        <View style={styles.bar}><View style={[styles.barFill, { width: '0%' }]} /></View>
        <Text style={styles.heroNote}>0 / {plan.calories} kcal eaten today · maintenance {plan.maintenance} kcal</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.card}>
        <Text style={styles.cardTitle}>Daily macros</Text>
        <View style={styles.macros}>
          <Macro label="Protein" value={plan.protein} unit="g" />
          <Macro label="Carbs" value={plan.carbs} unit="g" />
          <Macro label="Fat" value={plan.fat} unit="g" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(450).duration(500)} style={styles.card}>
        <Text style={styles.cardTitle}>Your body</Text>
        <Text style={styles.row}>BMI: <Text style={styles.bold}>{plan.bmi}</Text> ({plan.bmiLabel})</Text>
        <Text style={styles.row}>Height / weight: <Text style={styles.bold}>{profile.height_cm} cm · {profile.current_weight_kg} kg</Text></Text>
        <Text style={styles.row}>Activity: <Text style={styles.bold}>{goals.activity_level}</Text></Text>
        <Text style={styles.row}>Diet: <Text style={styles.bold}>{goals.dietary_preference}</Text></Text>
        <Text style={styles.row}>
          Allergies: <Text style={styles.bold}>{goals.allergies && goals.allergies.length ? goals.allergies.join(', ') : 'None'}</Text>
        </Text>
      </Animated.View>

      <Button title="✨ AI meal plan & coach" onPress={() => router.push('/ai-plan')} />

      <Text style={styles.disclaimer}>Estimates use the Mifflin-St Jeor formula and are not medical advice.</Text>
      <Button title="Log out" variant="outline" onPress={onLogout} loading={loggingOut} style={{ marginTop: 16 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hello: { fontSize: 26, fontWeight: '800', color: colors.text },
  goal: { color: colors.muted, marginTop: 4, marginBottom: 18 },
  hero: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: 22, marginBottom: 14 },
  heroLabel: { color: '#D1FAE5', fontWeight: '600' },
  heroValue: { color: colors.white, fontSize: 46, fontWeight: '800', marginTop: 4 },
  heroUnit: { fontSize: 18, fontWeight: '600' },
  bar: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 12, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: colors.white },
  heroNote: { color: '#D1FAE5', fontSize: 12, marginTop: 8 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  macros: { flexDirection: 'row', justifyContent: 'space-between' },
  macro: { flex: 1, alignItems: 'center', backgroundColor: colors.primaryLight, paddingVertical: 14, marginHorizontal: 4, borderRadius: radius.md },
  macroValue: { fontSize: 22, fontWeight: '800', color: colors.primaryDark },
  macroUnit: { fontSize: 13 },
  macroLabel: { color: colors.muted, marginTop: 2, fontSize: 12 },
  row: { color: colors.muted, marginBottom: 6 },
  bold: { color: colors.text, fontWeight: '600' },
  disclaimer: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 4 },
});
