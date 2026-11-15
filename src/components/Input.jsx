import { StyleSheet, Text, TextInput, View } from 'react-native';
import { radius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function Input({ label, error, style, ...props }) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      ) : null}

      <TextInput
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        style={[
          styles.input,
          {
            borderColor: error ? colors.error : colors.border,
            color: colors.text,
            backgroundColor: colors.card,
          },
          style,
        ]}
        {...props}
      />

      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  error: { fontSize: 12, marginTop: 4 },
});