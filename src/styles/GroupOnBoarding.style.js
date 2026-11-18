import { StyleSheet } from 'react-native';
import { lightColors } from '../constants/theme';

// Styles shared by both onboarding screens (header, fields, button, pills)
const shared = (colors) => {
    const panel = colors.bg;
    const soft = 'rgba(0,0,0,0.045)';

    return {
        root: { flex: 1, backgroundColor: panel },

        /* ---------- Header ---------- */
        pHeader: {
            height: 250,
            backgroundColor: colors.primary,
            overflow: 'hidden',
            paddingHorizontal: 40,
        },
        shapeA: {
            position: 'absolute',
            top: -40,
            right: -70,
            width: 220,
            height: 300,
            borderRadius: 60,
            backgroundColor: 'rgba(255,255,255,0.12)',
            transform: [{ rotate: '22deg' }],
        },
        shapeB: {
            position: 'absolute',
            top: 40,
            left: -90,
            width: 200,
            height: 260,
            borderRadius: 60,
            backgroundColor: 'rgba(0,0,0,0.06)',
            transform: [{ rotate: '-18deg' }],
        },
        pFill: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 60,
            backgroundColor: panel,
        },
        pSlope: {
            position: 'absolute',
            top: 140,
            left: '-6%',
            width: '112%',
            height: 400,
            backgroundColor: panel,
            borderTopLeftRadius: 90,
            borderTopRightRadius: 30,
            transform: [{ rotate: '6deg' }],
        },
        pStep: {
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.75)',
        },
        pTitle: {
            fontSize: 30,
            lineHeight: 36,
            fontWeight: '800',
            color: colors.white,
            marginTop: 4,
        },

        /* ---------- Body ---------- */
        body: {
            flex: 1,
            backgroundColor: panel,
            paddingHorizontal: 40,
            paddingBottom: 32,
        },
        intro: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 18 },

        /* ---------- Fields ---------- */
        boxLabel: {
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.5,
            color: colors.muted,
            marginTop: 22,
            marginBottom: 6,
        },
        box: {
            flexDirection: 'row',
            alignItems: 'center',
            height: 54,
            paddingHorizontal: 14,
            borderRadius: 14,
            backgroundColor: soft,
            borderWidth: 1.5,
            borderColor: 'transparent',
        },
        boxError: { borderColor: colors.error },
        fieldIcon: { marginRight: 12 },
        input: { flex: 1, fontSize: 16, paddingVertical: 12, color: colors.text },
        inputCenter: { textAlign: 'center' },
        errorText: { color: colors.error, fontSize: 12, fontWeight: '500', marginTop: 6 },
        formError: {
            color: colors.error,
            fontWeight: '500',
            textAlign: 'center',
            marginTop: 16,
        },
        statRow: { flexDirection: 'row', gap: 12 },
        statCol: { flex: 1 },

        /* ---------- Segmented control (few options) ---------- */
        segWrap: { flexDirection: 'row', backgroundColor: soft, borderRadius: 14, padding: 4 },
        seg: { flex: 1, paddingVertical: 12, borderRadius: 11, alignItems: 'center' },
        segActive: { backgroundColor: colors.primary },
        segText: { fontWeight: '600', fontSize: 14, color: colors.text },
        segTextActive: { color: colors.white },

        /* ---------- Pills (many options, wrap onto lines) ---------- */
        chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
        pill: {
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 22,
            borderWidth: 1.5,
            borderColor: colors.border,
        },
        pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
        pillText: { color: colors.text, fontWeight: '600', fontSize: 14 },
        pillTextSelected: { color: colors.white },

        /* ---------- Option cards (goal, activity level...) ---------- */
        option: {
            padding: 16,
            borderRadius: 14,
            backgroundColor: soft,
            borderWidth: 1.5,
            borderColor: 'transparent',
            marginTop: 10,
        },
        optionActive: { borderColor: colors.primary, backgroundColor: 'rgba(0,0,0,0.02)' },
        optionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
        optionSub: { fontSize: 13, color: colors.muted, marginTop: 2 },

        /* ---------- Button ---------- */
        btn: {
            height: 54,
            borderRadius: 27,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 32,
        },
        btnText: {
            color: colors.white,
            fontSize: 17,
            fontWeight: '700',
            letterSpacing: 1,
            textTransform: 'uppercase',
        },
        btnGhost: { alignItems: 'center', paddingVertical: 16, marginTop: 8 },
        btnGhostText: { color: colors.muted, fontWeight: '600', fontSize: 15 },
        joinRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginBottom: 12,
        },
        joinText: {
            fontSize: 13,
            color: colors.muted,
        },
    };
};

export const createFitnessStyles = (colors) => StyleSheet.create({ ...shared(colors) });

export const createPersonalStyles = (colors) => {
    const panel = colors.bg;

    return StyleSheet.create({
        ...shared(colors),

        /* ---------- Avatar (sits on the curve, text beside it) ---------- */
        avatarRow: { flexDirection: 'row', alignItems: 'center', marginTop: -56 },
        avatarButton: { width: 88, height: 88 },
        avatar: {
            width: 88,
            height: 88,
            borderRadius: 44,
            borderWidth: 4,
            borderColor: panel,
            backgroundColor: colors.border,
        },
        avatarPlaceholder: {
            width: 88,
            height: 88,
            borderRadius: 44,
            borderWidth: 4,
            borderColor: panel,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatarInitial: { fontSize: 32, fontWeight: '800', color: colors.white },
        avatarBadge: {
            position: 'absolute',
            right: 0,
            bottom: 2,
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: colors.primaryDark,
            borderWidth: 2,
            borderColor: panel,
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatarText: { marginLeft: 16, flex: 1, marginTop: 40 },
        avatarTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
        avatarSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
        changePhoto: {
            color: colors.primaryDark,
            fontWeight: '600',
            fontSize: 14,
            marginTop: 6,
        },

    });
};

// Fallbacks for files that still import { fitness } / { personal } (light only)
export const fitness = createFitnessStyles(lightColors);
export const personal = createPersonalStyles(lightColors);