"use server";

import { uploadToTigris } from "@/lib/db/s3";
import { AgentActionResult } from "@/types";
import { toAgentActionError } from "./shared/agent-utils";

/**
 * Archive research data to Tigris Object Storage.
 */
export async function archiveResearchAction(
  id: string,
  type: "search" | "project" | "offer",
  data: unknown,
): Promise<AgentActionResult<{ key: string }>> {
  try {
    const timestamp = new Date().toISOString().replace(/[:\.]/g, "-");
    const key = `archives/${type}/${id}_${timestamp}.json`;
    const body = JSON.stringify(data, null, 2);

    const result = await uploadToTigris(key, body);

    if (!result) {
      throw new Error("Tigris upload returned no result");
    }

    return {
      success: true,
      data: { key },
    };
  } catch (error) {
    console.error("Archive action failed:", error);
    return {
      success: false,
      error: toAgentActionError(error, "archive research"),
    };
  }
}
