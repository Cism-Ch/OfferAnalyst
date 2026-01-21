'use client';

import React, { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useSearchHistory } from '@/hooks/use-search-history';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';
import {
    Plus,
    ArrowLeft,
    Sparkles,
    Bot,
    Check,
    Layers,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectsPage() {
    const { projects, createProject, deleteProject, syncProjectSources } = useProjects();
    const { history, isLoading: historyLoading } = useSearchHistory();
    
    // Sync project sources with latest history when history loads
    useEffect(() => {
        if (!historyLoading && history.length > 0) {
            syncProjectSources(history);
        }
    }, [history, historyLoading, syncProjectSources]);

    // Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [step, setStep] = useState(1);

    // Form Data
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");
    const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);

    const resetWizard = () => {
        setStep(1);
        setNewProjectName("");
        setNewProjectDesc("");
        setSelectedHistoryIds([]);
        setIsWizardOpen(false);
    };

    const handleCreateProject = () => {
        const selectedSources = history.filter(h => selectedHistoryIds.includes(h.id));
        createProject(newProjectName, newProjectDesc, selectedSources);
        resetWizard();
    };

    const toggleHistorySelection = (id: string) => {
        setSelectedHistoryIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-6 font-sans text-neutral-900 dark:text-zinc-100">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Projects</h1>
                        <p className="text-muted-foreground">Manage and combine your research agents</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                <div className="mb-8 flex justify-end">
                    <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> New Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Bot className="h-5 w-5 text-primary" />
                                    Agent Setup Wizard
                                </DialogTitle>
                                <DialogDescription>
                                    Design your new research project in 3 steps.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-6">
                                {/* Steps Indicator */}
                                <div className="flex items-center justify-center mb-8 text-sm">
                                    <div className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1. Define</div>
                                    <div className="w-8 h-[2px] bg-muted mx-2" />
                                    <div className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2. Source</div>
                                    <div className="w-8 h-[2px] bg-muted mx-2" />
                                    <div className={`px-3 py-1 rounded-full ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3. Review</div>
                                </div>

                                {/* Step 1: Define */}
                                {step === 1 && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Project Name</Label>
                                            <Input
                                                placeholder="e.g., Tech Jobs Q3 Analysis"
                                                value={newProjectName}
                                                onChange={(e) => setNewProjectName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Goal / Description</Label>
                                            <Textarea
                                                placeholder="What is the main objective of this research?"
                                                value={newProjectDesc}
                                                onChange={(e) => setNewProjectDesc(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Source (History Selection) */}
                                {step === 2 && (
                                    <div className="space-y-4">
                                        <Label>Combine Research from History</Label>
                                        <p className="text-xs text-muted-foreground mb-2">Select past analysis to include in this project context.</p>
                                        <ScrollArea className="h-[200px] border rounded-md p-3">
                                            {historyLoading ? (
                                                <p className="text-sm text-center py-8 text-muted-foreground">Loading history...</p>
                                            ) : history.length === 0 ? (
                                                <div className="text-sm text-center py-8 text-muted-foreground">
                                                    <p className="mb-2">No history available yet.</p>
                                                    <p className="text-xs">Run an analysis from the Dashboard first to create search history.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {history.map(item => (
                                                        <div key={item.id} className="flex items-start space-x-3 border-b pb-3 last:border-0">
                                                            <Checkbox
                                                                id={item.id}
                                                                checked={selectedHistoryIds.includes(item.id)}
                                                                onCheckedChange={() => toggleHistorySelection(item.id)}
                                                            />
                                                            <div className="grid gap-1.5 leading-none">
                                                                <Label
                                                                    htmlFor={item.id}
                                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                >
                                                                    {item.inputs.domain} - {item.inputs.criteria}
                                                                </Label>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatDistanceToNow(item.timestamp)} ago • {item.results.topOffers.length} offers
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                )}

                                {/* Step 3: Review */}
                                {step === 3 && (
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-lg border space-y-3">
                                            <div>
                                                <h4 className="text-sm font-semibold text-muted-foreground">Project</h4>
                                                <p className="font-medium">{newProjectName}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-muted-foreground">Objective</h4>
                                                <p className="text-sm">{newProjectDesc || "No description provided."}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-muted-foreground">Sources Integreated</h4>
                                                <Badge variant="secondary" className="mt-1">
                                                    {selectedHistoryIds.length} Research Contexts
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm">
                                            <Sparkles className="h-4 w-4" />
                                            AI Agent will allow you to query across these combined sources.
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                {step > 1 && (
                                    <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
                                )}
                                {step < 3 ? (
                                    <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !newProjectName}>
                                        Next <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleCreateProject}>
                                        Create Project <Check className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Project List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
                            <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No projects active</p>
                            <p>Use the wizard to create your first research project.</p>
                        </div>
                    ) : (
                        projects.map(project => (
                            <Card key={project.id} className="group hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle>{project.name}</CardTitle>
                                            <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                                        </div>
                                        <Badge variant="outline">{project.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {project.sources.slice(0, 3).map((source, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">
                                                {source.inputs.domain}
                                            </Badge>
                                        ))}
                                        {project.sources.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">+{project.sources.length - 3}</Badge>
                                        )}
                                    </div>
                                    <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Created {formatDistanceToNow(project.createdAt, { addSuffix: true })}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between border-t pt-4">
                                    <Button variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => deleteProject(project.id)}>
                                        Delete
                                    </Button>
                                    <Button variant="outline" className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        Open Board <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
