/* Field Force Media — main.js */

// Nav scroll behavior
const nav = document.querySelector('.nav');
const onScroll = () => {
  nav?.classList.toggle('scrolled', window.scrollY > 40);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
if (reveals.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => observer.observe(el));
}

// Mobile nav toggle
const toggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
toggle?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('open');
  const spans = toggle.querySelectorAll('span');
  if (mobileMenu?.classList.contains('open')) {
    spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// ---- Video testimonials — 3D coverflow carousel ----
(() => {
  const track = document.getElementById('vtcTrack');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.vtc-card'));
  const dotsWrap = document.getElementById('vtcDots');
  const prevBtn = document.getElementById('vtcPrev');
  const nextBtn = document.getElementById('vtcNext');
  const total = cards.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (total <= 1) {
    track.classList.add('is-solo');
    wirePlay();
    return;
  }

  // With only two testimonials, show them side by side — no coverflow needed.
  if (total === 2) {
    track.classList.add('is-pair');
    wirePlay();
    return;
  }

  let current = 0;
  let timer = null;
  const DELAY = 7000;

  function posClass(i) {
    const diff = ((i - current) % total + total) % total;
    const d = diff > total / 2 ? diff - total : diff;
    if (d === 0) return 'pos-active';
    if (d === -1) return 'pos-prev';
    if (d === 1) return 'pos-next';
    if (d === -2) return 'pos-far-prev';
    if (d === 2) return 'pos-far-next';
    return 'pos-hidden';
  }

  function render() {
    cards.forEach((card, i) => {
      card.className = 'vtc-card ' + posClass(i);
      const vid = card.querySelector('video');
      if (!card.classList.contains('pos-active') && vid && !vid.paused) {
        vid.pause();
      }
      if (!card.classList.contains('is-playing')) {
        // keep is-playing only while its own video is actually playing
      }
    });
    if (dotsWrap) {
      Array.from(dotsWrap.children).forEach((dot, i) =>
        dot.classList.toggle('active', i === current));
    }
  }

  function goTo(i, userAction) {
    current = ((i % total) + total) % total;
    render();
    if (userAction) restart();
  }

  function start() {
    if (reduceMotion) return;
    clearInterval(timer);
    timer = setInterval(() => {
      // don't advance while a video is playing
      const playing = cards.some(c => {
        const v = c.querySelector('video');
        return v && !v.paused && !v.ended;
      });
      if (!playing) goTo(current + 1, false);
    }, DELAY);
  }
  function stop() { clearInterval(timer); }
  function restart() { stop(); start(); }

  // dots
  if (dotsWrap) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'vtc-dot' + (i === 0 ? ' active' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
      dot.addEventListener('click', () => goTo(i, true));
      dotsWrap.appendChild(dot);
    });
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1, true));
  nextBtn?.addEventListener('click', () => goTo(current + 1, true));

  // click a side card to bring it forward (active card handled by wirePlay)
  cards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
      if (card.classList.contains('pos-active')) return;
      if (e.target.closest('.vtc-media')) return;
      goTo(i, true);
    });
  });

  track.parentElement.addEventListener('mouseenter', stop);
  track.parentElement.addEventListener('mouseleave', start);

  wirePlay();
  goTo(0, false);
  start();

  function wirePlay() {
    cards.forEach(card => {
      const vid = card.querySelector('video');
      const media = card.querySelector('.vtc-media');
      if (!vid || !media) return;

      const startPlayback = (e) => {
        // once native controls are showing, they own every click
        if (vid.controls) return;
        if (e) e.stopPropagation();
        cards.forEach(c => {
          const v = c.querySelector('video');
          if (v && v !== vid) { v.pause(); c.classList.remove('is-playing'); }
        });
        vid.controls = true;
        const attempt = vid.play();
        if (attempt && attempt.catch) {
          attempt.catch(() => { vid.load(); vid.play().catch(() => {}); });
        }
      };

      // the whole poster area is the play target, not just the small button
      media.addEventListener('click', startPlayback);

      vid.addEventListener('play', () => card.classList.add('is-playing'));
      vid.addEventListener('pause', () => card.classList.remove('is-playing'));
      vid.addEventListener('ended', () => card.classList.remove('is-playing'));
    });
  }
})();
