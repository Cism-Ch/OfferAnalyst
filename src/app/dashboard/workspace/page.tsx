'use client';

/**
 * Workspace Management Page (Multi-Tenancy)
 * 
 * Manage workspace identity, team collaboration, role-based access control (RBAC),
 * and shared criteria for recruitment agencies, hunters, and teams.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Users,
    Plus,
    Mail,
    Trash2,
    Building2,
    Save,
    Loader2,
    Crown,
    Briefcase
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/toast';
import {
    getWorkspaceAction,
    updateWorkspaceAction,
    inviteWorkspaceMemberAction,
    updateMemberRoleAction,
    removeWorkspaceMemberAction,
    WorkspaceDTO
} from '@/app/actions/db/workspaces';

export default function WorkspacePage() {
    const { t, language } = useLanguage();
    const isFr = language === 'fr';
    const wp = t.workspacePage;
    const toast = useToast();

    const [workspace, setWorkspace] = useState<WorkspaceDTO | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [workspaceName, setWorkspaceName] = useState<string>('');
    const [workspaceDesc, setWorkspaceDesc] = useState<string>('');

    // Invite Modal State
    const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
    const [inviteEmail, setInviteEmail] = useState<string>('');
    const [inviteName, setInviteName] = useState<string>('');
    const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');
    const [isInviting, setIsInviting] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;
        getWorkspaceAction().then(res => {
            if (isMounted && res.success && res.data) {
                setWorkspace(res.data);
                setWorkspaceName(res.data.name);
                setWorkspaceDesc(res.data.description || '');
            }
            if (isMounted) setIsLoading(false);
        }).catch(() => {
            if (isMounted) setIsLoading(false);
        });
        return () => {
            isMounted = false;
        };
    }, []);

    const handleSaveWorkspace = async () => {
        if (!workspaceName.trim()) {
            toast.error(isFr ? "Le nom est requis." : "Workspace name is required.");
            return;
        }

        setIsSaving(true);
        try {
            const res = await updateWorkspaceAction({
                name: workspaceName,
                description: workspaceDesc
            });

            if (res.success && res.data) {
                setWorkspace(res.data);
                toast.success(wp.savedToast);
            } else {
                toast.error(res.error || (isFr ? "Échec de l'enregistrement" : "Save failed"));
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur inattendue");
        } finally {
            setIsSaving(false);
        }
    };

    const handleInviteMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim() || !inviteName.trim()) {
            toast.error(isFr ? "Tous les champs sont requis." : "All fields are required.");
            return;
        }

        setIsInviting(true);
        try {
            const res = await inviteWorkspaceMemberAction({
                email: inviteEmail.trim(),
                name: inviteName.trim(),
                role: inviteRole
            });

            if (res.success && res.data) {
                setWorkspace(res.data);
                toast.success(wp.inviteSuccessToast);
                setIsInviteOpen(false);
                setInviteEmail('');
                setInviteName('');
                setInviteRole('MEMBER');
            } else {
                toast.error(res.error || (isFr ? "Échec de l'invitation" : "Invite failed"));
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur inattendue");
        } finally {
            setIsInviting(false);
        }
    };

    const handleUpdateRole = async (memberId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') => {
        try {
            const res = await updateMemberRoleAction({ memberId, role });
            if (res.success && res.data) {
                setWorkspace(res.data);
                toast.success(isFr ? "Rôle mis à jour" : "Role updated");
            } else {
                toast.error(res.error || (isFr ? "Échec de la modification" : "Role change failed"));
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur inattendue");
        }
    };

    const handleRemoveMember = async (memberId: string, memberName: string | null) => {
        if (!window.confirm(`${wp.removeConfirm} (${memberName || 'ce membre'})`)) {
            return;
        }

        try {
            const res = await removeWorkspaceMemberAction({ memberId });
            if (res.success && res.data) {
                setWorkspace(res.data);
                toast.success(wp.memberRemovedToast);
            } else {
                toast.error(res.error || (isFr ? "Échec du retrait" : "Removal failed"));
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erreur inattendue");
        }
    };

    const isOwnerOrAdmin = workspace?.currentUserRole === 'OWNER' || workspace?.currentUserRole === 'ADMIN';

    return (
        <ModernLayout>
            <div className="container mx-auto py-6 px-4 max-w-4xl space-y-6">
                {/* Header */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <Building2 className="h-7 w-7 text-primary" />
                            <span>{wp.title}</span>
                        </h1>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                            {workspace?.plan ? workspace.plan.toUpperCase() : 'FREE'}
                        </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        {wp.description}
                    </p>
                </div>

                {/* B2B Callout Card */}
                <Card className="rounded-2xl border border-primary/20 bg-primary/5 shadow-xs overflow-hidden">
                    <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <span>{wp.b2bCalloutTitle}</span>
                                <Badge variant="secondary" className="text-[10px] font-normal">
                                    Prosumer & B2B
                                </Badge>
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {wp.b2bCalloutDesc}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-xs">Chargement de votre espace de travail...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Workspace Identity Details */}
                        <Card className="rounded-2xl border border-border/70 bg-card shadow-xs overflow-hidden">
                            <CardHeader className="p-4 sm:p-6 pb-3 border-b border-border/50">
                                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    <span>{wp.infoTitle}</span>
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {wp.infoDesc}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ws-name" className="text-xs font-semibold text-foreground">
                                            {wp.nameLabel}
                                        </Label>
                                        <Input
                                            id="ws-name"
                                            value={workspaceName}
                                            onChange={(e) => setWorkspaceName(e.target.value)}
                                            disabled={!isOwnerOrAdmin}
                                            placeholder="Ex: Agence Recrutement Tech"
                                            className="text-xs h-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ws-desc" className="text-xs font-semibold text-foreground">
                                            {wp.descLabel}
                                        </Label>
                                        <Input
                                            id="ws-desc"
                                            value={workspaceDesc}
                                            onChange={(e) => setWorkspaceDesc(e.target.value)}
                                            disabled={!isOwnerOrAdmin}
                                            placeholder="Ex: Sourcing profils lead & expatriés"
                                            className="text-xs h-9"
                                        />
                                    </div>
                                </div>

                                {isOwnerOrAdmin && (
                                    <div className="flex justify-end pt-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={isSaving}
                                            onClick={handleSaveWorkspace}
                                            className="text-xs h-8 gap-1.5 font-semibold touch-manipulation"
                                        >
                                            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                            <span>{isSaving ? wp.saving : wp.saveChanges}</span>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Team Members List & Invitation */}
                        <Card className="rounded-2xl border border-border/70 bg-card shadow-xs overflow-hidden">
                            <CardHeader className="p-4 sm:p-6 pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span>{wp.teamTitle}</span>
                                        <Badge variant="secondary" className="text-xs font-mono">
                                            {workspace?.members.length || 0}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        {wp.teamDesc}
                                    </CardDescription>
                                </div>
                                {isOwnerOrAdmin && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => setIsInviteOpen(true)}
                                        className="text-xs h-8 gap-1.5 font-semibold touch-manipulation self-start sm:self-auto"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>{wp.inviteBtn}</span>
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-3">
                                <div className="space-y-2.5">
                                    {workspace?.members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-muted/40"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                                                    {(member.name || member.email)[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-xs text-foreground">
                                                            {member.name || 'Membre invité'}
                                                        </span>
                                                        {member.role === 'OWNER' && (
                                                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] gap-1 py-0">
                                                                <Crown className="h-2.5 w-2.5" />
                                                                <span>{wp.roleOwner}</span>
                                                            </Badge>
                                                        )}
                                                        {member.status === 'invited' && (
                                                            <Badge variant="secondary" className="text-[10px] py-0">
                                                                {wp.statusInvited}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                                        <Mail className="h-3 w-3" />
                                                        <span>{member.email}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                                {/* Role Switcher or Badge */}
                                                {member.role === 'OWNER' ? (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {wp.roleOwner}
                                                    </Badge>
                                                ) : isOwnerOrAdmin ? (
                                                    <select
                                                        value={member.role}
                                                        onChange={(e) => handleUpdateRole(member.id, e.target.value as 'ADMIN' | 'MEMBER' | 'VIEWER')}
                                                        className="text-xs bg-background border border-border/80 rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                                    >
                                                        <option value="ADMIN">{wp.roleAdmin}</option>
                                                        <option value="MEMBER">{wp.roleMember}</option>
                                                        <option value="VIEWER">{wp.roleViewer}</option>
                                                    </select>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs">
                                                        {member.role === 'ADMIN' ? wp.roleAdmin : member.role === 'MEMBER' ? wp.roleMember : wp.roleViewer}
                                                    </Badge>
                                                )}

                                                {/* Remove Member Button */}
                                                {isOwnerOrAdmin && member.role !== 'OWNER' && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveMember(member.id, member.name)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        title={wp.removeBtn}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Invite Teammate Modal */}
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogContent className="max-w-md p-5 sm:p-6 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl">
                        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/40">
                            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span>{wp.modalInviteTitle}</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                {wp.modalInviteDesc}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleInviteMember} className="space-y-4 pt-3 text-xs">
                            <div className="space-y-1.5">
                                <Label htmlFor="inv-name" className="text-xs font-semibold text-foreground">
                                    {wp.inputName}
                                </Label>
                                <Input
                                    id="inv-name"
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    placeholder="Ex: Sophie Martin"
                                    required
                                    className="text-xs h-9"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="inv-email" className="text-xs font-semibold text-foreground">
                                    {wp.inputEmail}
                                </Label>
                                <Input
                                    id="inv-email"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="sophie@cabinet-recrutement.fr"
                                    required
                                    className="text-xs h-9"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="inv-role" className="text-xs font-semibold text-foreground">
                                    {wp.inputRole}
                                </Label>
                                <div className="grid grid-cols-3 gap-2 pt-1">
                                    {(['ADMIN', 'MEMBER', 'VIEWER'] as const).map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setInviteRole(r)}
                                            className={`p-2.5 rounded-xl border text-center transition-all ${
                                                inviteRole === r
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                                    : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border/60'
                                            }`}
                                        >
                                            <span className="block font-semibold text-xs">
                                                {r === 'ADMIN' ? wp.roleAdmin : r === 'MEMBER' ? wp.roleMember : wp.roleViewer}
                                            </span>
                                            <span className="block text-[9px] opacity-80 mt-0.5">
                                                {r === 'ADMIN' ? 'Gestion' : r === 'MEMBER' ? 'Édition' : 'Lecture'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsInviteOpen(false)}
                                    className="text-xs h-8"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isInviting}
                                    className="text-xs h-8 gap-1.5 font-semibold touch-manipulation"
                                >
                                    {isInviting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                                    <span>{wp.inviteBtn}</span>
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </ModernLayout>
    );
}
