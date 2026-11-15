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

        /* ---------- Calorie card (overlaps the header) ---------- */
        hero: {
            marginTop: -60,
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 22,
            marginBottom: 18,
            ...shadow,
        },
        heroLabel: {
            color: colors.muted,
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        heroValue: {
            color: colors.text,
            fontSize: 46,
            fontWeight: '800',
            letterSpacing: -1,
            marginTop: 6,
        },
        heroUnit: { fontSize: 16, fontWeight: '600', color: colors.muted },
        progressTrack: {
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.primaryLight,
            overflow: 'hidden',
            marginTop: 16,
        },
        progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary },
        heroStats: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 20,
            paddingTop: 18,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        heroStat: { flex: 1, alignItems: 'center' },
        heroStatValue: { color: colors.text, fontSize: 18, fontWeight: '700' },
        heroStatLabel: { color: colors.muted, fontSize: 12, marginTop: 3 },
        heroDivider: { width: 1, height: 28, backgroundColor: colors.border },

        /* ---------- Cards ---------- */
        card: {
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 20,
            marginBottom: 18,
            ...shadow,
        },
        cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text },

        /* ---------- Macros ---------- */
        macroRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginTop: 18,
        },
        macroIcon: {
            width: 40,
            height: 40,
            borderRadius: 13,
            backgroundColor: colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
        },
        macroBody: { flex: 1 },
        macroTop: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        macroLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
        macroValue: { color: colors.muted, fontSize: 12, fontWeight: '600' },
        macroBar: {
            height: 6,
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

        /* ---------- Today's meals ---------- */
        mealCard: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 18,
            ...shadow,
        },
        mealIcon: {
            width: 46,
            height: 46,
            borderRadius: 15,
            backgroundColor: colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
        },
        mealText: { flex: 1 },
        mealSubtitle: { color: colors.muted, fontSize: 13, marginTop: 3 },
    });

// Fallback for files that still import { styles } (light only)
export const styles = createStyles(lightColors);