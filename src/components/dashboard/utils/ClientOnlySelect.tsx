'use client';

import React, { useState, useEffect } from 'react';

/**
 * ClientOnlySelect Component
 * 
 * A wrapper component that ensures Select components are only rendered on the client side
 * to prevent hydration issues in Next.js applications.
 * 
 * This component displays a placeholder during server-side rendering and the actual
 * children once the component has mounted on the client.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The Select component to render client-side
 * @returns {JSX.Element} Placeholder during SSR, children after hydration
 */
export function ClientOnlySelect({ children }: {
    children: React.ReactNode;
}) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm">
                <span className="text-muted-foreground">Select limit</span>
            </div>
        );
    }

    return <>{children}</>;
}
