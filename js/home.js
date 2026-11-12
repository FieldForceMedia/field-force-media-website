/* Field Force home v3: live spend counter, count-ups, entrances. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt = function (n, d) { return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); };

  /* Live ad-spend counter: real figure at the "as of" time, then grows at the trailing 30-day rate. */
  var spend = document.getElementById('spendCounter');
  if (spend) {
    var base = parseFloat(spend.dataset.base), rate = parseFloat(spend.dataset.rate) / 86400, asof = Date.parse(spend.dataset.asof);
    var current = function () { return base + Math.max(0, (Date.now() - asof) / 1000) * rate; };
    /* Live totals straight from Meta via the CRM (refreshed hourly). The figures in the HTML
       are only the fallback if the CRM can't be reached. */
    window.__ffmLive = fetch('https://crm.fieldforcemedia.com/api/site-stats', { mode: 'cors' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.live) return;
        base = d.spend; asof = Date.parse(d.fetchedAt); rate = (d.dailyRate || 0) / 86400;
        var set = function (k, val, dec, suf, text) {
          document.querySelectorAll('[data-stat="' + k + '"]').forEach(function (el) {
            if (el.hasAttribute('data-count') && !el.dataset.done) { el.dataset.count = String(val); }
            else { el.textContent = text; }
          });
        };
        set('leads', d.leads, 0, '+', fmt(d.leads, 0) + '+');
        set('impressions', +(d.impressions / 1e6).toFixed(2), 2, 'M', (d.impressions / 1e6).toFixed(2) + 'M');
        set('clicks', +(d.linkClicks / 1e3).toFixed(1), 1, 'K', (d.linkClicks / 1e3).toFixed(1) + 'K');
        if (reduce) spend.textContent = '$' + fmt(current(), 0);
      }).catch(function () {});
    var paint = function () { spend.textContent = '$' + fmt(current(), 2); };
    if (reduce) { spend.textContent = '$' + fmt(current(), 0); }
    else {
      paint();
      var tick = function () { paint(); setTimeout(function () { requestAnimationFrame(tick); }, 250); };
      var started = false;
      var io0 = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !started) { started = true; tick(); io0.disconnect(); } }); }) : null;
      if (io0) io0.observe(spend); else tick();
    }
  }

  /* Count-ups for the supporting figures. */
  var nums = document.querySelectorAll('[data-count]');
  var run = function (el) {
    el.dataset.done = '1';
    var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), suf = el.dataset.suf || '';
    if (reduce) { el.textContent = fmt(end, dec) + suf; return; }
    var t0 = null, dur = 1400;
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e, dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  /* Client logo strip: scrolls on its own; drag (mouse), swipe (touch) or wheel to go faster.
     Auto-scroll pauses while someone is moving it and resumes shortly after. */
  var ms = document.querySelector('.marquee-scroller');
  if (ms) {
    var track = ms.querySelector('.marquee'), firstUl = track && track.querySelector('ul');
    var loopW = function () { return firstUl ? firstUl.getBoundingClientRect().width : 0; };
    var wrap = function () { var w = loopW(); if (w > 0) { if (ms.scrollLeft >= w) ms.scrollLeft -= w; else if (ms.scrollLeft <= 0) ms.scrollLeft += w; } };
    var pausedUntil = 0, dragging = false, startX = 0, startLeft = 0, last = 0, pos = 0;
    var hold = function (ms_) { pausedUntil = performance.now() + (ms_ || 1600); };
    ms.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') { hold(); return; }   /* touch uses native swipe scrolling */
      dragging = true; startX = e.clientX; startLeft = ms.scrollLeft; ms.classList.add('is-drag'); ms.setPointerCapture(e.pointerId); hold(); e.preventDefault();
    });
    ms.addEventListener('pointermove', function (e) { if (!dragging) return; ms.scrollLeft = startLeft - (e.clientX - startX); pos = ms.scrollLeft; wrap(); hold(); });
    var end = function () { if (!dragging) return; dragging = false; ms.classList.remove('is-drag'); hold(); };
    ms.addEventListener('pointerup', end); ms.addEventListener('pointercancel', end);
    ms.addEventListener('wheel', function () { hold(); }, { passive: true });
    ms.addEventListener('touchstart', function () { hold(2400); }, { passive: true });
    ms.addEventListener('scroll', function () { if (performance.now() < pausedUntil) { pos = ms.scrollLeft; wrap(); } }, { passive: true });
    ms.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { ms.scrollLeft += e.key === 'ArrowRight' ? 220 : -220; hold(); } });
    if (!reduce) {
      var speed = 0.045; /* px per ms, about the old 70s loop */
      var tickM = function (t) {
        var dt = last ? Math.min(64, t - last) : 16; last = t;
        if (!dragging && t > pausedUntil && !document.hidden) { pos += speed * dt; ms.scrollLeft = pos; if (pos >= loopW()) { pos -= loopW(); ms.scrollLeft = pos; } }
        else { pos = ms.scrollLeft; }
        requestAnimationFrame(tickM);
      };
      requestAnimationFrame(tickM);
    }
  }
  /* Site showcase: pick a thumbnail, it becomes the featured site. */
  var sc = document.getElementById('showcase');
  if (sc) {
    var img = document.getElementById('stImg'), src = document.getElementById('stSrc'), nm = document.getElementById('stName'), wh = document.getElementById('stWhere'), ds = document.getElementById('stDesc'), lk = document.getElementById('stLink'), ur = document.getElementById('stUrl');
    sc.querySelectorAll('.thumb').forEach(function (b) {
      b.addEventListener('click', function () {
        sc.querySelectorAll('.thumb').forEach(function (o) { o.classList.remove('on'); o.setAttribute('aria-pressed', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
        var k = b.dataset.k;
        src.srcset = 'images/work/' + k + '-m.jpg'; img.src = 'images/work/' + k + '-d.jpg'; img.alt = b.dataset.name + ' website';
        nm.textContent = b.dataset.name; wh.innerHTML = b.dataset.where; ds.textContent = b.dataset.desc; ur.textContent = b.dataset.dom || '';
        if (b.dataset.url) { lk.hidden = false; lk.href = b.dataset.url; lk.textContent = b.dataset.dom ? 'Visit ' + b.dataset.dom : 'Visit the live site'; } else { lk.hidden = true; }
      });
    });
  }
  /* Entrances: heading, then text, then pictures, once as each enters. */
  var rv = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) {
    document.documentElement.classList.add('rv-off');
    nums.forEach(function (n) { n.textContent = fmt(parseFloat(n.dataset.count), parseInt(n.dataset.dec || '0', 10)) + (n.dataset.suf || ''); });
    return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      if (e.target.hasAttribute('data-count')) run(e.target); else e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  rv.forEach(function (n) { io.observe(n); });
  nums.forEach(function (n) { io.observe(n); });
})();
