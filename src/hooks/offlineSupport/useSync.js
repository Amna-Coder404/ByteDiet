
import { useEffect, useRef } from 'react';

import { useAuth } from '../../context/AuthContext';
import { syncPending } from '../../services/offlineServices/syncService';
import useNetwork from './useNetwork';

// Sends saved offline edits to Supabase when the internet is back
export default function useSync() {
    const { user, refreshOnboarding } = useAuth();
    const { isOnline } = useNetwork();
    const running = useRef(false);

    useEffect(() => {
        if (!isOnline || !user?.id || running.current) return;

        running.current = true;

        syncPending(user.id)
            .then(async (synced) => {
                if (synced) {
                    try {
                        await refreshOnboarding();
                    } catch { }
                }
            })
            .catch(() => { })
            .finally(() => {
                running.current = false;
            });
    }, [isOnline, user?.id]);
}