'use client';

/**
 * Workspace Settings Page
 * 
 * Manage workspace configuration and team members.
 * Features:
 * - Workspace name and preferences
 * - Team member management (invite, roles)
 * - Default settings (theme, language, region)
 */

import React, { useState } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
    Users, 
    Plus, 
    Mail,
    Shield,
    Trash2,
    Globe,
    Palette,
    MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUpProps, staggerContainerProps, staggerItemProps } from '@/lib/motion';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Editor' | 'Viewer';
    joinedAt: string;
}

export default function WorkspacePage() {
    const [workspaceName, setWorkspaceName] = useState('My Workspace');
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Admin',
            joinedAt: '2026-01-10'
        }
    ]);

    const roleColors = {
        Admin: 'bg-red-500/10 text-red-500',
        Editor: 'bg-blue-500/10 text-blue-500',
        Viewer: 'bg-gray-500/10 text-gray-500'
    };

    const removeMember = (id: string) => {
        if (confirm('Remove this team member?')) {
            setTeamMembers(members => members.filter(m => m.id !== id));
        }
    };

    return (
        <ModernLayout>
            <div className="container mx-auto py-8 px-4 max-w-4xl">
                {/* Header */}
                <motion.div {...fadeInUpProps} className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Workspace Settings</h1>
                    <p className="text-muted-foreground">
                        Configure your workspace and manage team members
                    </p>
                </motion.div>

                <motion.div {...staggerContainerProps} className="space-y-6">
                    {/* Workspace Info */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Workspace Information</CardTitle>
                                <CardDescription>
                                    Basic information about your workspace
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="workspace-name">Workspace Name</Label>
                                    <input
                                        id="workspace-name"
                                        type="text"
                                        value={workspaceName}
                                        onChange={(e) => setWorkspaceName(e.target.value)}
                                        className="w-full mt-2 px-4 py-2 border rounded-md bg-background"
                                    />
                                </div>
                                <Button>Save Changes</Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Default Preferences */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Default Preferences</CardTitle>
                                <CardDescription>
                                    Set default settings for all workspace members
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label className="flex items-center gap-2 mb-2">
                                            <Palette className="w-4 h-4" />
                                            Theme
                                        </Label>
                                        <select className="w-full px-4 py-2 border rounded-md bg-background">
                                            <option>Light</option>
                                            <option>Dark</option>
                                            <option>System</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="flex items-center gap-2 mb-2">
                                            <Globe className="w-4 h-4" />
                                            Language
                                        </Label>
                                        <select className="w-full px-4 py-2 border rounded-md bg-background">
                                            <option>English</option>
                                            <option>Français</option>
                                            <option>Español</option>
                                            <option>Deutsch</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="flex items-center gap-2 mb-2">
                                            <MapPin className="w-4 h-4" />
                                            Region
                                        </Label>
                                        <select className="w-full px-4 py-2 border rounded-md bg-background">
                                            <option>North America</option>
                                            <option>Europe</option>
                                            <option>Asia Pacific</option>
                                        </select>
                                    </div>
                                </div>
                                <Button>Save Preferences</Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Team Members */}
                    <motion.div {...staggerItemProps}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Team Members</CardTitle>
                                        <CardDescription>
                                            Manage workspace access and roles
                                        </CardDescription>
                                    </div>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Invite Member
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {teamMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{member.name}</h4>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={roleColors[member.role]}>
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    {member.role}
                                                </Badge>
                                                {member.role !== 'Admin' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeMember(member.id)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-semibold mb-2">Role Permissions</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li><strong>Admin:</strong> Full access, can manage workspace and members</li>
                                        <li><strong>Editor:</strong> Can create and edit analyses, cannot manage workspace</li>
                                        <li><strong>Viewer:</strong> Read-only access to analyses and results</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </ModernLayout>
    );
}
