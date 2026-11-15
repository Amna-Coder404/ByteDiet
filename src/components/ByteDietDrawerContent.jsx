import React from 'react';
import { View, Text, Pressable, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '../lib/supabase';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import { createStyles } from '../styles/ByteDietDrawer.style';

export default function ByteDietDrawerContent({ navigation }) {
    const { colors, isDark, toggleTheme } = useTheme();
    const styles = useThemedStyles(createStyles);

    const navigateTo = (path, params = {}) => {
        navigation.closeDrawer();
        router.push({ pathname: path, params });
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    const { error } = await supabase.auth.signOut();

                    if (error) {
                        Alert.alert('Logout failed', error.message);
                        return;
                    }

                    navigation.closeDrawer();
                    router.replace('/login');
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>ByteDiet</Text>
                <Text style={styles.subtitle}>Your nutrition companion</Text>
            </View>

            <View style={styles.menu}>
                <MenuItem
                    icon="grid-outline"
                    label="Dashboard"
                    onPress={() => navigateTo('/dashboard')}
                />
                <MenuItem
                    icon="person-outline"
                    label="Profile"
                    onPress={() => navigateTo('/personal', { mode: 'edit' })}
                />
                <MenuItem
                    icon="flag-outline"
                    label="Change Goals"
                    onPress={() => navigateTo('/fitness', { mode: 'edit' })}
                />
                <MenuItem
                    icon="sparkles-outline"
                    label="AI Nutrition"
                    onPress={() => navigateTo('/ai-plan')}
                />
            </View>

            <View style={styles.footer}>
                <Pressable style={styles.themeButton} onPress={toggleTheme}>
                    <Ionicons
                        name={isDark ? 'sunny-outline' : 'moon-outline'}
                        size={22}
                        color={colors.primaryDark}
                    />
                    <Text style={styles.themeLabel}>
                        {isDark ? 'Light mode' : 'Dark mode'}
                    </Text>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ true: colors.primary }}
                    />
                </Pressable>

                <Pressable style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color={colors.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </Pressable>
            </View>
        </View>
    );
}

function MenuItem({ icon, label, onPress }) {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);

    return (
        <Pressable style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIconBox}>
                <Ionicons name={icon} size={20} color={colors.primaryDark} />
            </View>
            <Text style={styles.menuLabel}>{label}</Text>
        </Pressable>
    );
}