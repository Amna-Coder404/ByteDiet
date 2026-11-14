import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { useAuth } from '../context/AuthContext';
import {
    getMealHistory,
    deleteMeal,
    sumMeals,
} from '../services/mealService';

import { getDateKey, getDateLabel } from '../utils/format';


export default function useHistory() {
    const { user } = useAuth();

    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [error, setError] = useState('');

    const loadHistory = useCallback(async () => {
        if (!user?.id) {
            setMeals([]);
            setLoading(false);
            return;
        }

        try {
            setError('');
            setLoading(true);

            const data = await getMealHistory(user.id);
            setMeals(data);
        } catch (err) {
            setError(err.message || 'Could not load meal history.');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useFocusEffect(
        useCallback(() => {
            loadHistory();
            return () => setSelectedIds([]);
        }, [loadHistory])
    );

    const totals = useMemo(() => sumMeals(meals), [meals]);

    const listData = useMemo(() => {
        const groups = {};

        meals.forEach((meal) => {
            const dateKey = getDateKey(meal.eaten_at);

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            groups[dateKey].push(meal);
        });

        const rows = [];

        Object.keys(groups)
            .sort((a, b) => b.localeCompare(a))
            .forEach((dateKey) => {
                rows.push({
                    type: 'header',
                    key: `header-${dateKey}`,
                    title: getDateLabel(dateKey),
                });

                groups[dateKey].forEach((meal) => {
                    rows.push({
                        type: 'meal',
                        key: `meal-${meal.id}`,
                        meal,
                    });
                });
            });

        return rows;
    }, [meals]);

    // ---------- Single delete ----------
    const removeMeal = async (id) => {
        try {
            setDeletingId(id);
            const result = await deleteMeal(user.id, id);

            if (!result.ok) {
                Alert.alert('Could not delete', result.error);
                return;
            }

            setMeals((current) =>
                current.filter((meal) => meal.id !== id)
            );
        } catch (err) {
            Alert.alert(
                'Could not delete',
                err.message || 'Please try again.'
            );
        } finally {
            setDeletingId(null);
        }
    };

    const confirmDelete = (meal) => {
        Alert.alert(
            'Delete meal?',
            `Remove "${meal.description || 'Meal'}" from your history?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => removeMeal(meal.id),
                },
            ]
        );
    };

    // ---------- Multi select ----------
    const selectionMode = selectedIds.length > 0;

    const toggleSelect = (id) => {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((x) => x !== id)
                : [...current, id]
        );
    };

    const clearSelection = () => setSelectedIds([]);

    const selectAll = () => setSelectedIds(meals.map((m) => m.id));

    const removeSelected = async () => {
        const ids = [...selectedIds];

        try {
            setBulkDeleting(true);

            const results = await Promise.all(
                ids.map(async (id) => {
                    try {
                        const result = await deleteMeal(user.id, id);
                        return { id, ok: !!result?.ok };
                    } catch {
                        return { id, ok: false };
                    }
                })
            );

            const deleted = results.filter((r) => r.ok).map((r) => r.id);
            const failed = results.filter((r) => !r.ok).map((r) => r.id);

            setMeals((current) =>
                current.filter((meal) => !deleted.includes(meal.id))
            );
            setSelectedIds(failed);

            if (failed.length > 0) {
                Alert.alert(
                    'Some meals were not deleted',
                    `${failed.length} meal(s) could not be deleted. Please try again.`
                );
            }
        } finally {
            setBulkDeleting(false);
        }
    };

    const confirmDeleteSelected = () => {
        const count = selectedIds.length;

        Alert.alert(
            `Delete ${count} meal${count > 1 ? 's' : ''}?`,
            'This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: removeSelected,
                },
            ]
        );
    };

    return {
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
    };
}