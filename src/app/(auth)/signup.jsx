import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors } from '../../constants/theme';
import { signUp } from '../../services/authService';
import { validateEmail, validatePassword } from '../../utils/validation';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const e = {};
    const emailErr = validateEmail(email);
    const pwErr = validatePassword(password);
    if (emailErr) e.email = emailErr;
    if (pwErr) e.password = pwErr;
    if (!confirm) e.confirm = 'Confirm your password';
    else if (confirm !== password) e.confirm = 'Passwords do not match';
    setErrors(e);
    setFormError('');
    if (Object.keys(e).length) return;

    setLoading(true);
    const res = await signUp(email, password);
    setLoading(false);

    if (!res.ok) return setFormError(res.error);
    if (res.needsVerification) {
      Alert.alert('Verify your email', 'We sent you a confirmation link. Verify your email, then log in.');
      router.replace('/login');
    }
    // otherwise a session exists and the gate moves the user to onboarding
  };

  return (
    <Screen contentStyle={{ justifyContent: 'center' }}>
      <Text style={styles.title}>Create account 🌱</Text>
      <Text style={styles.sub}>Start your personalized nutrition plan.</Text>

      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" placeholder="you@example.com" error={errors.email} />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" error={errors.password} />
      <Input label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Repeat password" error={errors.confirm} />

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      <Button title="Sign up" onPress={onSubmit} loading={loading} style={{ marginTop: 6 }} />

      <View style={styles.row}>
        <Text style={styles.muted}>Already have an account? </Text>
        <Link href="/login" replace asChild>
          <Pressable><Text style={styles.link}>Log in</Text></Pressable>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  sub: { color: colors.muted, marginTop: 6, marginBottom: 24 },
  formError: { color: colors.error, marginBottom: 8, fontWeight: '500' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  muted: { color: colors.muted },
  link: { color: colors.primary, fontWeight: '700' },
});
