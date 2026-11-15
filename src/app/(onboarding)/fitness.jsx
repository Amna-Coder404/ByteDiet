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
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { createFitnessStyles } from '../../styles/GroupOnBoarding.style';

import {
  ACTIVITY_LEVELS,
  ALLERGIES,
  DIETS,
  FITNESS_GOALS,
} from '../../constants/options';
import useFitness from '../../hooks/useFitness';

export default function Fitness() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createFitnessStyles);
  const insets = useSafeAreaInsets();

  const {
    isEditing,
    goal,
    setGoal,
    activity,
    setActivity,
    diet,
    setDiet,
    dietOther,
    setDietOther,
    allergies,
    toggleAllergy,
    otherOn,
    toggleOther,
    otherText,
    setOtherText,
    errors,
    formError,
    loading,
    onFinish,
  } = useFitness();

  const Pill = ({ label, selected, onPress }) => (
    <Pressable onPress={onPress} style={[styles.pill, selected && styles.pillSelected]}>
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
    </Pressable>
  );

  const Group = ({ title, error, children }) => (
    <View>
      <Text style={styles.boxLabel}>{title}</Text>
      <View style={styles.chips}>{children}</View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

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
        {/* Header */}
        <View style={[styles.pHeader, { paddingTop: insets.top + 16 }]}>
          <StatusBar style="light" />
          <View style={styles.shapeA} />
          <View style={styles.shapeB} />
          <View style={styles.pFill} />
          <View style={styles.pSlope} />
          <Text style={styles.pStep}>
            {isEditing ? 'Update your preferences' : 'Step 2 of 2'}
          </Text>
          <Text style={styles.pTitle}>
            {isEditing ? 'Change your goals' : 'Your goals'}
          </Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.intro}>
            {isEditing
              ? 'Update your nutrition and fitness preferences.'
              : 'Tell us how you want to eat and train.'}
          </Text>

          <Group title="Fitness goal" error={errors.goal}>
            {FITNESS_GOALS.map((g) => (
              <Pill key={g} label={g} selected={goal === g} onPress={() => setGoal(g)} />
            ))}
          </Group>

          <Group title="Activity level" error={errors.activity}>
            {ACTIVITY_LEVELS.map((a) => (
              <Pill key={a} label={a} selected={activity === a} onPress={() => setActivity(a)} />
            ))}
          </Group>

          <Group title="Dietary preference" error={errors.diet}>
            {DIETS.map((d) => (
              <Pill key={d} label={d} selected={diet === d} onPress={() => setDiet(d)} />
            ))}
          </Group>

          {diet === 'Other' ? (
            <View style={[styles.box, { marginTop: 14 }]}>
              <TextInput
                style={styles.input}
                value={dietOther}
                onChangeText={setDietOther}
                placeholder="Describe your diet (optional)"
                placeholderTextColor={colors.muted}
              />
            </View>
          ) : null}

          <Group title="Allergies (select all that apply)">
            {ALLERGIES.map((a) => (
              <Pill
                key={a}
                label={a}
                selected={allergies.includes(a)}
                onPress={() => toggleAllergy(a)}
              />
            ))}
            <Pill label="Other" selected={otherOn} onPress={toggleOther} />
          </Group>

          {otherOn ? (
            <>
              <View style={[styles.box, { marginTop: 14 }, errors.other && styles.boxError]}>
                <TextInput
                  style={styles.input}
                  value={otherText}
                  onChangeText={setOtherText}
                  placeholder="Other allergies, comma separated"
                  placeholderTextColor={colors.muted}
                />
              </View>
              {errors.other ? <Text style={styles.errorText}>{errors.other}</Text> : null}
            </>
          ) : null}

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Pressable
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={onFinish}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>
                {isEditing ? 'Save changes' : 'Finish setup'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}