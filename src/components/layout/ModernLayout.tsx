'use client';

/**
 * Modern Premium Layout Wrapper (Delegates to unified AppShell)
 * 
 * Features:
 * - 100% backward-compatible props interface
 * - Collapsible sidebar with automatic tablet icon rail mode
 * - Modern responsive header with breadcrumbs and actions
 * - Fluid page content container with design tokens
 */

import React from 'react';
import { AppShell, type AppShellProps } from './AppShell';

export type ModernLayoutProps = AppShellProps;

export function ModernLayout(props: ModernLayoutProps) {
    return <AppShell showModelSelector={true} {...props} />;
}
