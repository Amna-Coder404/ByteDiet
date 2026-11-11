import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { colors } from '../../constants/theme';
import { ACTIVITY_LEVELS, ALLERGIES, DIETS, FITNESS_GOALS } from '../../constants/options';
import { useAuth } from '../../context/AuthContext';
import { getOnboardingData, saveNutritionGoals } from '../../services/onboardingService';

function Group({ title, error, children }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.chips}>{children}</View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default function Fitness() {
  const router = useRouter();
  const { user, refreshOnboarding } = useAuth();
  const [goal, setGoal] = useState('');
  const [activity, setActivity] = useState('');
  const [diet, setDiet] = useState('');
  const [dietOther, setDietOther] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [otherOn, setOtherOn] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOnboardingData(user.id)
      .then(({ goals }) => {
        if (!goals) return;
        setGoal(goals.fitness_goal ?? '');
        setActivity(goals.activity_level ?? '');
        const d = goals.dietary_preference ?? '';
        if (d && !DIETS.includes(d)) {
          setDiet('Other');
          setDietOther(d);
        } else setDiet(d);
        const saved = goals.allergies ?? [];
        setAllergies(saved.filter((a) => ALLERGIES.includes(a)));
        const custom = saved.filter((a) => !ALLERGIES.includes(a));
        if (custom.length) {
          setOtherOn(true);
          setOtherText(custom.join(', '));
        }
      })
      .catch(() => {});
  }, [user.id]);

  const toggleAllergy = (a) => setAllergies((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));

  const onFinish = async () => {
    const e = {};
    if (!goal) e.goal = 'Pick a fitness goal';
    if (!activity) e.activity = 'Pick an activity level';
    if (!diet) e.diet = 'Pick a dietary preference';
    if (otherOn && !otherText.trim()) e.other = 'Type your other allergy or turn Other off';
    setErrors(e);
    setFormError('');
    if (Object.keys(e).length) return;

    const customAllergies = otherOn ? otherText.split(',').map((s) => s.trim()).filter(Boolean) : [];
    setLoading(true);
    const res = await saveNutritionGoals(user.id, {
      fitnessGoal: goal,
      activityLevel: activity,
      dietaryPreference: diet === 'Other' && dietOther.trim() ? dietOther.trim() : diet,
      allergies: [...allergies, ...customAllergies],
    });
    if (!res.ok) {
      setLoading(false);
      return setFormError(res.error);
    }
    try {
      await refreshOnboarding();
    } catch {}
    setLoading(false);
    router.replace('/dashboard');
  };

  return (
    <Screen>
      <Text style={styles.step}>Step 2 of 2</Text>
      <Text style={styles.title}>Your goals</Text>
      <Text style={styles.sub}>Tell us how you want to eat and train.</Text>

      <Group title="Fitness goal" error={errors.goal}>
        {FITNESS_GOALS.map((g) => <Chip key={g} label={g} selected={goal === g} onPress={() => setGoal(g)} />)}
      </Group>

      <Group title="Activity level" error={errors.activity}>
        {ACTIVITY_LEVELS.map((a) => <Chip key={a} label={a} selected={activity === a} onPress={() => setActivity(a)} />)}
      </Group>

      <Group title="Dietary preference" error={errors.diet}>
        {DIETS.map((d) => <Chip key={d} label={d} selected={diet === d} onPress={() => setDiet(d)} />)}
      </Group>
      {diet === 'Other' ? (
        <Input value={dietOther} onChangeText={setDietOther} placeholder="Describe your diet (optional)" />
      ) : null}

      <Group title="Allergies (select all that apply)">
        {ALLERGIES.map((a) => <Chip key={a} label={a} selected={allergies.includes(a)} onPress={() => toggleAllergy(a)} />)}
        <Chip label="Other" selected={otherOn} onPress={() => setOtherOn((v) => !v)} />
      </Group>
      {otherOn ? (
        <Input value={otherText} onChangeText={setOtherText} placeholder="Other allergies, comma separated" error={errors.other} />
      ) : null}

      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      <Button title="Finish setup" onPress={onFinish} loading={loading} style={{ marginTop: 8 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { color: colors.primary, fontWeight: '700', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  sub: { color: colors.muted, marginTop: 6, marginBottom: 22 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  error: { color: colors.error, fontSize: 12, marginTop: 2, marginBottom: 6 },
});
