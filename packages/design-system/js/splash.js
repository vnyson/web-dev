/**
 * Splash Screen Utility
 * Shows a splash screen once per session, then hides it.
 *
 * Usage:
 *   import { initSplash } from '@vnyson/design-system/js/splash.js';
 *   initSplash({ storageKey: 'my-site-splash', duration: 1500 });
 */

const DEFAULTS = {
  selector: '.splash',
  storageKey: 'splash-seen',
  duration: 1500,
  seenClass: 'splash--seen',
  animateInClass: 'splash--animate-in',
  animateOutClass: 'splash--animate-out',
  crossfadeClass: 'splash--crossfade',
  mode: 'default', // 'default' | 'crossfade'
};

/**
 * Initialize splash screen
 * @param {Object} options - Configuration options
 * @param {string} options.selector - CSS selector for splash element
 * @param {string} options.storageKey - sessionStorage key
 * @param {number} options.duration - How long to show splash (ms)
 * @param {string} options.seenClass - Class to add when already seen
 * @param {string} options.animateInClass - Class for entrance animation
 * @param {string} options.animateOutClass - Class for exit animation
 * @param {string} options.crossfadeClass - Class for crossfade animation
 * @param {string} options.mode - Animation mode: 'default' or 'crossfade'
 */
export function initSplash(options = {}) {
  const config = { ...DEFAULTS, ...options };

  const splash = document.querySelector(config.selector);
  if (!splash) return;

  // Check if already seen this session
  const hasSeen = sessionStorage.getItem(config.storageKey);

  if (hasSeen) {
    // Hide immediately without animation
    splash.classList.add(config.seenClass);
    splash.setAttribute('hidden', '');
    return;
  }

  // Show with entrance animation
  splash.classList.add(config.animateInClass);

  // Mark as seen and hide after duration
  setTimeout(() => {
    sessionStorage.setItem(config.storageKey, 'true');

    splash.classList.remove(config.animateInClass);

    // Use crossfade or default exit animation
    const exitClass = config.mode === 'crossfade' ? config.crossfadeClass : config.animateOutClass;
    splash.classList.add(exitClass);

    // Remove from DOM after animation completes
    splash.addEventListener(
      'animationend',
      () => {
        splash.setAttribute('hidden', '');
      },
      { once: true },
    );
  }, config.duration);
}

/**
 * Reset splash for testing (clears sessionStorage)
 * @param {string} storageKey - The storage key to clear
 */
export function resetSplash(storageKey = DEFAULTS.storageKey) {
  sessionStorage.removeItem(storageKey);
}
