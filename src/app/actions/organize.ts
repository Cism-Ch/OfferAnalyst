'use server';

import { OpenRouter } from "@openrouter/sdk";
import { Offer } from "@/types";
import { AgentError, parseJSONFromText, retryWithBackoff, validateWithZod } from "./shared/agent-utils";
import { z } from 'zod';

const MODEL_NAME = "deepseek/deepseek-r1-0528:free";

const CategorySchema = z.object({
    name: z.string(),
    offers: z.array(z.any())
});

const TimelineSchema = z.object({
    date: z.string(),
    offers: z.array(z.any())
});

const OrganizedOffersSchema = z.object({
    categories: z.array(CategorySchema),
    timeline: z.array(TimelineSchema)
});

export interface OrganizedOffers {
    categories: {
        name: string;
        offers: Offer[];
    }[];
    timeline: {
        date: string;
        offers: Offer[];
    }[];
}

export async function organizeOffersAction(
    offers: Offer[]
): Promise<OrganizedOffers> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new AgentError("OPENROUTER_API_KEY not found", 'API_KEY_MISSING');
    }

    const openrouter = new OpenRouter({
        apiKey: apiKey,
    });

    const systemInstruction = `
    You are an AI Librarian specializing in data organization.
    
    TASK: Organize the provided offers into logical categories and a chronological timeline.
    
    PROCESS:
    1. Group offers by logical themes (e.g., Job Type, Sector, etc.).
    2. Group offers by approximate date or relevance period.
    3. Preserve the original offer objects entirely.
    
    OUTPUT REQUIREMENTS:
    - Return ONLY a valid JSON object.
    - DO NOT include summary text or "thinking" tags in the final JSON.

    JSON SCHEMA:
    {
      "categories": [{"name": "Category Name", "offers": [...]}],
      "timeline": [{"date": "Recent/Older/etc", "offers": [...]}]
    }
  `;

    const operation = async () => {
        const response = await openrouter.chat.send({
            model: MODEL_NAME,
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: `Organize these ${offers.length} offers: ${JSON.stringify(offers)}` }
            ],
            responseFormat: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new AgentError("No response text from OpenRouter", 'NO_RESPONSE');
        }

        const text = typeof content === 'string' ? content : '';
        console.log(`Organize (DeepSeek): AI response received (${text.length} chars)`);

        const cleanedText = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        const parsedData = parseJSONFromText(cleanedText, 'organize response');

        const validatedResponse = validateWithZod(parsedData, OrganizedOffersSchema, 'organize response');

        console.log(`Organize: Successfully organized into ${validatedResponse.categories.length} categories`);

        return validatedResponse as OrganizedOffers;
    };

    return retryWithBackoff(operation, 2, 'organize offers');
}