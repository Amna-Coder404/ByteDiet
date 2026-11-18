import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { useTheme } from '../context/ThemeContext';
import { getMealsSince, sumMeals } from '../services/mealService';
import { cacheGet, cacheSet } from '../services/offlineServices/cacheService';
import { useNetwork } from '../hooks/offlineSupport/useNetwork';
import { getDateKey, getDateLabel, getJoinedDate } from '../utils/format';

const CELL = 14;
const GAP = 4;
const MIN_WEEKS = 18;
const MONTH_H = 18;
const GRID_H = 7 * (CELL + GAP);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

// Opacity per level (level 0 is drawn with the border color instead)
const OPACITY = [1, 0.3, 0.55, 0.8, 1];
const STATUS = [
    'Nothing logged',
    'Far from your target',
    'A bit off target',
    'Close to your target',
    'On target 🎯',
];

// Same shadow as the other dashboard cards
const shadow = {
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
};

const dayStart = (key) => new Date(`${key}T00:00:00`);

// 0 = nothing logged, 1 = far off, 2 = a bit off, 3 = close, 4 = on target
function getLevel(calories, target) {
    if (!calories || !target) return 0;

    const ratio = calories / target;

    if (ratio >= 0.9 && ratio <= 1.05) return 4;
    if (ratio >= 0.8 && ratio <= 1.15) return 3;
    if (ratio >= 0.6 && ratio <= 1.3) return 2;

    return 1;
}

// Every day of the grid (weeks start on Sunday). Days before the goal began get before: true.
function buildDays(startKey, totals, target) {
    const start = dayStart(startKey);
    const todayKey = getDateKey(new Date());
    const today = dayStart(todayKey);

    const gridStart = new Date(today);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay() - (MIN_WEEKS - 1) * 7);

    const startSunday = new Date(start);
    startSunday.setDate(startSunday.getDate() - startSunday.getDay());

    const from = startSunday < gridStart ? startSunday : gridStart;
    const days = [];

    for (let d = new Date(from); d <= today; d.setDate(d.getDate() + 1)) {
        const key = getDateKey(d);
        const before = d < start;
        const isToday = key === todayKey;
        const calories = totals[key] || 0;

        let level = before ? -1 : getLevel(calories, target);

        // Today is still in progress: don't mark it as "far off" while the day is not over
        if (isToday && calories > 0 && target && calories / target < 0.9) level = 2;

        days.push({
            key,
            before,
            isToday,
            calories,
            level,
            month: Number(key.slice(5, 7)) - 1,
        });
    }

    return days;
}

// Days in a row (ending today) where the goal was followed
function getStreak(days) {
    let streak = 0;

    for (let i = days.length - 1; i >= 0; i--) {
        const isToday = i === days.length - 1;

        if (days[i].level >= 3) streak++;
        else if (isToday) continue; // today is not finished yet
        else break;
    }

    return streak;
}

export default function GoalHeatmap({ userId, startedAt, target }) {
    const { colors } = useTheme();
    const { isOnline } = useNetwork();
    const scrollRef = useRef(null);

    const [totals, setTotals] = useState({});
    const [selected, setSelected] = useState(null);

    const primary = colors.primary || '#2E7D32';
    const border = colors.border || '#E3E3E3';
    const muted = colors.muted || '#9E9E9E';

    const startKey = startedAt ? getDateKey(startedAt) : null;

    // Load per-day calories: saved copy first, then refresh when online
    useFocusEffect(
        useCallback(() => {
            if (!userId || !startKey) return;

            let active = true;
            const cacheKey = `heatmap:${userId}:${startKey}`;

            (async () => {
                const cached = await cacheGet(cacheKey);
                if (active && cached?.value) setTotals(cached.value);

                if (isOnline === false) return;

                try {
                    const meals = await getMealsSince(userId, dayStart(startKey).toISOString());

                    const grouped = {};
                    meals.forEach((meal) => {
                        const key = getDateKey(meal.created_at);
                        (grouped[key] ||= []).push(meal);
                    });

                    const result = {};
                    Object.keys(grouped).forEach((key) => {
                        result[key] = sumMeals(grouped[key]).calories;
                    });

                    if (!active) return;

                    setTotals(result);
                    cacheSet(cacheKey, result);
                } catch (err) {
                    console.error('[Heatmap]', err);
                }
            })();

            return () => {
                active = false;
            };
        }, [userId, startKey, isOnline])
    );

    const days = useMemo(
        () => (startKey ? buildDays(startKey, totals, target) : []),
        [startKey, totals, target]
    );

    const weeks = useMemo(() => {
        const result = [];

        for (let i = 0; i < days.length; i += 7) {
            result.push(days.slice(i, i + 7));
        }

        return result;
    }, [days]);

    if (!startKey || !days.length) return null;

    const tracked = days.filter((day) => !day.before);
    const followed = tracked.filter((day) => day.level >= 3).length;
    const streak = getStreak(tracked);

    const activeKey = selected ?? days[days.length - 1].key;
    const activeDay = days.find((day) => day.key === activeKey) ?? days[days.length - 1];

    const detailStatus =
        activeDay.isToday && activeDay.level === 2 && activeDay.calories > 0
            ? 'Still in progress'
            : STATUS[Math.max(0, activeDay.level)];

    const cellStyle = (day) => {
        const picked = day.key === activeKey;

        if (day.before) {
            return { borderWidth: 1, borderColor: border, opacity: 0.6 };
        }

        return {
            backgroundColor: day.level === 0 ? border : primary,
            opacity: day.level === 0 ? 1 : OPACITY[day.level],
            ...(picked && { borderWidth: 2, borderColor: colors.text }),
        };
    };

    return (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>Goal tracker</Text>
            <Text style={[styles.sub, { color: muted }]}>
                Since {getJoinedDate(startedAt)} · Day {tracked.length} · {followed} on-target
                {followed === 1 ? ' day' : ' days'} · {streak} day streak
            </Text>

            <View style={styles.gridWrap}>
                {/* Weekday labels */}
                <View style={{ marginTop: MONTH_H }}>
                    {WEEKDAYS.map((label, index) => (
                        <View key={index} style={styles.dayLabelBox}>
                            <Text style={[styles.dayLabel, { color: muted }]}>{label}</Text>
                        </View>
                    ))}
                </View>

                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.scroll}
                    onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
                >
                    <View>
                        {/* Month labels */}
                        <View style={styles.monthRow}>
                            {weeks.map((week, index) => {
                                const month = week[0].month;
                                const prev = index > 0 ? weeks[index - 1][0].month : -1;

                                return (
                                    <View key={index} style={styles.monthCol}>
                                        {month !== prev ? (
                                            <Text style={[styles.monthText, { color: muted }]}>{MONTHS[month]}</Text>
                                        ) : null}
                                    </View>
                                );
                            })}
                        </View>

                        {/* Day boxes */}
                        <View style={styles.grid}>
                            {weeks.map((week, index) => (
                                <View key={index} style={styles.week}>
                                    {week.map((day) => (
                                        <Pressable
                                            key={day.key}
                                            disabled={day.before}
                                            onPress={() => setSelected(day.key)}
                                            style={[styles.cell, cellStyle(day)]}
                                        />
                                    ))}
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* Tapped day details */}
            <View style={[styles.detail, { borderTopColor: border }]}>
                <Text style={[styles.detailDate, { color: colors.text }]}>
                    {getDateLabel(activeDay.key)}
                </Text>
                <Text style={[styles.detailText, { color: muted }]}>
                    {Math.round(activeDay.calories)} / {Math.round(target || 0)} kcal · {detailStatus}
                </Text>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <Text style={[styles.legendText, { color: muted }]}>Missed</Text>
                {[0, 1, 2, 3, 4].map((level) => (
                    <View
                        key={level}
                        style={[
                            styles.cell,
                            styles.legendCell,
                            {
                                backgroundColor: level === 0 ? border : primary,
                                opacity: level === 0 ? 1 : OPACITY[level],
                            },
                        ]}
                    />
                ))}
                <Text style={[styles.legendText, { color: muted }]}>On target</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 18,
        marginTop: 12,
        ...shadow,
    },
    title: { fontSize: 17, fontWeight: '700' },
    sub: { fontSize: 12, marginTop: 4, marginBottom: 14 },

    gridWrap: { flexDirection: 'row' },
    scroll: { height: MONTH_H + GRID_H, flexGrow: 1 },

    dayLabelBox: { height: CELL, marginBottom: GAP, justifyContent: 'center', width: 30 },
    dayLabel: { fontSize: 10 },

    monthRow: { flexDirection: 'row', height: MONTH_H },
    monthCol: { width: CELL + GAP },
    monthText: { position: 'absolute', left: 0, width: 36, fontSize: 10 },

    grid: { flexDirection: 'row', height: GRID_H },
    week: { flexDirection: 'column', marginRight: GAP },
    cell: { width: CELL, height: CELL, borderRadius: 3, marginBottom: GAP },

    detail: { marginTop: 10, paddingTop: 12, borderTopWidth: 1 },
    detailDate: { fontSize: 14, fontWeight: '600' },
    detailText: { fontSize: 12, marginTop: 3 },

    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 12,
    },
    legendCell: { marginBottom: 0, marginLeft: 4 },
    legendText: { fontSize: 11, marginHorizontal: 4 },
});