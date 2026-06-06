(function() {
  'use strict';
  /**
   * SheetSync Embed Script
   * Usage: <div id="sheetsync-XXXX"></div>
   *        <script src="/embed.js" data-sheet="SHEET_ID" data-target="sheetsync-XXXX"></script>
   */
  const scripts = document.querySelectorAll('script[src*="embed.js"]');
  scripts.forEach(function(script) {
    var sheetId = script.getAttribute('data-sheet');
    var targetId = script.getAttribute('data-target');
    if (!sheetId || !targetId) return;
    var target = document.getElementById(targetId);
    if (!target) return;

    var iframe = document.createElement('iframe');
    iframe.src = window.location.origin + '/api/sheet-data?sheet_id=' + encodeURIComponent(sheetId);
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = '1px solid #e2e8f0';
    iframe.style.borderRadius = '8px';
    iframe.setAttribute('loading', 'lazy');
    target.appendChild(iframe);
  });
})();
