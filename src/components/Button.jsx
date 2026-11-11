import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../constants/theme';

export default function Button({ title, onPress, loading, disabled, variant = 'primary', style }) {
  const outline = variant === 'outline';
  const off = loading || disabled;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        styles.btn,
        outline ? styles.outline : styles.solid,
        off && { opacity: 0.6 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.text, outline && { color: colors.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { height: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  solid: { backgroundColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  text: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
