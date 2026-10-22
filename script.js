/* ---------- page behaviour ---------- */
const $ = s => document.querySelector(s);
$('#yr').textContent = new Date().getFullYear();
const rmotion = matchMedia('(prefers-reduced-motion:reduce)').matches;

const burger = $('#burger'), menu = $('#menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
menu.addEventListener('click', e => {
  if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); }
});

const revealIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('[data-r]').forEach(el => revealIO.observe(el));

const links = [...document.querySelectorAll('#menu a[href^="#"]')];
const navIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => navIO.observe(s));

/* soft glow that follows the cursor over the tools section */
(function () {
  const t = $('#skills'); if (!t || rmotion) return;
  t.addEventListener('pointermove', e => {
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
})();

/* sliding role titles on the right of the hero */
(function () {
  const r = [...document.querySelectorAll('.roles span')]; let i = 0;
  r[0].classList.add('on');
  if (rmotion) return;
  setInterval(() => {
    const prev = r[i]; prev.classList.remove('on'); prev.classList.add('out');
    setTimeout(() => prev.classList.remove('out'), 750);
    i = (i + 1) % r.length; r[i].classList.add('on');
  }, 3200);
})();

/* ---------- 3D character (Three.js) ---------- */
(function () {
  const hero = $('#home'), cv = $('#bot'), stage = $('.stage');
  if (!window.THREE || !document.createElement('canvas').getContext('webgl')) { hero.classList.add('no3d'); return; }
  const T = THREE, rm = rmotion;
  const R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  R.setPixelRatio(Math.min(devicePixelRatio, 2));
  const S = new T.Scene(), C = new T.PerspectiveCamera(38, 1, .1, 60);

  /* soft front light plus purple and pink rim lights, like the reference */
  S.add(new T.AmbientLight(0xffffff, .55));
  const key = new T.DirectionalLight(0xffffff, 1); key.position.set(-2, 4, 6); S.add(key);
  const rimL = new T.PointLight(0xa855f7, 2.4, 20); rimL.position.set(-4, 2, -3); S.add(rimL);
  const rimR = new T.PointLight(0xf472b6, 1.8, 20); rimR.position.set(4, 2, -3); S.add(rimR);

  const mat = (c, m = 0, r = .45) => new T.MeshStandardMaterial({ color: c, metalness: m, roughness: r });
  const white = mat(0xeceef6), dark = mat(0x16192b, .4, .4), hairM = mat(0x08080e, .3, .22), purple = mat(0x8b5cf6, .4, .3), steel = mat(0xb8bfd0, .6, .3);
  const eyeW = mat(0xffffff, 0, .3), irisM = mat(0x2a1763, .2, .3);
  const sph = new T.SphereGeometry(1, 40, 28), box = new T.BoxGeometry(1, 1, 1), cyl = new T.CylinderGeometry(1, 1, 1, 28);

  const rig = new T.Group(); S.add(rig);
  const props = new T.Group(); rig.add(props);           /* chair, desk, laptop: rise in as you scroll */
  const add = (g, m, p, s, par = rig) => { const o = new T.Mesh(g, m); o.position.set(...p); if (s) o.scale.set(...s); par.add(o); return o; };

  /* head */
  const head = new T.Group(); head.position.set(0, 1.85, 0); rig.add(head);
  add(sph, white, [0, 0, 0], [.78, .86, .76], head);
  const hair = add(new T.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI * .5), hairM, [0, .03, -.05], [.84, .92, .82], head);
  hair.rotation.x = -.5;
  [-1, 1].forEach(s => add(sph, white, [s * .78, 0, 0], [.08, .17, .11], head));      /* ears */
  add(sph, white, [0, -.1, .72], [.09, .11, .09], head);                             /* nose */
  const mouth = add(new T.TorusGeometry(.13, .014, 8, 24, Math.PI), dark, [0, -.26, .69], null, head);
  mouth.rotation.z = Math.PI;                                                         /* smile */

  const eyes = [-1, 1].map(s => {
    const g = new T.Group(); g.position.set(s * .28, .08, .69); head.add(g);
    add(sph, eyeW, [0, 0, 0], [.15, .12, .07], g);
    const ir = add(sph, irisM, [0, 0, .045], [.065, .075, .03], g);
    const lid = add(sph, white, [0, 0, .005], [.165, .135, .085], g);
    return { ir, lid };
  });
  const brows = [-1, 1].map(s => { const b = add(box, hairM, [s * .28, .34, .65], [.24, .04, .05], head); b.rotation.z = s * .1; return b; });

  /* body: neck, turtleneck ring, rounded shoulders */
  add(cyl, white, [0, 1.2, 0], [.24, .4, .24]);
  const ring = add(new T.TorusGeometry(.27, .07, 14, 36), white, [0, 1.12, 0]); ring.rotation.x = Math.PI / 2;
  add(sph, white, [0, .3, 0], [.95, .95, .5]);
  add(box, dark, [0, -.4, .05], [1, .3, .8]);
  [-1, 1].forEach(s => add(sph, white, [s * .8, .95, 0], [.2, .2, .2]));

  /* limbs are cylinders stretched between two points */
  const up = new T.Vector3(0, 1, 0), v = new T.Vector3();
  const limb = (m, a, b) => { v.subVectors(b, a); m.position.copy(a).addScaledVector(v, .5); m.scale.y = v.length(); m.quaternion.setFromUnitVectors(up, v.normalize()); };
  const mk = (m, r) => { const o = new T.Mesh(cyl, m); o.scale.x = o.scale.z = r; rig.add(o); return o; };
  const V = (x, y, z) => new T.Vector3(x, y, z);

  const arms = [-1, 1].map(s => {
    const sh = V(s * .8, .95, 0), el = V(s * .95, .35, .55), hand = V(s * .35, .12, 1.15);
    const upper = mk(white, .15), fore = mk(white, .12), h = add(sph, white, [0, 0, 0], [.13, .09, .16]);
    limb(upper, sh, el);
    return { s, el, hand, fore, h };
  });
  [-1, 1].forEach(s => {
    const hip = V(s * .35, -.45, .1), knee = V(s * .38, -.45, 1.1), foot = V(s * .38, -1.65, 1.2);
    limb(mk(dark, .17), hip, knee); limb(mk(dark, .13), knee, foot);
    add(box, dark, [s * .38, -1.75, 1.35], [.28, .12, .5]);
  });

  /* chair, desk, laptop */
  add(box, purple, [0, -.68, .15], [1.5, .14, 1.4], props);
  add(box, purple, [0, .35, -.62], [1.3, 1.6, .14], props);
  add(cyl, dark, [0, -1.2, .1], [.08, 1, .08], props);
  add(cyl, dark, [0, -1.78, .1], [.85, .08, .85], props);
  add(box, mat(0x23233a, .3, .5), [0, -.12, 1.75], [3.6, .1, 1.5], props);
  add(box, steel, [0, 0, 1.3], [1.3, .06, .9], props);
  const lid = new T.Group(); lid.position.set(0, .03, 1.75); lid.rotation.x = .25; props.add(lid);
  add(box, steel, [0, .375, 0], [1.3, .75, .04], lid);
  add(box, new T.MeshBasicMaterial({ color: 0x1b2a6b }), [0, .375, -.025], [1.2, .65, .01], lid);
  add(sph, new T.MeshBasicMaterial({ color: 0x67e8f9 }), [0, .375, .03], [.09, .09, .02], lid);

  /* input + state */
  let mx = 0, my = 0, last = 0, openAmt = 0, blink = 0, nextBlink = 4;
  const eyesOpenAt = performance.now() + 900;   /* eyes stay shut, then snap open */
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = -(e.clientY / innerHeight * 2 - 1); last = performance.now(); }, { passive: true });

  const clamp = (x, a, b) => Math.min(b, Math.max(a, x)), lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);
  let vis = true, hx = 0, hy = 0, raf = 0;
  function resize() {
    R.setSize(stage.clientWidth, stage.clientHeight, false);
    C.aspect = stage.clientWidth / stage.clientHeight; C.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis && !raf) loop(); }).observe(hero);

  const clock = new T.Clock();
  function loop() {
    if (!vis) { raf = 0; return; }
    raf = requestAnimationFrame(loop);
    const t = rm ? 0 : clock.getElapsedTime(), now = performance.now();
    const p = clamp(scrollY / Math.max(1, hero.offsetHeight - innerHeight), 0, 1), e = ease(p);
    hero.style.setProperty('--p', p.toFixed(3));

    /* start: head and shoulders filling the frame. scroll: pull back, turn, desk rises in */
    const f = C.aspect > 1.1 ? 1 : 1.7;
    C.position.set(lerp(0, .6, e), lerp(1.65, 1.7, e), lerp(4.9, 10, e) * f);
    C.lookAt(0, lerp(1.6, .9, e), lerp(0, .7, e));
    rig.rotation.y = lerp(0, -.45, e);
    props.position.y = -3.2 * (1 - ease(clamp((p - .12) / .5, 0, 1)));

    /* cursor target (gentle idle sway if the pointer is still) */
    let tx = mx, ty = my;
    if (now - last > 3000 && !rm) { tx = Math.sin(t * .5) * .35; ty = Math.sin(t * .37) * .2; }
    hx = lerp(hx, tx, .1); hy = lerp(hy, ty, .1);
    head.rotation.y = lerp(head.rotation.y, hx * .5 - rig.rotation.y * .7, .1);
    head.rotation.x = lerp(head.rotation.x, -hy * .3 + e * .18, .1);

    /* eyes: shut at first, snap open, blink now and then; irises and brows follow the cursor */
    if (now > eyesOpenAt) openAmt = lerp(openAmt, 1, .5);
    if (t > nextBlink) { blink = 1; nextBlink = t + 3 + Math.random() * 3; }
    blink = Math.max(0, blink - .12);
    const op = openAmt * (1 - blink), lidH = lerp(.135, .028, op);
    eyes.forEach(E => {
      E.lid.scale.y = lidH; E.lid.position.y = .13 - lidH;
      E.ir.position.x = hx * .045; E.ir.position.y = hy * .03;
    });
    brows.forEach(b => b.position.y = .34 + op * .035);

    /* typing + float */
    arms.forEach(a => {
      a.hand.y = .12 + Math.sin(t * 14 + a.s * 2) * .025;
      limb(a.fore, a.el, a.hand); a.h.position.copy(a.hand);
    });
    rig.position.y = Math.sin(t) * .03;
    R.render(S, C);
  }
  loop();
})();