'use server';

/**
 * Organize Offers Agent V2
 * 
 * Enhanced version with:
 * - Template selection (timeline, grid, kanban)
 * - Custom grouping (by price, location, score)
 * - Export options (JSON, CSV, PDF-ready)
 */

import { OpenRouter } from "@openrouter/sdk";
import { Offer } from "@/types";
import { AgentError, parseJSONFromText, retryWithBackoff, validateWithZod } from "./shared/agent-utils";
import { z } from 'zod';
import { DEFAULT_MODEL_ID } from '@/lib/ai-models';

const CategorySchema = z.object({
    name: z.string(),
    offers: z.array(z.any())
});

const TimelineSchema = z.object({
    date: z.string(),
    offers: z.array(z.any())
});

const KanbanColumnSchema = z.object({
    status: z.string(),
    offers: z.array(z.any())
});

const OrganizedOffersSchema = z.object({
    categories: z.array(CategorySchema).optional(),
    timeline: z.array(TimelineSchema).optional(),
    kanban: z.array(KanbanColumnSchema).optional(),
    groupedBy: z.string().optional()
});

export interface OrganizedOffersV2 {
    categories?: {
        name: string;
        offers: Offer[];
    }[];
    timeline?: {
        date: string;
        offers: Offer[];
    }[];
    kanban?: {
        status: string;
        offers: Offer[];
    }[];
    groupedBy?: string;
}

type TemplateType = 'timeline' | 'grid' | 'kanban';
type GroupingType = 'category' | 'price' | 'location' | 'score';
type ExportFormat = 'json' | 'csv' | 'pdf-ready';

interface OrganizeOptionsV2 {
    template?: TemplateType;
    groupBy?: GroupingType;
    exportFormat?: ExportFormat;
}

export async function organizeOffersActionV2(
    offers: Offer[],
    modelName: string = DEFAULT_MODEL_ID,
    options: OrganizeOptionsV2 = {}
): Promise<OrganizedOffersV2> {
    const {
        template = 'grid',
        groupBy = 'category'
        // exportFormat - future feature
    } = options;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new AgentError("OPENROUTER_API_KEY not found", 'API_KEY_MISSING');
    }

    const openrouter = new OpenRouter({
        apiKey: apiKey,
    });

    // Simplify offers for processing
    const simplifiedOffers = offers.map(offer => ({
        id: offer.id,
        title: offer.title,
        price: offer.price,
        location: offer.location,
        category: offer.category,
        finalScore: (offer as unknown as { finalScore?: number }).finalScore || 0,
        description: offer.description.length > 500 
            ? offer.description.substring(0, 500) + "..." 
            : offer.description
    }));

    // Template-specific instructions
    const templateInstructions = {
        timeline: `
            Organize offers chronologically or by relevance period.
            Return a "timeline" array with date/period labels.
        `,
        grid: `
            Organize offers into logical categories for grid display.
            Return a "categories" array with thematic groupings.
        `,
        kanban: `
            Organize offers into kanban-style columns (e.g., "Top Priority", "Consider", "Maybe").
            Return a "kanban" array with status columns.
        `
    };

    // Grouping-specific instructions
    const groupingInstructions = {
        category: 'Group by thematic categories (type, sector, etc.)',
        price: 'Group by price ranges (e.g., Budget, Mid-range, Premium)',
        location: 'Group by geographical location or region',
        score: 'Group by score ranges (e.g., Excellent 90+, Good 70-89, Fair 50-69)'
    };

    const systemInstruction = `
    You are an AI Librarian V2 specializing in advanced data organization.
    
    TASK: Organize the provided offers using the specified template and grouping strategy.
    
    TEMPLATE: ${template}
    ${templateInstructions[template]}
    
    GROUPING STRATEGY: ${groupBy}
    ${groupingInstructions[groupBy]}
    
    PROCESS:
    1. Analyze offers for optimal grouping based on "${groupBy}".
    2. Apply "${template}" template structure.
    3. Preserve all offer data.
    4. Create meaningful, user-friendly labels.
    
    OUTPUT REQUIREMENTS:
    - Return ONLY a valid JSON object.
    - DO NOT include summary text or thinking tags.
    - Structure must match the template type.

    JSON SCHEMA FOR ${template.toUpperCase()}:
    ${template === 'timeline' ? `
    {
      "timeline": [
        {
          "date": "Date or Period label",
          "offers": [ ...original offer objects... ]
        }
      ],
      "groupedBy": "${groupBy}"
    }
    ` : template === 'kanban' ? `
    {
      "kanban": [
        {
          "status": "Column name (e.g., Top Priority)",
          "offers": [ ...original offer objects... ]
        }
      ],
      "groupedBy": "${groupBy}"
    }
    ` : `
    {
      "categories": [
        {
          "name": "Category name",
          "offers": [ ...original offer objects... ]
        }
      ],
      "groupedBy": "${groupBy}"
    }
    `}

    TEMPLATE: ${template}
    GROUPING: ${groupBy}
    `;

    const operation = async () => {
        const response = await openrouter.chat.send({
            model: modelName,
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: `Organize these ${simplifiedOffers.length} offers using ${template} template grouped by ${groupBy}: ${JSON.stringify(simplifiedOffers)}` }
            ],
            responseFormat: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new AgentError("No response text from OpenRouter", 'NO_RESPONSE');
        }

        const text = typeof content === 'string' ? content : '';
        console.log(`Organize V2: AI response received (${text.length} chars) using ${template} template`);

        const cleanedText = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        const parsedData = parseJSONFromText(cleanedText, 'organize v2 response');

        const validatedResponse = validateWithZod(parsedData, OrganizedOffersSchema, 'organize v2 response');

        // Re-hydrate offers with full data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rehydrateOffers = (items: any[]) => {
            return items.map(item => {
                const original = offers.find(o => o.id === item.id);
                return original || item;
            });
        };

        const result: OrganizedOffersV2 = {
            groupedBy: groupBy
        };

        if (validatedResponse.categories) {
            result.categories = validatedResponse.categories.map(cat => ({
                ...cat,
                offers: rehydrateOffers(cat.offers)
            }));
        }

        if (validatedResponse.timeline) {
            result.timeline = validatedResponse.timeline.map(t => ({
                ...t,
                offers: rehydrateOffers(t.offers)
            }));
        }

        if (validatedResponse.kanban) {
            result.kanban = validatedResponse.kanban.map(k => ({
                ...k,
                offers: rehydrateOffers(k.offers)
            }));
        }

        console.log(`Organize V2: Successfully organized using ${template} template`);

        // TODO: Export handling
        // if (exportFormat === 'csv') {
        //     return convertToCSV(result);
        // } else if (exportFormat === 'pdf-ready') {
        //     return preparePDFData(result);
        // }

        return result;
    };

    return retryWithBackoff(operation, 2, 'organize offers v2');
}

// TODO: Export functions
// function convertToCSV(data: OrganizedOffersV2): string { ... }
// function preparePDFData(data: OrganizedOffersV2): any { ... }
