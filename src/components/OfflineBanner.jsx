// src/components/OfflineBanner.jsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { radius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

function timeAgo(ts) {
    if (!ts) return '';
    const mins = Math.floor((Date.now() - ts) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} day(s) ago`;
}

export default function OfflineBanner({ lastSynced, style }) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                styles.banner,
                { backgroundColor: colors.primaryLight, borderColor: colors.border },
                style,
            ]}
        >
            <Ionicons name="cloud-offline-outline" size={20} color={colors.primaryDark} />
            <View style={styles.textWrap}>
                <Text style={[styles.title, { color: colors.text }]}>You're offline</Text>
                <Text style={[styles.sub, { color: colors.muted }]}>
                    Showing your saved data{lastSynced ? ` · updated ${timeAgo(lastSynced)}` : ''}
                </Text>
            </View>
        </View>
    ); s
}

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderRadius: radius.md,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 12,
    },
    textWrap: { flex: 1 },
    title: { fontSize: 14, fontWeight: '700' },
    sub: { fontSize: 12, marginTop: 1 },
});