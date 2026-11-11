import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { colors } from '../../constants/theme';
import { GENDERS } from '../../constants/options';
import { useAuth } from '../../context/AuthContext';
import { getOnboardingData, saveProfile } from '../../services/onboardingService';
import { validatePersonal } from '../../utils/validation';

export default function Personal() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', age: '', gender: '', height: '', weight: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    getOnboardingData(user.id)
      .then(({ profile }) => {
        if (!profile) return;
        setForm({
          name: profile.name ?? '',
          age: profile.age != null ? String(profile.age) : '',
          gender: profile.gender ?? '',
          height: profile.height_cm != null ? String(profile.height_cm) : '',
          weight: profile.current_weight_kg != null ? String(profile.current_weight_kg) : '',
        });
      })
      .catch(() => {});
  }, [user.id]);

  const onContinue = async () => {
    const e = validatePersonal(form);
    setErrors(e);
    setFormError('');
    if (Object.keys(e).length) return;

    setLoading(true);
    const res = await saveProfile(user.id, {
      name: form.name.trim(),
      age: parseInt(form.age, 10),
      gender: form.gender,
      heightCm: Number(form.height),
      weightKg: Number(form.weight),
    });
    setLoading(false);
    if (!res.ok) return setFormError(res.error);
    router.push('/fitness');
  };

  return (
    <Screen>
      <Text style={styles.step}>Step 1 of 2</Text>
      <Text style={styles.title}>About you</Text>
      <Text style={styles.sub}>We use this to calculate your daily needs.</Text>

      <Input label="Full name" value={form.name} onChangeText={set('name')} autoCapitalize="words" placeholder="Your name" error={errors.name} />
      <Input label="Age" value={form.age} onChangeText={set('age')} keyboardType="number-pad" placeholder="e.g. 22" error={errors.age} />

      <Text style={styles.label}>Gender</Text>
      <View style={styles.chips}>
        {GENDERS.map((g) => (
          <Chip key={g} label={g} selected={form.gender === g} onPress={() => set('gender')(g)} />
        ))}
      </View>
      {errors.gender ? <Text style={styles.error}>{errors.gender}</Text> : null}

      <Input label="Height (cm)" value={form.height} onChangeText={set('height')} keyboardType="decimal-pad" placeholder="e.g. 165" error={errors.height} />
      <Input label="Current weight (kg)" value={form.weight} onChangeText={set('weight')} keyboardType="decimal-pad" placeholder="e.g. 60" error={errors.weight} />

      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      <Button title="Continue" onPress={onContinue} loading={loading} style={{ marginTop: 8 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { color: colors.primary, fontWeight: '700', marginBottom: 6 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  sub: { color: colors.muted, marginTop: 6, marginBottom: 22 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  error: { color: colors.error, fontSize: 12, marginBottom: 8 },
});
