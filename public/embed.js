(function() {
  'use strict';
  const scripts = document.querySelectorAll('script[src*="embed.js"]');
  scripts.forEach(script => {
    const sheetId = script.getAttribute('data-sheet');
    const targetId = script.getAttribute('data-target');
    if (!sheetId || !targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;

    const iframe = document.createElement('iframe');
    iframe.src = window.location.origin + '/api/sheet-data?sheet_id=' + sheetId;
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = '1px solid #e2e8f0';
    iframe.style.borderRadius = '8px';
    iframe.setAttribute('loading', 'lazy');
    target.appendChild(iframe);
  });
})();
