import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';

export default function Chip({ label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.on]}>
      <Text style={[styles.text, selected && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: 8,
    marginBottom: 8,
  },
  on: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.text, fontWeight: '600', fontSize: 14 },
});
