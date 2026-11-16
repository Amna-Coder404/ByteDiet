import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View, Image } from 'react-native';

// 'screen' includes the status bar and Android navigation bar areas
const SCREEN = Dimensions.get('screen');
import { radius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const TITLE = 'ByteDiet';

export default function AnimatedSplashScreen({ onFinish, holdMs = 900 }) {
    const { colors: c } = useTheme();

    const logoScale = useRef(new Animated.Value(0.4)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const ring = useRef(new Animated.Value(0)).current;
    const letters = useRef(TITLE.split('').map(() => new Animated.Value(0))).current;
    const tagline = useRef(new Animated.Value(0)).current;
    const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;
    const screenOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Pulsing ring behind the logo
        const ringLoop = Animated.loop(
            Animated.timing(ring, {
                toValue: 1,
                duration: 1600,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            })
        );
        ringLoop.start();

        // Loading dots
        const dotLoops = dots.map((d, i) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(i * 160),
                    Animated.timing(d, { toValue: 1, duration: 350, useNativeDriver: true }),
                    Animated.timing(d, { toValue: 0.3, duration: 350, useNativeDriver: true }),
                    Animated.delay((2 - i) * 160),
                ])
            )
        );
        dotLoops.forEach((l) => l.start());

        // Intro sequence
        Animated.sequence([
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 5,
                    tension: 70,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
            ]),
            Animated.stagger(
                70,
                letters.map((l) =>
                    Animated.timing(l, {
                        toValue: 1,
                        duration: 350,
                        easing: Easing.out(Easing.back(1.6)),
                        useNativeDriver: true,
                    })
                )
            ),
            Animated.timing(tagline, { toValue: 1, duration: 450, useNativeDriver: true }),
            Animated.delay(holdMs),
            Animated.timing(screenOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
        ]).start(() => {
            ringLoop.stop();
            dotLoops.forEach((l) => l.stop());
            onFinish?.();
        });

        return () => {
            ringLoop.stop();
            dotLoops.forEach((l) => l.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] });
    const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

    return (
        <Animated.View style={[styles.root, { backgroundColor: c.primary, opacity: screenOpacity }]}>
            {/* Logo */}
            <View style={styles.logoWrap}>
                <Animated.View
                    style={[
                        styles.ring,
                        { backgroundColor: c.white, opacity: ringOpacity, transform: [{ scale: ringScale }] },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.logo,
                        {
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                        },
                    ]}
                >
                    <Image
                        source={require('../assets/icon.png')}
                        style={styles.logoImage}
                        resizeMode="cover"
                    />
                </Animated.View>
            </View>

            {/* App name, letter by letter */}
            <View style={styles.titleRow}>
                {TITLE.split('').map((ch, i) => (
                    <Animated.Text
                        key={i}
                        style={[
                            styles.title,
                            {
                                color: c.white,
                                opacity: letters[i],
                                transform: [
                                    {
                                        translateY: letters[i].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [18, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        {ch}
                    </Animated.Text>
                ))}
            </View>

            <Animated.Text style={[styles.tagline, { color: c.heroSub, opacity: tagline }]}>
                Eat smart. Track easy.
            </Animated.Text>

            {/* Loading dots */}
            <View style={styles.dotsRow}>
                {dots.map((d, i) => (
                    <Animated.View
                        key={i}
                        style={[
                            styles.dot,
                            {
                                backgroundColor: c.white,
                                opacity: d,
                                transform: [
                                    { scale: d.interpolate({ inputRange: [0.3, 1], outputRange: [0.8, 1.2] }) },
                                ],
                            },
                        ]}
                    />
                ))}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: SCREEN.width,
        height: SCREEN.height,
        zIndex: 9999,
        elevation: 9999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoWrap: {
        width: 110,
        height: 110,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    ring: {
        position: 'absolute',
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    logo: {
        width: 110,
        height: 110,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.9)',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    logoGlyph: {
        fontSize: 54,
        fontWeight: '800',
    },
    titleRow: {
        flexDirection: 'row',
    },
    title: {
        fontSize: 38,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    tagline: {
        marginTop: 8,
        fontSize: 15,
        fontWeight: '500',
    },
    dotsRow: {
        position: 'absolute',
        bottom: 80,
        flexDirection: 'row',
        gap: 10,
    },
    dot: {
        width: 9,
        height: 9,
        borderRadius: 5,
    },
});