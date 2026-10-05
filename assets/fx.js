/* Cinematic + interactive layer: scroll progress, hero headline reveal,
   magnetic book buttons, about-photo parallax, dark-section spotlight, team bios modal. */
(function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Scroll progress bar + about-photo parallax
  var bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);
  var stackPhotos = document.querySelectorAll('[data-parallax]');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    if (reduceMotion) return;
    stackPhotos.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      var offset = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      el.style.setProperty('--py', (offset * parseFloat(el.dataset.parallax)).toFixed(1) + 'px');
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Hero headline: split into words that blur in one after another
  var h1 = document.querySelector('[data-split]');
  if (h1 && !reduceMotion) {
    var words = h1.textContent.trim().split(/\s+/);
    h1.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'hero-word';
      s.style.animationDelay = (0.15 + i * 0.09) + 's';
      s.textContent = w;
      h1.appendChild(s);
      if (i < words.length - 1) h1.appendChild(document.createTextNode(' '));
    });
  }

  // Magnetic book buttons
  if (canHover && !reduceMotion) {
    document.querySelectorAll('.btn-book').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.3 + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  // Spotlight following the pointer
  if (canHover) {
    document.querySelectorAll('.spotlight').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--sx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--sy', (e.clientY - r.top) + 'px');
      });
    });
  }

  // Team bios modal
  var modal = document.getElementById('team-modal');
  if (modal && typeof modal.showModal === 'function') {
    var photo = modal.querySelector('.tm-photo img');
    var body = modal.querySelector('.tm-body');
    var closeBtn = modal.querySelector('.tm-close');
    var lastTrigger = null;

    function open(card) {
      lastTrigger = card.querySelector('.team-more');
      var img = card.querySelector('.team-photo img');
      photo.src = img.src;
      photo.alt = img.alt;
      body.querySelector('.tm-name').textContent = card.querySelector('.team-name').textContent;
      body.querySelector('.tm-role').textContent = card.querySelector('.team-role').textContent;
      body.querySelector('.tm-bio').innerHTML = card.querySelector('.team-bio').innerHTML;
      // restart entrance animations
      body.querySelectorAll(':scope > *').forEach(function (el) { el.style.animation = 'none'; el.offsetHeight; el.style.animation = ''; });
      photo.style.animation = 'none'; photo.offsetHeight; photo.style.animation = '';
      modal.classList.remove('closing');
      modal.showModal();
      modal.querySelector('.tm-grid').scrollTop = 0;
      body.scrollTop = 0;
      document.body.classList.add('modal-open');
    }
    function close() {
      if (!modal.open || modal.classList.contains('closing')) return;
      if (reduceMotion) { finish(); return; }
      modal.classList.add('closing');
      setTimeout(finish, 280);
    }
    function finish() {
      modal.classList.remove('closing');
      modal.close();
    }
    modal.addEventListener('close', function () {
      document.body.classList.remove('modal-open');
      if (lastTrigger) lastTrigger.focus({ preventScroll: true });
    });
    modal.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    closeBtn.addEventListener('click', close);
    document.querySelectorAll('.team-card').forEach(function (card) {
      card.querySelector('.team-more').addEventListener('click', function () { open(card); });
    });
  }
})();
