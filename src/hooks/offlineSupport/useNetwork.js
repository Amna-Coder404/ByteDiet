

import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

// NetInfo hook that tells you if the phone is online
/**
 * isOnline: null  -> still checking
 *           true  -> connected to the internet
 *           false -> offline
 */
export function useNetwork() {
    const [isOnline, setIsOnline] = useState(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsOnline(!!state.isConnected && state.isInternetReachable !== false);
        });
        return unsubscribe;
    }, []);

    return { isOnline };
}

export default useNetwork;