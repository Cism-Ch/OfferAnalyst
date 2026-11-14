'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { Globe, ShieldCheck, Users, Search, MapPin, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Map,
    MapControls,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MarkerTooltip,
    type MapRef,
} from '@/components/ui/map';
import type { UserGeoStat } from '@/app/actions/db/admin';

interface UserWorldMapCardProps {
    stats: UserGeoStat[];
    isLoading?: boolean;
}

const WORLD_CENTER: [number, number] = [10, 22];
const WORLD_ZOOM = 1.35;

export function UserWorldMapCard({ stats, isLoading = false }: UserWorldMapCardProps) {
    const { resolvedTheme } = useTheme();
    const mapRef = useRef<MapRef | null>(null);

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
    const maxActivity = useMemo(
        () => Math.max(...localizedCountries.map((c) => c.userCount + c.searchCount), 1),
        [localizedCountries]
    );

    const handleSelectCountry = (country: UserGeoStat) => {
        setSelectedCode(country.countryCode);
        if (country.countryCode !== 'INTL') {
            mapRef.current?.flyTo({
                center: [country.lng, country.lat],
                zoom: 3.6,
                duration: 900,
            });
        }
    };

    const handleResetWorldView = () => {
        setSelectedCode(null);
        mapRef.current?.flyTo({
            center: WORLD_CENTER,
            zoom: WORLD_ZOOM,
            duration: 800,
        });
    };

    return (
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Globe className="size-5 text-primary" />
                        <CardTitle className="text-lg">
                            Carte du Monde Interactive (Utilisateurs & Recherches)
                        </CardTitle>
                        <Badge
                            variant="outline"
                            className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        >
                            <ShieldCheck className="mr-1 size-3" />
                            Conforme RGPD — Agrégation Pays ISO-3166
                        </Badge>
                    </div>
                    <CardDescription>
                        Carte MapLibre GL interactive avec agrégation stricte au niveau pays (aucune IP ni donnée personnelle stockée).
                    </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5">
                        <Users className="size-3.5 text-primary" />
                        <span className="font-semibold text-foreground">{totalUsers}</span>
                        <span>utilisateurs</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5">
                        <Search className="size-3.5 text-cyan-400" />
                        <span className="font-semibold text-foreground">{totalSearches}</span>
                        <span>recherches</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5">
                        <MapPin className="size-3.5 text-amber-400" />
                        <span className="font-semibold text-foreground">
                            {localizedCountries.length}
                        </span>
                        <span>pays actifs</span>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleResetWorldView}
                        className="h-8 gap-1.5 text-xs"
                    >
                        <RotateCcw className="size-3.5" />
                        Vue Monde
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Interactive @mapcn/map (MapLibre GL) */}
                <div className="flex flex-col gap-3 lg:col-span-8">
                    <div className="relative h-[380px] w-full overflow-hidden rounded-xl border border-border/60 bg-background">
                        <Map
                            ref={mapRef}
                            theme={resolvedTheme === 'light' ? 'light' : 'dark'}
                            center={WORLD_CENTER}
                            zoom={WORLD_ZOOM}
                            minZoom={1}
                            maxZoom={8}
                            className="h-full w-full"
                        >
                            <MapControls
                                position="bottom-right"
                                showZoom
                                showCompass
                                showFullscreen
                            />

                            {localizedCountries.map((country) => {
                                const weight = country.userCount + country.searchCount;
                                const ratio = Math.sqrt(weight / maxActivity);
                                const markerSize = Math.round(14 + ratio * 16);
                                const isSelected = activeCountry?.countryCode === country.countryCode;

                                return (
                                    <MapMarker
                                        key={country.countryCode}
                                        longitude={country.lng}
                                        latitude={country.lat}
                                        onClick={() => handleSelectCountry(country)}
                                    >
                                        <MarkerContent>
                                            <div
                                                className={`relative flex items-center justify-center rounded-full border-2 border-background shadow-lg transition-transform hover:scale-110 ${
                                                    isSelected
                                                        ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/30'
                                                        : 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                                                }`}
                                                style={{
                                                    width: `${markerSize}px`,
                                                    height: `${markerSize}px`,
                                                }}
                                            >
                                                <span className="text-[9px] font-bold leading-none">
                                                    {country.userCount}
                                                </span>
                                            </div>
                                        </MarkerContent>

                                        <MarkerTooltip>
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <span>{country.flag}</span>
                                                <span className="font-semibold">{country.labelFr}</span>
                                                <span className="text-muted-foreground">
                                                    · {country.userCount}u / {country.searchCount}r
                                                </span>
                                            </div>
                                        </MarkerTooltip>

                                        <MarkerPopup closeButton>
                                            <div className="flex min-w-[180px] flex-col gap-2 text-xs">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                        <span className="text-base">{country.flag}</span>
                                                        <span>{country.labelFr}</span>
                                                    </div>
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {country.countryCode}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-2 text-[11px]">
                                                    <div>
                                                        <p className="text-muted-foreground">Profils</p>
                                                        <p className="font-semibold text-foreground">
                                                            {country.userCount} ({country.percentage}%)
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Recherches</p>
                                                        <p className="font-semibold text-cyan-400">
                                                            {country.searchCount}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </MarkerPopup>
                                    </MapMarker>
                                );
                            })}
                        </Map>
                    </div>

                    {activeCountry ? (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/70 px-3 py-2 text-xs">
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
                        <div className="rounded-lg border border-border/50 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                            {isLoading
                                ? 'Chargement des statistiques géographiques agrégées...'
                                : 'Aucune donnée géographique enregistrée pour le moment.'}
                        </div>
                    )}
                </div>

                {/* Country ranking sidebar + International bucket */}
                <div className="flex flex-col gap-3 lg:col-span-4">
                    <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <span>Classement par Pays</span>
                        <span>Profils / Recherches</span>
                    </div>

                    <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-1">
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
                                    onClick={() => handleSelectCountry(country)}
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
