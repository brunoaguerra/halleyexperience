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

  let cw = 0, ch = 0;
  let last = 0;

  // Offscreen tile we fill with fresh noise each tick.
  const tile = document.createElement('canvas');
  tile.width = TILE;
  tile.height = TILE;
  const tctx = tile.getContext('2d');
  const imgData = tctx.createImageData(TILE, TILE);
  const buf = imgData.data;

  function resize() {
    cw = window.innerWidth;
    ch = window.innerHeight;
    canvas.width = cw;
    canvas.height = ch;
  }

  function rollNoise() {
    for (let i = 0; i < buf.length; i += 4) {
      // gray value centered on 128 so it's neutral under "overlay"
      const v = 128 + (Math.random() * 2 - 1) * SPREAD;
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
    if (t - last < 1000 / FPS) return;
    last = t;
    paint();
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();
