
import React from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { styles } from '../styles/ByteDietDrawer.style';

export default function ByteDietDrawerContent({ navigation }) {
    const navigateTo = (path, params = {}) => {
        navigation.closeDrawer();

        router.push({
            pathname: path,
            params,
        });
    };
    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
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
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>ByteDiet</Text>
                <Text style={styles.subtitle}>
                    Your nutrition companion
                </Text>
            </View>

            <View style={styles.menu}>
                <MenuItem
                    icon="◉"
                    label="Dashboard"
                    onPress={() => navigateTo('/dashboard')}
                />
                <MenuItem
                    icon="♙"
                    label="Profile"
                    onPress={() =>
                        navigateTo('/personal', { mode: 'edit' })
                    }
                />

                <MenuItem
                    icon="◎"
                    label="Change Goals"
                    onPress={() =>
                        navigateTo('/fitness', { mode: 'edit' })
                    }
                />
                <MenuItem
                    icon="✦"
                    label="AI Nutrition"
                    onPress={() => navigateTo('/ai-plan')}
                />
            </View>

            <View style={styles.footer}>
                <Pressable
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutIcon}>↪</Text>
                    <Text style={styles.logoutText}>Logout</Text>
                </Pressable>
            </View>
        </View>
    );
}

function MenuItem({ icon, label, onPress }) {
    return (
        <Pressable
            style={styles.menuItem}
            onPress={onPress}
        >
            <Text style={styles.menuIcon}>{icon}</Text>
            <Text style={styles.menuLabel}>{label}</Text>
        </Pressable>
    );
}

