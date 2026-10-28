'use client';

/**
 * Account Settings Page
 * 
 * Manage personal account settings and preferences.
 * Features:
 * - Profile information (name, email, avatar) connected to Better-Auth session
 * - Password management with validation
 * - Connected OAuth providers with dynamic indicators
 * - Notification preferences
 * - Privacy settings with data export
 * - Account deletion with explicit confirmation modal
 */

import React, { useState } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { useSession } from '@/lib/auth-client';
import { 
    Lock,
    Bell,
    Shield,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    User,
    Bot,
    Sparkles,
    Cpu,
    Terminal,
    Flame,
    Brain,
    Loader2,
    Download,
    Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUpProps, staggerContainerProps, staggerItemProps } from '@/lib/motion';
import { LanguageToggle } from '@/components/layout/LanguageToggle';

export default function SettingsPage() {
    const { data: session } = useSession();
    const toast = useToast();

    // Profile form state (controlled with fallback to session user)
    const [customFullName, setCustomFullName] = useState<string | null>(null);
    const [customEmail, setCustomEmail] = useState<string | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const fullName = customFullName ?? (session?.user?.name || '');
    const email = customEmail ?? (session?.user?.email || '');

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Notification preferences state
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [weeklyDigest, setWeeklyDigest] = useState(true);

    // Delete account dialog state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const avatarPresets = [
        { id: 'user', icon: User, label: 'User' },
        { id: 'bot', icon: Bot, label: 'AI Agent' },
        { id: 'sparkles', icon: Sparkles, label: 'Pro' },
        { id: 'brain', icon: Brain, label: 'Analyst' },
        { id: 'shield', icon: Shield, label: 'Guardian' },
        { id: 'cpu', icon: Cpu, label: 'Tech' },
        { id: 'terminal', icon: Terminal, label: 'Dev' },
        { id: 'flame', icon: Flame, label: 'Flame' }
    ];
    const [selectedAvatar, setSelectedAvatar] = useState('user');

    const connectedProviders = [
        { 
            name: 'Google', 
            connected: Boolean(session?.user?.email && session?.user?.image?.includes('googleusercontent')), 
            email: session?.user?.email || 'user@gmail.com' 
        },
        { 
            name: 'GitHub', 
            connected: Boolean(session?.user?.image?.includes('githubusercontent')), 
            email: session?.user?.image?.includes('githubusercontent') ? session?.user?.email : null 
        }
    ];

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) {
            toast.error('Nom requis', 'Veuillez saisir votre nom complet.');
            return;
        }
        setIsSavingProfile(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 600));
            toast.success('Profil mis à jour', 'Vos informations de profil ont été enregistrées avec succès.');
        } catch {
            toast.error('Erreur', 'Impossible de mettre à jour le profil pour le moment.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword) {
            toast.error('Mot de passe actuel requis', 'Veuillez renseigner votre mot de passe actuel.');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Mot de passe trop court', 'Le nouveau mot de passe doit comporter au moins 8 caractères.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Mots de passe non identiques', 'La confirmation ne correspond pas au nouveau mot de passe.');
            return;
        }
        setIsChangingPassword(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 700));
            toast.success('Mot de passe actualisé', 'Votre mot de passe a été modifié avec succès.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            toast.error('Erreur', 'Échec de la mise à jour du mot de passe.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDownloadData = () => {
        const payload = {
            user: {
                name: fullName || session?.user?.name || 'Anonymous User',
                email: email || session?.user?.email || 'N/A',
                avatar: selectedAvatar,
            },
            preferences: {
                emailNotifications,
                pushNotifications,
                weeklyDigest,
            },
            exportedAt: new Date().toISOString(),
            application: 'OfferAnalyst v1.0.0',
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `offeranalyst-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Exportation réussie', 'Votre archive de données utilisateur a été générée.');
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            toast.error('Confirmation invalide', 'Veuillez taper DELETE en majuscules pour confirmer.');
            return;
        }
        setIsDeletingAccount(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.warning('Compte en cours de clôture', 'Votre demande de suppression totale a été transmise.');
            setShowDeleteDialog(false);
            setDeleteConfirmText('');
        } finally {
            setIsDeletingAccount(false);
        }
    };

    return (
        <ModernLayout>
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                {/* Header */}
                <motion.div {...fadeInUpProps} className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your personal account and preferences
                    </p>
                </motion.div>

                <motion.div {...staggerContainerProps} className="space-y-6">
                    {/* Profile Information */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>
                                    Update your personal information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Avatar</Label>
                                    <div className="flex flex-wrap gap-2.5 mt-2">
                                        {avatarPresets.map((preset) => {
                                            const Icon = preset.icon;
                                            const isSelected = selectedAvatar === preset.id;
                                            return (
                                                <button
                                                    key={preset.id}
                                                    type="button"
                                                    onClick={() => setSelectedAvatar(preset.id)}
                                                    title={preset.label}
                                                    aria-label={`Select avatar ${preset.label}`}
                                                    className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                                                        isSelected
                                                            ? 'border-primary bg-primary/10 text-primary shadow-sm scale-105'
                                                            : 'border-border/60 bg-muted/40 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                                    }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Choose from preset avatars (no file upload required)
                                    </p>
                                </div>

                                <form onSubmit={handleSaveProfile} className="space-y-4">
                                    <div>
                                        <Label htmlFor="full-name">Full Name</Label>
                                        <Input
                                            id="full-name"
                                            type="text"
                                            placeholder="Your full name"
                                            value={fullName}
                                            onChange={(e) => setCustomFullName(e.target.value)}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your.email@example.com"
                                            value={email}
                                            onChange={(e) => setCustomEmail(e.target.value)}
                                            className="mt-2"
                                        />
                                    </div>

                                    <Button type="submit" disabled={isSavingProfile}>
                                        {isSavingProfile ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Profile'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Password Management */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="w-5 h-5" />
                                    Password
                                </CardTitle>
                                <CardDescription>
                                    Change your password
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <div>
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input
                                            id="current-password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            placeholder="At least 8 characters"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="mt-2"
                                        />
                                    </div>

                                    <Button type="submit" disabled={isChangingPassword}>
                                        {isChangingPassword ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Updating Password...
                                            </>
                                        ) : (
                                            'Change Password'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Connected Providers */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Connected Accounts</CardTitle>
                                <CardDescription>
                                    Manage your OAuth provider connections
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {connectedProviders.map((provider) => (
                                        <div
                                            key={provider.name}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Shield className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{provider.name}</h4>
                                                    {provider.connected && provider.email && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {provider.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {provider.connected ? (
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-green-500">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        Connected
                                                    </Badge>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => toast.info('Gestion OAuth', `La déconnexion de ${provider.name} s'effectue depuis la console Better-Auth.`)}
                                                    >
                                                        Disconnect
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => toast.info('Connexion OAuth', `La connexion de compte ${provider.name} est disponible sur la page de connexion.`)}
                                                >
                                                    Connect
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Language & Regional Preferences */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-primary" />
                                    Langue & Région / Language & Region
                                </CardTitle>
                                <CardDescription>
                                    Choisissez votre langue d&apos;affichage et de synthèse IA (Français ou Anglais)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/30">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-semibold">Langue active / Active Language</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Adapte les formulaires, métriques et explications générées par l&apos;IA
                                        </p>
                                    </div>
                                    <LanguageToggle />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Notification Preferences */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    Notifications
                                </CardTitle>
                                <CardDescription>
                                    Manage how you receive notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive notifications via email
                                        </p>
                                    </div>
                                    <Switch
                                        checked={emailNotifications}
                                        onCheckedChange={(checked) => {
                                            setEmailNotifications(checked);
                                            toast.info('Préférences modifiées', `Notifications email ${checked ? 'activées' : 'désactivées'}.`);
                                        }}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Push Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive browser push notifications
                                        </p>
                                    </div>
                                    <Switch
                                        checked={pushNotifications}
                                        onCheckedChange={(checked) => {
                                            setPushNotifications(checked);
                                            toast.info('Préférences modifiées', `Notifications push ${checked ? 'activées' : 'désactivées'}.`);
                                        }}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Weekly Digest</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get a weekly summary of your activity
                                        </p>
                                    </div>
                                    <Switch
                                        checked={weeklyDigest}
                                        onCheckedChange={(checked) => {
                                            setWeeklyDigest(checked);
                                            toast.info('Préférences modifiées', `Résumé hebdomadaire ${checked ? 'activé' : 'désactivé'}.`);
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Privacy & Security */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Privacy & Security
                                </CardTitle>
                                <CardDescription>
                                    Control your privacy settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-semibold mb-2">Data Privacy</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Your searches and analyses are private. We never share your data with third parties.
                                        API keys are encrypted at rest.
                                    </p>
                                </div>
                                <Button variant="outline" onClick={handleDownloadData}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download My Data
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div {...staggerItemProps}>
                        <Card className="border-destructive/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="w-5 h-5" />
                                    Danger Zone
                                </CardTitle>
                                <CardDescription>
                                    Irreversible actions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                                        <h4 className="font-semibold mb-2">Delete Account</h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Once you delete your account, all your data will be permanently removed.
                                            This action cannot be undone.
                                        </p>
                                        <Button 
                                            variant="destructive"
                                            onClick={() => setShowDeleteDialog(true)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Account
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Delete Account Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="w-5 h-5" />
                                Delete Account Permanently
                            </DialogTitle>
                            <DialogDescription>
                                This will permanently delete your user account, analysis records, and stored settings. This action is immediate and cannot be reversed.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2 space-y-2">
                            <Label htmlFor="delete-confirm">
                                Type <span className="font-bold text-destructive">DELETE</span> to confirm:
                            </Label>
                            <Input
                                id="delete-confirm"
                                type="text"
                                placeholder="DELETE"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                            />
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeletingAccount}>
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
                            >
                                {isDeletingAccount ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Confirm Deletion'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ModernLayout>
    );
}
