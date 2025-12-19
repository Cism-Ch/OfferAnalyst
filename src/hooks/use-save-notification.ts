"use client"

import { useEffect, useState } from 'react';

/**
 * Custom hook for showing save notifications
 * 
 * This hook provides state for showing save notifications,
 * giving users visual feedback that their data is being persisted.
 * 
 * @returns State and trigger function for showing save notifications
 */
export function useSaveNotification() {
    const [showNotification, setShowNotification] = useState(false);
    const [notificationTimeout, setNotificationTimeout] = useState<number | null>(null);

    const triggerNotification = () => {
        // Clear any existing timeout
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }

        setShowNotification(true);
        
        const timeout = setTimeout(() => {
            setShowNotification(false);
        }, 2000);
        
        setNotificationTimeout(timeout as unknown as number);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (notificationTimeout) {
                clearTimeout(notificationTimeout);
            }
        };
    }, [notificationTimeout]);

    return {
        showNotification,
        triggerNotification
    };
}
