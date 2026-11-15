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

import { useAuth } from '../../context/AuthContext';
import { getOnboardingData } from '../../services/onboardingService';
import { getTodayMeals, sumMeals } from '../../services/mealService';
import { calcPlan } from '../../utils/nutrition';
import { resolveAvatarUrl } from '../../utils/avatar';

import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { createStyles } from '../../styles/Dashboard.style';

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

  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();

  const router = useRouter();
  const navigation = useNavigation();

  const [data, setData] = useState(null);
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState('');
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const avatarUrl = data?.profile?.avatar_url;

  const initial = (
    data?.profile?.name?.trim()?.charAt(0) ||
    user?.email?.charAt(0) ||
    'U'
  ).toUpperCase();

  // Profile + goals (reloads on focus)
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      let active = true;

      getOnboardingData(user.id)
        .then((result) => {
          if (active) {
            setData(result);
            setError('');
          }
        })
        .catch((err) => {
          if (active) setError(err.message || 'Unable to load dashboard.');
        });

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  // Today's meals
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
      let active = true;

      getTodayMeals(user.id)
        .then((result) => {
          if (active) setMeals(result);
        })
        .catch((err) => console.error('[Meals Error]', err));

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  // Avatar URL
  useEffect(() => {
    let active = true;
    setAvatarFailed(false);
    setAvatarSrc(null);

    if (!avatarUrl) return;

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
  }, [avatarUrl]);

  if (error) {
    return (
      <Screen contentStyle={{ justifyContent: 'center' }}>
        <NotFound
          icon={<Ionicons name="alert-circle-outline" size={48} color={colors.error} />}
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
              subtitle="Get your meal plan"
              onPress={() => router.push('/ai-plan')}
            />

            <ActionTile
              icon="time-outline"
              title="History"
              subtitle="All your meals"
              onPress={() => router.push('/history')}
            />
          </Animated.View>

          {/* Today's meals */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(350)}
            style={styles.mealCard}
          >
            <View style={styles.mealIcon}>
              <Ionicons name="restaurant-outline" size={22} color={colors.primaryDark} />
            </View>

            <View style={styles.mealText}>
              <Text style={styles.cardTitle}>Today's meals</Text>
              <Text style={styles.mealSubtitle}>
                {meals.length === 0
                  ? 'No meals logged yet'
                  : `${meals.length} meal${meals.length > 1 ? 's' : ''} logged today`}
              </Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}