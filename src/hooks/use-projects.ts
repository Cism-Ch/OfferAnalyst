"use client"

import { useState, useEffect, useRef } from "react"
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
    // Track if this is the first render to avoid saving initial loaded state
    const isFirstRender = useRef(true);

    // Use lazy initialization to load from localStorage without useEffect setState
    const [projects, setProjects] = useState<Project[]>(() => {
        if (typeof window === 'undefined') return [];

        try {
            const stored = window.localStorage.getItem(PROJECTS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                console.log("[useProjects] Loaded:", parsed.length, "projects");
                return parsed;
            }
        } catch (e) {
            console.error("[useProjects] Failed to load projects", e);
        }

        return [];
    });

    // Save to localStorage whenever projects changes (skip first render)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
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
    }

    const deleteProject = (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id))
    }

    return {
        projects,
        createProject,
        deleteProject
    }
}
