import {
    ActivityIndicator,
    FlatList,
    Pressable,
    Text,
    View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';


import useHistory from '../../hooks/useHistory';

import Loader from '../../components/Loader';
import NotFound from '../../components/NotFound';
import { useTheme, useThemedStyles } from '../../context/ThemeContext';
import { createStyles } from '../../styles/History.style';
import { number, getTime } from '../../utils/format';
import OfflineGate from '../../components/OfflineGate';

function Macro({ label, value, unit }) {

    const styles = useThemedStyles(createStyles);
    return (
        <View style={styles.macroItem}>
            <Text style={styles.macroValue}>
                {number(value)}{unit}
            </Text>
            <Text style={styles.macroLabel}>{label}</Text>
        </View>
    );
}

function HistoryScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);

    const {
        meals,
        loading,
        error,
        deletingId,
        totals,
        listData,
        loadHistory,
        confirmDelete,
        selectedIds,
        selectionMode,
        bulkDeleting,
        toggleSelect,
        clearSelection,
        selectAll,
        confirmDeleteSelected,
    } = useHistory();

    const renderMeal = (item) => {
        const selected = selectedIds.includes(item.id);

        return (
            <Pressable
                onLongPress={() => toggleSelect(item.id)}
                onPress={() => {
                    if (selectionMode) toggleSelect(item.id);
                }}
                delayLongPress={300}
                style={[styles.mealCard, selected && styles.mealCardSelected]}
            >
                <View style={styles.mealTop}>
                    {selectionMode && (
                        <Ionicons
                            name={selected ? 'checkbox' : 'square-outline'}
                            size={24}
                            color={selected ? colors.primary : colors.muted}
                            style={styles.checkbox}
                        />
                    )}

                    <View style={styles.mealInfo}>
                        <Text style={styles.mealName} numberOfLines={1}>
                            {item.description || 'Meal'}
                        </Text>

                        <Text style={styles.mealTime}>
                            {getTime(item.eaten_at)}
                        </Text>
                    </View>

                    {!selectionMode && (
                        <Pressable
                            onPress={() => confirmDelete(item)}
                            disabled={deletingId === item.id}
                            hitSlop={10}
                            style={styles.deleteButton}
                        >
                            {deletingId === item.id ? (
                                <ActivityIndicator size="small" color={colors.error} />
                            ) : (
                                <Text style={styles.deleteText}>Delete</Text>
                            )}
                        </Pressable>
                    )}
                </View>

                <View style={styles.calorieRow}>
                    <Text style={styles.calorieLabel}>Calories</Text>
                    <Text style={styles.calorieValue}>
                        {number(item.calories)} kcal
                    </Text>
                </View>

                <View style={styles.macroRow}>
                    <Macro label="Protein" value={item.protein_g} unit="g" />
                    <Macro label="Carbs" value={item.carbs_g} unit="g" />
                    <Macro label="Fat" value={item.fat_g} unit="g" />
                </View>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            {selectionMode ? (
                <View style={styles.header}>
                    <Pressable
                        onPress={clearSelection}
                        hitSlop={10}
                        style={styles.backButton}
                    >
                        <Ionicons name="close" size={24} color={colors.text} />
                    </Pressable>

                    <View style={styles.headerText}>
                        <Text style={styles.title}>
                            {selectedIds.length} selected
                        </Text>
                    </View>

                    <Pressable
                        onPress={selectAll}
                        hitSlop={10}
                        style={styles.headerAction}
                    >
                        <Text style={styles.headerActionText}>All</Text>
                    </Pressable>

                    <Pressable
                        onPress={confirmDeleteSelected}
                        disabled={bulkDeleting}
                        hitSlop={10}
                        style={styles.headerAction}
                    >
                        {bulkDeleting ? (
                            <ActivityIndicator size="small" color={colors.error} />
                        ) : (
                            <Ionicons name="trash-outline" size={22} color={colors.error} />
                        )}
                    </Pressable>
                </View>
            ) : (
                <View style={styles.header}>
                    <Pressable
                        onPress={() => router.back()}
                        hitSlop={10}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back-outline" size={24} color={colors.text} />
                    </Pressable>

                    <View style={styles.headerText}>
                        <Text style={styles.title}>Meal History</Text>
                        <Text style={styles.subtitle}>
                            Long press a meal to select
                        </Text>
                    </View>
                </View>
            )}

            {!loading && !selectionMode && meals.length > 0 && (
                <View style={styles.summary}>
                    <Text style={styles.summaryLabel}>
                        Total nutrition · Recent meals
                    </Text>

                    <Text style={styles.summaryCalories}>
                        {number(totals.calories)}{' '}
                        <Text style={styles.summaryUnit}>kcal</Text>
                    </Text>

                    <View style={styles.summaryMacros}>
                        <Text style={styles.summaryMacro}>
                            P {number(totals.protein)}g
                        </Text>
                        <Text style={styles.summaryMacro}>
                            C {number(totals.carbs)}g
                        </Text>
                        <Text style={styles.summaryMacro}>
                            F {number(totals.fat)}g
                        </Text>
                    </View>
                </View>
            )}

            {loading ? (
                <Loader />
            ) : error ? (
                <NotFound
                    icon={<Ionicons name="restaurant-outline" size={48} color={colors.muted} />}
                    text={error}
                >
                    <Pressable onPress={loadHistory} style={styles.retryButton}>
                        <Text style={styles.retryText}>Try again</Text>
                    </Pressable>
                </NotFound>
            ) : meals.length === 0 ? (
                <NotFound
                    icon={<Ionicons name="restaurant-outline" size={48} color={colors.muted} />}
                    text="No meals yet. Your logged meals will appear here. Start by analyzing a meal with AI Coach."
                >
                    <Pressable
                        onPress={() => router.push('/ai-plan')}
                        style={styles.retryButton}
                    >
                        <Text style={styles.retryText}>Open AI Coach</Text>
                    </Pressable>
                </NotFound>
            ) : (
                <FlatList
                    data={listData}
                    keyExtractor={(item) => item.key}
                    extraData={selectedIds}// redraw when this changes
                    renderItem={({ item }) =>
                        item.type === 'header' ? (
                            <Text style={styles.sectionTitle}>{item.title}</Text>
                        ) : (
                            renderMeal(item.meal)
                        )
                    }
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshing={loading}
                    onRefresh={loadHistory}
                />
            )}
        </SafeAreaView>
    );
}

export default function History() {
    return (
        <OfflineGate feature="History">
            <HistoryScreen />
        </OfflineGate>
    );
}