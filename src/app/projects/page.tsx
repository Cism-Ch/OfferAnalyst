"use client";

import React, { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { useSearchHistory } from "@/hooks/use-search-history";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import {
  Plus,
  ArrowLeft,
  Sparkles,
  Bot,
  Check,
  Layers,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ProjectsPage() {
  const { history, isLoading: historyLoading } = useSearchHistory();
  const {
    projects,
    createProject,
    deleteProject,
    isLoading: projectsLoading,
  } = useProjects(history);

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
    const selectedSources = history.filter((h) =>
      selectedHistoryIds.includes(h.id),
    );
    createProject(newProjectName, newProjectDesc, selectedSources);
    resetWizard();
  };

  const toggleHistorySelection = (id: string) => {
    setSelectedHistoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-neutral-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
              Manage and combine your research agents
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl">
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
                <div className="mb-8 flex items-center justify-center text-sm">
                  <div
                    className={`rounded-full px-3 py-1 ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    1. Define
                  </div>
                  <div className="mx-2 h-[2px] w-8 bg-muted" />
                  <div
                    className={`rounded-full px-3 py-1 ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    2. Source
                  </div>
                  <div className="mx-2 h-[2px] w-8 bg-muted" />
                  <div
                    className={`rounded-full px-3 py-1 ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    3. Review
                  </div>
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
                    <p className="mb-2 text-xs text-muted-foreground">
                      Select past analysis to include in this project context.
                    </p>
                    <ScrollArea className="h-[200px] rounded-md border p-3">
                      {historyLoading ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          Loading history...
                        </p>
                      ) : history.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          <p className="mb-2">No history available yet.</p>
                          <p className="text-xs">
                            Run an analysis from the Dashboard first to create
                            search history.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {history.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start space-x-3 border-b pb-3 last:border-0"
                            >
                              <Checkbox
                                id={item.id}
                                checked={selectedHistoryIds.includes(item.id)}
                                onCheckedChange={() =>
                                  toggleHistorySelection(item.id)
                                }
                              />
                              <div className="grid gap-1.5 leading-none">
                                <Label
                                  htmlFor={item.id}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {item.inputs.domain} - {item.inputs.criteria}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(item.timestamp)} ago •{" "}
                                  {item.results.topOffers.length} offers
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
                    <div className="space-y-3 rounded-lg border bg-slate-50 p-4 dark:bg-zinc-900">
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          Project
                        </h4>
                        <p className="font-medium">{newProjectName}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          Objective
                        </h4>
                        <p className="text-sm">
                          {newProjectDesc || "No description provided."}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground">
                          Sources Integreated
                        </h4>
                        <Badge variant="secondary" className="mt-1">
                          {selectedHistoryIds.length} Research Contexts
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      <Sparkles className="h-4 w-4" />
                      AI Agent will allow you to query across these combined
                      sources.
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={step === 1 && !newProjectName}
                  >
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {projectsLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Sparkles className="text-neon/50 mb-4 h-10 w-10 animate-pulse" />
              <p className="font-bold">Retrieving intelligence projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full rounded-xl border-2 border-dashed py-20 text-center text-muted-foreground">
              <Layers className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">No projects active</p>
              <p>Use the wizard to create your first research project.</p>
            </div>
          ) : (
            projects.map((project) => (
              <Card
                key={project.id}
                className="hover:border-primary/50 group transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
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
                      <Badge variant="secondary" className="text-xs">
                        +{project.sources.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Created{" "}
                    {formatDistanceToNow(project.createdAt, {
                      addSuffix: true,
                    })}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteProject(project.id)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                  >
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
