import { StyleSheet } from 'react-native';
import { lightColors, radius } from '../constants/theme';

export const createStyles = (colors) =>
    StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.bg },
        center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
        header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
        title: { fontSize: 18, fontWeight: '800', color: colors.text },
        sub: { fontSize: 12, color: colors.muted, marginTop: 1 },
        list: { padding: 14, paddingBottom: 8 },
        row: { marginBottom: 10, flexDirection: 'row' },
        rowMine: { justifyContent: 'flex-end' },
        rowAi: { justifyContent: 'flex-start' },
        bubble: { maxWidth: '86%', borderRadius: 18, padding: 12 },
        bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
        bubbleAi: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
        bubbleErr: { borderColor: colors.error },
        text: { color: colors.text, fontSize: 15, lineHeight: 21 },
        photo: { width: 200, height: 200, borderRadius: 12, marginBottom: 8 },
        meal: { marginTop: 4, minWidth: 230 },
        mealTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8 },
        itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 4 },
        itemName: { flex: 1, color: colors.text, fontSize: 13 },
        itemKcal: { color: colors.muted, fontSize: 13 },
        totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 6, paddingTop: 8 },
        totalLabel: { fontWeight: '800', color: colors.text },
        totalKcal: { fontWeight: '800', color: colors.primaryDark },
        macros: { color: colors.muted, fontSize: 12, marginTop: 4 },
        note: { color: colors.text, fontSize: 12, marginTop: 8 },
        logBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 10, alignItems: 'center', marginTop: 10 },
        logText: { color: colors.white, fontWeight: '700' },
        estimate: { color: colors.muted, fontSize: 10, marginTop: 6 },
        chips: { marginTop: 8, gap: 8 },
        chip: { alignSelf: 'flex-start', borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
        chipText: { color: colors.primaryDark, fontWeight: '600', fontSize: 13 },
        preview: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
        previewImg: { width: 48, height: 48, borderRadius: 8 },
        previewText: { flex: 1, color: colors.muted, fontSize: 12 },
        composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
        iconBtn: { width: 40, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
        input: { flex: 1, maxHeight: 110, minHeight: 44, borderWidth: 1.5, borderColor: colors.border, borderRadius: 22, paddingHorizontal: 14, paddingTop: 11, paddingBottom: 11, fontSize: 15, color: colors.text, backgroundColor: colors.bg },
        send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    });

// Fallback for files that still import { styles } (e.g. MealCard) - light only
export const styles = createStyles(lightColors);