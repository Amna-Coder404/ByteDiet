import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  Stack,
  useRouter,
  useSegments,
  useGlobalSearchParams,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import AnimatedSplashScreen from '../components/AnimatedSplashScreen';
import useSync from '../hooks/offlineSupport/useSync';

function Gate() {

  const { colors, isDark } = useTheme();

  useSync();

  const {
    ready,
    session,
    introSeen,
    authEntry,
    onboarding,
  } = useAuth();

  const segments = useSegments();
  const params = useGlobalSearchParams();
  const router = useRouter();

  const [splashDone, setSplashDone] = useState(false);

  const group = segments[0];
  const isEditMode = params.mode === 'edit';

  useEffect(() => {
    if (!ready) return;

    // 1. User is not logged in
    if (!session) {
      if (!introSeen) {
        if (group !== 'intro') {
          router.replace('/intro');
        }
      } else if (group !== '(auth)') {
        router.replace(
          authEntry === 'signup' ? '/signup' : '/login'
        );
      }
      return;
    }

    // 2. User has not completed onboarding
    if (!onboarding.complete) {
      if (group !== '(onboarding)') {
        router.replace(
          onboarding.profileDone ? '/fitness' : '/personal'
        );
      }
      return;
    }

    // 3. Completed user can edit existing information
    if (group === '(onboarding)' && isEditMode) {
      return;
    }

    // 4. Completed user should normally access the app
    if (group !== '(app)') {
      router.replace('/dashboard');
    }
  }, [
    ready,
    session,
    introSeen,
    authEntry,
    onboarding,
    group,
    isEditMode,
  ]);

  return (
    <>
      <StatusBar
        style={splashDone ? (isDark ? 'light' : 'dark') : 'light'}
        translucent
      />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.bg,
          },
        }}
      />

      {/* Animated splash plays first, on top of the app */}
      {!splashDone && (
        <AnimatedSplashScreen onFinish={() => setSplashDone(true)} />
      )}

      {/* Fallback: splash finished but auth is still loading */}
      {splashDone && !ready && (
        <View style={[styles.loading, { backgroundColor: colors.bg }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});