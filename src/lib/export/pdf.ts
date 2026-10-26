import { Offer } from "@/types";
import { OrganizedOffersV2 } from "@/app/actions/organizeV2";

export interface PDFOfferItem {
  id: string;
  rank: number;
  title: string;
  price: string | number;
  location: string;
  category: string;
  score: number;
  justification: string;
  url?: string;
  breakdown?: {
    relevance: number;
    quality: number;
    trend: number;
  };
  webInsights?: string[];
}

export interface PDFSection {
  title: string;
  count: number;
  offers: PDFOfferItem[];
}

export interface PDFExportData {
  metadata: {
    title: string;
    domain: string;
    generatedAt: string;
    totalOffers: number;
    groupedBy: string;
  };
  summary: {
    averageScore: number;
    topScore: number;
    totalGroups: number;
  };
  sections: PDFSection[];
}

interface PreparePDFOptions {
  title?: string;
  domain?: string;
  marketSummary?: string;
}

/**
 * Prepares and structures organized offer data for PDF generation and reporting.
 */
export function preparePDFData(
  data: OrganizedOffersV2 | Offer[],
  options: PreparePDFOptions = {}
): PDFExportData {
  const generatedAt = new Date().toISOString();
  const domain = options.domain || 'General Market';
  const title = options.title || `Offer Analysis Report — ${domain}`;

  const sections: PDFSection[] = [];
  const allScores: number[] = [];

  // Helper to map an offer to PDFOfferItem
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapOffer = (item: any, fallbackRank: number): PDFOfferItem => {
    const score = Number(item.finalScore ?? item.score ?? 0);
    if (!isNaN(score) && score > 0) {
      allScores.push(score);
    }

    return {
      id: item.id || '',
      rank: item.rank ?? fallbackRank,
      title: item.title || 'Untitled Offer',
      price: item.price ?? 'N/A',
      location: item.location || 'N/A',
      category: item.category || 'General',
      score,
      justification: item.justification || '',
      url: item.url,
      breakdown: item.breakdown ? {
        relevance: Number(item.breakdown.relevance ?? 0),
        quality: Number(item.breakdown.quality ?? 0),
        trend: Number(item.breakdown.trend ?? 0)
      } : undefined,
      webInsights: Array.isArray(item.webInsights) ? item.webInsights : undefined
    };
  };

  if (Array.isArray(data)) {
    sections.push({
      title: 'Top Ranked Offers',
      count: data.length,
      offers: data.map((o, idx) => mapOffer(o, idx + 1))
    });
  } else {
    if (data.categories && data.categories.length > 0) {
      data.categories.forEach(cat => {
        sections.push({
          title: cat.name,
          count: cat.offers.length,
          offers: cat.offers.map((o, idx) => mapOffer(o, idx + 1))
        });
      });
    } else if (data.kanban && data.kanban.length > 0) {
      data.kanban.forEach(col => {
        sections.push({
          title: col.status,
          count: col.offers.length,
          offers: col.offers.map((o, idx) => mapOffer(o, idx + 1))
        });
      });
    } else if (data.timeline && data.timeline.length > 0) {
      data.timeline.forEach(t => {
        sections.push({
          title: t.date,
          count: t.offers.length,
          offers: t.offers.map((o, idx) => mapOffer(o, idx + 1))
        });
      });
    }
  }

  const totalOffers = sections.reduce((acc, sec) => acc + sec.count, 0);
  const topScore = allScores.length > 0 ? Math.max(...allScores) : 0;
  const averageScore = allScores.length > 0
    ? Math.round((allScores.reduce((sum, s) => sum + s, 0) / allScores.length) * 10) / 10
    : 0;

  return {
    metadata: {
      title,
      domain,
      generatedAt,
      totalOffers,
      groupedBy: ('groupedBy' in data && data.groupedBy) ? data.groupedBy : 'category'
    },
    summary: {
      averageScore,
      topScore,
      totalGroups: sections.length
    },
    sections
  };
}
