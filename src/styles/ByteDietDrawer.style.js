import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: 65,
        paddingHorizontal: 20,
    },
    header: {
        paddingBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    logo: {
        fontSize: 27,
        fontWeight: '800',
        color: '#16A36A',
    },
    subtitle: {
        fontSize: 13,
        color: '#888888',
        marginTop: 5,
    },
    menu: {
        paddingTop: 20,
        gap: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    menuIcon: {
        width: 35,
        fontSize: 21,
        color: '#16A36A',
    },
    menuLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#252525',
    },
    footer: {
        marginTop: 'auto',
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: 15,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    logoutIcon: {
        width: 35,
        fontSize: 22,
        color: '#DC4545',
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#DC4545',
    },
});
