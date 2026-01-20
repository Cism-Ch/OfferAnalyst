import { getDb } from "./mongodb";
import { z } from "zod";

export const AuditActionSchema = z.enum([
  "OFFER_SAVED",
  "OFFER_CREATED",
  "OFFER_UPDATED",
  "OFFER_REMOVED",
  "HISTORY_ADDED",
  "HISTORY_PINNED",
  "HISTORY_REMOVED",
  "HISTORY_CLEARED",
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "PROJECT_DELETED",
  "DASHBOARD_SYNCED",
  "RESEARCH_ARCHIVED",
]);

export interface AuditLog {
  userId?: string;
  action: z.infer<typeof AuditActionSchema>;
  resourceId?: string;
  resourceType: "offer" | "history" | "project" | "dashboard" | "archive";
  metadata?: Record<string, unknown>;
  timestamp: Date;
  userAgent?: string;
}

/**
 * Log a user action to the audit_logs collection.
 */
export async function logAuditAction(params: Omit<AuditLog, "timestamp">) {
  try {
    const db = await getDb();
    if (!db) return null;

    const log: AuditLog = {
      ...params,
      timestamp: new Date(),
    };

    return await db.collection("audit_logs").insertOne(log);
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
}
