import { Tigris } from "@tigrisdata/core";

/**
 * Tigris Search Singleton
 */
let tigrisClient: Tigris | null = null;

export function getTigrisClient() {
  if (tigrisClient) return tigrisClient;

  const uri = process.env.TIGRIS_URI;
  const clientId = process.env.TIGRIS_CLIENT_ID;
  const clientSecret = process.env.TIGRIS_CLIENT_SECRET;

  if (!uri || !clientId || !clientSecret) {
    return null;
  }

  try {
    tigrisClient = new Tigris({
      serverUrl: uri,
      clientId,
      clientSecret,
    });
    return tigrisClient;
  } catch (e) {
    console.error("[Tigris] Failed to initialize client", e);
    return null;
  }
}

/**
 * Initialize search indexes.
 */
export async function initializeTigrisIndexes() {
  const client = getTigrisClient();
  if (!client) return;

  try {
    const search = client.getSearch();

    // Use 'unknown' type assertion safely
    const s = search as unknown as {
      createOrUpdateIndex: (name: string, config: unknown) => Promise<void>;
    };

    if (s.createOrUpdateIndex) {
      await s.createOrUpdateIndex("offers", {
        schema: {
          id: { type: "string" },
          title: { type: "string", searchable: true },
          description: { type: "string", searchable: true },
          category: { type: "string", facet: true },
          price: { type: "number" },
          location: { type: "string", facet: true },
          finalScore: { type: "number" },
        },
      });

      await s.createOrUpdateIndex("history", {
        schema: {
          id: { type: "string" },
          domain: { type: "string", facet: true },
          criteria: { type: "string", searchable: true },
          context: { type: "string", searchable: true },
          timestamp: { type: "number" },
        },
      });
      console.log("[Tigris Search] Indexes initialized");
    }
  } catch (error) {
    console.error("[Tigris Search] Index initialization failed:", error);
  }
}

export async function syncToTigrisSearch(
  indexName: "offers" | "history",
  document: unknown,
) {
  const client = getTigrisClient();
  if (!client) return;

  try {
    const index = await client.getSearch().getIndex(indexName);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (index as any).createOrReplace([document]);
  } catch (error) {
    console.error(`[Tigris Search] Sync failed for ${indexName}:`, error);
  }
}

export async function deleteFromTigrisSearch(
  indexName: "offers" | "history",
  id: string,
) {
  const client = getTigrisClient();
  if (!client) return;

  try {
    const index = await client.getSearch().getIndex(indexName);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (index as any).delete([id]);
  } catch (error) {
    console.error(`[Tigris Search] Delete failed for ${indexName}:`, error);
  }
}
