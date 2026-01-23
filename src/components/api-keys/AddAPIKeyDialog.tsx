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
    onAdd: (name: string, provider: string, key: string) => Promise<void>;
    isAuthenticated: boolean;
}

const AI_PROVIDERS = [
    { value: 'openrouter', label: 'OpenRouter', prefix: 'sk-or-v1-' },
    { value: 'openai', label: 'OpenAI', prefix: 'sk-' },
    { value: 'anthropic', label: 'Anthropic', prefix: 'sk-ant-' },
    { value: 'google', label: 'Google Gemini', prefix: 'AIza' },
    { value: 'mistral', label: 'Mistral AI', prefix: '' },
] as const;

export function AddAPIKeyDialog({
    open,
    onOpenChange,
    onAdd,
    isAuthenticated
}: AddAPIKeyDialogProps) {
    const [name, setName] = useState('');
    const [provider, setProvider] = useState<string>('openrouter');
    const [key, setKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !key.trim()) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setIsLoading(true);
            await onAdd(name.trim(), provider, key.trim());
            
            // Reset form
            setName('');
            setKey('');
            setProvider('openrouter');
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
            <DialogContent className="sm:max-w-[500px]">
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
                            <Label htmlFor="provider">Provider</Label>
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
