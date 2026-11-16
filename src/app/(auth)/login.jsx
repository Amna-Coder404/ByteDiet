import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import AuthHeader from '../../components/AuthHeader';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { createStyles } from '../../styles/Auth.style';
import { signIn } from '../../services/authService';
import { validateEmail } from '../../utils/validation';

export default function Login() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    // on success the gate in app/_layout.jsx redirects automatically
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
        <AuthHeader title="Hello sign in" />

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


          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Pressable
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign in</Text>}
          </Pressable>

          <View style={styles.row}>
            <Text style={styles.muted}>Don't have account? </Text>
            <Link href="/signup" replace asChild>
              <Pressable>
                <Text style={styles.link}>Sign up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}