import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemedStyles } from '../context/ThemeContext';
import { createStyles } from '../styles/Auth.style';

export default function AuthHeader({ title }) {
    const styles = useThemedStyles(createStyles);
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <StatusBar style="light" />
            <View style={styles.shapeA} />
            <View style={styles.shapeB} />
            <View style={styles.headerFill} />
            <View style={styles.slope} />
            <Text style={styles.headerTitle}>{title}</Text>
        </View>
    );
}