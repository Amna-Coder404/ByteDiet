import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors } from '../../constants/theme';
import { signIn } from '../../services/authService';
import { validateEmail } from '../../utils/validation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const e = {};
    const emailErr = validateEmail(email);
    if (emailErr) e.email = emailErr;
    if (!password) e.password = 'Password is required';
    setErrors(e);
    setFormError('');
    if (Object.keys(e).length) return;

    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (!res.ok) setFormError(res.error);
    // on success the gate in app/_layout.js redirects automatically
  };

  return (
    <Screen contentStyle={{ justifyContent: 'center' }}>
      <Text style={styles.title}>Welcome back 👋</Text>
      <Text style={styles.sub}>Log in to continue your ByteDiet journey.</Text>

      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" placeholder="you@example.com" error={errors.email} />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Your password" error={errors.password} />

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}
      <Button title="Log in" onPress={onSubmit} loading={loading} style={{ marginTop: 6 }} />

      <View style={styles.row}>
        <Text style={styles.muted}>New here? </Text>
        <Link href="/signup" replace asChild>
          <Pressable><Text style={styles.link}>Create an account</Text></Pressable>
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
