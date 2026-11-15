import { View, ActivityIndicator } from 'react-native';
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Loader = () => {
    const { colors } = useTheme();

    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.bg,
            }}
        >
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
};

export default Loader;