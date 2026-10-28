'use client';

/**
 * Account Settings Page
 * 
 * Manage personal account settings and preferences.
 * Features:
 * - Guest Mode vs Authenticated Cloud Account differentiation
 * - Real Profile & Password Server Actions connected to Better-Auth & Prisma
 * - Sign Out action & Local Guest Data cleanup
 * - Bilingual FR/EN interface
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useSession, signOut } from '@/lib/auth-client';
import { useLanguage } from '@/contexts/LanguageContext';
import { updateUserProfile, changeUserPassword, deleteUserAccount } from '@/app/actions/db/profile';
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
    Globe,
    LogOut,
    LogIn,
    UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUpProps, staggerContainerProps, staggerItemProps } from '@/lib/motion';
import { LanguageToggle } from '@/components/layout/LanguageToggle';

export default function SettingsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { language, t } = useLanguage();
    const isFr = language === 'fr';
    const isAuthenticated = Boolean(session?.user?.id);
    const toast = useToast();

    // Profile form state (controlled with fallback to session user)
    const [customFullName, setCustomFullName] = useState<string | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const fullName = customFullName ?? (session?.user?.name || '');
    const email = session?.user?.email || '';

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
            email: session?.user?.email || null 
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
            toast.error(
                isFr ? 'Nom requis' : 'Name required',
                isFr ? 'Veuillez saisir votre nom complet.' : 'Please enter your full name.'
            );
            return;
        }
        setIsSavingProfile(true);
        try {
            const res = await updateUserProfile({ name: fullName.trim() });
            if (!res.success) {
                toast.error(isFr ? 'Erreur' : 'Error', res.error);
                return;
            }
            toast.success(
                isFr ? 'Profil mis à jour' : 'Profile updated',
                isFr ? 'Vos informations de profil ont été enregistrées.' : 'Your profile information has been saved.'
            );
        } catch {
            toast.error(
                isFr ? 'Erreur' : 'Error',
                isFr ? 'Impossible de mettre à jour le profil.' : 'Could not update profile.'
            );
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword) {
            toast.error(
                isFr ? 'Mot de passe actuel requis' : 'Current password required',
                isFr ? 'Veuillez renseigner votre mot de passe actuel.' : 'Please enter your current password.'
            );
            return;
        }
        if (newPassword.length < 8) {
            toast.error(
                isFr ? 'Mot de passe trop court' : 'Password too short',
                t.auth.errPasswordLength
            );
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error(
                isFr ? 'Mots de passe non identiques' : 'Password mismatch',
                t.auth.errPasswordMismatch
            );
            return;
        }
        setIsChangingPassword(true);
        try {
            const res = await changeUserPassword({ currentPassword, newPassword });
            if (!res.success) {
                toast.error(isFr ? 'Erreur' : 'Error', res.error);
                return;
            }
            toast.success(
                isFr ? 'Mot de passe actualisé' : 'Password updated',
                isFr ? 'Votre mot de passe a été modifié avec succès.' : 'Your password has been updated successfully.'
            );
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            toast.error(
                isFr ? 'Erreur' : 'Error',
                isFr ? 'Échec de la mise à jour du mot de passe.' : 'Failed to update password.'
            );
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut();
            toast.success(
                isFr ? 'Déconnexion réussie' : 'Signed out',
                isFr ? 'Vous êtes maintenant en mode Invité.' : 'You are now in Guest Mode.'
            );
            router.push('/');
            router.refresh();
        } catch {
            toast.error(
                isFr ? 'Erreur' : 'Error',
                isFr ? 'Impossible de fermer la session.' : 'Failed to sign out.'
            );
        } finally {
            setIsSigningOut(false);
        }
    };

    const handleClearGuestData = () => {
        if (typeof window === 'undefined') return;
        const keysToRemove = [
            'offeranalyst_temp_api_keys',
            'offeranalyst_saved_offers',
            'offeranalyst_search_history',
            'offeranalyst_projects',
            'offeranalyst_onboarding_completed',
            'offeranalyst_onboarding_usecase',
        ];
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
        toast.success(
            isFr ? 'Données locales effacées' : 'Local data cleared',
            isFr ? 'Le cache navigateur du mode Invité a été réinitialisé.' : 'Guest Mode browser storage has been reset.'
        );
    };

    const handleDownloadData = () => {
        const payload = {
            mode: isAuthenticated ? 'authenticated' : 'guest',
            user: {
                name: fullName || session?.user?.name || 'Guest User',
                email: email || 'N/A',
                avatar: selectedAvatar,
            },
            preferences: {
                language,
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

        toast.success(
            isFr ? 'Exportation réussie' : 'Export complete',
            isFr ? 'Votre archive de données utilisateur a été générée.' : 'Your user data archive has been generated.'
        );
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') {
            toast.error(
                isFr ? 'Confirmation invalide' : 'Invalid confirmation',
                isFr ? 'Veuillez taper DELETE en majuscules pour confirmer.' : 'Please type DELETE in uppercase to confirm.'
            );
            return;
        }
        setIsDeletingAccount(true);
        try {
            const res = await deleteUserAccount();
            if (!res.success) {
                toast.error(isFr ? 'Erreur' : 'Error', res.error);
                return;
            }
            await signOut().catch(() => null);
            toast.warning(
                isFr ? 'Compte supprimé' : 'Account deleted',
                isFr ? 'Votre compte et vos données ont été supprimés.' : 'Your account and cloud data have been permanently deleted.'
            );
            setShowDeleteDialog(false);
            setDeleteConfirmText('');
            router.push('/');
            router.refresh();
        } finally {
            setIsDeletingAccount(false);
        }
    };

    return (
        <ModernLayout>
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                {/* Header */}
                <motion.div {...fadeInUpProps} className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">
                            {isFr ? 'Paramètres du Compte' : 'Account Settings'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isFr
                                ? 'Gérez votre profil, vos préférences régionales et votre sécurité'
                                : 'Manage your personal profile, regional preferences, and security'}
                        </p>
                    </div>
                    {isAuthenticated && (
                        <Button
                            variant="outline"
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="min-h-11 gap-2 self-start sm:self-auto"
                        >
                            {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                            {isSigningOut ? t.auth.signingOut : t.auth.signOut}
                        </Button>
                    )}
                </motion.div>

                <motion.div {...staggerContainerProps} className="space-y-6">
                    {/* Guest Mode Banner OR Authenticated Profile Card */}
                    {!isAuthenticated ? (
                        <motion.div {...staggerItemProps}>
                            <Card className="border-primary/30 bg-primary/5">
                                <CardHeader>
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="w-5 h-5 text-primary" />
                                            {isFr ? 'Mode Invité Actif (Session Locale)' : 'Guest Mode Active (Local Session)'}
                                        </CardTitle>
                                        <Badge variant="secondary">
                                            {t.nav.guestSession}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        {t.auth.guestNotice}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <Button asChild className="min-h-11 gap-2">
                                        <Link href="/auth/login">
                                            <LogIn className="w-4 h-4" />
                                            {t.auth.signInBtn}
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="min-h-11 gap-2">
                                        <Link href="/auth/signup">
                                            <UserPlus className="w-4 h-4" />
                                            {t.auth.signUpBtn}
                                        </Link>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleClearGuestData}
                                        className="min-h-11 gap-2 text-muted-foreground hover:text-destructive sm:ml-auto"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {isFr ? 'Réinitialiser le cache local' : 'Reset local cache'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <>
                            {/* Profile Information */}
                            <motion.div {...staggerItemProps}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{isFr ? 'Informations du Profil' : 'Profile Information'}</CardTitle>
                                        <CardDescription>
                                            {isFr ? 'Mettez à jour vos informations personnelles' : 'Update your personal information'}
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
                                        </div>

                                        <form onSubmit={handleSaveProfile} className="space-y-4">
                                            <div>
                                                <Label htmlFor="full-name">{t.auth.nameLabel}</Label>
                                                <Input
                                                    id="full-name"
                                                    type="text"
                                                    placeholder={t.auth.namePlaceholder}
                                                    value={fullName}
                                                    onChange={(e) => setCustomFullName(e.target.value)}
                                                    className="mt-2 h-11"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="email">{t.auth.emailLabel}</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    disabled
                                                    className="mt-2 h-11 bg-muted/50"
                                                />
                                            </div>

                                            <Button type="submit" disabled={isSavingProfile} className="min-h-11">
                                                {isSavingProfile ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        {isFr ? 'Enregistrement...' : 'Saving...'}
                                                    </>
                                                ) : (
                                                    isFr ? 'Enregistrer le profil' : 'Save Profile'
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
                                            {t.auth.passwordLabel}
                                        </CardTitle>
                                        <CardDescription>
                                            {isFr ? 'Modifiez votre mot de passe de connexion' : 'Change your account password'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleChangePassword} className="space-y-4">
                                            <div>
                                                <Label htmlFor="current-password">
                                                    {isFr ? 'Mot de passe actuel' : 'Current Password'}
                                                </Label>
                                                <Input
                                                    id="current-password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="mt-2 h-11"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="new-password">
                                                    {isFr ? 'Nouveau mot de passe' : 'New Password'}
                                                </Label>
                                                <Input
                                                    id="new-password"
                                                    type="password"
                                                    placeholder={t.auth.passwordMinHint}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="mt-2 h-11"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="confirm-password">
                                                    {t.auth.confirmPasswordLabel}
                                                </Label>
                                                <Input
                                                    id="confirm-password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="mt-2 h-11"
                                                />
                                            </div>

                                            <Button type="submit" disabled={isChangingPassword} className="min-h-11">
                                                {isChangingPassword ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        {isFr ? 'Mise à jour...' : 'Updating Password...'}
                                                    </>
                                                ) : (
                                                    isFr ? 'Modifier le mot de passe' : 'Change Password'
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
                                        <CardTitle>{isFr ? 'Comptes Connectés (OAuth)' : 'Connected Accounts (OAuth)'}</CardTitle>
                                        <CardDescription>
                                            {isFr ? 'Connexions tierces associées à votre compte' : 'Manage your OAuth provider connections'}
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
                                                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            {isFr ? 'Connecté' : 'Connected'}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            {isFr ? 'Non lié' : 'Not linked'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </>
                    )}

                    {/* Language & Regional Preferences */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-primary" />
                                    {isFr ? 'Langue & Région' : 'Language & Region'}
                                </CardTitle>
                                <CardDescription>
                                    {isFr
                                        ? "Choisissez votre langue d'affichage et de synthèse IA (Français ou Anglais)"
                                        : 'Choose your display and AI synthesis language (French or English)'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/30">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-semibold">
                                            {isFr ? 'Langue active' : 'Active Language'}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {isFr
                                                ? "Adapte les formulaires, métriques et explications générées par l'IA"
                                                : 'Adapts forms, metrics, and AI-generated explanations'}
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
                                    {isFr ? 'Gérez vos préférences de notification' : 'Manage how you receive notifications'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>{isFr ? 'Notifications Email' : 'Email Notifications'}</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {isFr ? 'Recevoir les alertes de sécurité par email' : 'Receive security alerts via email'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={emailNotifications}
                                        onCheckedChange={(checked) => {
                                            setEmailNotifications(checked);
                                            toast.info(
                                                isFr ? 'Préférences modifiées' : 'Preferences updated',
                                                isFr
                                                    ? `Notifications email ${checked ? 'activées' : 'désactivées'}.`
                                                    : `Email notifications ${checked ? 'enabled' : 'disabled'}.`
                                            );
                                        }}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>{isFr ? 'Notifications Push' : 'Push Notifications'}</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {isFr ? 'Notifications navigateur en temps réel' : 'Receive browser push notifications'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={pushNotifications}
                                        onCheckedChange={(checked) => {
                                            setPushNotifications(checked);
                                            toast.info(
                                                isFr ? 'Préférences modifiées' : 'Preferences updated',
                                                isFr
                                                    ? `Notifications push ${checked ? 'activées' : 'désactivées'}.`
                                                    : `Push notifications ${checked ? 'enabled' : 'disabled'}.`
                                            );
                                        }}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>{isFr ? 'Résumé Hebdomadaire' : 'Weekly Digest'}</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {isFr ? 'Synthèse hebdomadaire de vos analyses' : 'Get a weekly summary of your activity'}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={weeklyDigest}
                                        onCheckedChange={(checked) => {
                                            setWeeklyDigest(checked);
                                            toast.info(
                                                isFr ? 'Préférences modifiées' : 'Preferences updated',
                                                isFr
                                                    ? `Résumé hebdomadaire ${checked ? 'activé' : 'désactivé'}.`
                                                    : `Weekly digest ${checked ? 'enabled' : 'disabled'}.`
                                            );
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
                                    {isFr ? 'Confidentialité & Export' : 'Privacy & Security'}
                                </CardTitle>
                                <CardDescription>
                                    {isFr ? 'Contrôlez et exportez vos données personnelles' : 'Control and export your personal data'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-semibold mb-2">
                                        {isFr ? 'Protection des Données' : 'Data Privacy'}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {isFr
                                            ? 'Vos recherches et analyses restent privées. Les clés API Cloud sont chiffrées en AES-256-GCM au repos.'
                                            : 'Your searches and analyses are private. Cloud API keys are encrypted with AES-256-GCM at rest.'}
                                    </p>
                                </div>
                                <Button variant="outline" onClick={handleDownloadData} className="min-h-11">
                                    <Download className="w-4 h-4 mr-2" />
                                    {isFr ? 'Télécharger mes données (JSON)' : 'Download My Data (JSON)'}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Danger Zone (Authenticated Only) */}
                    {isAuthenticated && (
                        <motion.div {...staggerItemProps}>
                            <Card className="border-destructive/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-destructive">
                                        <AlertTriangle className="w-5 h-5" />
                                        {isFr ? 'Zone Critique' : 'Danger Zone'}
                                    </CardTitle>
                                    <CardDescription>
                                        {isFr ? 'Actions irréversibles sur votre compte' : 'Irreversible account actions'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                                        <h4 className="font-semibold mb-2">
                                            {isFr ? 'Supprimer le compte' : 'Delete Account'}
                                        </h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {isFr
                                                ? 'La suppression de votre compte effacera définitivement vos projets, historiques, clés API et favoris Cloud.'
                                                : 'Once you delete your account, all your cloud projects, history, API keys, and saved offers will be permanently removed.'}
                                        </p>
                                        <Button 
                                            variant="destructive"
                                            onClick={() => setShowDeleteDialog(true)}
                                            className="min-h-11"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            {isFr ? 'Supprimer définitivement mon compte' : 'Delete Account'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </motion.div>

                {/* Delete Account Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="w-5 h-5" />
                                {isFr ? 'Supprimer le compte définitivement' : 'Delete Account Permanently'}
                            </DialogTitle>
                            <DialogDescription>
                                {isFr
                                    ? 'Cette action supprimera immédiatement votre compte utilisateur, vos analyses enregistrées et vos clés API Cloud.'
                                    : 'This will permanently delete your user account, analysis records, and stored settings. This action cannot be reversed.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2 space-y-2">
                            <Label htmlFor="delete-confirm">
                                {isFr ? (
                                    <>Tapez <span className="font-bold text-destructive">DELETE</span> pour confirmer :</>
                                ) : (
                                    <>Type <span className="font-bold text-destructive">DELETE</span> to confirm:</>
                                )}
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
                                {isFr ? 'Annuler' : 'Cancel'}
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
                            >
                                {isDeletingAccount ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {isFr ? 'Suppression...' : 'Deleting...'}
                                    </>
                                ) : (
                                    isFr ? 'Confirmer la suppression' : 'Confirm Deletion'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ModernLayout>
    );
}
