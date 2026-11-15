import { StyleSheet } from 'react-native';
import { lightColors } from '../constants/theme';

const HEADER_H = 320; // height of the blue header

export const createStyles = (colors) => {
    const panel = colors.background || '#F7F8FA'; // white panel + page color

    return StyleSheet.create({
        root: { flex: 1, backgroundColor: panel },

        /* ---------- Blue header with curved white panel ---------- */
        header: {
            height: HEADER_H,
            backgroundColor: colors.primary,
            overflow: 'hidden',
            alignItems: 'center',
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
        headerFill: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 80,
            backgroundColor: panel,
        },
        slope: {
            position: 'absolute',
            top: HEADER_H - 150,
            left: '-6%',
            width: '112%',
            height: 520,
            backgroundColor: panel,
            borderTopLeftRadius: 120,
            borderTopRightRadius: 36,
            transform: [{ rotate: '8deg' }],
        },
        headerTitle: {
            marginTop: 50,
            paddingHorizontal: 40,
            fontSize: 30,
            lineHeight: 36,
            fontWeight: '800',
            letterSpacing: 0.5,
            textAlign: 'center',
            textTransform: 'uppercase',
            color: '#FFFFFF',
        },

        /* ---------- Form ---------- */
        body: {
            flex: 1,
            backgroundColor: panel,
            paddingHorizontal: 40,
            paddingBottom: 32,
        },
        field: {
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1.5,
            borderBottomColor: colors.primary,
            marginTop: 22,
        },
        fieldError: { borderBottomColor: colors.error },
        fieldIcon: { marginRight: 12 },
        input: {
            flex: 1,
            fontSize: 16,
            paddingVertical: 12,
            color: colors.text,
        },
        errorText: {
            color: colors.error,
            fontSize: 12,
            fontWeight: '500',
            marginTop: 6,
        },
        formError: {
            color: colors.error,
            fontWeight: '500',
            textAlign: 'center',
            marginTop: 16,
        },
        forgot: {
            alignSelf: 'flex-end',
            marginTop: 16,
            color: colors.primary,
            fontWeight: '500',
            fontSize: 14,
        },

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
            color: '#FFFFFF',
            fontSize: 17,
            fontWeight: '700',
            letterSpacing: 1,
            textTransform: 'uppercase',
        },

        /* ---------- Footer ---------- */
        row: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
        muted: { color: colors.muted },
        link: { color: colors.primary, fontWeight: '700' },
    });
};

// Fallback for files that still import { styles } (light only)
export const styles = createStyles(lightColors);