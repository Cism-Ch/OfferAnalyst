'use client';

import React, { useMemo, useState } from 'react';
import { Globe, ShieldCheck, Users, Search, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserGeoStat } from '@/app/actions/db/admin';

interface UserWorldMapCardProps {
    stats: UserGeoStat[];
    isLoading?: boolean;
}

const SVG_WIDTH = 800;
const SVG_HEIGHT = 400;

/**
 * Equirectangular projection helper mapping WGS84 (lng, lat) to SVG (x, y).
 */
function projectCoordinates(lng: number, lat: number): { x: number; y: number } {
    const x = ((lng + 180) / 360) * SVG_WIDTH;
    const y = ((90 - lat) / 180) * SVG_HEIGHT;
    return { x, y };
}

/**
 * Stylized low-poly continent outlines on an 800x400 equirectangular canvas.
 * Purely geometric & dependency-free for instant SSR/CSR rendering.
 */
const CONTINENT_PATHS: Array<{ id: string; label: string; d: string }> = [
    {
        id: 'north-america',
        label: 'Amérique du Nord',
        d: 'M 62 56 L 145 48 L 210 68 L 245 104 L 218 134 L 195 148 L 182 178 L 154 188 L 130 162 L 96 130 L 66 86 Z',
    },
    {
        id: 'greenland',
        label: 'Groenland',
        d: 'M 252 24 L 306 20 L 320 48 L 284 66 L 254 50 Z',
    },
    {
        id: 'south-america',
        label: 'Amérique du Sud',
        d: 'M 218 192 L 266 204 L 298 232 L 282 288 L 250 342 L 236 338 L 230 278 L 212 224 Z',
    },
    {
        id: 'europe',
        label: 'Europe',
        d: 'M 374 96 L 404 72 L 456 64 L 486 84 L 478 112 L 444 126 L 414 130 L 382 126 L 370 112 Z',
    },
    {
        id: 'africa',
        label: 'Afrique',
        d: 'M 372 136 L 424 134 L 468 148 L 502 184 L 482 242 L 456 286 L 434 284 L 414 238 L 388 196 L 364 166 Z',
    },
    {
        id: 'asia',
        label: 'Asie',
        d: 'M 484 64 L 598 54 L 716 74 L 732 108 L 696 146 L 656 176 L 614 188 L 568 182 L 534 164 L 494 146 L 478 114 Z',
    },
    {
        id: 'oceania',
        label: 'Océanie',
        d: 'M 636 244 L 704 238 L 728 274 L 694 304 L 642 292 L 626 266 Z',
    },
];

const LATITUDE_LINES = [-60, -30, 0, 30, 60];
const LONGITUDE_LINES = [-120, -60, 0, 60, 120];

export function UserWorldMapCard({ stats, isLoading = false }: UserWorldMapCardProps) {
    const localizedCountries = useMemo(
        () => stats.filter((item) => item.countryCode !== 'INTL'),
        [stats]
    );
    const intlStat = useMemo(
        () => stats.find((item) => item.countryCode === 'INTL'),
        [stats]
    );

    const [selectedCode, setSelectedCode] = useState<string | null>(null);

    const activeCountry = useMemo(() => {
        if (selectedCode) {
            return stats.find((item) => item.countryCode === selectedCode) ?? null;
        }
        return localizedCountries[0] ?? intlStat ?? null;
    }, [selectedCode, stats, localizedCountries, intlStat]);

    const totalUsers = useMemo(
        () => stats.reduce((acc, item) => acc + item.userCount, 0),
        [stats]
    );
    const totalSearches = useMemo(
        () => stats.reduce((acc, item) => acc + item.searchCount, 0),
        [stats]
    );
    const maxActivity = useMemo(() => {
        const peak = Math.max(
            ...localizedCountries.map((c) => c.userCount + c.searchCount),
            1
        );
        return peak;
    }, [localizedCountries]);

    return (
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">
                            Répartition Géographique Interactive
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        >
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            Conforme RGPD — Agrégation Pays ISO-3166
                        </Badge>
                    </div>
                    <CardDescription>
                        Origine déclarée ou inférée au niveau pays uniquement (aucune IP ni coordonnée personnelle conservée).
                    </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span className="font-semibold text-foreground">{totalUsers}</span>
                        <span>utilisateurs</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5">
                        <Search className="h-3.5 w-3.5 text-cyan-400" />
                        <span className="font-semibold text-foreground">{totalSearches}</span>
                        <span>recherches</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5">
                        <MapPin className="h-3.5 w-3.5 text-amber-400" />
                        <span className="font-semibold text-foreground">
                            {localizedCountries.length}
                        </span>
                        <span>pays actifs</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Interactive Equirectangular World Map */}
                <div className="lg:col-span-8 flex flex-col gap-3">
                    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-slate-950/80 p-3">
                        <svg
                            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                            className="h-auto w-full select-none"
                            role="img"
                            aria-label="Carte du monde interactive des utilisateurs et recherches OfferAnalyst"
                        >
                            <defs>
                                <radialGradient id="oceanGlow" cx="50%" cy="45%" r="65%">
                                    <stop offset="0%" stopColor="rgba(14, 165, 233, 0.12)" />
                                    <stop offset="100%" stopColor="rgba(2, 6, 23, 0.0)" />
                                </radialGradient>
                            </defs>

                            <rect
                                x={0}
                                y={0}
                                width={SVG_WIDTH}
                                height={SVG_HEIGHT}
                                fill="url(#oceanGlow)"
                            />

                            {/* Graticule grid */}
                            <g stroke="rgba(148, 163, 184, 0.12)" strokeWidth={1} strokeDasharray="3 4">
                                {LATITUDE_LINES.map((lat) => {
                                    const { y } = projectCoordinates(0, lat);
                                    return (
                                        <line
                                            key={`lat-${lat}`}
                                            x1={0}
                                            y1={y}
                                            x2={SVG_WIDTH}
                                            y2={y}
                                        />
                                    );
                                })}
                                {LONGITUDE_LINES.map((lng) => {
                                    const { x } = projectCoordinates(lng, 0);
                                    return (
                                        <line
                                            key={`lng-${lng}`}
                                            x1={x}
                                            y1={0}
                                            x2={x}
                                            y2={SVG_HEIGHT}
                                        />
                                    );
                                })}
                            </g>

                            {/* Stylized continents */}
                            <g>
                                {CONTINENT_PATHS.map((continent) => (
                                    <path
                                        key={continent.id}
                                        d={continent.d}
                                        fill="rgba(30, 41, 59, 0.88)"
                                        stroke="rgba(71, 85, 105, 0.65)"
                                        strokeWidth={1.25}
                                        strokeLinejoin="round"
                                    />
                                ))}
                            </g>

                            {/* Country activity markers */}
                            <g>
                                {localizedCountries.map((country) => {
                                    const { x, y } = projectCoordinates(country.lng, country.lat);
                                    const weight = country.userCount + country.searchCount;
                                    const ratio = Math.sqrt(weight / maxActivity);
                                    const radius = 5 + ratio * 10;
                                    const isSelected = activeCountry?.countryCode === country.countryCode;

                                    return (
                                        <g
                                            key={country.countryCode}
                                            transform={`translate(${x}, ${y})`}
                                            className="cursor-pointer"
                                            onClick={() => setSelectedCode(country.countryCode)}
                                            onMouseEnter={() => setSelectedCode(country.countryCode)}
                                        >
                                            <circle
                                                r={radius * 1.9}
                                                fill={
                                                    isSelected
                                                        ? 'rgba(34, 211, 238, 0.25)'
                                                        : 'rgba(16, 185, 129, 0.16)'
                                                }
                                                className="animate-pulse"
                                            />
                                            <circle
                                                r={radius}
                                                fill={isSelected ? '#22d3ee' : '#10b981'}
                                                stroke="#020617"
                                                strokeWidth={1.5}
                                            />
                                            <text
                                                y={-radius - 6}
                                                textAnchor="middle"
                                                fontSize={10}
                                                fontWeight={600}
                                                fill={isSelected ? '#67e8f9' : '#cbd5e1'}
                                            >
                                                {country.countryCode} ({country.userCount})
                                            </text>
                                        </g>
                                    );
                                })}
                            </g>
                        </svg>

                        {/* Selected country detail bar */}
                        {activeCountry ? (
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/70 px-3 py-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-base">{activeCountry.flag}</span>
                                    <span className="font-semibold text-foreground">
                                        {activeCountry.labelFr}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px]">
                                        {activeCountry.countryCode}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <span>
                                        <strong className="text-foreground">
                                            {activeCountry.userCount}
                                        </strong>{' '}
                                        profil(s) ({activeCountry.percentage}%)
                                    </span>
                                    <span>
                                        <strong className="text-cyan-400">
                                            {activeCountry.searchCount}
                                        </strong>{' '}
                                        recherche(s) localisée(s)
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-3 rounded-lg border border-border/50 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                                {isLoading
                                    ? 'Chargement des statistiques géographiques agrégées...'
                                    : 'Aucune donnée géographique enregistrée pour le moment.'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Country ranking sidebar + International bucket */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <span>Classement par Pays</span>
                        <span>Profils / Recherches</span>
                    </div>

                    <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
                        {stats.length === 0 && (
                            <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                                {isLoading
                                    ? 'Analyse en cours...'
                                    : 'Aucun utilisateur ou historique géolocalisé.'}
                            </p>
                        )}

                        {stats.map((country) => {
                            const isSelected = activeCountry?.countryCode === country.countryCode;
                            return (
                                <button
                                    key={country.countryCode}
                                    type="button"
                                    onClick={() => setSelectedCode(country.countryCode)}
                                    className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                                        isSelected
                                            ? 'border-cyan-500/60 bg-cyan-500/10'
                                            : 'border-border/50 bg-background/40 hover:border-border hover:bg-background/70'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-2 truncate">
                                            <span>{country.flag}</span>
                                            <span className="truncate font-medium text-foreground">
                                                {country.labelFr}
                                            </span>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2 font-mono text-[11px]">
                                            <span className="text-foreground">
                                                {country.userCount}u
                                            </span>
                                            <span className="text-muted-foreground">/</span>
                                            <span className="text-cyan-400">
                                                {country.searchCount}r
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                                            style={{
                                                width: `${Math.max(country.percentage, country.searchCount > 0 ? 6 : 0)}%`,
                                            }}
                                        />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {intlStat && (
                        <div className="mt-auto rounded-lg border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
                            <div className="flex items-center justify-between font-medium text-foreground">
                                <span>🌍 Portée Internationale (INTL)</span>
                                <span>{intlStat.percentage}% des profils</span>
                            </div>
                            <p className="mt-1 text-[11px]">
                                Inclut les recherches multi-marchés sans restriction nationale ({intlStat.searchCount} recherche(s)).
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
