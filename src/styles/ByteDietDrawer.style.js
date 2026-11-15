import { StyleSheet } from 'react-native';
import { lightColors } from '../constants/theme';

export const createStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.bg,
            paddingTop: 65,
            paddingHorizontal: 20,
        },
        header: {
            paddingBottom: 25,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        logo: {
            fontSize: 27,
            fontWeight: '800',
            color: colors.primary,
        },
        subtitle: {
            fontSize: 13,
            color: colors.muted,
            marginTop: 5,
        },
        menu: {
            paddingTop: 20,
            gap: 8,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderRadius: 12,
        },
        menuIconBox: {
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
        },
        menuLabel: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
        },
        footer: {
            marginTop: 'auto',
            paddingBottom: 30,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 15,
        },
        themeButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 14,
            backgroundColor: colors.primaryLight,
            marginBottom: 12,
        },
        themeLabel: {
            flex: 1,
            color: colors.text,
            fontSize: 15,
            fontWeight: '700',
        },
        logoutButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            padding: 12,
        },
        logoutText: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.error,
        },
    });

// Fallback for files that still import { styles } (light theme only)
export const styles = createStyles(lightColors);