"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SearchHistoryItem } from "@/types";
import { ApiResponse } from "@/types/api";
import { useEffect, useCallback } from "react";
import { useQuerySync } from "./use-query-sync";
import { toast } from "sonner";

const PROJECTS_KEY = "offeranalyst_projects";
const PROJECTS_QUERY_KEY = ["projects"];

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  sourceIds: string[];
  sources: SearchHistoryItem[];
  status: "active" | "archived";
}

export function useProjects(history: SearchHistoryItem[] = []) {
  const queryClient = useQueryClient();
  const { notifySync } = useQuerySync();

  const { data: projectsResponse, isLoading } = useQuery<
    ApiResponse<Project[]>
  >({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Failed to fetch projects");
      return data;
    },
  });

  const rawProjects = projectsResponse?.data || [];

  const projects = rawProjects.map((project) => ({
    ...project,
    sources: project.sourceIds
      .map((id) => history.find((h) => h.id === id))
      .filter((h): h is SearchHistoryItem => h !== undefined),
  }));

  const saveMutation = useMutation({
    mutationFn: async (project: Partial<Project>) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Failed to save project");
      return data;
    },
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: PROJECTS_QUERY_KEY });
      const previousProjects =
        queryClient.getQueryData<ApiResponse<Project[]>>(PROJECTS_QUERY_KEY);

      if (previousProjects?.data) {
        // Determine if update or create
        const exists = previousProjects.data.some(
          (p) => p.id === newProject.id,
        );
        let newData;
        if (exists) {
          newData = previousProjects.data.map((p) =>
            p.id === newProject.id ? { ...p, ...newProject } : p,
          );
        } else {
          newData = [
            {
              ...newProject,
              createdAt: Date.now(),
              status: "active",
              sourceIds: newProject.sourceIds || [],
            } as Project,
            ...previousProjects.data,
          ];
        }

        queryClient.setQueryData<ApiResponse<Project[]>>(PROJECTS_QUERY_KEY, {
          ...previousProjects,
          data: newData,
        });
      }

      return { previousProjects };
    },
    onError: (err, newProject, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(PROJECTS_QUERY_KEY, context.previousProjects);
      }
      toast.error(err.message || "Failed to save project");
    },
    onSuccess: () => {
      toast.success("Project saved");
      notifySync(PROJECTS_QUERY_KEY);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Failed to delete project");
      return data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PROJECTS_QUERY_KEY });
      const previousProjects =
        queryClient.getQueryData<ApiResponse<Project[]>>(PROJECTS_QUERY_KEY);

      if (previousProjects?.data) {
        queryClient.setQueryData<ApiResponse<Project[]>>(PROJECTS_QUERY_KEY, {
          ...previousProjects,
          data: previousProjects.data.filter((p) => p.id !== id),
        });
      }

      return { previousProjects };
    },
    onError: (err, id, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(PROJECTS_QUERY_KEY, context.previousProjects);
      }
      toast.error(err.message || "Failed to delete project");
    },
    onSuccess: () => {
      toast.success("Project deleted");
      notifySync(PROJECTS_QUERY_KEY);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });

  const createProject = useCallback(
    (name: string, description: string, sources: SearchHistoryItem[]) => {
      if (!name.trim()) return;

      const newProject: Partial<Project> = {
        name,
        description,
        createdAt: Date.now(),
        sourceIds: sources.map((s) => s.id),
        status: "active",
      };
      saveMutation.mutate(newProject);
    },
    [saveMutation],
  );

  const deleteProject = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation],
  );

  // Migration logic
  useEffect(() => {
    if (typeof window === "undefined") return;

    const localData = window.localStorage.getItem(PROJECTS_KEY);
    if (localData) {
      try {
        const parsed: Project[] = JSON.parse(localData);
        if (parsed.length > 0) {
          console.log(`[useProjects] Migrating ${parsed.length} projects...`);
          Promise.all(parsed.map((p) => saveMutation.mutateAsync(p))).then(
            () => {
              window.localStorage.removeItem(PROJECTS_KEY);
            },
          );
        } else {
          window.localStorage.removeItem(PROJECTS_KEY);
        }
      } catch (e) {
        console.error("Migration failed", e);
        window.localStorage.removeItem(PROJECTS_KEY);
      }
    }
  }, [saveMutation]);

  return {
    projects,
    createProject,
    deleteProject,
    isLoading,
  };
}
