'use client';

/**
 * Account Settings Page
 * 
 * Manage personal account settings and preferences.
 * Features:
 * - Profile information (name, email, avatar)
 * - Password management
 * - Connected OAuth providers
 * - Notification preferences
 * - Privacy settings
 * - Account deletion
 */

import React, { useState } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
    User, 
    Mail,
    Lock,
    Bell,
    Shield,
    Trash2,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUpProps, staggerContainerProps, staggerItemProps } from '@/lib/motion';

export default function SettingsPage() {
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [weeklyDigest, setWeeklyDigest] = useState(true);

    const avatarPresets = ['👤', '🧑', '👨', '👩', '🦸', '🧙', '🤖', '👾'];
    const [selectedAvatar, setSelectedAvatar] = useState('👤');

    const connectedProviders = [
        { name: 'Google', connected: true, email: 'user@gmail.com' },
        { name: 'GitHub', connected: false, email: null }
    ];

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
                                    <div className="flex gap-2 mt-2">
                                        {avatarPresets.map((avatar) => (
                                            <button
                                                key={avatar}
                                                onClick={() => setSelectedAvatar(avatar)}
                                                className={`w-12 h-12 text-2xl rounded-full border-2 transition-all ${
                                                    selectedAvatar === avatar
                                                        ? 'border-primary scale-110'
                                                        : 'border-transparent hover:border-muted'
                                                }`}
                                            >
                                                {avatar}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Choose from preset avatars (no file upload required)
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="full-name">Full Name</Label>
                                    <input
                                        id="full-name"
                                        type="text"
                                        defaultValue="John Doe"
                                        className="w-full mt-2 px-4 py-2 border rounded-md bg-background"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <input
                                        id="email"
                                        type="email"
                                        defaultValue="john@example.com"
                                        className="w-full mt-2 px-4 py-2 border rounded-md bg-background"
                                    />
                                </div>

                                <Button>Save Profile</Button>
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
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <input
                                        id="current-password"
                                        type="password"
                                        className="w-full mt-2 px-4 py-2 border rounded-md bg-background"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="new-password">New Password</Label>
                                    <input
                                        id="new-password"
                                        type="password"
                                        className="w-full mt-2 px-4 py-2 border rounded-md bg-background"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        className="w-full mt-2 px-4 py-2 border rounded-md bg-background"
                                    />
                                </div>

                                <Button>Change Password</Button>
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
                                                    <Button variant="outline" size="sm">
                                                        Disconnect
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button variant="outline" size="sm">
                                                    Connect
                                                </Button>
                                            )}
                                        </div>
                                    ))}
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
                                        onCheckedChange={setEmailNotifications}
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
                                        onCheckedChange={setPushNotifications}
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
                                        onCheckedChange={setWeeklyDigest}
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
                                <Button variant="outline">Download My Data</Button>
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
                                        <Button variant="destructive">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Account
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </ModernLayout>
    );
}
