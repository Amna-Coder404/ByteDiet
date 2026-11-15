import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { lightColors, darkColors } from '../constants/theme';

const KEY = 'bytediet-theme';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const system = useColorScheme();
    const [mode, setMode] = useState(null);

    // Load the saved mode (falls back to the phone setting)
    useEffect(() => {
        AsyncStorage.getItem(KEY)
            .then((saved) => {
                if (saved === 'dark' || saved === 'light') setMode(saved);
                else setMode(system === 'dark' ? 'dark' : 'light');
            })
            .catch(() => setMode('light'));
    }, []);

    const isDark = mode === 'dark';

    const toggleTheme = useCallback(() => {
        const next = isDark ? 'light' : 'dark';
        setMode(next);
        AsyncStorage.setItem(KEY, next).catch(() => { });
    }, [isDark]);

    const value = useMemo(
        () => ({
            isDark,
            toggleTheme,
            colors: isDark ? darkColors : lightColors,
        }),
        [isDark, toggleTheme]
    );

    if (mode === null) return null; // wait for the saved mode

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
}

// Builds styles from a createStyles(colors) function
export function useThemedStyles(createStyles) {
    const { colors } = useTheme();
    return useMemo(() => createStyles(colors), [colors]);
}