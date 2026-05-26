import { initSplash, resetSplash } from '@vnyson/design-system/js/splash.js';

const API_URL = 'https://tennis-admin-api.vnyson.workers.dev';

// Clear splash for hard refresh
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('clear-splash')) {
  resetSplash('tennis-stringing-splash');
  // Clean URL
  window.history.replaceState({}, '', window.location.pathname);
}

document.addEventListener('DOMContentLoaded', () => {
  // Queue Data Fetching
  const queueImage = document.querySelector('.queue-image');
  const queueText = document.querySelector('.queue-text');

  if (queueImage && queueText) {
    fetchQueueStatus();
  }

  async function fetchQueueStatus() {
    try {
      const response = await fetch(`${API_URL}/api/queue-status`);
      if (!response.ok) {
        throw new Error('Failed to fetch queue status');
      }
      const data = await response.json();
      updateQueueDisplay(data.count);
    } catch (error) {
      console.error('Error fetching queue status:', error);
      queueText.textContent = 'Error';
    }
  }

  function updateQueueDisplay(count) {
    let imageName;
    let text;

    if (count === 0) {
      imageName = 'Pokemon Hospital-0.png';
      text = 'No wait';
    } else if (count === 1) {
      imageName = 'Pokemon Hospital-1.png';
      text = '1 day';
    } else if (count === 2) {
      imageName = 'Pokemon Hospital-2.png';
      text = '2 days';
    } else if (count === 3) {
      imageName = 'Pokemon Hospital-3.png';
      text = '3 days';
    } else if (count === 4) {
      imageName = 'Pokemon Hospital-4.png';
      text = '4 days';
    } else if (count === 5) {
      imageName = 'Pokemon Hospital-5.png';
      text = '5 days';
    } else if (count === 6) {
      imageName = 'Pokemon Hospital-6.png';
      text = '6 days';
    } else {
      imageName = 'Pokemon Hospital-FULL.png';
      text = '1-2 weeks';
    }

    queueImage.src = `assets/images/queue/${imageName}`;
    queueText.textContent = text;
  }

  // Queue Image Hover Effect
  if (queueImage) {
    const originalSrc = queueImage.src;
    const gifSrc = queueImage.dataset.gifSrc;

    queueImage.addEventListener('mouseenter', () => {
      if (gifSrc) {
        queueImage.src = gifSrc;
      }
    });

    queueImage.addEventListener('mouseleave', () => {
      queueImage.src = originalSrc;
    });
  }

  // Inventory Overlay
  const inventoryButton = document.querySelector('.inventory-button');
  const inventoryOverlay = document.getElementById('inventory-overlay');
  const inventoryCloseButton = document.querySelector('.inventory-overlay__close');
  const inventoryGrid = document.getElementById('inventory-grid');

  if (inventoryButton && inventoryOverlay) {
    inventoryButton.addEventListener('click', () => {
      inventoryOverlay.classList.remove('hidden');
      fetchInventory();
    });
  }

  if (inventoryCloseButton && inventoryOverlay) {
    inventoryCloseButton.addEventListener('click', () => {
      inventoryOverlay.classList.add('hidden');
    });
  }

  if (inventoryOverlay) {
    inventoryOverlay.addEventListener('click', (e) => {
      if (e.target === inventoryOverlay) {
        inventoryOverlay.classList.add('hidden');
      }
    });
  }

  async function fetchInventory() {
    if (!inventoryGrid) return;

    try {
      const response = await fetch(`${API_URL}/api/inventory`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      const data = await response.json();
      renderInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      inventoryGrid.innerHTML = '<p>Error loading inventory.</p>';
    }
  }

  function renderInventory(items) {
    if (!items || items.length === 0) {
      inventoryGrid.innerHTML = '<p>No inventory items.</p>';
      return;
    }

    inventoryGrid.innerHTML = items
      .map(
        (item) => `
      <div class="inventory-item">
        <div class="inventory-item__name">${item.name || 'N/A'}</div>
        ${item.brand ? `<div class="inventory-item__brand">${item.brand}</div>` : ''}
        ${item.category ? `<div class="inventory-item__category">${item.category}</div>` : ''}
        ${item.price ? `<div class="inventory-item__price">$${item.price}</div>` : ''}
        <div class="inventory-item__quantity">Qty: ${item.quantity || 0}</div>
        ${item.status ? `<div class="inventory-item__status inventory-item__status--${item.status}">${item.status.replace('_', ' ')}</div>` : ''}
      </div>
    `,
      )
      .join('');
  }

  initSplash({
    storageKey: 'tennis-stringing-splash',
    duration: 2000,
    mode: 'crossfade',
    animationMode: 'bike',
    animationPaths: [
      'assets/images/splash-loading/bike-animation-side-large.gif',
      'assets/images/splash-loading/bike-antimation-front-large.gif',
    ],
  });

  // Random Grass Background Tiles (per session)
  const grassBackground = document.querySelector('.grass-background');
  if (grassBackground) {
    const sessionKey = 'tennis-stringing-grass-tiles';
    const tileSize = 200; // Match CSS minmax value

    let tileConfig = sessionStorage.getItem(sessionKey);

    if (!tileConfig) {
      // Calculate how many tiles needed to cover viewport
      const cols = Math.ceil(window.innerWidth / tileSize) + 1;
      const rows = Math.ceil(window.innerHeight / tileSize) + 1;
      const totalTiles = cols * rows;

      // Generate random pattern for each tile
      tileConfig = [];
      for (let i = 0; i < totalTiles; i++) {
        const pattern = Math.floor(Math.random() * 3) + 1;
        tileConfig.push(pattern);
      }

      sessionStorage.setItem(sessionKey, JSON.stringify(tileConfig));
    } else {
      tileConfig = JSON.parse(tileConfig);
    }

    // Create tile elements with random patterns
    tileConfig.forEach((pattern) => {
      const tile = document.createElement('div');
      tile.className = `grass-tile grass-tile--${pattern}`;
      grassBackground.appendChild(tile);
    });
  }

  // Rotating String Display
  const stringNameElement = document.querySelector('.string-name');
  if (stringNameElement) {
    const strings = [
      'ReString Zero 1.23mm',
      'Tourna Big Hitter Silver 17g',
      'Golden Set Snake Bit 17g',
    ];
    let currentIndex = 0;
    const rotationInterval = 7000; // 7 seconds

    const rotateString = () => {
      // Fade out
      stringNameElement.classList.add('string-name--fading-out');

      setTimeout(() => {
        // Change text while hidden
        currentIndex = (currentIndex + 1) % strings.length;
        stringNameElement.textContent = strings[currentIndex];

        // Fade in by removing the fade-out class
        stringNameElement.classList.remove('string-name--fading-out');
      }, 250); // Match transition duration
    };

    // Set initial string
    stringNameElement.textContent = strings[0];

    // Start rotation interval
    setInterval(rotateString, rotationInterval);
  }

  // Service GIF Animation Control
  const serviceGif = document.querySelector('.service-gif');
  if (serviceGif) {
    const originalSrc = serviceGif.src;
    let isPlaying = false;
    let hasPlayedOnce = false;
    let animationTimeout;

    // Function to play the gif
    const playGif = () => {
      if (isPlaying) return;
      isPlaying = true;
      hasPlayedOnce = true;

      // Force reload to restart animation
      serviceGif.src = originalSrc + '?t=' + Date.now();
      serviceGif.classList.remove('service-gif--paused');
      serviceGif.classList.add('service-gif--playing');

      // Reset before animation finishes (assuming ~2 second gif)
      animationTimeout = setTimeout(() => {
        resetGif();
      }, 1500);
    };

    // Function to reset the gif
    const resetGif = () => {
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
      isPlaying = false;
      serviceGif.classList.remove('service-gif--playing');
      serviceGif.classList.add('service-gif--paused');
    };

    // Initially set as paused
    serviceGif.classList.add('service-gif--paused');

    // Hover events
    serviceGif.addEventListener('mouseenter', playGif);
    serviceGif.addEventListener('mouseleave', resetGif);

    // Click/tap events
    serviceGif.addEventListener('click', (e) => {
      e.preventDefault();
      if (isPlaying) {
        resetGif();
      } else {
        playGif();
      }
    });

    // Touch events for mobile
    serviceGif.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!isPlaying) {
        playGif();
      }
    });

    serviceGif.addEventListener('touchend', resetGif);

    // Intersection Observer for scroll-to-trigger
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPlayedOnce) {
            playGif();
          }
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(serviceGif);

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      observer.disconnect();
      serviceGif.classList.remove('service-gif--paused');
      serviceGif.classList.add('service-gif--playing');
    }
  }
});
