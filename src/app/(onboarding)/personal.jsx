import {
  ActivityIndicator,
  Image,
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
import { Ionicons } from '@expo/vector-icons';

import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { createPersonalStyles } from '../../styles/GroupOnBoarding.style';

import { GENDERS } from '../../constants/options';
import usePersonal from '../../hooks/usePersonal';

export default function Personal() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createPersonalStyles);
  const insets = useSafeAreaInsets();

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

  const statError = errors.age || errors.height || errors.weight;

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
            {isEditing ? 'Update your information' : 'Step 1 of 2'}
          </Text>
          <Text style={styles.pTitle}>
            {isEditing ? 'Edit your profile' : 'About you'}
          </Text>
        </View>

        <View style={styles.body}>
          {/* Avatar + text side by side */}
          <View style={styles.avatarRow}>
            <Pressable onPress={pickAvatar} style={styles.avatarButton}>
              {avatarSource ? (
                <Image source={{ uri: avatarSource }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{initial}</Text>
                </View>
              )}
              <View style={styles.avatarBadge}>
                <Ionicons name="camera" size={13} color="#fff" />
              </View>
            </Pressable>

            <View style={styles.avatarText}>
              <Text style={styles.avatarTitle}>Profile picture</Text>
              <Text style={styles.avatarSub}>So people can recognize you</Text>
              <Pressable onPress={pickAvatar} hitSlop={8}>
                <Text style={styles.changePhoto}>
                  {avatarSource ? 'Change photo' : 'Upload photo'}
                </Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.intro}>
            {isEditing
              ? 'Update your personal information.'
              : 'We use this to calculate your daily needs.'}
          </Text>

          {/* Full name */}
          <Text style={styles.boxLabel}>Full name</Text>
          <View style={[styles.box, errors.name && styles.boxError]}>
            <Ionicons
              name="person-outline"
              size={20}
              color={colors.muted}
              style={styles.fieldIcon}
            />
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={set('name')}
              placeholder="Your name"
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
            />
          </View>
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          {/* Age / Height / Weight in one row */}
          <View style={styles.statRow}>
            <View style={styles.statCol}>
              <Text style={styles.boxLabel}>Age</Text>
              <View style={[styles.box, errors.age && styles.boxError]}>
                <TextInput
                  style={[styles.input, styles.inputCenter]}
                  value={form.age}
                  onChangeText={set('age')}
                  placeholder="22"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.statCol}>
              <Text style={styles.boxLabel}>Height (cm)</Text>
              <View style={[styles.box, errors.height && styles.boxError]}>
                <TextInput
                  style={[styles.input, styles.inputCenter]}
                  value={form.height}
                  onChangeText={set('height')}
                  placeholder="165"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.statCol}>
              <Text style={styles.boxLabel}>Weight (kg)</Text>
              <View style={[styles.box, errors.weight && styles.boxError]}>
                <TextInput
                  style={[styles.input, styles.inputCenter]}
                  value={form.weight}
                  onChangeText={set('weight')}
                  placeholder="60"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
          {statError ? <Text style={styles.errorText}>{statError}</Text> : null}

          {/* Gender: segmented control */}
          <Text style={styles.boxLabel}>Gender</Text>
          <View style={styles.segWrap}>
            {GENDERS.map((gender) => {
              const selected = form.gender === gender;
              return (
                <Pressable
                  key={gender}
                  onPress={() => set('gender')(gender)}
                  style={[styles.seg, selected && styles.segActive]}
                >
                  <Text style={[styles.segText, selected && styles.segTextActive]}>
                    {gender}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Pressable
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={onContinue}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>
                {isEditing ? 'Save changes' : 'Continue'}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}