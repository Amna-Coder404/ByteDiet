import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';

function Gate() {
  const { ready, session, introSeen, authEntry, onboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const group = segments[0];

  useEffect(() => {
    if (!ready) return;

    if (!session) {
      if (!introSeen) {
        if (group !== 'intro') router.replace('/intro');
      } else if (group !== '(auth)') {
        router.replace(authEntry === 'signup' ? '/signup' : '/login');
      }
      return;
    }

    if (!onboarding.complete) {
      if (group !== '(onboarding)') router.replace(onboarding.profileDone ? '/fitness' : '/personal');
      return;
    }

    if (group !== '(app)') router.replace('/dashboard');
  }, [ready, session, introSeen, authEntry, onboarding, group]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
      {!ready && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});
