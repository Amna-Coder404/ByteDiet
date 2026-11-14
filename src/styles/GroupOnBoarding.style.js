import { StyleSheet } from "react-native";
import { colors } from "../constants/theme";


export const fitness = StyleSheet.create({
    step: { color: colors.primary, fontWeight: '700', marginBottom: 6 },
    title: { fontSize: 28, fontWeight: '800', color: colors.text },
    sub: { color: colors.muted, marginTop: 6, marginBottom: 22 },
    label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
    chips: { flexDirection: 'row', flexWrap: 'wrap' },
    error: { color: colors.error, fontSize: 12, marginTop: 2, marginBottom: 6 },
});

export const personal = StyleSheet.create({
    step: {
        color: colors.primary,
        fontWeight: '700',
        marginBottom: 6,
    },

    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },

    sub: {
        color: colors.muted,
        marginTop: 6,
        marginBottom: 22,
    },

    avatarSection: {
        alignItems: 'center',
        marginBottom: 26,
    },

    avatarButton: {
        position: 'relative',
        marginBottom: 12,
    },

    avatar: {
        width: 104,
        height: 104,
        borderRadius: 52,
        backgroundColor: colors.border,
    },

    avatarPlaceholder: {
        width: 104,
        height: 104,
        borderRadius: 52,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarInitial: {
        fontSize: 38,
        fontWeight: '800',
        color: '#FFFFFF',
    },

    cameraIcon: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    cameraText: {
        color: '#FFFFFF',
        fontSize: 21,
        fontWeight: '700',
        lineHeight: 23,
    },

    avatarTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
    },

    avatarSub: {
        fontSize: 12,
        color: colors.muted,
        marginTop: 4,
    },

    changePhoto: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '700',
        marginTop: 9,
    },

    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },

    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 6,
    },

    error: {
        color: colors.error,
        fontSize: 12,
        marginBottom: 8,
    },
});
