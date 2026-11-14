
import { StyleSheet } from 'react-native';
import { colors, radius } from '../constants/theme';

export const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },

    hello: {
        fontSize: 23,
        fontWeight: '800',
        color: colors.text,
    },

    subtitle: {
        color: colors.muted,
        fontSize: 13,
        marginTop: 5,
    },

    avatarButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: colors.primaryLight,
        backgroundColor: colors.primaryLight,
    },

    avatarButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    avatarFallback: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },

    hero: {
        backgroundColor: colors.primary,
        borderRadius: radius.lg,
        padding: 22,
        marginBottom: 18,
    },

    heroLabel: {
        color: '#D1FAE5',
        fontSize: 14,
        fontWeight: '600',
    },

    heroValue: {
        color: colors.white,
        fontSize: 34,
        fontWeight: '800',
        marginTop: 10,
    },

    heroUnit: {
        fontSize: 14,
        fontWeight: '600',
    },

    bar: {
        height: 9,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.25)',
        marginTop: 20,
        overflow: 'hidden',
    },

    barFill: {
        height: '100%',
        backgroundColor: colors.white,
        borderRadius: 10,
    },

    calorieFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },

    heroNote: {
        color: '#D1FAE5',
        fontSize: 12,
        fontWeight: '600',
    },

    card: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: 18,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: colors.border,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },

    macros: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 18,
    },

    macro: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.primaryLight,
        paddingVertical: 14,
        paddingHorizontal: 5,
        borderRadius: radius.md,
    },

    macroValue: {
        fontSize: 19,
        fontWeight: '800',
        color: colors.primaryDark,
    },

    macroBar: {
        width: '85%',
        height: 5,
        backgroundColor: colors.border,
        borderRadius: 5,
        overflow: 'hidden',
        marginTop: 10,
    },

    macroFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 5,
    },

    macroLabel: {
        color: colors.text,
        fontWeight: '700',
        fontSize: 12,
        marginTop: 10,
    },

    macroTarget: {
        color: colors.muted,
        fontSize: 11,
        marginTop: 3,
    },

    mealCard: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: 18,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: colors.border,
    },

    mealHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    mealSubtitle: {
        color: colors.muted,
        fontSize: 13,
        marginTop: 6,
    },

    viewAll: {
        color: colors.primaryDark,
        fontSize: 13,
        fontWeight: '700',
    },

    aiSection: {
        marginBottom: 20,
    },
});
