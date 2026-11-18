import { StyleSheet } from 'react-native';
import { lightColors } from '../constants/theme';

const shadow = {
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
};

export const createStyles = (colors) =>
    StyleSheet.create({
        root: { flex: 1, backgroundColor: colors.bg },
        scrollContent: { paddingBottom: 40 },

        /* ---------- Header ---------- */
        top: {
            backgroundColor: colors.primary,
            paddingHorizontal: 24,
            paddingBottom: 88,
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
            overflow: 'hidden',
        },
        shapeA: {
            position: 'absolute',
            top: -60,
            right: -70,
            width: 230,
            height: 260,
            borderRadius: 60,
            backgroundColor: 'rgba(255,255,255,0.10)',
            transform: [{ rotate: '22deg' }],
        },
        shapeB: {
            position: 'absolute',
            bottom: -40,
            left: -80,
            width: 200,
            height: 200,
            borderRadius: 60,
            backgroundColor: 'rgba(0,0,0,0.06)',
            transform: [{ rotate: '-18deg' }],
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            paddingTop: 16,
        },
        headerText: { flex: 1 },
        subtitle: { color: 'rgba(255,255,255,0.78)', fontSize: 13, fontWeight: '500' },
        hello: {
            fontSize: 24,
            fontWeight: '700',
            letterSpacing: -0.3,
            color: colors.white,
            marginTop: 2,
        },
        settingsButton: {
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.18)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatarButton: {
            width: 54,
            height: 54,
            borderRadius: 27,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.7)',
            backgroundColor: 'rgba(255,255,255,0.2)',
        },
        avatarImage: { width: '100%', height: '100%' },
        avatarFallback: {
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.22)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatarInitial: { color: colors.white, fontSize: 20, fontWeight: '700' },

        /* ---------- Content ---------- */
        content: { paddingHorizontal: 20 },

        /* ---------- Today card: calories + macros (overlaps the header) ---------- */
        today: {
            marginTop: -60,
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 22,
            marginBottom: 18,
            ...shadow,
        },
        todayTop: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
        },
        todayLabel: {
            color: colors.muted,
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        todayValue: {
            color: colors.text,
            fontSize: 42,
            fontWeight: '800',
            letterSpacing: -1,
            marginTop: 4,
        },
        todayUnit: { fontSize: 16, fontWeight: '600', color: colors.muted },
        todayEaten: { alignItems: 'flex-end', paddingBottom: 6 },
        todayEatenValue: { color: colors.text, fontSize: 15, fontWeight: '700' },
        todayEatenLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },

        progressTrack: {
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.primaryLight,
            overflow: 'hidden',
            marginTop: 16,
        },
        progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary },

        macros: {
            flexDirection: 'row',
            gap: 16,
            marginTop: 18,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        macroCol: { flex: 1 },
        macroLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
        macroValue: { color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 4 },
        macroUnit: { color: colors.muted, fontSize: 11, fontWeight: '600' },
        macroBar: {
            height: 5,
            borderRadius: 3,
            backgroundColor: colors.primaryLight,
            overflow: 'hidden',
            marginTop: 8,
        },
        macroFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },

        /* ---------- Quick actions ---------- */
        tiles: { flexDirection: 'row', gap: 14, marginBottom: 18 },
        tile: {
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 18,
            ...shadow,
        },
        tilePrimary: { backgroundColor: colors.primary },
        tileIcon: {
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
        },
        tileIconPrimary: { backgroundColor: 'rgba(255,255,255,0.2)' },
        tileTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 14 },
        tileTitlePrimary: { color: colors.white },
        tileSub: { color: colors.muted, fontSize: 12, marginTop: 4 },
        tileSubPrimary: { color: 'rgba(255,255,255,0.8)' },
    });

// Fallback for files that still import { styles } (light only)
export const styles = createStyles(lightColors);