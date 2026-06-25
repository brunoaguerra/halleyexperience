/* =========================================================
   HALLEY — Looping soundtrack + play/pause control
   ========================================================= */

// Remove intro curtain after it fades out
const curtain = document.getElementById('introCurtain');
if (curtain) {
  curtain.addEventListener('animationend', () => curtain.remove(), { once: true });
}

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
track.play().catch((err) => {
  console.warn('[HALLEY] Autoplay blocked:', err.message);
});

// Un-mute on the very first user interaction so the soundtrack
// is already playing — it just becomes audible on first gesture.
function enableSound() {
  track.muted = false;
  if (track.paused) {
    track.play().catch((err) => {
      console.warn('[HALLEY] Play on gesture failed:', err.message);
    });
  }
  // Remove ALL gesture listeners at once
  ['pointerdown', 'keydown', 'touchstart'].forEach((evt) => {
    window.removeEventListener(evt, enableSound);
  });
}
window.addEventListener('pointerdown', enableSound);
window.addEventListener('keydown', enableSound);
window.addEventListener('touchstart', enableSound);

// Manual play/pause. Pressing it also counts as the first gesture,
// so it un-mutes too.
player.addEventListener('click', () => {
  track.muted = false;
  if (track.paused) {
    track.play().catch((err) => {
      console.warn('[HALLEY] Play failed:', err.message);
    });
  } else {
    track.pause();
  }
});

track.addEventListener('play', sync);
track.addEventListener('pause', sync);
sync();

// ---------------------------------------------------------
// Page Visibility API — pause audio & animations when the
// tab is hidden to save CPU/battery and stop sound playing
// in the background.
// ---------------------------------------------------------
let wasPlayingBeforeHidden = false;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Tab went to background: remember state and pause
    wasPlayingBeforeHidden = !track.paused;
    if (!track.paused) track.pause();
    // Pause CSS animations (Ken Burns, CTA breath, grain overlay)
    document.documentElement.style.setProperty('--page-play-state', 'paused');
  } else {
    // Tab came back: resume only if it was playing before
    if (wasPlayingBeforeHidden && !track.muted) {
      track.play().catch((err) => {
        console.warn('[HALLEY] Resume on visibility failed:', err.message);
      });
    }
    document.documentElement.style.removeProperty('--page-play-state');
  }
});

