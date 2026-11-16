// src/components/OfflineGate.jsx
// Wrap any screen that needs the internet. When offline it shows the shared
// NotFound component instead of the screen.
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import Screen from './Screen';
import NotFound from './NotFound';
import { useNetwork } from '../hooks/offlineSupport/useNetwork';
import { useTheme } from '../context/ThemeContext';

export default function OfflineGate({ feature = 'This feature', children }) {
    const { isOnline } = useNetwork();
    const { colors } = useTheme();

    if (isOnline === false) {
        return (
            <Screen contentStyle={{ justifyContent: 'center' }}>
                <NotFound
                    icon={<Ionicons name="cloud-offline-outline" size={48} color={colors.muted} />}
                    text={`${feature} needs an internet connection. Please reconnect and try again.`}
                />
            </Screen>
        );
    }

    return children;
}