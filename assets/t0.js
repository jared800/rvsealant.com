/* Tier 0 click tracking for RVSealant.com (site-checklist-enforcer 2026-11-26).
   Sends a GA4 affiliate_click event for every outbound partner or retailer link:
   rel="sponsored" links and links to Amazon. Params: partner (host), page, placement. */
(function () {
  function isPartner(a) {
    var rel = (a.getAttribute('rel') || '').toLowerCase();
    var host = a.hostname || '';
    return rel.indexOf('sponsored') > -1 || /(^|\.)amazon\.|amzn\.to$/.test(host);
  }
  function placement(a) {
    var s = a.closest('section,article,table,aside,footer,header,nav');
    if (!s) return 'body';
    return s.id || s.tagName.toLowerCase();
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.hostname === location.hostname || !isPartner(a)) return;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'affiliate_click', {
        partner: a.hostname.replace(/^www\./, ''),
        page: location.pathname,
        placement: placement(a),
        link_text: (a.textContent || '').trim().slice(0, 80),
        transport_type: 'beacon'
      });
    }
  }, true);
})();
