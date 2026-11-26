/* Homepage results cards: dots follow the swipe on phones, tap a dot to jump. */
(function () {
  var track = document.getElementById('rtrack'), dots = document.getElementById('rdots');
  if (!track || !dots) return;
  var cards = track.querySelectorAll('.rcard');
  cards.forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', c.getAttribute('aria-label'));
    b.addEventListener('click', function () { track.scrollTo({ left: c.offsetLeft - track.offsetLeft - 20, behavior: 'smooth' }); });
    dots.appendChild(b);
  });
  var mark = function () {
    var w = cards[0].getBoundingClientRect().width + 14, i = Math.round(track.scrollLeft / w);
    dots.querySelectorAll('button').forEach(function (d, j) { d.setAttribute('aria-current', j === i ? 'true' : 'false'); });
  };
  track.addEventListener('scroll', function () { requestAnimationFrame(mark); }, { passive: true });
  mark();
})();
