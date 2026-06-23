/* =========================================================
   HALLEY — B&W + glitch spotlight on the hero image
   A large soft-edged circle follows the cursor (eased, "soft"
   motion). Inside the circle the image turns black & white AND
   glitches (ghosting + horizontal tears). Everything outside
   the circle stays the clean colour image.
   ========================================================= */

(function () {
  const bw   = document.getElementById('bwCanvas');
  const hero = document.querySelector('.hero');
  if (!bw || !hero) return;

  const MOBILE = window.matchMedia('(max-width: 768px), (hover: none)').matches;

  // On pure touch devices (no hover capability) the spotlight has no purpose —
  // skip the entire RAF loop to save CPU/battery.
  if (MOBILE) return;

  const ctx = bw.getContext('2d');

  let gray = null;          // pre-rendered grayscale image
  let iw = 0, ih = 0;       // natural image size
  let cw = 0, ch = 0;       // CSS-pixel canvas size

  // Eased cursor position + spotlight radius.
  let targetX = -9999, targetY = -9999;
  let curX = -9999, curY = -9999;
  let targetR = 0, curR = 0, bigR = 0;
  let inside = false;

  const EASE_POS = 0.12;    // lower = softer / laggier follow
  const EASE_R   = 0.10;

  // Glitch params, re-rolled every GLITCH_MS so it flickers.
  const GLITCH_MS = 70;
  let lastGlitch = 0;
  let gAb = 0, gAbY = 0, gSlices = [], gBars = [];

  let resizeTimer = 0;

  function buildGray() {
    iw = hero.naturalWidth;
    ih = hero.naturalHeight;
    if (!iw || !ih) return;
    gray = document.createElement('canvas');
    gray.width = iw;
    gray.height = ih;
    const g = gray.getContext('2d');
    g.filter = 'grayscale(1) contrast(1.05)';
    g.drawImage(hero, 0, 0, iw, ih);
  }

  function resize() {
    const rect = bw.getBoundingClientRect();
    cw = rect.width;
    ch = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    bw.width  = Math.round(cw * dpr);
    bw.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);  // work in CSS pixels
    bigR = Math.min(cw, ch) * 0.22;          // spotlight radius
  }

  // Debounced resize to avoid excessive recalcs.
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }

  // Map the image onto the canvas like the <img> (cover, centered).
  function coverRect() {
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    return { dx: (cw - dw) / 2, dy: (ch - dh) / 2, dw, dh };
  }

  const rnd = (a, b) => a + Math.random() * (b - a);

  function rollGlitch() {
    gAb  = rnd(3, 9);
    gAbY = rnd(-2, 2);
    gSlices = [];
    const n = Math.floor(rnd(4, 9));
    for (let i = 0; i < n; i++) {
      gSlices.push({ sy: rnd(0, ch), sh: rnd(4, 26), off: rnd(-40, 40) });
    }
    gBars = [];
    for (let i = 0; i < 2; i++) {
      gBars.push({
        y: rnd(0, ch), h: rnd(1, 3),
        mode: Math.random() < 0.5 ? 'screen' : 'multiply',
        color: Math.random() < 0.5 ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)'
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, cw, ch);
    if (curR < 0.5 || !gray) return;

    const { dx, dy, dw, dh } = coverRect();

    // 1) grayscale base
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(gray, dx, dy, dw, dh);

    // 2) glitch (only while actively hovering)
    if (inside) {
      // ghosting — offset additive copies of the gray image
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.18;
      ctx.drawImage(gray, dx - gAb, dy, dw, dh);
      ctx.drawImage(gray, dx + gAb, dy + gAbY, dw, dh);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // horizontal tears — copy bands of the canvas and shift them
      for (const s of gSlices) {
        ctx.drawImage(bw, 0, s.sy, cw, s.sh, s.off, s.sy, cw, s.sh);
      }
      // scan bars
      for (const b of gBars) {
        ctx.globalCompositeOperation = b.mode;
        ctx.fillStyle = b.color;
        ctx.fillRect(0, b.y, cw, b.h);
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    // 3) mask everything to the soft circle around the cursor
    ctx.globalCompositeOperation = 'destination-in';
    const grad = ctx.createRadialGradient(curX, curY, 0, curX, curY, curR);
    grad.addColorStop(0.0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.6, 'rgba(0,0,0,1)');
    grad.addColorStop(1.0, 'rgba(0,0,0,0)');   // soft feather
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'source-over';
  }

  function frame(t) {
    requestAnimationFrame(frame);
    if (!gray || document.hidden) return;

    curX += (targetX - curX) * EASE_POS;
    curY += (targetY - curY) * EASE_POS;
    targetR = inside ? bigR : 0;
    curR += (targetR - curR) * EASE_R;

    if (inside && t - lastGlitch >= GLITCH_MS) {
      lastGlitch = t;
      rollGlitch();
    }
    draw();
  }

  function pointTo(e) {
    const rect = bw.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
    if (!inside) { curX = targetX; curY = targetY; }  // snap on entry
    inside = true;
  }

  window.addEventListener('pointermove', pointTo, { passive: true });
  window.addEventListener('pointerdown', pointTo, { passive: true });
  window.addEventListener('pointerleave', () => { inside = false; });
  document.addEventListener('mouseleave', () => { inside = false; });
  window.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch') inside = false;
  });
  window.addEventListener('pointercancel', () => { inside = false; });
  window.addEventListener('resize', onResize);

  function start() {
    buildGray();
    resize();
    requestAnimationFrame(frame);
  }

  if (hero.complete && hero.naturalWidth) start();
  else hero.addEventListener('load', start, { once: true });
})();
