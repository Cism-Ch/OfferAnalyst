'use client';

/**
 * Add API Key Dialog Component
 * 
 * Modal for adding new API keys (both persistent and temporary)
 */

import React, { useState } from 'react';
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
import { AlertCircle } from 'lucide-react';

interface AddAPIKeyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (name: string, provider: string, key: string, expiresAt?: Date | null, rateLimit?: number | null) => Promise<void>;
    isAuthenticated: boolean;
    initialProvider?: string;
}

const AI_PROVIDERS = [
    { value: 'openrouter', label: 'OpenRouter (Recommandé - Tous Modèles)', prefix: 'sk-or-v1-' },
    { value: 'openai', label: 'OpenAI (GPT-4o, o3-mini)', prefix: 'sk-' },
    { value: 'anthropic', label: 'Anthropic (Claude 3.7 Sonnet)', prefix: 'sk-ant-' },
    { value: 'deepseek', label: 'DeepSeek (R1 & V3)', prefix: 'sk-' },
    { value: 'moonshot', label: 'Moonshot AI / Kimi (Kimi 2.6)', prefix: 'sk-' },
    { value: 'mistral', label: 'Mistral AI (Mistral Large)', prefix: '' },
    { value: 'google', label: 'Google Gemini', prefix: 'AIza' },
] as const;

const EXPIRATION_OPTIONS = [
    { value: 'never', label: 'Jamais (Recommandé)' },
    { value: '30', label: '30 jours' },
    { value: '90', label: '90 jours' },
    { value: '180', label: '6 mois' },
    { value: '365', label: '1 an' },
    { value: 'custom', label: 'Date personnalisée' },
] as const;

export function AddAPIKeyDialog({
    open,
    onOpenChange,
    onAdd,
    isAuthenticated,
    initialProvider = 'openrouter'
}: AddAPIKeyDialogProps) {
    const [name, setName] = useState('');
    const [provider, setProvider] = useState<string>(initialProvider);
    const [key, setKey] = useState('');
    const [expirationOption, setExpirationOption] = useState<string>('never');
    const [customExpiration, setCustomExpiration] = useState('');
    const [rateLimit, setRateLimit] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        if (initialProvider) {
            const timer = setTimeout(() => {
                setProvider(initialProvider);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [initialProvider, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !key.trim()) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setIsLoading(true);
            
            // Calculate expiration date
            let expiresAt: Date | null = null;
            if (isAuthenticated && expirationOption !== 'never') {
                if (expirationOption === 'custom' && customExpiration) {
                    expiresAt = new Date(customExpiration);
                } else if (expirationOption !== 'custom') {
                    const days = parseInt(expirationOption);
                    expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + days);
                }
            }

            // Parse rate limit
            const rateLimitNum = rateLimit ? parseInt(rateLimit) : null;
            
            await onAdd(name.trim(), provider, key.trim(), expiresAt, rateLimitNum);
            
            // Reset form
            setName('');
            setKey('');
            setProvider('openrouter');
            setExpirationOption('never');
            setCustomExpiration('');
            setRateLimit('');
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add API key');
        } finally {
            setIsLoading(false);
        }
    };

    const selectedProvider = AI_PROVIDERS.find(p => p.value === provider);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent variant="bottom-sheet" className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add API Key</DialogTitle>
                        <DialogDescription>
                            {isAuthenticated ? (
                                'Add a new API key for BYOK (Bring Your Own Key) access. Your key will be encrypted and stored securely.'
                            ) : (
                                'Add a temporary API key. It will be stored locally in your browser for 24 hours.'
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {!isAuthenticated && (
                            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 flex gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium mb-1">Temporary Storage</p>
                                    <p className="text-muted-foreground text-xs">
                                        Your key will be stored locally for 24 hours only. 
                                        <a href="/auth/signup" className="underline ml-1">Sign up</a> for persistent storage.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name">Key Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Production Key"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="provider">Fournisseur d&apos;IA (Provider)</Label>
                            <Select
                                value={provider}
                                onValueChange={setProvider}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="provider">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {AI_PROVIDERS.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Informative Guidance Banner based on provider choice */}
                            {provider === 'openrouter' ? (
                                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-lg p-2.5 text-xs text-emerald-600 dark:text-emerald-400">
                                    <p className="font-semibold flex items-center gap-1.5 mb-0.5">
                                        <span>✨</span> Clé Universelle Recommandée
                                    </p>
                                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                                        Une seule clé OpenRouter (commençant par <code className="font-mono bg-muted/60 px-1 py-0.5 rounded text-foreground">sk-or-v1-</code>) active immédiatement l&apos;ensemble des 9 modèles (Claude 3.7, GPT-4o, DeepSeek R1, Kimi, Mistral, Gemini, Nemotron) sans nécessiter de comptes tiers multiples.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-blue-500/10 border border-blue-500/25 rounded-lg p-2.5 text-xs text-blue-600 dark:text-blue-400">
                                    <p className="font-semibold flex items-center gap-1.5 mb-0.5">
                                        <span>ℹ️</span> Passerelle Unifiée OpenRouter
                                    </p>
                                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                                        OfferAnalyst achemine l&apos;ensemble des requêtes d&apos;inférence via le hub OpenRouter. Pour utiliser vos propres crédits {selectedProvider?.label}, vous pouvez soit associer votre compte sur <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-primary">openrouter.ai/keys</a> (BYOK), soit utiliser une clé OpenRouter universelle.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="key">API Key</Label>
                            <Input
                                id="key"
                                type="password"
                                placeholder={selectedProvider?.prefix ? `Starts with ${selectedProvider.prefix}...` : 'Enter your API key'}
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                disabled={isLoading}
                                required
                                className="font-mono text-sm"
                            />
                        </div>

                        {isAuthenticated && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="expiration">Expiration (Optionnel)</Label>
                                    <Select
                                        value={expirationOption}
                                        onValueChange={setExpirationOption}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger id="expiration">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EXPIRATION_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {expirationOption === 'custom' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="customExpiration">Date d&apos;expiration personnalisée</Label>
                                        <Input
                                            id="customExpiration"
                                            type="date"
                                            value={customExpiration}
                                            onChange={(e) => setCustomExpiration(e.target.value)}
                                            disabled={isLoading}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="rateLimit">Rate Limit (Optionnel)</Label>
                                    <Input
                                        id="rateLimit"
                                        type="number"
                                        placeholder="Nombre max de requêtes par heure (vide = illimité)"
                                        value={rateLimit}
                                        onChange={(e) => setRateLimit(e.target.value)}
                                        disabled={isLoading}
                                        min="1"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Laissez vide pour aucune limite
                                    </p>
                                </div>
                            </>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-500">
                                {error}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Adding...' : 'Add Key'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
