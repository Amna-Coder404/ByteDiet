import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius } from '../constants/theme';

export default function Input({ label, error, style, ...props }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="#9DB3A5"
        autoCapitalize="none"
        style={[styles.input, !!error && { borderColor: colors.error }, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  error: { color: colors.error, fontSize: 12, marginTop: 4 },
});
