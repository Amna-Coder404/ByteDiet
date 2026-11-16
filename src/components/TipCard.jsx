// src/components/TipCard.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { radius } from '../constants/theme';
import { TIPS, getRandomTip, loadTips } from '../constants/tips';
import { useTheme } from '../context/ThemeContext';

export default function TipCard({ style }) {
    const { colors } = useTheme();
    const [tips, setTips] = useState(TIPS);
    const [tip, setTip] = useState(() => getRandomTip());
    const fade = useRef(new Animated.Value(1)).current;

    // Load the tips saved in AsyncStorage (no internet needed)
    useEffect(() => {
        let active = true;
        loadTips().then((list) => {
            if (active) setTips(list);
        });
        return () => {
            active = false;
        };
    }, []);

    // Tap the card (or the refresh icon) to see another tip
    const showNext = () => {
        Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            setTip((current) => getRandomTip(current, tips));
            Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
        });
    };

    return (
        <Pressable
            onPress={showNext}
            style={[
                styles.card,
                { backgroundColor: colors.primaryLight, borderColor: colors.border },
                style,
            ]}
        >
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
                        <Ionicons name="bulb" size={16} color={colors.white} />
                    </View>
                    <Text style={[styles.title, { color: colors.primaryDark }]}>Daily Tip</Text>
                </View>
                <Ionicons name="refresh" size={18} color={colors.muted} />
            </View>

            <Animated.View style={{ opacity: fade }}>
                <Text style={[styles.category, { color: colors.primary }]}>{tip.category}</Text>
                <Text style={[styles.text, { color: colors.text }]}>{tip.text}</Text>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: radius.lg,
        borderWidth: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
    },
    category: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 4,
    },
    text: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
});