import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import AuthHeader from '../../components/AuthHeader';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { createStyles } from '../../styles/Auth.style';
import { signUp } from '../../services/authService';
import { validateEmail, validatePassword } from '../../utils/validation';

export default function Signup() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader title={'Create your\naccount'} />

        <View style={styles.body}>
          {/* Email */}
          <View style={[styles.field, errors.email && styles.fieldError]}>
            <Ionicons name="mail-outline" size={20} color={colors.muted} style={styles.fieldIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          {/* Password */}
          <View style={[styles.field, errors.password && styles.fieldError]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.muted} style={styles.fieldIcon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.muted}
              />
            </Pressable>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {/* Confirm password */}
          <View style={[styles.field, errors.confirm && styles.fieldError]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.muted} style={styles.fieldIcon} />
            <TextInput
              style={styles.input}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Confirm password"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={10}>
              <Ionicons
                name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.muted}
              />
            </Pressable>
          </View>
          {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Pressable
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign up</Text>}
          </Pressable>

          <View style={styles.row}>
            <Text style={styles.muted}>Already have an account? </Text>
            <Link href="/login" replace asChild>
              <Pressable>
                <Text style={styles.link}>Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}