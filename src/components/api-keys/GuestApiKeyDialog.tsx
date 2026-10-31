'use client';

/**
 * Guest API Key Dialog Component
 * 
 * Secure modal allowing unauthenticated / guest users to configure their personal API key.
 * Features:
 * - 24-hour encrypted HttpOnly cookie storage (AES-256-GCM)
 * - Provider selection (OpenRouter, Gemini, OpenAI, Anthropic, Mistral)
 * - Masked preview (sk-or-••••••••1234)
 * - Real-time 24h expiration countdown
 * - Instant key revocation / clear button
 * - Bilingual FR / EN support
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { KeyRound, ShieldCheck, Clock, Trash2, Eye, EyeOff, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { saveGuestApiKeyAction, clearGuestApiKeyAction, getGuestApiKeyAction, type GuestApiKeyStatus } from '@/app/actions/shared/guest-api-key';
import { useLanguage } from '@/contexts/LanguageContext';

export interface GuestApiKeyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onKeyUpdated?: () => void;
}

const GUEST_AI_PROVIDERS = [
    { value: 'openrouter', label: 'OpenRouter (Recommandé - Tous Modèles)', prefix: 'sk-or-' },
    { value: 'google', label: 'Google Gemini', prefix: 'AIza' },
    { value: 'openai', label: 'OpenAI (GPT-4o, o3-mini)', prefix: 'sk-' },
    { value: 'anthropic', label: 'Anthropic (Claude 3.7)', prefix: 'sk-ant-' },
    { value: 'mistral', label: 'Mistral AI', prefix: '' },
] as const;

export function GuestApiKeyDialog({
    open,
    onOpenChange,
    onKeyUpdated
}: GuestApiKeyDialogProps) {
    const { language } = useLanguage();
    const isFr = language === 'fr';

    const [provider, setProvider] = useState<string>('openrouter');
    const [apiKey, setApiKey] = useState<string>('');
    const [showKey, setShowKey] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isClearing, setIsClearing] = useState<boolean>(false);
    const [status, setStatus] = useState<GuestApiKeyStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<string>('');

    const refreshStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getGuestApiKeyAction();
            if (res.success && res.data) {
                setStatus(res.data);
                setIsEditing(!res.data.hasKey);
            }
        } catch (err) {
            console.error('Failed to load guest API key status:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => {
            refreshStatus();
            setError(null);
            setSuccessMessage(null);
            setApiKey('');
            setShowKey(false);
        }, 0);
        return () => clearTimeout(timer);
    }, [open, refreshStatus]);

    // Update countdown timer
    useEffect(() => {
        if (!status?.expiresAt || !status.hasKey) {
            const timer = setTimeout(() => {
                setTimeLeft('');
            }, 0);
            return () => clearTimeout(timer);
        }

        const updateTimer = () => {
            const diff = status.expiresAt! - Date.now();
            if (diff <= 0) {
                setTimeLeft(isFr ? 'Expirée' : 'Expired');
                return;
            }
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${hours}h ${minutes}m`);
        };

        const timer = setTimeout(() => {
            updateTimer();
        }, 0);
        const interval = setInterval(updateTimer, 60000);
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [status, isFr]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!apiKey.trim()) {
            setError(isFr ? 'Veuillez saisir votre clé API' : 'Please enter your API key');
            return;
        }

        try {
            setIsSaving(true);
            const res = await saveGuestApiKeyAction({
                provider,
                apiKey: apiKey.trim()
            });

            if (!res.success || res.error) {
                setError(res.error?.message || (isFr ? 'Erreur lors de l\'enregistrement' : 'Failed to save key'));
                return;
            }

            setSuccessMessage(isFr ? 'Clé chiffrée et activée pour 24 heures !' : 'Key encrypted & active for 24 hours!');
            setApiKey('');
            setIsEditing(false);
            await refreshStatus();
            onKeyUpdated?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : (isFr ? 'Erreur inattendue' : 'Unexpected error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = async () => {
        setError(null);
        setSuccessMessage(null);
        try {
            setIsClearing(true);
            await clearGuestApiKeyAction();
            setStatus({ hasKey: false, isExpired: false });
            setIsEditing(true);
            setSuccessMessage(isFr ? 'Clé API supprimée avec succès.' : 'API key cleared successfully.');
            onKeyUpdated?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : (isFr ? 'Erreur lors de la suppression' : 'Failed to clear key'));
        } finally {
            setIsClearing(false);
        }
    };

    const activeProviderMeta = GUEST_AI_PROVIDERS.find(p => p.value === (status?.provider || provider));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent variant="bottom-sheet" className="sm:max-w-[500px] border-border/80 shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <KeyRound className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">
                                {isFr ? 'Clé API Personnelle Invité (24h)' : 'Guest Personal API Key (24h)'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                {isFr
                                    ? 'Chiffrement AES-256-GCM éphémère. Débloque le quota et passe en BYOK illimité.'
                                    : 'Ephemeral AES-256-GCM encryption. Bypasses the 10 daily searches limit.'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs">{isFr ? 'Vérification du trousseau...' : 'Checking key status...'}</span>
                    </div>
                ) : (
                    <div className="space-y-4 py-2">
                        {/* Status Messages */}
                        {error && (
                            <div className="p-3 text-xs bg-destructive/10 border border-destructive/30 rounded-xl text-destructive flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {successMessage && (
                            <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        {/* Existing Key Active Card */}
                        {status?.hasKey && !isEditing ? (
                            <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5 py-0.5 px-2.5 font-medium">
                                            <Sparkles className="h-3 w-3" />
                                            {isFr ? 'BYOK Actif' : 'BYOK Active'}
                                        </Badge>
                                        <span className="text-xs font-semibold capitalize text-foreground">
                                            {activeProviderMeta?.label || status.provider}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-background px-2 py-1 rounded-md border">
                                        <Clock className="h-3.5 w-3.5 text-primary" />
                                        <span>{timeLeft || (isFr ? '24h actif' : '24h active')}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">{isFr ? 'Aperçu masqué (Zéro fuite)' : 'Masked Preview (Zero Leak)'}</Label>
                                    <div className="p-2.5 rounded-lg bg-background border font-mono text-xs tracking-wider text-foreground select-all">
                                        {status.maskedKey || '••••••••'}
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between gap-2 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="text-xs min-h-[44px] touch-manipulation rounded-xl"
                                    >
                                        {isFr ? 'Remplacer la clé' : 'Replace Key'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClear}
                                        disabled={isClearing}
                                        className="text-xs text-destructive hover:bg-destructive/10 min-h-[44px] gap-1.5 touch-manipulation rounded-xl"
                                    >
                                        {isClearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                        {isFr ? 'Supprimer' : 'Clear Key'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* New Key Form */
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-2.5 text-xs text-muted-foreground">
                                    <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <p className="leading-relaxed">
                                        {isFr
                                            ? 'Votre clé est chiffrée côté serveur avec un sel unique et stockée dans un cookie sécurisé expiré après 24 heures. Elle n\'est jamais persistée en base de données.'
                                            : 'Your key is encrypted on the server with AES-256-GCM and stored in a secure 24-hour cookie. It is never persisted to the database.'}
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="guest-provider" className="text-xs font-semibold">
                                        {isFr ? 'Fournisseur d\'IA (Provider)' : 'AI Provider'}
                                    </Label>
                                    <Select
                                        value={provider}
                                        onValueChange={setProvider}
                                        disabled={isSaving}
                                    >
                                        <SelectTrigger id="guest-provider" className="min-h-[44px] h-11 text-xs touch-manipulation rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GUEST_AI_PROVIDERS.map((p) => (
                                                <SelectItem key={p.value} value={p.value} className="text-xs">
                                                    {p.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="guest-api-key" className="text-xs font-semibold">
                                        {isFr ? 'Clé API personnelle' : 'Personal API Key'}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="guest-api-key"
                                            type={showKey ? 'text' : 'password'}
                                            placeholder={activeProviderMeta?.prefix ? `${activeProviderMeta.prefix}...` : 'sk-...'}
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            disabled={isSaving}
                                            required
                                            className="font-mono text-xs pr-11 min-h-[44px] h-11 rounded-xl"
                                            autoComplete="off"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowKey(!showKey)}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 size-10 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg touch-manipulation"
                                            aria-label={showKey ? 'Hide key' : 'Show key'}
                                        >
                                            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        {isFr ? 'Expiration automatique après 24 heures de session.' : 'Automatically expires after 24 hours.'}
                                    </p>
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
                                    {status?.hasKey && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsEditing(false)}
                                            disabled={isSaving}
                                            className="text-xs min-h-[44px] h-11 touch-manipulation rounded-xl"
                                        >
                                            {isFr ? 'Annuler' : 'Cancel'}
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={isSaving || !apiKey.trim()}
                                        className="text-xs min-h-[44px] h-11 gap-2 font-medium touch-manipulation rounded-xl"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                {isFr ? 'Chiffrement...' : 'Encrypting...'}
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="h-4 w-4" />
                                                {isFr ? 'Activer pour 24h' : 'Activate for 24h'}
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
