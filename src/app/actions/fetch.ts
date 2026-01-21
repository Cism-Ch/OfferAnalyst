"use server";

import { OpenRouter } from "@openrouter/sdk";
import { Offer, AgentActionResult } from "@/types";
import {
  AgentError,
  parseJSONFromText,
  retryWithBackoff,
  validateWithZod,
  toAgentActionError,
} from "./shared/agent-utils";
import { z } from "zod";
import { DEFAULT_MODEL_ID } from "@/lib/ai-models";

// Schéma Zod pour valider une offre
const OfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.union([z.string(), z.number()]),
  location: z.string(),
  category: z.string(),
  url: z.string().optional().default(""),
});

const FetchResponseSchema = z.array(OfferSchema);

export async function fetchOffersAction(
  domain: string,
  context: string,
  modelName: string = DEFAULT_MODEL_ID,
): Promise<AgentActionResult<Offer[]>> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: toAgentActionError(
        new AgentError("OPENROUTER_API_KEY not found", "API_KEY_MISSING"),
        "fetch offers",
      ),
    };
  }

  const openrouter = new OpenRouter({
    apiKey: apiKey,
  });

  const systemInstruction = `
    You are a professional AI Retrieval Agent specializing in market data.
    
    GOAL: Find real-world current offers (jobs, products, real estate, etc.) based on the provided Domain and Context.
    
    PROCESS:
    1. Reason about the best sources for "${domain}" in the context of "${context}".
    2. Retrieve or generate a list of at least 5-10 realistic, current listings.
    3. Ensure each listing includes a title, price, location, and a valid source URL if possible.
    
    OUTPUT REQUIREMENTS:
    - You MUST return ONLY a valid JSON array.
    - DO NOT include any introductory text, summary, or "thinking" tags in the final JSON output.
    - If you use research, ensure the data is as up-to-date as possible.

    JSON SCHEMA:
    [
      {
        "id": "unique_string",
        "title": "string",
        "description": "key details",
        "price": "string or number",
        "location": "string",
        "category": "string",
        "url": "full_source_url"
      }
    ]

    DOMAIN: ${domain}
    CONTEXT: ${context}
  `;

  const operation = async () => {
    const response = await openrouter.chat.send({
      model: modelName,
      messages: [
        { role: "system", content: systemInstruction },
        {
          role: "user",
          content: `Find live offers for domain "${domain}" with this context: "${context}". Return as JSON array.`,
        },
      ],
      responseFormat: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new AgentError("No response text from OpenRouter", "NO_RESPONSE");
    }

    const text = typeof content === "string" ? content : "";
    console.log(
      `Fetch (DeepSeek): AI response received (${text.length} chars)`,
    );

    // Extraire le JSON (DeepSeek-R1 inclut souvent des balises <think>)
    const cleanedText = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // On utilise l'utilitaire de parsing robuste
    const parsedData = parseJSONFromText(cleanedText, "fetch response");

    // Si l'AI a wrappé le tableau dans un objet (parce qu'on a demandé json_object), on récupère le tableau
    let dataToValidate = parsedData;
    if (
      typeof parsedData === "object" &&
      parsedData !== null &&
      !Array.isArray(parsedData)
    ) {
      const values = Object.values(parsedData);
      const arrayValue = values.find((v) => Array.isArray(v));
      if (arrayValue) {
        dataToValidate = arrayValue;
      }
    }

    // Validation avec Zod
    const validatedOffers = validateWithZod(
      dataToValidate,
      FetchResponseSchema,
      "fetch response",
    );

    console.log(
      `Fetch: Successfully retrieved ${validatedOffers.length} offers`,
    );
    return validatedOffers;
  };

  try {
    const offers = await retryWithBackoff(operation, 3, "fetch offers");
    return {
      success: true,
      data: offers,
      meta: {
        model: modelName,
      },
    };
  } catch (error) {
    console.error("Fetch offers failed", error);
    return {
      success: false,
      error: toAgentActionError(error, "fetch offers"),
    };
  }
}
