
import { useCallback, useEffect, useState } from 'react';

import {
  Image, Pressable, Text, View,
} from 'react-native';

import {
  useFocusEffect,
  useRouter,
  useNavigation,
} from 'expo-router';

import Animated, {
  FadeInDown,
} from 'react-native-reanimated';

import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Loader from '../../components/Loader';

import { colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

import { getOnboardingData } from '../../services/onboardingService';
import {
  getTodayMeals,
  sumMeals,
} from '../../services/mealService';

import { calcPlan } from '../../utils/nutrition';
import { resolveAvatarUrl } from '../../utils/avatar';
import { styles } from '../../styles/Dashboard.style';
import { Ionicons } from '@expo/vector-icons';
import NotFound from '../../components/NotFound';

function Macro({ label, value, eaten }) {
  const percentage = value > 0 ? Math.min(100, (eaten / value) * 100)
    : 0;

  return (
    <View style={styles.macro}>
      <Text style={styles.macroValue}>
        {Math.round(eaten)}g
      </Text>

      <View style={styles.macroBar}>
        <View
          style={[
            styles.macroFill,
            { width: `${percentage}%` },
          ]}
        />
      </View>

      <Text style={styles.macroLabel}>
        {label}
      </Text>

      <Text style={styles.macroTarget}>
        of {value}g
      </Text>
    </View>
  );
}


export default function Dashboard() {
  const { user } = useAuth();

  const router = useRouter();
  const navigation = useNavigation();

  // States
  const [data, setData] = useState(null);
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState('');
  const [convertedAvatar, setConvertedAvatar] = useState(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  // Derived values
  const avatarUrl = data?.profile?.avatar_url;

  const initial = (
    data?.profile?.name?.trim()?.charAt(0) ||
    user?.email?.charAt(0) ||
    'U'
  ).toUpperCase();

  // Fetch onboarding data
  useEffect(() => {
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
        if (active) {
          setError(
            err.message || 'Unable to load dashboard.'
          );
        }
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  // Fetch today's meals
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;

      let active = true;

      getTodayMeals(user.id)
        .then((result) => {
          if (active) {
            setMeals(result);
          }
        })
        .catch((err) => {
          console.error('[Meals Error]', err);
        });

      return () => {
        active = false;
      };
    }, [user?.id])
  );

  // Resolve avatar URL
  useEffect(() => {
    let active = true;

    setAvatarFailed(false);
    setConvertedAvatar(null);

    if (!avatarUrl) return;

    console.log('[Avatar] raw value:', avatarUrl);

    resolveAvatarUrl(avatarUrl)
      .then((url) => {
        console.log('[Avatar] resolved:', url);
        if (active) setConvertedAvatar(url);
      })
      .catch((err) => {
        console.error('[Avatar Resolve Failed]', err);
        if (active) setAvatarFailed(true);
      });

    return () => {
      active = false;
    };
  }, [avatarUrl]);
  // Error handling
  // Error handling
  if (error) {
    return (
      <Screen contentStyle={{ justifyContent: 'center' }}>
        <NotFound
          icon={
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          }
          text={error}
        />
      </Screen>
    );
  }

  // Loading
  if (!data?.profile || !data?.goals) {
    return <Loader />;
  }

  // Dashboard calculations
  const { profile, goals } = data;

  const plan = calcPlan(profile, goals);
  const eaten = sumMeals(meals);

  const firstName =
    profile.name?.trim()?.split(' ')[0] || 'there';

  const remaining = plan.calories - eaten.calories;

  const percentage = plan.calories > 0
    ? Math.min(
      100,
      Math.round(
        (eaten.calories / plan.calories) * 100
      )
    )
    : 0;

  const showAvatar =
    convertedAvatar && !avatarFailed;

  return (
    <Screen>

      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(350)}
        style={styles.header}
      >
        <View>
          <Text style={styles.hello}>
            Hello, {firstName} 👋
          </Text>

          <Text style={styles.subtitle}>
            Your daily nutrition overview
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.openDrawer()}
          style={styles.avatarButton}
          hitSlop={10}
        >
          {showAvatar ? (
            <Image
              source={{ uri: convertedAvatar }}
              style={styles.avatarImage}
              resizeMode="cover"
              onError={(e) => {
                console.log('[Avatar Image Error]', e.nativeEvent);
                setAvatarFailed(true);
              }}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {initial}
              </Text>
            </View>
          )}
        </Pressable>
      </Animated.View>


      {/* Calories */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(350)}
        style={styles.hero}
      >
        <Text style={styles.heroLabel}>
          Calories consumed
        </Text>

        <Text style={styles.heroValue}>
          {Math.round(eaten.calories)}
          <Text style={styles.heroUnit}>
            {' '}/ {plan.calories} kcal
          </Text>
        </Text>

        <View style={styles.bar}>
          <View
            style={[
              styles.barFill,
              { width: `${percentage}%` },
            ]}
          />
        </View>

        <View style={styles.calorieFooter}>
          <Text style={styles.heroNote}>
            {remaining >= 0
              ? `${Math.round(remaining)} kcal remaining`
              : `${Math.round(-remaining)} kcal over target`}
          </Text>

          <Text style={styles.heroNote}>
            {percentage}%
          </Text>
        </View>
      </Animated.View>


      {/* Macronutrients */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(350)}
        style={styles.card}
      >
        <Text style={styles.cardTitle}>
          Nutrition breakdown
        </Text>

        <View style={styles.macros}>
          <Macro
            label="Protein"
            value={plan.protein}
            eaten={eaten.protein}
          />

          <Macro
            label="Carbs"
            value={plan.carbs}
            eaten={eaten.carbs}
          />

          <Macro
            label="Fat"
            value={plan.fat}
            eaten={eaten.fat}
          />
        </View>
      </Animated.View>


      {/* Meals summary */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(350)}
        style={styles.mealCard}
      >
        <View style={styles.mealHeader}>
          <View>
            <Text style={styles.cardTitle}>
              Today's meals
            </Text>

            <Text style={styles.mealSubtitle}>
              {meals.length === 0
                ? 'No meals logged yet'
                : `${meals.length} meals logged today`}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push('/history')}
            hitSlop={10}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Text style={styles.viewAll}>View all</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.primary} />
          </Pressable>
        </View>
      </Animated.View>


      {/* AI Coach */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(350)}
        style={styles.aiSection}
      >
        <Button
          title="✨ AI Nutrition Coach"
          onPress={() => router.push('/ai-plan')}
        />
      </Animated.View>

    </Screen>
  );
}
