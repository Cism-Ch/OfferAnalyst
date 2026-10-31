'use server';

/**
 * Server Actions: Workspace & Team Management (Multi-Tenancy)
 * 
 * Manages workspaces, member invitations, RBAC roles (OWNER, ADMIN, MEMBER, VIEWER),
 * and shared quotas. Follows Rule 2, 3, 10 (singleton prisma, Zod validation, { success, data, error }).
 */

import { z } from 'zod';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { WorkspaceRole } from '@prisma/client';

export interface WorkspaceMemberDTO {
    id: string;
    workspaceId: string;
    userId: string | null;
    email: string;
    name: string | null;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
    status: string;
    joinedAt: string;
}

export interface WorkspaceDTO {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    plan: string;
    currentUserRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
    members: WorkspaceMemberDTO[];
    isGuest?: boolean;
}

export interface WorkspaceActionResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

const UpdateWorkspaceSchema = z.object({
    name: z.string().min(2, 'Le nom doit comporter au moins 2 caractères').max(50),
    description: z.string().max(200).optional()
});

const InviteMemberSchema = z.object({
    email: z.string().email('Adresse email invalide'),
    name: z.string().min(1, 'Le nom est requis').max(50),
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER'])
});

const UpdateRoleSchema = z.object({
    memberId: z.string().min(1),
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER'])
});

const RemoveMemberSchema = z.object({
    memberId: z.string().min(1)
});

/**
 * Get current user workspace or auto-provision default workspace
 */
export async function getWorkspaceAction(): Promise<WorkspaceActionResult<WorkspaceDTO>> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session?.user?.id) {
            // Guest fallback workspace
            return {
                success: true,
                data: {
                    id: 'guest-workspace',
                    name: 'Espace Invité (Démo)',
                    description: 'Espace de travail en mode invité local.',
                    ownerId: 'guest-user',
                    plan: 'free',
                    currentUserRole: 'OWNER',
                    isGuest: true,
                    members: [
                        {
                            id: 'guest-member-1',
                            workspaceId: 'guest-workspace',
                            userId: 'guest-user',
                            email: 'invite@offeranalyst.com',
                            name: 'Invité Actif',
                            role: 'OWNER',
                            status: 'active',
                            joinedAt: new Date().toISOString()
                        }
                    ]
                }
            };
        }

        const userId = session.user.id;
        const userEmail = session.user.email;
        const userName = session.user.name || 'Utilisateur';

        // Find existing workspace owned by user or where user is member
        let workspace = await prisma.workspace.findFirst({
            where: { ownerId: userId },
            include: {
                members: {
                    orderBy: { joinedAt: 'asc' }
                }
            }
        });

        // If not owner, check membership
        if (!workspace) {
            const membership = await prisma.workspaceMember.findFirst({
                where: {
                    OR: [
                        { userId },
                        { email: userEmail }
                    ]
                },
                include: {
                    workspace: {
                        include: {
                            members: {
                                orderBy: { joinedAt: 'asc' }
                            }
                        }
                    }
                }
            });

            if (membership?.workspace) {
                workspace = membership.workspace;
            }
        }

        // Auto-provision default personal workspace if none exists
        if (!workspace) {
            workspace = await prisma.workspace.create({
                data: {
                    name: `Espace de ${userName}`,
                    description: 'Espace de travail principal pour l\'analyse collaborative.',
                    ownerId: userId,
                    plan: 'free',
                    members: {
                        create: {
                            userId,
                            email: userEmail,
                            name: userName,
                            role: 'OWNER' as WorkspaceRole,
                            status: 'active'
                        }
                    }
                },
                include: {
                    members: true
                }
            });
        }

        // Determine current user's role
        let currentRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' = 'VIEWER';
        if (workspace.ownerId === userId) {
            currentRole = 'OWNER';
        } else {
            const userMember = workspace.members.find(m => m.userId === userId || m.email === userEmail);
            if (userMember) {
                currentRole = userMember.role as 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
            }
        }

        const membersDTO: WorkspaceMemberDTO[] = workspace.members.map(m => ({
            id: m.id,
            workspaceId: m.workspaceId,
            userId: m.userId,
            email: m.email,
            name: m.name,
            role: m.role as 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER',
            status: m.status,
            joinedAt: m.joinedAt.toISOString()
        }));

        return {
            success: true,
            data: {
                id: workspace.id,
                name: workspace.name,
                description: workspace.description,
                ownerId: workspace.ownerId,
                plan: workspace.plan,
                currentUserRole: currentRole,
                isGuest: false,
                members: membersDTO
            }
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Erreur lors de la récupération du workspace'
        };
    }
}

/**
 * Update workspace name & description
 */
export async function updateWorkspaceAction(
    rawInput: { name: string; description?: string }
): Promise<WorkspaceActionResult<WorkspaceDTO>> {
    try {
        const parsed = UpdateWorkspaceSchema.safeParse(rawInput);
        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0]?.message || 'Données invalides'
            };
        }

        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentification requise pour modifier l\'espace de travail'
            };
        }

        const userId = session.user.id;
        const workspace = await prisma.workspace.findFirst({
            where: { ownerId: userId }
        });

        if (!workspace) {
            return {
                success: false,
                error: 'Espace de travail introuvable ou permissions insuffisantes'
            };
        }

        await prisma.workspace.update({
            where: { id: workspace.id },
            data: {
                name: parsed.data.name.trim(),
                description: parsed.data.description?.trim() || null
            }
        });

        revalidatePath('/dashboard/workspace');
        return getWorkspaceAction();
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour du workspace'
        };
    }
}

/**
 * Invite or add a member to the workspace
 */
export async function inviteWorkspaceMemberAction(
    rawInput: { email: string; name: string; role: 'ADMIN' | 'MEMBER' | 'VIEWER' }
): Promise<WorkspaceActionResult<WorkspaceDTO>> {
    try {
        const parsed = InviteMemberSchema.safeParse(rawInput);
        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0]?.message || 'Données invalides'
            };
        }

        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentification requise pour inviter un collaborateur'
            };
        }

        const userId = session.user.id;
        const workspace = await prisma.workspace.findFirst({
            where: { ownerId: userId },
            include: { members: true }
        });

        if (!workspace) {
            return {
                success: false,
                error: 'Vous devez être propriétaire du workspace pour inviter des membres'
            };
        }

        const normalizedEmail = parsed.data.email.toLowerCase().trim();

        // Check if member already exists in workspace
        const existingMember = workspace.members.find(
            m => m.email.toLowerCase() === normalizedEmail
        );

        if (existingMember) {
            return {
                success: false,
                error: `Un membre avec l'adresse ${normalizedEmail} est déjà présent dans ce workspace.`
            };
        }

        // Check if user already exists in DB
        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail }
        });

        await prisma.workspaceMember.create({
            data: {
                workspaceId: workspace.id,
                userId: existingUser?.id || null,
                email: normalizedEmail,
                name: parsed.data.name.trim(),
                role: parsed.data.role as WorkspaceRole,
                status: existingUser ? 'active' : 'invited'
            }
        });

        revalidatePath('/dashboard/workspace');
        return getWorkspaceAction();
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Erreur lors de l\'invitation du membre'
        };
    }
}

/**
 * Update a member's role
 */
export async function updateMemberRoleAction(
    rawInput: { memberId: string; role: 'ADMIN' | 'MEMBER' | 'VIEWER' }
): Promise<WorkspaceActionResult<WorkspaceDTO>> {
    try {
        const parsed = UpdateRoleSchema.safeParse(rawInput);
        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0]?.message || 'Données invalides'
            };
        }

        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentification requise'
            };
        }

        const member = await prisma.workspaceMember.findUnique({
            where: { id: parsed.data.memberId },
            include: { workspace: true }
        });

        if (!member) {
            return {
                success: false,
                error: 'Membre introuvable'
            };
        }

        if (member.workspace.ownerId !== session.user.id) {
            return {
                success: false,
                error: 'Seul le propriétaire peut modifier les rôles de l\'équipe'
            };
        }

        if (member.role === 'OWNER') {
            return {
                success: false,
                error: 'Le rôle de propriétaire ne peut pas être modifié'
            };
        }

        await prisma.workspaceMember.update({
            where: { id: member.id },
            data: { role: parsed.data.role as WorkspaceRole }
        });

        revalidatePath('/dashboard/workspace');
        return getWorkspaceAction();
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Erreur lors du changement de rôle'
        };
    }
}

/**
 * Remove a member from the workspace
 */
export async function removeWorkspaceMemberAction(
    rawInput: { memberId: string }
): Promise<WorkspaceActionResult<WorkspaceDTO>> {
    try {
        const parsed = RemoveMemberSchema.safeParse(rawInput);
        if (!parsed.success) {
            return {
                success: false,
                error: 'Identifiant invalide'
            };
        }

        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentification requise'
            };
        }

        const member = await prisma.workspaceMember.findUnique({
            where: { id: parsed.data.memberId },
            include: { workspace: true }
        });

        if (!member) {
            return {
                success: false,
                error: 'Membre introuvable'
            };
        }

        if (member.workspace.ownerId !== session.user.id && member.userId !== session.user.id) {
            return {
                success: false,
                error: 'Permissions insuffisantes pour retirer ce membre'
            };
        }

        if (member.role === 'OWNER') {
            return {
                success: false,
                error: 'Le propriétaire ne peut pas être retiré de son workspace'
            };
        }

        await prisma.workspaceMember.delete({
            where: { id: member.id }
        });

        revalidatePath('/dashboard/workspace');
        return getWorkspaceAction();
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Erreur lors du retrait du membre'
        };
    }
}
