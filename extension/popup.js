/**
 * OfferAnalyst Chrome Extension - Popup Logic
 */

let capturedData = null;

document.addEventListener('DOMContentLoaded', async () => {
  const badgeEl = document.getElementById('platform-badge');
  const titleEl = document.getElementById('page-title');
  const urlEl = document.getElementById('page-url');
  const previewEl = document.getElementById('preview-box');
  const appUrlInput = document.getElementById('app-url');
  const sendBtn = document.getElementById('btn-send');
  const copyBtn = document.getElementById('btn-copy');

  // Load saved app url if any
  chrome.storage?.local?.get(['offeranalyst_app_url'], (res) => {
    if (res?.offeranalyst_app_url) {
      appUrlInput.value = res.offeranalyst_app_url;
    }
  });

  // Query active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    titleEl.textContent = 'Onglet non accessible';
    previewEl.textContent = 'Veuillez ouvrir une page web pour capturer une offre.';
    return;
  }

  // Detect platform
  const tabUrl = tab.url || '';
  if (tabUrl.includes('linkedin.com')) {
    badgeEl.textContent = 'LinkedIn';
  } else if (tabUrl.includes('indeed.com')) {
    badgeEl.textContent = 'Indeed';
  } else if (tabUrl.includes('welcometothejungle.com')) {
    badgeEl.textContent = 'WTTJ';
  } else {
    badgeEl.textContent = 'Web Job';
  }

  titleEl.textContent = tab.title || 'Page active';
  urlEl.textContent = tabUrl;

  // Execute extraction on the tab
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Selection check
        const sel = window.getSelection()?.toString()?.trim();
        if (sel && sel.length > 30) {
          return { text: sel, title: document.title, url: window.location.href, mode: 'selection' };
        }
        // Known selectors
        const selectors = [
          '.jobs-description__content',
          '.jobs-description',
          '#job-details',
          '#jobDescriptionText',
          '.jobsearch-JobComponent-description',
          '[data-testid="job-section-description"]',
          'article',
          'main'
        ];
        for (const s of selectors) {
          const el = document.querySelector(s);
          if (el && el.innerText && el.innerText.trim().length > 60) {
            return { text: el.innerText.trim(), title: document.title, url: window.location.href, mode: 'selector' };
          }
        }
        return {
          text: document.body?.innerText?.slice(0, 10000) || '',
          title: document.title,
          url: window.location.href,
          mode: 'body'
        };
      }
    });

    if (results && results[0]?.result) {
      capturedData = results[0].result;
      const previewText = capturedData.text.length > 300 
        ? capturedData.text.slice(0, 300) + '...'
        : capturedData.text;
      previewEl.textContent = previewText || 'Aucun texte identifié.';
    } else {
      previewEl.textContent = 'Impossible d\'extraire le contenu de la page.';
    }
  } catch (err) {
    previewEl.textContent = 'Erreur extraction : ' + (err?.message || 'Page restreinte');
  }

  // Save app URL on change
  appUrlInput.addEventListener('change', () => {
    const val = appUrlInput.value.trim().replace(/\/+$/, '');
    chrome.storage?.local?.set({ offeranalyst_app_url: val });
  });

  // Send to OfferAnalyst button
  sendBtn.addEventListener('click', () => {
    if (!capturedData || !capturedData.text) {
      alert('Veuillez sélectionner du texte ou ouvrir une offre valide.');
      return;
    }

    const baseAppUrl = appUrlInput.value.trim().replace(/\/+$/, '');
    const formattedPayload = `[Source: ${capturedData.url}]\n[Titre: ${capturedData.title}]\n\n${capturedData.text}`;
    
    // Hash payload prevents 414 URI Too Long errors
    const targetUrl = `${baseAppUrl}/data-source#capture=${encodeURIComponent(formattedPayload)}`;
    
    chrome.tabs.create({ url: targetUrl });
  });

  // Copy text button
  copyBtn.addEventListener('click', () => {
    if (!capturedData || !capturedData.text) return;
    const formattedPayload = `[Source: ${capturedData.url}]\n[Titre: ${capturedData.title}]\n\n${capturedData.text}`;
    navigator.clipboard.writeText(formattedPayload).then(() => {
      copyBtn.textContent = 'Texte copié !';
      setTimeout(() => {
        copyBtn.textContent = 'Copier le texte extrait';
      }, 2000);
    });
  });
});
