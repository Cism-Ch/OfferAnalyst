'use client';

import React, { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * ClientOnlySwitch Component
 * 
 * A wrapper component that ensures Switch components are only rendered on the client side
 * to prevent hydration issues in Next.js applications.
 * 
 * Uses useSyncExternalStore for zero-flash, idiomatic client-side mounting without setState in effects.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The Switch component to render client-side
 * @returns {JSX.Element} Placeholder during SSR, children after hydration
 */
export function ClientOnlySwitch({ children }: {
    children: React.ReactNode;
}) {
    const isClient = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );

    if (!isClient) {
        return (
            <div className="w-9 h-5 rounded-full bg-muted border border-border/60" aria-hidden="true" />
        );
    }

    return <>{children}</>;
}
