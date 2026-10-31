/**
 * OfferAnalyst Export Engine (CSV & PDF)
 * 
 * Provides deterministic, standards-compliant export capabilities:
 * - Structured CSV export with UTF-8 BOM, escaped values, scores breakdown and web citations.
 * - Pure TypeScript PDF-1.4 binary generator with executive summary, score distributions, and AI justification.
 * - Browser download helpers for both client-side and server API routes.
 */

import { AnalysisResponse } from '@/types';

// ============================================================================
// 1. CSV EXPORT ENGINE
// ============================================================================

export interface ExportMetadata {
  domain?: string;
  criteria?: string;
  model?: string;
  language?: 'fr' | 'en';
  date?: Date;
}

/**
 * Escapes a cell value for standard CSV compatibility.
 * Neutralizes CSV Formula Injection (CWE-1236) and handles quotes, commas, and newlines.
 */
function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  let str = String(value);
  // Neutralize CSV Formula Injection for Excel / Calc
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Generates a clean, structured CSV from an AnalysisResponse.
 * Prepends UTF-8 BOM (\uFEFF) for immediate compatibility with Excel (Windows/Mac) and Numbers.
 */
export function generateCsv(analysis: AnalysisResponse, meta?: ExportMetadata): string {
  const isEn = meta?.language === 'en';
  const lines: string[] = [];

  // UTF-8 BOM
  const BOM = '\uFEFF';

  // Metadata block
  lines.push(`${escapeCsvCell(isEn ? 'OFFERANALYST REPORT' : 'RAPPORT OFFERANALYST')};${escapeCsvCell(meta?.domain || 'General')}`);
  lines.push(`${escapeCsvCell(isEn ? 'Generated At' : 'Date de génération')};${escapeCsvCell((meta?.date || new Date()).toISOString())}`);
  if (meta?.criteria) {
    lines.push(`${escapeCsvCell(isEn ? 'Search Criteria' : 'Critères de recherche')};${escapeCsvCell(meta.criteria)}`);
  }
  if (meta?.model || analysis.modelUsed) {
    lines.push(`${escapeCsvCell(isEn ? 'AI Model' : 'Modèle IA')};${escapeCsvCell(meta?.model || analysis.modelUsed || 'Default')}`);
  }
  lines.push(`${escapeCsvCell(isEn ? 'Total Analyzed' : 'Total analysé')};${escapeCsvCell(analysis.totalAnalyzed || analysis.topOffers.length)}`);
  lines.push(''); // Blank line separator

  // Market Summary block
  if (analysis.marketSummary) {
    lines.push(`${escapeCsvCell(isEn ? 'MARKET SUMMARY' : 'SYNTHÈSE DU MARCHÉ')}`);
    lines.push(escapeCsvCell(analysis.marketSummary));
    lines.push('');
  }

  // Column Headers
  const headers = isEn
    ? [
        'Rank',
        'Title',
        'Overall Score',
        'Relevance (50%)',
        'Quality (30%)',
        'Trend (20%)',
        'Price',
        'Location',
        'Category',
        'AI Justification',
        'Web Insights',
        'URL',
      ]
    : [
        'Rang',
        'Titre',
        'Score Global',
        'Pertinence (50%)',
        'Qualité (30%)',
        'Tendance (20%)',
        'Prix',
        'Localisation',
        'Catégorie',
        'Justification IA',
        'Signaux Web',
        'URL',
      ];

  lines.push(headers.map(escapeCsvCell).join(';'));

  // Data rows
  analysis.topOffers.forEach((offer, idx) => {
    const rank = offer.rank || idx + 1;
    const finalScore = Math.round(offer.finalScore || 0);
    const relevance = Math.round(offer.breakdown?.relevance || 0);
    const quality = Math.round(offer.breakdown?.quality || 0);
    const trend = Math.round(offer.breakdown?.trend || 0);
    const insights = Array.isArray(offer.webInsights) ? offer.webInsights.join(' | ') : '';
    const url = offer.url || '';

    const row = [
      rank,
      offer.title || `Offer #${rank}`,
      `${finalScore}/100`,
      `${relevance}/100`,
      `${quality}/100`,
      `${trend}/100`,
      offer.price ?? '',
      offer.location || '',
      offer.category || '',
      offer.justification || '',
      insights,
      url,
    ];

    lines.push(row.map(escapeCsvCell).join(';'));
  });

  // Search Sources block
  if (analysis.searchSources && analysis.searchSources.length > 0) {
    lines.push('');
    lines.push(`${escapeCsvCell(isEn ? 'EXPLORED WEB SOURCES' : 'SOURCES WEB CONSULTÉES')}`);
    lines.push([escapeCsvCell(isEn ? 'Source Title' : 'Titre'), escapeCsvCell('URL')].join(';'));
    analysis.searchSources.forEach((src) => {
      lines.push([escapeCsvCell(src.title || src.uri), escapeCsvCell(src.uri)].join(';'));
    });
  }

  return BOM + lines.join('\r\n');
}

// ============================================================================
// 2. DETERMINISTIC PURE TYPESCRIPT PDF-1.4 ENGINE
// ============================================================================

/**
 * Sanitizes text for standard PDF Type 1 font (WinAnsiEncoding compatible).
 * Replaces non-ascii characters with clean equivalents and escapes PDF parentheses.
 */
function sanitizePdfText(str: string): string {
  if (!str) return '';
  const clean = str
    // Preserve Euro currency sign as EUR or standard representation
    .replace(/€/g, 'EUR')
    // Accents replacement for WinAnsi / ASCII
    .replace(/[éèêë]/g, 'e')
    .replace(/[ÉÈÊË]/g, 'E')
    .replace(/[àâä]/g, 'a')
    .replace(/[ÀÂÄ]/g, 'A')
    .replace(/[îï]/g, 'i')
    .replace(/[ÎÏ]/g, 'I')
    .replace(/[ôö]/g, 'o')
    .replace(/[ÔÖ]/g, 'O')
    .replace(/[ùûü]/g, 'u')
    .replace(/[ÙÛÜ]/g, 'U')
    .replace(/[ç]/g, 'c')
    .replace(/[Ç]/g, 'C')
    .replace(/[’‘]/g, "'")
    .replace(/[«»“”]/g, '"')
    .replace(/[•–—]/g, '-')
    .replace(/[^\x20-\x7E]/g, ' '); // Keep standard printable ASCII

  // Escape PDF literal string special chars: \, (, )
  return clean.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Wraps text into lines not exceeding maxChars.
 */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

interface PdfPageContent {
  stream: string;
}

/**
 * Generates a complete, valid PDF-1.4 binary buffer.
 * Contains:
 * - Cover/Header banner with branding
 * - Executive summary with styled callout
 * - Top scored offers with score breakdown bars (Relevance, Quality, Trend)
 * - AI justifications & web insights
 * - Proper multi-page layout with headers & footers
 */
export function generatePdfReport(analysis: AnalysisResponse, meta?: ExportMetadata): Uint8Array {
  const isEn = meta?.language === 'en';
  const dateStr = (meta?.date || new Date()).toLocaleDateString(isEn ? 'en-US' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const domain = meta?.domain || 'Multi-Source';
  const criteria = meta?.criteria || '';

  const pages: PdfPageContent[] = [];
  let currentCommands: string[] = [];
  let currentY = 792 - 40; // Letter height (792pt) - top margin 40pt
  const pageHeight = 792;
  const pageWidth = 612;
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2; // 532pt
  const bottomMargin = 50;

  function flushPage() {
    if (currentCommands.length > 0) {
      // Add footer to current page
      const pageNum = pages.length + 1;
      const footerText = sanitizePdfText(
        `OfferAnalyst • ${isEn ? 'Page' : 'Page'} ${pageNum} • ${dateStr}`
      );
      // Footer line
      currentCommands.push('0.85 0.85 0.88 RG 0.5 w');
      currentCommands.push(`${marginX} 35 m ${marginX + contentWidth} 35 l S`);
      // Footer text
      currentCommands.push('BT /F1 8 Tf 0.5 0.5 0.5 rg');
      currentCommands.push(`${marginX} 22 Td (${footerText}) Tj ET`);

      pages.push({ stream: currentCommands.join('\n') });
      currentCommands = [];
      currentY = pageHeight - 40;
    }
  }

  function ensureSpace(neededHeight: number) {
    if (currentY - neededHeight < bottomMargin) {
      flushPage();
      // Draw running header on subsequent pages
      currentCommands.push('0.85 0.85 0.88 RG 0.5 w');
      currentCommands.push(`${marginX} 760 m ${marginX + contentWidth} 760 l S`);
      currentCommands.push('BT /F2 8 Tf 0.3 0.6 0.9 rg');
      currentCommands.push(`${marginX} 765 Td (OFFERANALYST - ${sanitizePdfText(domain.toUpperCase())}) Tj ET`);
      currentY = 740;
    }
  }

  // --- PAGE 1: HEADER & BRANDING ---
  // Header accent bar (Neon Cyan / Emerald gradient simulation)
  currentCommands.push('0.06 0.72 0.51 rg'); // #10B981 Emerald
  currentCommands.push(`${marginX} ${currentY - 4} ${contentWidth} 5 re f`);
  currentY -= 20;

  // Title
  currentCommands.push('BT /F2 20 Tf 0.08 0.12 0.20 rg');
  currentCommands.push(`${marginX} ${currentY} Td (${sanitizePdfText(isEn ? 'OFFER ANALYSIS REPORT' : "RAPPORT D'ANALYSE D'OFFRES")}) Tj ET`);
  currentY -= 20;

  // Subtitle / Metadata row
  currentCommands.push('BT /F1 10 Tf 0.40 0.45 0.55 rg');
  const offersList = Array.isArray(analysis?.topOffers) ? analysis.topOffers : [];
  const totalAnalyzed = analysis?.totalAnalyzed ?? offersList.length;
  const metaLine = sanitizePdfText(
    `${isEn ? 'Domain:' : 'Domaine :'} ${domain}  |  ${isEn ? 'Date:' : 'Date :'} ${dateStr}  |  ${isEn ? 'Offers Analyzed:' : 'Offres analysées :'} ${totalAnalyzed}`
  );
  currentCommands.push(`${marginX} ${currentY} Td (${metaLine}) Tj ET`);
  currentY -= 15;

  if (criteria) {
    currentCommands.push('BT /F1 9 Tf 0.40 0.45 0.55 rg');
    currentCommands.push(`${marginX} ${currentY} Td (${sanitizePdfText((isEn ? 'Criteria: ' : 'Critères : ') + criteria.slice(0, 90))}) Tj ET`);
    currentY -= 15;
  }

  // Divider
  currentCommands.push('0.88 0.90 0.94 RG 1 w');
  currentCommands.push(`${marginX} ${currentY} m ${marginX + contentWidth} ${currentY} l S`);
  currentY -= 25;

  // --- SECTION 1: EXECUTIVE MARKET SUMMARY ---
  if (analysis?.marketSummary) {
    const summaryLines = wrapText(analysis.marketSummary, 92);
    const boxHeight = summaryLines.length * 13 + 32;

    ensureSpace(boxHeight + 20);

    // Summary Box Background
    currentCommands.push('0.96 0.98 0.99 rg');
    currentCommands.push(`${marginX} ${currentY - boxHeight + 10} ${contentWidth} ${boxHeight} re f`);

    // Summary Box Left Accent Border
    currentCommands.push('0.06 0.72 0.51 rg');
    currentCommands.push(`${marginX} ${currentY - boxHeight + 10} 4 ${boxHeight} re f`);

    // Summary Box Title
    currentCommands.push('BT /F2 11 Tf 0.04 0.48 0.35 rg');
    currentCommands.push(`${marginX + 14} ${currentY - 14} Td (${sanitizePdfText(isEn ? 'EXECUTIVE MARKET SUMMARY' : 'SYNTHÈSE DU MARCHÉ')}) Tj ET`);

    // Summary Box Body Text
    currentCommands.push('BT /F1 9 Tf 0.20 0.24 0.30 rg');
    let textY = currentY - 30;
    for (const sLine of summaryLines) {
      currentCommands.push(`${marginX + 14} ${textY} Td (${sanitizePdfText(sLine)}) Tj ET`);
      textY -= 13;
    }
    currentY -= boxHeight + 15;
  }

  // --- SECTION 2: TOP SCORED OFFERS ---
  if (offersList.length > 0) {
    ensureSpace(40);
    currentCommands.push('BT /F2 13 Tf 0.08 0.12 0.20 rg');
    currentCommands.push(`${marginX} ${currentY} Td (${sanitizePdfText(isEn ? 'TOP RECOMMENDED OFFERS & SCORES' : 'TOP OFFRES RECOMMANDÉES & SCORES')}) Tj ET`);
    currentY -= 20;

    offersList.forEach((offer, i) => {
      const rank = offer.rank || i + 1;
      const score = Math.round(offer.finalScore || 0);
      const rel = Math.round(offer.breakdown?.relevance || 0);
      const qual = Math.round(offer.breakdown?.quality || 0);
      const trnd = Math.round(offer.breakdown?.trend || 0);

      // Clamp justification to max 12 lines (~1000 chars) to prevent off-page coordinate overflow
      const rawJust = offer.justification || '';
      const allJustLines = wrapText(rawJust, 85);
      const justLines = allJustLines.slice(0, 12);
      if (allJustLines.length > 12 && justLines.length > 0) {
        justLines[justLines.length - 1] = (justLines[justLines.length - 1] || '').slice(0, 80) + '...';
      }

      const cardHeight = 70 + justLines.length * 12 + (offer.webInsights?.length ? 25 : 0);

      ensureSpace(cardHeight + 15);

      // Card background
      currentCommands.push('0.98 0.99 1.00 rg');
      currentCommands.push(`${marginX} ${currentY - cardHeight + 10} ${contentWidth} ${cardHeight} re f`);

      // Card outline
      currentCommands.push('0.85 0.89 0.95 RG 1 w');
      currentCommands.push(`${marginX} ${currentY - cardHeight + 10} ${contentWidth} ${cardHeight} re S`);

      // Rank Badge Box
      currentCommands.push('0.06 0.72 0.51 rg');
      currentCommands.push(`${marginX + 10} ${currentY - 24} 24 20 re f`);
      currentCommands.push('BT /F2 11 Tf 1 1 1 rg');
      currentCommands.push(`${marginX + 17} ${currentY - 18} Td (#${rank}) Tj ET`);

      // Offer Title (with safe fallback)
      currentCommands.push('BT /F2 11 Tf 0.10 0.15 0.25 rg');
      const rawTitle = offer.title || (isEn ? `Offer #${rank}` : `Offre #${rank}`);
      const titleText = sanitizePdfText(rawTitle.slice(0, 60));
      currentCommands.push(`${marginX + 42} ${currentY - 14} Td (${titleText}) Tj ET`);

      // Price & Location
      currentCommands.push('BT /F1 9 Tf 0.40 0.45 0.55 rg');
      const details = sanitizePdfText(
        `${offer.price ? String(offer.price) : ''} ${offer.location ? ' • ' + offer.location : ''} ${offer.category ? ' • ' + offer.category : ''}`
      );
      currentCommands.push(`${marginX + 42} ${currentY - 26} Td (${details}) Tj ET`);

      // Global Score Badge
      currentCommands.push('0.12 0.20 0.35 rg');
      currentCommands.push(`${marginX + contentWidth - 65} ${currentY - 24} 55 20 re f`);
      currentCommands.push('BT /F2 10 Tf 1 1 1 rg');
      currentCommands.push(`${marginX + contentWidth - 58} ${currentY - 18} Td (${score}/100) Tj ET`);

      // Score Breakdown Row
      currentCommands.push('BT /F1 8 Tf 0.30 0.35 0.45 rg');
      const scoreDetails = sanitizePdfText(
        `${isEn ? 'Relevance' : 'Pertinence'}: ${rel}/100  |  ${isEn ? 'Quality' : 'Qualité'}: ${qual}/100  |  ${isEn ? 'Trend' : 'Tendance'}: ${trnd}/100`
      );
      currentCommands.push(`${marginX + 12} ${currentY - 42} Td (${scoreDetails}) Tj ET`);

      // Justification Text
      currentCommands.push('BT /F1 8.5 Tf 0.25 0.28 0.35 rg');
      let justY = currentY - 56;
      for (const jLine of justLines) {
        currentCommands.push(`${marginX + 12} ${justY} Td (${sanitizePdfText(jLine)}) Tj ET`);
        justY -= 12;
      }

      // Web Insights if present
      if (offer.webInsights && offer.webInsights.length > 0) {
        currentCommands.push('BT /F2 8 Tf 0.06 0.50 0.40 rg');
        const insightSummary = sanitizePdfText(`[Web Signal] ${offer.webInsights[0].slice(0, 85)}`);
        currentCommands.push(`${marginX + 12} ${justY - 2} Td (${insightSummary}) Tj ET`);
      }

      currentY -= cardHeight + 12;
    });
  }

  // Flush final page
  flushPage();

  // --- ASSEMBLE PDF FILE FORMAT ---
  // Object IDs:
  // 1: Catalog
  // 2: Pages
  // 3: Font Helvetica
  // 4: Font Helvetica-Bold
  // 5 + 2*i : Page object
  // 6 + 2*i : Page content stream
  const objects: { id: number; data: string }[] = [];
  const numPages = pages.length;

  const pageObjIds: number[] = [];
  for (let i = 0; i < numPages; i++) {
    pageObjIds.push(5 + i * 2);
  }

  // 1: Catalog
  objects.push({
    id: 1,
    data: '<< /Type /Catalog /Pages 2 0 R >>',
  });

  // 2: Pages
  objects.push({
    id: 2,
    data: `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${numPages} >>`,
  });

  // 3: Font Helvetica (F1)
  objects.push({
    id: 3,
    data: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  });

  // 4: Font Helvetica-Bold (F2)
  objects.push({
    id: 4,
    data: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  });

  // Page and Stream objects
  for (let i = 0; i < numPages; i++) {
    const pageId = 5 + i * 2;
    const streamId = 6 + i * 2;
    const streamContent = pages[i].stream;
    const streamLen = new TextEncoder().encode(streamContent).length;

    // Page Object
    objects.push({
      id: pageId,
      data: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamId} 0 R >>`,
    });

    // Content Stream Object
    objects.push({
      id: streamId,
      data: `<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream`,
    });
  }

  // Build binary buffer with xref
  let pdfOutput = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets: number[] = [0]; // offset 0 is dummy

  for (const obj of objects) {
    const offset = new TextEncoder().encode(pdfOutput).length;
    offsets.push(offset);
    pdfOutput += `${obj.id} 0 obj\n${obj.data}\nendobj\n`;
  }

  const startXref = new TextEncoder().encode(pdfOutput).length;
  pdfOutput += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i++) {
    const offStr = String(offsets[i]).padStart(10, '0');
    pdfOutput += `${offStr} 00000 n \n`;
  }

  pdfOutput += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return new TextEncoder().encode(pdfOutput);
}

// ============================================================================
// 3. CLIENT DOWNLOAD HELPERS
// ============================================================================

/**
 * Initiates a browser download for a Blob object.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Downloads analysis results as a structured CSV.
 */
export function exportAnalysisAsCsv(
  analysis: AnalysisResponse,
  domain: string = 'analysis',
  criteria?: string,
  filename?: string
): void {
  const csvContent = generateCsv(analysis, { domain, criteria, date: new Date() });
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const safeName = filename || `offeranalyst-${domain.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.csv`;
  downloadBlob(blob, safeName);
}

/**
 * Downloads analysis results as a styled PDF report.
 */
export function exportAnalysisAsPdf(
  analysis: AnalysisResponse,
  domain: string = 'analysis',
  criteria?: string,
  filename?: string
): void {
  const pdfBytes = generatePdfReport(analysis, { domain, criteria, date: new Date() });
  const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
  const safeName = filename || `offeranalyst-${domain.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.pdf`;
  downloadBlob(blob, safeName);
}
