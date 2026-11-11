import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '🥗', title: 'Personalized nutrition', text: 'Plans built around your body, goals and allergies.' },
  { icon: '🍎', title: 'Healthy eating habits', text: 'Small daily choices that last.' },
  { icon: '🔥', title: 'Daily calorie tracking', text: 'Know exactly what your body needs each day.' },
  { icon: '💪', title: 'Fitness & weight management', text: 'Lose, maintain, gain or build muscle.' },
];

export default function Intro() {
  const { completeIntro } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.duration(700)} style={styles.hero}>
          <View style={styles.logo}>
            <Text style={{ fontSize: 40 }}>🥦</Text>
          </View>
          <Text style={styles.title}>ByteDiet</Text>
          <Text style={styles.subtitle}>Eat smarter. Track easier. Live healthier.</Text>
        </Animated.View>

        <View style={styles.list}>
          {FEATURES.map((f, i) => (
            <Animated.View key={f.title} entering={FadeInDown.delay(300 + i * 150).duration(600)} style={styles.card}>
              <Text style={styles.icon}>{f.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardText}>{f.text}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(1000).duration(600)} style={styles.actions}>
          <Button title="Get Started" onPress={() => completeIntro('signup')} />
          <Button title="I already have an account" variant="outline" onPress={() => completeIntro('login')} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  hero: { alignItems: 'center', marginTop: 16 },
  logo: { width: 84, height: 84, borderRadius: 26, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 36, fontWeight: '800', color: colors.primaryDark, marginTop: 12, letterSpacing: 0.5 },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 4 },
  list: { gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  icon: { fontSize: 28, marginRight: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardText: { fontSize: 13, color: colors.muted, marginTop: 2 },
  actions: { gap: 10 },
});
