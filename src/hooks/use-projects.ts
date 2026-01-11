"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { SearchHistoryItem } from "@/types"

const PROJECTS_KEY = "offeranalyst_projects"

export interface Project {
    id: string
    name: string
    description: string
    createdAt: number
    sourceIds: string[] // IDs from history
    sources: SearchHistoryItem[] // Hydrated sources for display
    status: "active" | "archived"
}

export function useProjects() {
    // Track if localStorage has been loaded to avoid saving during initial load
    const isInitialLoad = useRef(true);

    // Initialize with empty array to ensure server/client consistency
    const [projects, setProjects] = useState<Project[]>([]);

    // Load from localStorage after mount (client-side only) to avoid hydration mismatch
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const stored = window.localStorage.getItem(PROJECTS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                /* eslint-disable react-hooks/set-state-in-effect */
                // This is intentional to prevent hydration errors - we load from localStorage after mount
                setProjects(parsed);
                /* eslint-enable react-hooks/set-state-in-effect */
                console.log("[useProjects] Loaded:", parsed.length, "projects");
            }
        } catch (e) {
            console.error("[useProjects] Failed to load projects", e);
        }

        // Mark initial load as complete
        isInitialLoad.current = false;
    }, []);

    // Save to localStorage whenever projects changes (skip initial load)
    useEffect(() => {
        // Don't save during the initial load phase
        if (isInitialLoad.current) {
            return;
        }

        if (typeof window === 'undefined') return;

        try {
            window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
            console.log("[useProjects] Saved:", projects.length, "projects");
        } catch (e) {
            console.error("[useProjects] Failed to save projects", e);
        }
    }, [projects]);

    const createProject = (name: string, description: string, sources: SearchHistoryItem[]) => {
        if (!name.trim()) {
            console.error("[useProjects] Cannot create project without name");
            return;
        }
        
        const newProject: Project = {
            id: crypto.randomUUID(),
            name,
            description,
            createdAt: Date.now(),
            sourceIds: sources.map(s => s.id),
            sources: sources,
            status: "active"
        }
        setProjects(prev => [newProject, ...prev])
        console.log("[useProjects] Created project:", name);
    }

    const deleteProject = (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id))
        console.log("[useProjects] Deleted project:", id);
    }
    
    const syncProjectSources = useCallback((history: SearchHistoryItem[]) => {
        // Update project sources with latest history data
        setProjects(prev => prev.map(project => {
            const updatedSources = project.sourceIds
                .map(id => history.find(h => h.id === id))
                .filter((h): h is SearchHistoryItem => h !== undefined);
            
            return {
                ...project,
                sources: updatedSources
            };
        }));
    }, []);

    return {
        projects,
        createProject,
        deleteProject,
        syncProjectSources
    }
}
