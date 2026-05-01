import Atropos from 'atropos';
import 'atropos/css';
import gsap from 'gsap';
import { initSplash } from '../../../packages/design-system/js/splash.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initAtropos() {
  const cardEl = document.querySelector('.atropos');
  if (!cardEl) return;

  Atropos({
    el: cardEl,
    activeOffset: 40,
    alwaysActive: false,
    shadow: true,
    shadowScale: 1.05,
    shadowOffset: 5,
    highlight: true,
    rotateXMax: 15,
    rotateYMax: 15,
    rotateXInvert: false,
    rotateYInvert: false,
    duration: 300,
  });
}

function initEntranceAnimation() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.animate-in').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const elements = document.querySelectorAll('.animate-in');
  gsap.fromTo(
    elements,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.15,
      delay: 0.2,
    },
  );
}

function initMagneticEffect() {
  if (prefersReducedMotion) return;

  const magneticElements = document.querySelectorAll('.magnetic');
  magneticElements.forEach((el) => {
    const strength = 0.3;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out',
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  });
}

function initLinkHoverEffects() {
  if (prefersReducedMotion) return;

  const links = document.querySelectorAll('a');
  links.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      gsap.to(link, {
        scale: 1.05,
        duration: 0.2,
        ease: 'power2.out',
      });
    });

    link.addEventListener('mouseleave', () => {
      gsap.to(link, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSplash({
    storageKey: 'tennis-stringing-splash',
    duration: 1200,
    mode: 'crossfade',
  });
  initAtropos();
  initEntranceAnimation();
  initMagneticEffect();
  initLinkHoverEffects();
});
