'use client';

import React, { useState, useEffect } from 'react';

/**
 * ClientOnlySwitch Component
 * 
 * A wrapper component that ensures Switch components are only rendered on the client side
 * to prevent hydration issues in Next.js applications.
 * 
 * This component displays a placeholder during server-side rendering and the actual
 * children once the component has mounted on the client.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The Switch component to render client-side
 * @returns {JSX.Element} Placeholder during SSR, children after hydration
 */
export function ClientOnlySwitch({ children }: {
    children: React.ReactNode;
}) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="w-9 h-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        );
    }

    return <>{children}</>;
}
