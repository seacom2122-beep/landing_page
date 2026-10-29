/* ORBIT — progressive enhancement. Everything here is optional; the page reads fine without it. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // 1. Hero entrance: nav → headline → copy → visual (staggered via CSS delays)
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('ready')));
  // The CSS keys off ".ready [data-intro]" under .js, so mirror it on <html>
  root.classList.add('ready');

  // 2. Mobile menu
  const btn = $('.menu-btn'), menu = $('#menu'), nav = $('.nav');
  const setMenu = open => {
    btn.setAttribute('aria-expanded', open);
    menu.classList.toggle('open', open);
    nav.classList.toggle('has-open', open);
  };
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
  });

  // 3. Scroll-triggered reveals for the work cards
  const revealObs = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.style.transitionDelay = (en.target.dataset.i || 0) * 90 + 'ms'; en.target.classList.add('in'); revealObs.unobserve(en.target); }
  }), { threshold: .15 });
  $$('[data-reveal]').forEach((el, i) => { el.dataset.i = i; revealObs.observe(el); });

  // 4. Signature sequence: native scroll + IntersectionObserver picks the active stage
  const svg = $('.stage-svg'), cap = $('#cap'), steps = $$('.step');
  const stageObs = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    steps.forEach(s => s.classList.toggle('active', s === en.target));
    svg.dataset.stage = en.target.dataset.stage;
    cap.textContent = en.target.dataset.caption;
  }), { rootMargin: '-45% 0px -45% 0px' }); // fires when a step crosses the viewport middle
  steps.forEach(s => stageObs.observe(s));
  steps[0].classList.add('active');

  // 5. Scroll progress + nav state, throttled with rAF
  const bar = $('.progress span');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const max = root.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      nav.classList.toggle('scrolled', scrollY > 10);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // 6. Restrained pointer parallax (fine pointers only, never with reduced motion)
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    const hero = $('.hero'), layers = $$('.par');
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      layers.forEach(l => { const d = +l.dataset.depth; l.style.transform = `translate(${cx * d}px,${cy * d}px)`; });
      raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > .001) ? requestAnimationFrame(loop) : 0;
    };
    hero.addEventListener('pointermove', e => {
      tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }
})();
