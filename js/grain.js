/* =========================================================
   HALLEY — Animated film grain overlay
   A subtle, moving monochrome noise across the whole page.
   Rendered from a small noise tile repeated over the screen
   (cheap), re-rolled a few times per second.
   ========================================================= */

(function () {
  const canvas = document.getElementById('grain');
  if (!canvas) return;

  // Respect users who asked for less motion.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');

  // Lighter settings on phones (smaller screens / touch) to save
  // CPU and battery without losing the filmic texture.
  const MOBILE = window.matchMedia('(max-width: 768px), (hover: none)').matches;

  const TILE = MOBILE ? 96 : 128;   // noise tile size (px)
  const FPS = MOBILE ? 16 : 24;     // grain refresh rate
  const SPREAD = 26;                // contrast of the grain (0–127). Higher = grittier.
  const MAX_DPR = MOBILE ? 1 : 1.5; // limit canvas resolution to save GPU

  let cw = 0, ch = 0;
  let last = 0;
  let resizeTimer = 0;

  // Offscreen tile we fill with fresh noise each tick.
  const tile = document.createElement('canvas');
  tile.width = TILE;
  tile.height = TILE;
  const tctx = tile.getContext('2d');
  const imgData = tctx.createImageData(TILE, TILE);
  const buf = imgData.data;

  // Pre-allocate a Uint8Array for batch random generation (faster than Math.random per pixel).
  const pixelCount = TILE * TILE;
  const rndBuf = new Uint8Array(pixelCount);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width  = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Debounced resize to avoid excessive recalcs on mobile (address bar toggling).
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }

  function rollNoise() {
    // Fill random bytes in one batch call (much faster than per-pixel Math.random)
    crypto.getRandomValues(rndBuf);
    for (let i = 0, j = 0; i < buf.length; i += 4, j++) {
      // gray value centered on 128 so it's neutral under "overlay"
      // Map 0-255 random byte to [128-SPREAD, 128+SPREAD]
      const v = 128 + ((rndBuf[j] / 255) * 2 - 1) * SPREAD;
      buf[i] = buf[i + 1] = buf[i + 2] = v;
      buf[i + 3] = 255;
    }
    tctx.putImageData(imgData, 0, 0);
  }

  let pattern = null;
  function paint() {
    rollNoise();
    pattern = ctx.createPattern(tile, 'repeat');
    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    // random sub-tile offset so the repeat seam keeps moving
    ctx.translate(-Math.random() * TILE, -Math.random() * TILE);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, cw + TILE, ch + TILE);
    ctx.restore();
  }

  function frame(t) {
    requestAnimationFrame(frame);
    // Skip painting when the tab is hidden (Page Visibility API)
    if (document.hidden) return;
    if (t - last < 1000 / FPS) return;
    last = t;
    paint();
  }

  window.addEventListener('resize', onResize);
  resize();
  requestAnimationFrame(frame);
})();
