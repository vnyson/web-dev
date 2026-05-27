import { initSplash, resetSplash } from '@vnyson/design-system/js/splash.js';

const API_URL =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8787'
    : 'https://tennis-admin-api.vnyson.workers.dev';

// Clear splash for hard refresh
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('clear-splash')) {
  resetSplash('tennis-stringing-splash');
  // Clean URL
  window.history.replaceState({}, '', window.location.pathname);
}

document.addEventListener('DOMContentLoaded', () => {
  // Queue Data Fetching
  const queueImages = document.querySelectorAll('.queue-image');
  const queueTexts = document.querySelectorAll('.queue-text');

  if (queueImages.length > 0 && queueTexts.length > 0) {
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
      // Default to 0 if API fails
      updateQueueDisplay(0);
    }
  }

  function updateQueueDisplay(count) {
    let imageName;
    let text;

    if (count === 0) {
      imageName = 'Pokemon Hospital-0.png';
      text = 'EST. 1-2 days';
    } else if (count === 1) {
      imageName = 'Pokemon Hospital-1.png';
      text = 'EST. 2-3 days';
    } else if (count === 2) {
      imageName = 'Pokemon Hospital-2.png';
      text = 'EST. 3-4 days';
    } else if (count === 3) {
      imageName = 'Pokemon Hospital-3.png';
      text = 'EST. 4-5 days';
    } else if (count === 4) {
      imageName = 'Pokemon Hospital-4.png';
      text = 'EST. 5-6 days';
    } else if (count === 5) {
      imageName = 'Pokemon Hospital-5.png';
      text = 'EST. 6-7 days';
    } else if (count === 6) {
      imageName = 'Pokemon Hospital-6.png';
      text = 'EST. 7-8 days';
    } else {
      imageName = 'Pokemon Hospital-FULL.png';
      text = 'EST. 1-2 weeks';
    }

    queueImages.forEach((queueImage) => {
      queueImage.src = `assets/images/queue/${imageName}`;
    });
    queueTexts.forEach((queueText) => {
      queueText.textContent = text;
    });
  }

  // Queue Image Hover Effect
  queueImages.forEach((queueImage) => {
    const gifSrc = queueImage.dataset.gifSrc;

    if (gifSrc) {
      queueImage.addEventListener('mouseenter', () => {
        queueImage.src = gifSrc;
      });

      queueImage.addEventListener('mouseleave', () => {
        // Re-fetch queue status to get the correct image
        fetchQueueStatus();
      });
    }
  });

  // Inventory Overlay
  const inventoryButtons = document.querySelectorAll('.inventory-button');
  const inventoryOverlay = document.getElementById('inventory-overlay');
  const inventoryCloseButton = document.querySelector('.inventory-overlay__close');
  const inventoryGrid = document.getElementById('inventory-grid');

  if (inventoryButtons.length > 0 && inventoryOverlay) {
    inventoryButtons.forEach((inventoryButton) => {
      inventoryButton.addEventListener('click', () => {
        inventoryOverlay.classList.remove('hidden');
        fetchInventory();
      });
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

    // Sort items: strings first, then rackets, then other equipment
    const sortedItems = items.sort((a, b) => {
      const categoryOrder = { string: 0, racket: 1 };
      const aCategoryOrder = categoryOrder[a.category?.toLowerCase()] ?? 2;
      const bCategoryOrder = categoryOrder[b.category?.toLowerCase()] ?? 2;
      if (aCategoryOrder !== bCategoryOrder) return aCategoryOrder - bCategoryOrder;
      return (a.name || '').localeCompare(b.name || '');
    });

    // Group by section: String, Rackets, Other Equipment
    const groupedItems = {
      string: items.filter((item) => item.category?.toLowerCase() === 'string'),
      racket: items.filter((item) => item.category?.toLowerCase() === 'racket'),
      other: items.filter(
        (item) =>
          item.category?.toLowerCase() !== 'string' && item.category?.toLowerCase() !== 'racket',
      ),
    };

    // Generate table HTML
    let tableHtml = '<table class="inventory-table">';
    tableHtml +=
      '<thead><tr><th>Name</th><th>Type</th><th>Characteristics</th><th>Price</th><th>Qty</th></tr></thead>';
    tableHtml += '<tbody>';

    // Render strings first
    if (groupedItems['string'].length > 0) {
      tableHtml += '<tr><td colspan="5" class="inventory-category-header">Strings</td></tr>';
      groupedItems['string'].forEach((item) => {
        const characteristics = item.string_characteristics
          ? JSON.parse(item.string_characteristics)
          : [];
        const characteristicsHtml =
          characteristics.length > 0
            ? characteristics.map((c) => `<span class="inventory-tag">${c}</span>`).join(' ')
            : '-';
        tableHtml += `
          <tr>
            <td>${item.name || 'N/A'}</td>
            <td>${item.string_type || '-'}</td>
            <td>${characteristicsHtml}</td>
            <td class="inventory-price">${item.price ? `$${item.price}` : '-'}</td>
            <td>${item.quantity || 0}</td>
          </tr>
        `;
      });
    }

    // Render rackets
    if (groupedItems['racket'].length > 0) {
      tableHtml += '<tr><td colspan="5" class="inventory-category-header">Rackets</td></tr>';
      groupedItems['racket'].forEach((item) => {
        tableHtml += `
          <tr>
            <td>${item.name || 'N/A'}</td>
            <td>-</td>
            <td>-</td>
            <td class="inventory-price">${item.price ? `$${item.price}` : '-'}</td>
            <td>${item.quantity || 0}</td>
          </tr>
        `;
      });
    }

    // Render other equipment
    if (groupedItems['other'].length > 0) {
      tableHtml +=
        '<tr><td colspan="5" class="inventory-category-header">Other Equipment</td></tr>';
      groupedItems['other'].forEach((item) => {
        tableHtml += `
          <tr>
            <td>${item.name || 'N/A'}</td>
            <td>-</td>
            <td>-</td>
            <td class="inventory-price">${item.price ? `$${item.price}` : '-'}</td>
            <td>${item.quantity || 0}</td>
          </tr>
        `;
      });
    }

    tableHtml += '</tbody></table>';
    inventoryGrid.innerHTML = tableHtml;
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
  const stringNameElements = document.querySelectorAll('.string-name');
  if (stringNameElements.length > 0) {
    const strings = [
      'ReString Zero 1.23mm',
      'Tourna Big Hitter Silver 17g',
      'Golden Set Snake Bite 17g',
    ];
    let currentIndex = 0;
    const rotationInterval = 7000; // 7 seconds

    const rotateString = () => {
      // Fade out all elements
      stringNameElements.forEach((element) => {
        element.classList.add('string-name--fading-out');
      });

      setTimeout(() => {
        // Change text while hidden
        currentIndex = (currentIndex + 1) % strings.length;
        stringNameElements.forEach((element) => {
          element.textContent = strings[currentIndex];
          // Fade in by removing the fade-out class
          element.classList.remove('string-name--fading-out');
        });
      }, 250); // Match transition duration
    };

    // Set initial string
    stringNameElements.forEach((element) => {
      element.textContent = strings[0];
    });

    // Start rotation interval
    setInterval(rotateString, rotationInterval);
  }

  // Service GIF Animation Control - Reusable for all service gifs
  const serviceGifs = document.querySelectorAll('.service-gif');
  serviceGifs.forEach((serviceGif) => {
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
  });
});
