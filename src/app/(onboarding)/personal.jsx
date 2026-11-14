import { Text, View, Image, Pressable } from 'react-native';

import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Chip from '../../components/Chip';

import { GENDERS } from '../../constants/options';
import usePersonal from '../../hooks/usePersonal';

import { personal as styles } from '../../styles/GroupOnBoarding.style';

export default function Personal() {
  const {
    isEditing,
    form,
    set,
    errors,
    formError,
    loading,
    avatarSource,
    initial,
    pickAvatar,
    onContinue,
  } = usePersonal();

  return (
    <Screen>
      <Text style={styles.step}>
        {isEditing ? 'Update your information' : 'Step 1 of 2'}
      </Text>

      <Text style={styles.title}>
        {isEditing ? 'Edit your profile' : 'About you'}
      </Text>

      <Text style={styles.sub}>
        {isEditing
          ? 'Update your personal information.'
          : 'We use this to calculate your daily needs.'}
      </Text>

      {/* Profile Avatar */}
      <View style={styles.avatarSection}>
        <Pressable onPress={pickAvatar} style={styles.avatarButton}>
          {avatarSource ? (
            <Image source={{ uri: avatarSource }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}

          <View style={styles.cameraIcon}>
            <Text style={styles.cameraText}>+</Text>
          </View>
        </Pressable>

        <Text style={styles.avatarTitle}>Profile picture</Text>

        <Text style={styles.avatarSub}>
          Add a photo so people can recognize you
        </Text>

        <Pressable onPress={pickAvatar}>
          <Text style={styles.changePhoto}>
            {avatarSource ? 'Change photo' : 'Upload photo'}
          </Text>
        </Pressable>
      </View>

      <Input
        label="Full name"
        value={form.name}
        onChangeText={set('name')}
        autoCapitalize="words"
        placeholder="Your name"
        error={errors.name}
      />

      <Input
        label="Age"
        value={form.age}
        onChangeText={set('age')}
        keyboardType="number-pad"
        placeholder="e.g. 22"
        error={errors.age}
      />

      <Text style={styles.label}>Gender</Text>

      <View style={styles.chips}>
        {GENDERS.map((gender) => (
          <Chip
            key={gender}
            label={gender}
            selected={form.gender === gender}
            onPress={() => set('gender')(gender)}
          />
        ))}
      </View>

      {errors.gender ? (
        <Text style={styles.error}>{errors.gender}</Text>
      ) : null}

      <Input
        label="Height (cm)"
        value={form.height}
        onChangeText={set('height')}
        keyboardType="decimal-pad"
        placeholder="e.g. 165"
        error={errors.height}
      />

      <Input
        label="Current weight (kg)"
        value={form.weight}
        onChangeText={set('weight')}
        keyboardType="decimal-pad"
        placeholder="e.g. 60"
        error={errors.weight}
      />

      {formError ? <Text style={styles.error}>{formError}</Text> : null}

      <Button
        title={isEditing ? 'Save changes' : 'Continue'}
        onPress={onContinue}
        loading={loading}
        style={{ marginTop: 8 }}
      />
    </Screen>
  );
}