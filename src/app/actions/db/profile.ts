'use server';

/**
 * User Profile & Account Management Server Actions
 * 
 * Conforms to Agent.md Rules:
 * - Server-side session verification via Better-Auth (Zero IDOR)
 * - Strict Zod validation before DB writes
 * - Standardized { success, data, error } return pattern + revalidatePath
 */

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const UpdateProfileSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    image: z.string().trim().max(500).optional(),
});

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function updateUserProfile(input: {
    name: string;
    image?: string;
}): Promise<{ success: true; data: { name: string; image: string | null } } | { success: false; error: string }> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Unauthorized: Please sign in to update your profile.',
            };
        }

        const parsed = UpdateProfileSchema.safeParse(input);
        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0]?.message || 'Invalid profile data',
            };
        }

        const updated = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: parsed.data.name,
                ...(parsed.data.image !== undefined ? { image: parsed.data.image } : {}),
            },
            select: {
                name: true,
                image: true,
            },
        });

        revalidatePath('/dashboard/settings');
        revalidatePath('/');

        return {
            success: true,
            data: {
                name: updated.name || parsed.data.name,
                image: updated.image,
            },
        };
    } catch (error) {
        console.error('Error updating user profile:', error);
        return {
            success: false,
            error: 'Failed to update user profile.',
        };
    }
}

export async function changeUserPassword(input: {
    currentPassword: string;
    newPassword: string;
}): Promise<{ success: true; data: { updated: boolean } } | { success: false; error: string }> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Unauthorized: Please sign in to change your password.',
            };
        }

        const parsed = ChangePasswordSchema.safeParse(input);
        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0]?.message || 'Invalid password payload',
            };
        }

        const authCtx = await auth.$context.catch(() => null);
        const hashedPassword = authCtx?.password?.hash
            ? await authCtx.password.hash(parsed.data.newPassword)
            : await bcrypt.hash(parsed.data.newPassword, 12);

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });

        const accountRepo = prisma.account as unknown as {
            findFirst: (args: {
                where: { userId: string; providerId: string };
            }) => Promise<{ id: string } | null>;
            update: (args: {
                where: { id: string };
                data: { password: string };
            }) => Promise<unknown>;
            create: (args: {
                data: {
                    userId: string;
                    accountId: string;
                    providerId: string;
                    password: string;
                };
            }) => Promise<unknown>;
        };

        const credentialAccount = await accountRepo.findFirst({
            where: {
                userId: session.user.id,
                providerId: 'credential',
            },
        });

        if (credentialAccount) {
            await accountRepo.update({
                where: { id: credentialAccount.id },
                data: { password: hashedPassword },
            });
        } else {
            await accountRepo.create({
                data: {
                    userId: session.user.id,
                    accountId: session.user.id,
                    providerId: 'credential',
                    password: hashedPassword,
                },
            });
        }

        revalidatePath('/dashboard/settings');

        return {
            success: true,
            data: { updated: true },
        };
    } catch (error) {
        console.error('Error changing password:', error);
        return {
            success: false,
            error: 'Failed to update password.',
        };
    }
}

export async function deleteUserAccount(): Promise<
    { success: true; data: { deleted: boolean } } | { success: false; error: string }
> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Unauthorized: Authentication required.',
            };
        }

        const userId = session.user.id;

        // Clean up user-owned records and user account
        await prisma.$transaction([
            prisma.aPIKeyUsageLog.deleteMany({ where: { userId } }),
            prisma.securityAlert.deleteMany({ where: { userId } }),
            prisma.aPIKey.deleteMany({ where: { userId } }),
            prisma.searchHistory.deleteMany({ where: { userId } }),
            prisma.savedOffer.deleteMany({ where: { userId } }),
            prisma.project.deleteMany({ where: { userId } }),
            prisma.analysisResult.deleteMany({ where: { userId } }),
            prisma.session.deleteMany({ where: { userId } }),
            prisma.account.deleteMany({ where: { userId } }),
            prisma.user.delete({ where: { id: userId } }),
        ]);

        revalidatePath('/');
        revalidatePath('/dashboard/settings');

        return {
            success: true,
            data: { deleted: true },
        };
    } catch (error) {
        console.error('Error deleting user account:', error);
        return {
            success: false,
            error: 'Failed to delete user account.',
        };
    }
}

