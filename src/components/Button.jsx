import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { radius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export default function Button({ title, onPress, loading, disabled, variant = 'primary', style }) {
  const { colors } = useTheme();

  const outline = variant === 'outline';
  const off = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        styles.btn,
        outline
          ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary }
          : { backgroundColor: colors.primary },
        off && { opacity: 0.6 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.text, { color: outline ? colors.primary : colors.white }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { height: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, fontWeight: '700' },
});