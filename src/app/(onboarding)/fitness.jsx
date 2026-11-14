import { Text, View } from 'react-native';

import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import {
  ACTIVITY_LEVELS,
  ALLERGIES,
  DIETS,
  FITNESS_GOALS,
} from '../../constants/options';
import useFitness from '../../hooks/useFitness';

import { fitness as styles } from '../../styles/GroupOnBoarding.style';

function Group({ title, error, children }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.chips}>{children}</View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default function Fitness() {
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

  return (
    <Screen>
      <Text style={styles.step}>
        {isEditing ? 'Update your preferences' : 'Step 2 of 2'}
      </Text>

      <Text style={styles.title}>
        {isEditing ? 'Change your goals' : 'Your goals'}
      </Text>

      <Text style={styles.sub}>
        {isEditing
          ? 'Update your nutrition and fitness preferences.'
          : 'Tell us how you want to eat and train.'}
      </Text>

      <Group title="Fitness goal" error={errors.goal}>
        {FITNESS_GOALS.map((g) => (
          <Chip key={g} label={g} selected={goal === g} onPress={() => setGoal(g)} />
        ))}
      </Group>

      <Group title="Activity level" error={errors.activity}>
        {ACTIVITY_LEVELS.map((a) => (
          <Chip key={a} label={a} selected={activity === a} onPress={() => setActivity(a)} />
        ))}
      </Group>

      <Group title="Dietary preference" error={errors.diet}>
        {DIETS.map((d) => (
          <Chip key={d} label={d} selected={diet === d} onPress={() => setDiet(d)} />
        ))}
      </Group>

      {diet === 'Other' ? (
        <Input
          value={dietOther}
          onChangeText={setDietOther}
          placeholder="Describe your diet (optional)"
        />
      ) : null}

      <Group title="Allergies (select all that apply)">
        {ALLERGIES.map((a) => (
          <Chip
            key={a}
            label={a}
            selected={allergies.includes(a)}
            onPress={() => toggleAllergy(a)}
          />
        ))}
        <Chip label="Other" selected={otherOn} onPress={toggleOther} />
      </Group>

      {otherOn ? (
        <Input
          value={otherText}
          onChangeText={setOtherText}
          placeholder="Other allergies, comma separated"
          error={errors.other}
        />
      ) : null}

      {formError ? <Text style={styles.error}>{formError}</Text> : null}

      <Button
        title={isEditing ? 'Save changes' : 'Finish setup'}
        onPress={onFinish}
        loading={loading}
        style={{ marginTop: 8 }}
      />
    </Screen>
  );
}