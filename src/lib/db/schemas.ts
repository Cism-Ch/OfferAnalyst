import { z } from "zod";

/**
 * Shared Zod schemas for data validation.
 * Synchronized with MongoDB and Tigris indexing requirements.
 */

// Offer Schema
export const OfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  price: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  score: z.number().min(0).max(100),
  analysis: z
    .object({
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      recommendation: z.string(),
    })
    .optional(),
  savedAt: z.date().default(() => new Date()),
  projectId: z.string().optional(), // Nullable reference to a project
});

// Search Input Schema
export const SearchInputSchema = z.object({
  domain: z.string().min(1),
  criteria: z.string().min(1),
  context: z.string(),
  limit: z.number().int().positive().default(10),
});

// Search History Schema
export const SearchHistorySchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  inputs: SearchInputSchema,
  results: z.any().optional(), // Metadata about results
  createdAt: z.date().default(() => new Date()),
  isPinned: z.boolean().default(false),
});

// Project Schema
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  searchIds: z.array(z.string()).default([]), // References to searches
});

// Dashboard State Schema
export const DashboardStateSchema = z.object({
  id: z.string().default("default"), // One state per user, for now 'default'
  domain: z.string(),
  explicitCriteria: z.string(),
  implicitContext: z.string(),
  offersInput: z.string(),
  autoFetch: z.boolean(),
  limit: z.string(),
  model: z.string(),
  updatedAt: z.date().default(() => new Date()),
});

export type Offer = z.infer<typeof OfferSchema>;
export type SearchInput = z.infer<typeof SearchInputSchema>;
export type SearchHistory = z.infer<typeof SearchHistorySchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type DashboardState = z.infer<typeof DashboardStateSchema>;
