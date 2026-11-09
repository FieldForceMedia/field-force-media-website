/* Field Force Media: cookie choice + small interactions.
   Every effect is desktop-pointer only and off for people who ask for reduced motion. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var fx = finePointer && !reduce;

  /* ---- Cookie choice ----
     The page head sets Google's consent defaults before analytics loads (see the gtag block).
     This banner records the visitor's choice and updates consent. Decline is as easy as accept. */
  var KEY = 'ffm-consent';
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (!saved) {
    var bar = document.createElement('div');
    bar.className = 'cookie-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie choice');
    bar.innerHTML =
      '<p>We use cookies to see which pages are useful and to measure our ads. The site works the same either way. ' +
      '<a href="/privacy.html">Privacy policy</a></p>' +
      '<div class="cookie-btns"><button type="button" data-c="denied">Decline</button>' +
      '<button type="button" data-c="granted">Accept</button></div>';
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]');
      if (!b) return;
      var v = b.dataset.c;
      try { localStorage.setItem(KEY, v); } catch (err) {}
      if (typeof gtag === 'function') {
        gtag('consent', 'update', { analytics_storage: v, ad_storage: v, ad_user_data: v, ad_personalization: v });
      }
      bar.classList.add('out');
      setTimeout(function () { bar.remove(); }, reduce ? 0 : 250);
    });
    document.body.appendChild(bar);
  }

  /* ---- Contact form: "Sending..." while it submits, so nobody double-taps. ---- */
  document.querySelectorAll('form[action*="ffm-forms"]').forEach(function (f) {
    var btn = f.querySelector('[type="submit"]');
    if (!btn) return;
    var label = btn.textContent;
    f.addEventListener('submit', function () { btn.disabled = true; btn.textContent = 'Sending...'; });
    window.addEventListener('pageshow', function () { btn.disabled = false; btn.textContent = label; });
  });

  /* ---- Lead event for Google Analytics when the form comes back with ?sent=1 ---- */
  if (/[?&]sent=1\b/.test(location.search) && typeof gtag === 'function') {
    gtag('event', 'generate_lead', { form: 'contact' });
  }

  /* ---- Sticky "Book a call" bar on phones, after the first screen. Not on the contact page. ---- */
  if (!/contact(\.html)?$/.test(location.pathname)) {
    var sticky = document.createElement('a');
    sticky.className = 'sticky-cta';
    sticky.href = '/contact.html';
    sticky.textContent = 'Book a free strategy call';
    document.body.appendChild(sticky);
    document.body.classList.add('has-sticky');
    var showSticky = function () { sticky.classList.toggle('on', window.scrollY > window.innerHeight * 0.8); };
    window.addEventListener('scroll', showSticky, { passive: true });
    showSticky();
  }

  if (!fx) return;

  /* ---- Magnetic primary button: leans up to 6px toward the pointer. Only on [data-magnetic]. ---- */
  document.querySelectorAll('[data-magnetic]').forEach(function (el) {
    var MAX = 6;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      var y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.translate = (x * MAX).toFixed(1) + 'px ' + (y * MAX).toFixed(1) + 'px';
    });
    el.addEventListener('pointerleave', function () { el.style.translate = ''; });
  });

  /* ---- Context cursor: a small label next to the normal cursor, only over [data-cursor] targets. ---- */
  var targets = document.querySelectorAll('[data-cursor]');
  if (targets.length) {
    var tag = document.createElement('div');
    tag.className = 'ctx-cursor';
    tag.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tag);
    var raf = 0, px = 0, py = 0;
    var place = function () { raf = 0; tag.style.transform = 'translate(' + px + 'px,' + py + 'px)'; };
    targets.forEach(function (t) {
      t.addEventListener('pointerenter', function () { tag.textContent = t.dataset.cursor; tag.classList.add('on'); });
      t.addEventListener('pointerleave', function () { tag.classList.remove('on'); });
    });
    window.addEventListener('pointermove', function (e) {
      px = e.clientX + 18; py = e.clientY + 18;
      if (!raf) raf = requestAnimationFrame(place);
    }, { passive: true });
  }

  /* ---- Light parallax on one element ([data-parallax]); moves at most ~8% of its own height. ---- */
  var px0 = document.querySelector('[data-parallax]');
  if (px0) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var r = px0.getBoundingClientRect();
      var vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh; /* -0.5..0.5 around the middle of the screen */
      px0.style.translate = '0 ' + (p * r.height * -0.08).toFixed(1) + 'px';
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }
})();
