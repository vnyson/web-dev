import Atropos from 'atropos';
import 'atropos/css';
import gsap from 'gsap';
import { initSplash, resetSplash } from '@vnyson/design-system/js/splash.js';

// Clear splash for hard refresh
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('clear-splash')) {
  resetSplash('tennis-stringing-splash');
  // Clean URL
  window.history.replaceState({}, '', window.location.pathname);
}

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

// SVG Animation Controllers
function initStringAnimation(card) {
  const path = card.querySelector('#string-path');
  if (!path) return;

  const wavyPath = 'M 10 50 Q 30 30, 50 50 T 90 50 T 130 50 T 170 50 T 190 50';
  const straightPath = 'M 10 50 L 50 50 L 90 50 L 130 50 L 170 50 L 190 50';

  const tl = gsap.timeline({ paused: true });
  tl.to(path, {
    attr: { d: straightPath },
    duration: 0.8,
    ease: 'power2.inOut',
  });

  return {
    play: () => tl.play(),
    reverse: () => tl.reverse(),
    reset: () => {
      path.setAttribute('d', wavyPath);
      tl.progress(0).pause();
    },
  };
}

function initRacquetAnimation(card) {
  const racquet = card.querySelector('#racquet-group');
  const arrow = card.querySelector('#rotation-arrow');
  if (!racquet) return;

  const tl = gsap.timeline({ paused: true });
  tl.to(racquet, {
    rotation: 360,
    duration: 1.5,
    ease: 'power2.inOut',
  });

  if (arrow) {
    gsap.set(arrow, { opacity: 0.5 });
    tl.to(arrow, { opacity: 0, duration: 0.3 }, 0);
  }

  return {
    play: () => tl.restart(),
  };
}

function initWeightsAnimation(card) {
  const weights = [
    { circle: '#weight-3', label: '#label-3' },
    { circle: '#weight-9', label: '#label-9' },
    { circle: '#weight-12', label: '#label-12' },
    { circle: '#weight-throat', label: '#label-throat' },
  ];

  const tl = gsap.timeline({ paused: true });

  weights.forEach((item, i) => {
    const circle = card.querySelector(item.circle);
    const label = card.querySelector(item.label);
    if (circle) {
      tl.to(circle, { opacity: 1, scale: 1.2, duration: 0.3, ease: 'back.out(1.7)' }, i * 0.3);
      tl.to(circle, { scale: 1, duration: 0.2 }, `>${i * 0.3 + 0.2}`);
    }
    if (label) {
      tl.to(label, { opacity: 1, duration: 0.3 }, i * 0.3 + 0.15);
    }
  });

  return {
    play: () => tl.restart(),
    reset: () => {
      weights.forEach((item) => {
        const circle = card.querySelector(item.circle);
        const label = card.querySelector(item.label);
        if (circle) gsap.set(circle, { opacity: 0, scale: 1 });
        if (label) gsap.set(label, { opacity: 0 });
      });
      tl.progress(0).pause();
    },
  };
}

function initServiceAnimations() {
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const cards = document.querySelectorAll('.service-card');
  const animations = new Map();

  cards.forEach((card) => {
    const type = card.dataset.animation;
    let controller;

    switch (type) {
      case 'string':
        controller = initStringAnimation(card);
        break;
      case 'racquet':
        controller = initRacquetAnimation(card);
        break;
      case 'weights':
        controller = initWeightsAnimation(card);
        break;
    }

    if (controller) {
      animations.set(card, controller);
    }
  });

  if (isMobile) {
    // Mobile: animate on scroll into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const controller = animations.get(entry.target);
            if (controller) controller.play();
          }
        });
      },
      { threshold: 0.5, rootMargin: '0px' },
    );

    cards.forEach((card) => observer.observe(card));
  } else {
    // Desktop: animate on load + hover
    animations.forEach((controller) => {
      if (controller.play) controller.play();
    });

    cards.forEach((card) => {
      const controller = animations.get(card);
      if (!controller) return;

      card.addEventListener('mouseenter', () => {
        if (controller.reset) controller.reset();
        if (controller.play) controller.play();
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSplash({
    storageKey: 'tennis-stringing-splash',
    duration: 2000,
    mode: 'crossfade',
    animationMode: 'bike',
  });
  initAtropos();
  initEntranceAnimation();
  initMagneticEffect();
  initLinkHoverEffects();
  initServiceAnimations();
});
