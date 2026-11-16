import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../../components/Screen';
import Loader from '../../components/Loader';
import NotFound from '../../components/NotFound';
import OfflineBanner from '../../components/OfflineBanner';
import TipCard from '../../components/TipCard';

import { useAuth } from '../../context/AuthContext';
import { getOnboardingData } from '../../services/onboardingService';
import { getTodayMeals, sumMeals } from '../../services/mealService';
import { cacheGet, cacheSet } from '../../services/offlineServices/cacheService';
import { useNetwork } from '../../hooks/offlineSupport/useNetwork';
import { calcPlan } from '../../utils/nutrition';
import { resolveAvatarUrl } from '../../utils/avatar';

import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { createStyles } from '../../styles/Dashboard.style';

// Local date like 2026-11-15, used so cached meals are only reused for the same day
function todayKey() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function MacroRow({ label, icon, value, eaten }) {
  const pct = value > 0 ? Math.min(100, (eaten / value) * 100) : 0;
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroIcon}>
        <Ionicons name={icon} size={18} color={colors.primaryDark} />
      </View>

      <View style={styles.macroBody}>
        <View style={styles.macroTop}>
          <Text style={styles.macroLabel}>{label}</Text>
          <Text style={styles.macroValue}>
            {Math.round(eaten)} / {value}g
          </Text>
        </View>

        <View style={styles.macroBar}>
          <View style={[styles.macroFill, { width: `${pct}%` }]} />
        </View>
      </View>
    </View>
  );
}

function ActionTile({ icon, title, subtitle, onPress, primary }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable onPress={onPress} style={[styles.tile, primary && styles.tilePrimary]}>
      <View style={[styles.tileIcon, primary && styles.tileIconPrimary]}>
        <Ionicons
          name={icon}
          size={22}
          color={primary ? colors.white : colors.primaryDark}
        />
      </View>
      <Text style={[styles.tileTitle, primary && styles.tileTitlePrimary]}>{title}</Text>
      <Text style={[styles.tileSub, primary && styles.tileSubPrimary]}>{subtitle}</Text>
    </Pressable>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isOnline } = useNetwork();

  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  const router = useRouter();
  const navigation = useNavigation();

  const [data, setData] = useState(null);
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState('');
  const [fromCache, setFromCache] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const avatarUrl = data?.profile?.avatar_url;

  const initial = (
    data?.profile?.name?.trim()?.charAt(0) ||
    user?.email?.charAt(0) ||
    'U'
  ).toUpperCase();

  // Profile + goals: show saved data first, then refresh when online
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      let active = true;
      const key = `dashboard:${user.id}`;

      (async () => {
        const cached = await cacheGet(key);
        if (!active) return;

        if (cached?.value) {
          setData(cached.value);
          setLastSynced(cached.savedAt);
          setError('');
        }

        // Offline: keep whatever is saved
        if (isOnline === false) {
          setFromCache(!!cached);
          if (!cached) setError('You are offline and there is no saved data yet. Connect to the internet once to get started.');
          return;
        }

        try {
          const result = await getOnboardingData(user.id);
          if (!active) return;
          setData(result);
          setError('');
          setFromCache(false);
          setLastSynced(Date.now());
          cacheSet(key, result);
        } catch (err) {
          if (!active) return;
          if (cached?.value) {
            setFromCache(true); // request failed, keep showing saved data
          } else {
            setError(err.message || 'Unable to load dashboard.');
          }
        }
      })();

      return () => {
        active = false;
      };
    }, [user?.id, isOnline])
  );

  // Today's meals: same idea, saved per day
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      let active = true;
      const key = `meals:${user.id}:${todayKey()}`;

      (async () => {
        const cached = await cacheGet(key);
        if (active && cached?.value) setMeals(cached.value);

        if (isOnline === false) return;

        try {
          const result = await getTodayMeals(user.id);
          if (!active) return;
          setMeals(result);
          cacheSet(key, result);
        } catch (err) {
          console.error('[Meals Error]', err);
        }
      })();

      return () => {
        active = false;
      };
    }, [user?.id, isOnline])
  );

  // Avatar URL (needs internet; falls back to the initial letter when offline)
  useEffect(() => {
    let active = true;
    setAvatarFailed(false);
    setAvatarSrc(null);

    if (!avatarUrl || isOnline === false) return;

    resolveAvatarUrl(avatarUrl)
      .then((url) => {
        if (active) setAvatarSrc(url);
      })
      .catch(() => {
        if (active) setAvatarFailed(true);
      });

    return () => {
      active = false;
    };
  }, [avatarUrl, isOnline]);

  if (error && !data) {
    return (
      <Screen contentStyle={{ justifyContent: 'center' }}>
        <NotFound
          icon={
            <Ionicons
              name={isOnline === false ? 'cloud-offline-outline' : 'alert-circle-outline'}
              size={48}
              color={isOnline === false ? colors.muted : colors.error}
            />
          }
          text={error}
        />
      </Screen>
    );
  }

  if (!data?.profile || !data?.goals) return <Loader />;

  const { profile, goals } = data;
  const plan = calcPlan(profile, goals);
  const eaten = sumMeals(meals);

  const firstName = profile.name?.trim()?.split(' ')[0] || 'there';
  const remaining = plan.calories - eaten.calories;
  const percentage =
    plan.calories > 0
      ? Math.min(100, Math.round((eaten.calories / plan.calories) * 100))
      : 0;

  const showAvatar = avatarSrc && !avatarFailed;
  const showOfflineBanner = isOnline === false || fromCache;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.top, { paddingTop: insets.top }]}>
          <View style={styles.shapeA} />
          <View style={styles.shapeB} />

          <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
            <View style={styles.avatarButton}>
              {showAvatar ? (
                <Image
                  source={{ uri: avatarSrc }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>{initial}</Text>
                </View>
              )}
            </View>

            <View style={styles.headerText}>
              <Text style={styles.subtitle}>Welcome back</Text>
              <Text style={styles.hello}>{firstName}</Text>
            </View>

            <Pressable
              onPress={() => navigation.openDrawer()}
              hitSlop={10}
              style={styles.settingsButton}
            >
              <Ionicons name="settings-outline" size={22} color={colors.white} />
            </Pressable>
          </Animated.View>
        </View>

        <View style={styles.content}>
          {/* Offline notice */}
          {showOfflineBanner && <OfflineBanner lastSynced={lastSynced} />}

          {/* Calories */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(350)}
            style={styles.hero}
          >
            <Text style={styles.heroLabel}>
              {remaining >= 0 ? 'Calories left' : 'Over target'}
            </Text>

            <Text style={styles.heroValue}>
              {Math.abs(Math.round(remaining))}
              <Text style={styles.heroUnit}> kcal</Text>
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${percentage}%` },
                  remaining < 0 && { backgroundColor: colors.error },
                ]}
              />
            </View>

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{Math.round(eaten.calories)}</Text>
                <Text style={styles.heroStatLabel}>Eaten</Text>
              </View>

              <View style={styles.heroDivider} />

              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{plan.calories}</Text>
                <Text style={styles.heroStatLabel}>Goal</Text>
              </View>

              <View style={styles.heroDivider} />

              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{percentage}%</Text>
                <Text style={styles.heroStatLabel}>Done</Text>
              </View>
            </View>
          </Animated.View>

          {/* Macros */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(350)}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Macros</Text>

            <MacroRow label="Protein" icon="barbell-outline" value={plan.protein} eaten={eaten.protein} />
            <MacroRow label="Carbs" icon="leaf-outline" value={plan.carbs} eaten={eaten.carbs} />
            <MacroRow label="Fat" icon="water-outline" value={plan.fat} eaten={eaten.fat} />
          </Animated.View>

          {/* Quick actions */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(350)}
            style={styles.tiles}
          >
            <ActionTile
              primary
              icon="sparkles-outline"
              title="AI Coach"
              subtitle={isOnline === false ? 'Needs internet' : 'Get your meal plan'}
              onPress={() => router.push('/ai-plan')}
            />

            <ActionTile
              icon="time-outline"
              title="History"
              subtitle={isOnline === false ? 'Needs internet' : 'All your meals'}
              onPress={() => router.push('/history')}
            />
          </Animated.View>

          {/* Daily tip (works offline) */}
          <Animated.View entering={FadeInDown.delay(400).duration(350)}>
            <TipCard />
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}