import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function NotFound({ icon, text, style, children }) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, style]}>
            {icon ? (
                typeof icon === 'string' ? (
                    <Text style={styles.emoji}>{icon}</Text>
                ) : (
                    icon
                )
            ) : null}

            {text ? (
                <Text style={[styles.text, { color: colors.muted }]}>{text}</Text>
            ) : null}

            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 35,
    },
    emoji: { fontSize: 45, marginBottom: 16 },
    text: { textAlign: 'center', lineHeight: 21, fontSize: 14, marginTop: 8 },
});