"use client"

import { useState, useEffect } from "react"
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
    const [projects, setProjects] = useState<Project[]>([])
    const [isInitialized, setIsInitialized] = useState(false)

    // Load from local storage
    useEffect(() => {
        if (typeof window === 'undefined') return

        try {
            const stored = window.localStorage.getItem(PROJECTS_KEY)
            if (stored) {
                setProjects(JSON.parse(stored))
            }
        } catch (e) {
            console.error("Failed to parse projects", e)
        } finally {
            setIsInitialized(true)
        }
    }, [])

    // Save to local storage
    useEffect(() => {
        if (!isInitialized) return
        if (typeof window === 'undefined') return

        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
    }, [projects, isInitialized])

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
        deleteProject,
        isInitialized
    }
}
