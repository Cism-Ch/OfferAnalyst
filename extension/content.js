/**
 * OfferAnalyst Chrome Extension - Content Script
 * Extracts clean job postings text from active tab DOM
 */

function extractJobContent() {
  // 1. Check user text selection first
  const selection = window.getSelection()?.toString()?.trim();
  if (selection && selection.length > 30) {
    return {
      text: selection,
      title: document.title,
      url: window.location.href,
      mode: 'selection'
    };
  }

  // 2. Known job platform selectors
  const selectors = [
    // LinkedIn
    '.jobs-description__content',
    '.jobs-description',
    '#job-details',
    '.job-view-layout',
    // Indeed
    '#jobDescriptionText',
    '.jobsearch-JobComponent-description',
    // Welcome to the Jungle
    '[data-testid="job-section-description"]',
    'section[data-testid="job-section-description"]',
    // Monster / Glassdoor / Generic
    '[data-test-id="job-description"]',
    '.job-description',
    '.job-details',
    'article',
    'main'
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      const text = el.innerText?.trim();
      if (text && text.length > 80) {
        return {
          text,
          title: document.title,
          url: window.location.href,
          mode: 'selector',
          selector
        };
      }
    }
  }

  // 3. Fallback: clean main body text
  const bodyText = document.body?.innerText?.trim()?.slice(0, 15000) || '';
  return {
    text: bodyText,
    title: document.title,
    url: window.location.href,
    mode: 'fallback'
  };
}

// Listen for message from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_job') {
    const data = extractJobContent();
    sendResponse(data);
  }
  return true;
});
