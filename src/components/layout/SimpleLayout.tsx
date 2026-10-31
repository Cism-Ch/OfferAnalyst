'use client';

/**
 * Simple Layout Wrapper (Delegates to unified AppShell)
 * 
 * Features:
 * - 100% backward-compatible props interface for content & documentation pages
 * - Collapsible sidebar with automatic tablet icon rail mode
 * - Modern responsive header with breadcrumbs and actions
 * - Fluid page content container with design tokens
 */

import React from 'react';
import { AppShell, type AppShellProps } from './AppShell';

export type SimpleLayoutProps = AppShellProps;

export function SimpleLayout(props: SimpleLayoutProps) {
    return <AppShell showModelSelector={true} {...props} />;
}
