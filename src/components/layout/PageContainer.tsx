import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * PageContainer Component (RSC by default)
 *
 * Implements fluid bounded containers with canonical 2026 responsive spacing tokens:
 * - `--spacing-page` for horizontal gutter (16px on mobile -> 32px on desktop)
 * - `--spacing-section` for vertical breathing room (20px on mobile -> 40px on desktop)
 *
 * Follows Rule 1 (RSC by default), Rule 12 (Documentation), and Rule 14 (Canonical Tailwind).
 */

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "main" | "section" | "article";
  size?: "sm" | "md" | "lg" | "xl" | "full" | "default";
  disablePaddingY?: boolean;
}

const sizeClasses: Record<NonNullable<PageContainerProps["size"]>, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  default: "max-w-7xl",
  lg: "max-w-7xl",
  xl: "max-w-screen-2xl",
  full: "max-w-full",
};

export function PageContainer({
  children,
  className,
  as: Component = "div",
  size = "default",
  disablePaddingY = false,
  ...props
}: PageContainerProps) {
  return (
    <Component
      data-slot="page-container"
      className={cn(
        "w-full mx-auto px-[var(--spacing-page)]",
        !disablePaddingY && "py-[var(--spacing-section)]",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
