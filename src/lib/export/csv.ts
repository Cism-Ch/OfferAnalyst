import { Offer } from "@/types";
import { OrganizedOffersV2 } from "@/app/actions/organizeV2";

/**
 * Escapes a cell value conforming to RFC 4180 CSV specifications.
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // If the string contains comma, quote, or newline, escape quotes and wrap in quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

interface FlattenedOfferRow {
  groupName: string;
  rank: string | number;
  id: string;
  title: string;
  price: string | number;
  location: string;
  category: string;
  score: string | number;
  justification: string;
  url: string;
  description: string;
}

/**
 * Extracts a flattened list of offer rows from OrganizedOffersV2 structure or Offer array.
 */
function extractRows(data: OrganizedOffersV2 | Offer[]): FlattenedOfferRow[] {
  if (Array.isArray(data)) {
    return data.map((offer, index) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scored = offer as any;
      return {
        groupName: scored.category || 'General',
        rank: scored.rank ?? (index + 1),
        id: scored.id || '',
        title: scored.title || '',
        price: scored.price ?? 'N/A',
        location: scored.location || 'N/A',
        category: scored.category || 'General',
        score: scored.finalScore ?? scored.score ?? 'N/A',
        justification: scored.justification || '',
        url: scored.url || '',
        description: scored.description || ''
      };
    });
  }

  const rows: FlattenedOfferRow[] = [];

  if (data.categories && data.categories.length > 0) {
    data.categories.forEach(cat => {
      cat.offers.forEach((offer, idx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scored = offer as any;
        rows.push({
          groupName: cat.name,
          rank: scored.rank ?? (idx + 1),
          id: scored.id || '',
          title: scored.title || '',
          price: scored.price ?? 'N/A',
          location: scored.location || 'N/A',
          category: scored.category || cat.name,
          score: scored.finalScore ?? scored.score ?? 'N/A',
          justification: scored.justification || '',
          url: scored.url || '',
          description: scored.description || ''
        });
      });
    });
  } else if (data.kanban && data.kanban.length > 0) {
    data.kanban.forEach(col => {
      col.offers.forEach((offer, idx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scored = offer as any;
        rows.push({
          groupName: col.status,
          rank: scored.rank ?? (idx + 1),
          id: scored.id || '',
          title: scored.title || '',
          price: scored.price ?? 'N/A',
          location: scored.location || 'N/A',
          category: scored.category || col.status,
          score: scored.finalScore ?? scored.score ?? 'N/A',
          justification: scored.justification || '',
          url: scored.url || '',
          description: scored.description || ''
        });
      });
    });
  } else if (data.timeline && data.timeline.length > 0) {
    data.timeline.forEach(item => {
      item.offers.forEach((offer, idx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scored = offer as any;
        rows.push({
          groupName: item.date,
          rank: scored.rank ?? (idx + 1),
          id: scored.id || '',
          title: scored.title || '',
          price: scored.price ?? 'N/A',
          location: scored.location || 'N/A',
          category: scored.category || 'General',
          score: scored.finalScore ?? scored.score ?? 'N/A',
          justification: scored.justification || '',
          url: scored.url || '',
          description: scored.description || ''
        });
      });
    });
  }

  return rows;
}

/**
 * Converts organized offers or an offer list into RFC 4180 CSV formatted text.
 */
export function convertToCSV(data: OrganizedOffersV2 | Offer[]): string {
  const headers = [
    'Group / Status',
    'Rank',
    'Title',
    'Price',
    'Location',
    'Category',
    'Score',
    'Justification',
    'URL',
    'Description'
  ];

  const rows = extractRows(data);

  const csvLines: string[] = [
    headers.map(escapeCSVValue).join(',')
  ];

  for (const row of rows) {
    const values = [
      row.groupName,
      row.rank,
      row.title,
      row.price,
      row.location,
      row.category,
      row.score,
      row.justification,
      row.url,
      row.description
    ];
    csvLines.push(values.map(escapeCSVValue).join(','));
  }

  return csvLines.join('\r\n');
}
