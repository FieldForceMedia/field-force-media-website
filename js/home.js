/* Field Force home v3: live spend counter, count-ups, entrances. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt = function (n, d) { return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); };

  /* Live ad-spend counter: real figure at the "as of" time, then grows at the trailing 30-day rate. */
  var spend = document.getElementById('spendCounter');
  if (spend) {
    var base = parseFloat(spend.dataset.base), rate = parseFloat(spend.dataset.rate) / 86400, asof = Date.parse(spend.dataset.asof);
    var current = function () { return base + Math.max(0, (Date.now() - asof) / 1000) * rate; };
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
