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

/* Email signup box (site-checklist-enforcer 2026-11-27): Brevo form for list 21 "RVSealant - Roof Reseal Checklist",
   Brevo automation 5 sends the checklist and two follow-ups. Inserted at the end of each content page.
   Honeypot email_address_check must stay empty. Fires GA4 sign_up on submit. */
(function () {
  var ACTION = 'https://b9efc0f0.sibforms.com/serve/MUIFAOkcwRL3uP0NMAO2v0sNyMqPz4vfhtUF6McdRB1VZsXaUgSaGXu8kQ4see4pEbpqWwcjTUluFjqxeAsaf-w52_pRYRP-fAedYFR0yLv0rBqgraGPCjeqZQkqB3Nh85e4ewH22RFr_5GL7WKIwAzlQtIWJXltMrRFF_4r_mjvTqabh17gZh9eeZuoVEByupCr3IOoYDYlpcERBQ==';
  var SKIP = /^\/(privacy|disclosure|reseal-checklist)\/?$/;
  function init() {
    if (SKIP.test(location.pathname) || document.getElementById('signup')) return;
    var wrap = document.querySelector('main .wrap');
    if (!wrap) return;
    var css = document.createElement('style');
    css.textContent = '.signup{background:#fff;border:1px solid var(--line);border-left:4px solid var(--brand);border-radius:12px;padding:18px;margin:28px 0}' +
      '.signup h2{margin-top:0;font-size:1.2rem}.signup p{margin:.3em 0 .8em}.signup form{display:flex;flex-wrap:wrap;gap:8px}' +
      '.signup input[type=email]{flex:1 1 220px;min-width:0;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font:inherit}' +
      '.signup button{background:var(--brand);color:#fff;border:0;border-radius:8px;padding:10px 16px;font:inherit;font-weight:700;cursor:pointer}' +
      '.signup button:hover{background:var(--brand-d)}.signup .hp{position:absolute;left:-5000px;width:1px;height:1px;overflow:hidden}' +
      '.signup .fine{font-size:.82rem;color:var(--muted);margin:.6em 0 0}.signup-msg{font-weight:600;color:var(--brand-d);margin:.4em 0 0}';
    document.head.appendChild(css);
    var s = document.createElement('section');
    s.className = 'signup'; s.id = 'signup';
    s.innerHTML = '<h2>Free RV roof reseal checklist</h2>' +
      '<p>The prep, weather and cure steps from the sealant makers\' own labels, on one printable page. Plus two short follow-up emails on picking the right sealant for your roof.</p>' +
      '<form class="signup-form" method="POST" action="' + ACTION + '">' +
      '<label class="hp" aria-hidden="true">Leave this empty<input type="text" name="email_address_check" value="" tabindex="-1" autocomplete="off"></label>' +
      '<input type="email" name="EMAIL" placeholder="you@example.com" aria-label="Email address" required autocomplete="email">' +
      '<input type="hidden" name="locale" value="en"><input type="hidden" name="html_type" value="simple">' +
      '<button type="submit">Send me the checklist</button></form>' +
      '<p class="signup-msg" role="status" aria-live="polite"></p>' +
      '<p class="fine">Three emails, then occasional updates. Unsubscribe in one click. See our <a href="/privacy/">privacy policy</a>.</p>';
    wrap.appendChild(s);
    var f = s.querySelector('form'), msg = s.querySelector('.signup-msg');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.email_address_check.value) { msg.textContent = "You're in."; f.style.display = 'none'; return; }
      var em = f.EMAIL.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { msg.textContent = 'Please enter a valid email address.'; return; }
      f.querySelector('button').disabled = true;
      fetch(ACTION, { method: 'POST', mode: 'no-cors', body: new FormData(f) }).then(function () {
        if (typeof window.gtag === 'function') window.gtag('event', 'sign_up', { method: 'reseal_checklist', page: location.pathname });
        f.style.display = 'none';
        msg.textContent = "You're in. The checklist is on its way to your inbox (check spam if it isn't there in 5 minutes).";
      }).catch(function () { f.submit(); });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
