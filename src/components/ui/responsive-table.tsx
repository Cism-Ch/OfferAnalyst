import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * ResponsiveTable Component & Table Primitives
 *
 * Implements accessible, dense-data presentation across all viewports:
 * - Desktop (md+): Standard semantic HTML <table> with sticky/scroll container and neat borders
 * - Mobile (<md): Stacked key-value accessible card list, eliminating horizontal scrolling
 *
 * Conforms to:
 * - Rule 1 (RSC/Client friendly)
 * - Rule 9 (Strict TypeScript, zero any)
 * - Rule 12 (Comprehensive documentation)
 * - Rule 14 (Canonical Tailwind CSS ordering)
 * - Rule R-UI-05 (44px touch targets on mobile interactions)
 */

export interface ResponsiveTableColumn<T> {
  key: string;
  header: React.ReactNode;
  /** Custom label used for mobile card view. Defaults to header string when header is a string */
  mobileLabel?: React.ReactNode;
  /** Custom cell renderer */
  render?: (row: T, index: number) => React.ReactNode;
  /** Alignment of column text */
  align?: "left" | "center" | "right";
  /** Custom header cell className */
  headerClassName?: string;
  /** Custom table body cell className */
  cellClassName?: string;
  /** Custom mobile card item className */
  mobileClassName?: string;
  /** Hide this column in the mobile card view */
  hideOnMobile?: boolean;
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: ResponsiveTableColumn<T>[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyMessage?: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: React.ReactNode;
  className?: string;
  tableClassName?: string;
  cardClassName?: string;
  caption?: string;
  /** Optional header title for each mobile card */
  mobileCardTitle?: (row: T, index: number) => React.ReactNode;
}

/* ========================================================================= */
/* Primitive Shadcn-compatible Table Elements (Accessible HTML <table>)     */
/* ========================================================================= */

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-xs sm:text-sm text-left", className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b border-border/80 text-muted-foreground", className)}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0 divide-y divide-border/60", className)}
      {...props}
    />
  );
}

export function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

export function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border/60 transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      scope="col"
      className={cn(
        "h-10 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("p-3 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

export function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-xs text-muted-foreground text-center", className)}
      {...props}
    />
  );
}

/* ========================================================================= */
/* High-Level Responsive Table (Desktop: <table>, Mobile: Stacked Cards)     */
/* ========================================================================= */

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "Aucune donnée disponible",
  isLoading = false,
  loadingMessage = "Chargement des données...",
  className,
  tableClassName,
  cardClassName,
  caption,
  mobileCardTitle,
}: ResponsiveTableProps<T>) {
  // Alignment helper
  const getAlignClass = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center justify-center";
    if (align === "right") return "text-right justify-end";
    return "text-left justify-start";
  };

  if (isLoading) {
    return (
      <div className={cn("w-full py-8 text-center text-muted-foreground text-sm", className)}>
        <div className="inline-flex items-center gap-2">
          <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>{loadingMessage}</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn("w-full p-6 text-center text-muted-foreground text-sm bg-muted/20 rounded-lg border border-border/50", className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div data-slot="responsive-table-container" className={cn("w-full", className)}>
      {/* Mobile Stacked Card View (< md) */}
      <div className="block md:hidden space-y-3" role="list" aria-label={caption || "Tableau de données"}>
        {data.map((row, rowIndex) => {
          const rowKey = keyExtractor(row, rowIndex);
          const titleContent = mobileCardTitle ? mobileCardTitle(row, rowIndex) : null;
          return (
            <div
              key={rowKey}
              role="listitem"
              className={cn(
                "rounded-lg border border-border/80 bg-card p-3.5 shadow-xs transition-colors hover:bg-accent/20 space-y-2.5",
                cardClassName
              )}
            >
              {titleContent && (
                <div className="pb-2 mb-2 border-b border-border/60 flex items-center justify-between font-medium">
                  {titleContent}
                </div>
              )}
              <dl className="grid grid-cols-2 gap-2 text-xs">
                {columns
                  .filter((col) => !col.hideOnMobile)
                  .map((col) => {
                    const label = col.mobileLabel ?? col.header;
                    const value = col.render
                      ? col.render(row, rowIndex)
                      : String((row as Record<string, unknown>)[col.key] ?? "-");

                    return (
                      <div
                        key={col.key}
                        className={cn("flex flex-col gap-0.5", col.mobileClassName)}
                      >
                        <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          {label}
                        </dt>
                        <dd className={cn("font-medium text-foreground", getAlignClass(col.align))}>
                          {value}
                        </dd>
                      </div>
                    );
                  })}
              </dl>
            </div>
          );
        })}
      </div>

      {/* Desktop Standard Table View (md+) */}
      <div className="hidden md:block">
        <Table className={tableClassName}>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(getAlignClass(col.align), col.headerClassName)}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => {
              const rowKey = keyExtractor(row, rowIndex);
              return (
                <TableRow key={rowKey}>
                  {columns.map((col) => {
                    const value = col.render
                      ? col.render(row, rowIndex)
                      : String((row as Record<string, unknown>)[col.key] ?? "-");

                    return (
                      <TableCell
                        key={col.key}
                        className={cn(getAlignClass(col.align), col.cellClassName)}
                      >
                        {value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
