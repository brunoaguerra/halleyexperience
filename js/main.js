/* =========================================================
   HALLEY — Looping soundtrack + play/pause control
   ========================================================= */

const track  = document.getElementById('track');
const player = document.getElementById('player');

track.volume = 0.6;

// Reflect the audio state on the player button (icon + a11y labels).
function sync() {
  const playing = !track.paused;
  player.classList.toggle('playing', playing);
  player.setAttribute('aria-pressed', playing ? 'true' : 'false');
  player.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
}

// Kick off muted autoplay immediately (allowed by all browsers).
track.play().catch(() => {});

// Un-mute on the very first user interaction so the soundtrack
// is already playing — it just becomes audible on first gesture.
function enableSound() {
  track.muted = false;
  if (track.paused) track.play().catch(() => {});
  window.removeEventListener('pointerdown', enableSound);
  window.removeEventListener('keydown', enableSound);
  window.removeEventListener('touchstart', enableSound);
}
window.addEventListener('pointerdown', enableSound);
window.addEventListener('keydown', enableSound);
window.addEventListener('touchstart', enableSound);

// Manual play/pause. Pressing it also counts as the first gesture,
// so it un-mutes too.
player.addEventListener('click', () => {
  track.muted = false;
  if (track.paused) track.play(); else track.pause();
});

track.addEventListener('play', sync);
track.addEventListener('pause', sync);
sync();
