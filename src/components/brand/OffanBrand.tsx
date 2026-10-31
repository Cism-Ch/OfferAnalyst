import React from 'react';

/**
 * OffanBrand - Typographic & Geometric Brand Components (2026 High-Legibility Edition)
 * 
 * Monogram & Logotype for 'Offan' (Offer Analyst).
 * Features:
 * - Pure scalable SVG vector monogram (O + A analytical peak)
 * - Transparent geometry using compound paths (fillRule="evenodd") — no opaque background patches
 * - Standard CSS variables (var(--primary)) avoiding broken hsl(#hex) syntax
 * - Universal legibility across all dark, light, luxury gold, silver and neon themes
 */

export interface OffanIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    glow?: boolean;
    className?: string;
}

export function OffanIcon({
    size = 28,
    glow = false,
    className = '',
    ...props
}: OffanIconProps) {
    const gradId = React.useId();

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`shrink-0 transition-[filter,transform] duration-200 ${
                glow ? 'filter drop-shadow-[0_0_6px_var(--primary)]' : ''
            } ${className}`}
            aria-label="Offan Logo Icon"
            {...props}
        >
            <defs>
                <linearGradient id={gradId} x1="10%" y1="0%" x2="90%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
                    <stop offset="60%" stopColor="var(--primary)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.75" />
                </linearGradient>
            </defs>

            {/* Outer Geometric 'O' Ring */}
            <circle
                cx="50"
                cy="46"
                r="36"
                stroke={`url(#${gradId})`}
                strokeWidth="5"
                strokeLinecap="round"
                className="opacity-95"
            />

            {/* Inner secondary precision dashed ring */}
            <circle
                cx="50"
                cy="46"
                r="28"
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                className="opacity-40"
            />

            {/* 
              Geometric Analytical Chevron 'A' (Offer Analyst Peak)
              Compound path with fillRule="evenodd" so the inner apex is genuinely transparent!
              Outer triangle: M50,18 L76,68 H64 L50,38 L36,68 H24 Z
              Inner cut: M50,36 L61,58 H39 Z
            */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M50 18L76 68H64L50 38L36 68H24L50 18ZM50 36L60 56H40L50 36Z"
                fill={`url(#${gradId})`}
                className="transition-transform duration-200 origin-center"
            />

            {/* Analytical Crossbar Base */}
            <path
                d="M32 74H68"
                stroke={`url(#${gradId})`}
                strokeWidth="4"
                strokeLinecap="round"
            />

            {/* Base anchor dots */}
            <circle cx="26" cy="74" r="2.5" fill="var(--primary)" />
            <circle cx="74" cy="74" r="2.5" fill="var(--primary)" />
        </svg>
    );
}

export interface OffanLogoProps {
    variant?: 'full' | 'compact' | 'monogram';
    size?: 'sm' | 'md' | 'lg';
    glow?: boolean;
    className?: string;
}

export function OffanLogo({
    variant = 'full',
    size = 'md',
    glow = true,
    className = ''
}: OffanLogoProps) {
    const iconSizes = {
        sm: 22,
        md: 26,
        lg: 34
    };

    const textSizes = {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-2xl'
    };

    const subSizes = {
        sm: 'text-[9px]',
        md: 'text-[10px]',
        lg: 'text-xs'
    };

    if (variant === 'monogram') {
        return <OffanIcon size={iconSizes[size]} glow={glow} className={className} />;
    }

    return (
        <div className={`flex items-center gap-2.5 select-none ${className}`}>
            {/* Emblem container with high-contrast badge background */}
            <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-card border border-border shadow-xs hover:border-primary/50 transition-colors">
                <OffanIcon size={iconSizes[size]} glow={glow} />
            </div>

            <div className="flex flex-col justify-center">
                <div className="flex items-center">
                    <span className={`font-extrabold tracking-[0.16em] uppercase text-foreground leading-tight ${textSizes[size]}`}>
                        Off<span className="text-primary font-black ml-[1px]">an</span>
                    </span>
                    <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                </div>
                {variant === 'full' && (
                    <span className={`font-semibold tracking-[0.24em] uppercase text-muted-foreground leading-none mt-0.5 ${subSizes[size]}`}>
                        Offer Analyst
                    </span>
                )}
            </div>
        </div>
    );
}
