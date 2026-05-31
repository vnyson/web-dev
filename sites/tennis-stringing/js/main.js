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
      text = 'EST. 1-2 days';
    } else if (count === 2) {
      imageName = 'Pokemon Hospital-2.png';
      text = 'EST. 2-3 days';
    } else if (count === 3) {
      imageName = 'Pokemon Hospital-3.png';
      text = 'EST. 2-3 days';
    } else if (count === 4) {
      imageName = 'Pokemon Hospital-4.png';
      text = 'EST. 4-5 days';
    } else if (count === 5) {
      imageName = 'Pokemon Hospital-5.png';
      text = 'EST. 6-7 days';
    } else if (count === 6) {
      imageName = 'Pokemon Hospital-6.png';
      text = 'EST. 6-7 days';
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

  // Profile Overlay
  const profileButtons = document.querySelectorAll('.profile-button, .profile-button-mobile');
  const profileOverlay = document.getElementById('profile-overlay');
  const profileCloseButton = document.querySelector('.profile-overlay__close');
  const inventoryOverlay = document.getElementById('inventory-overlay');

  function closeAllOverlays() {
    profileOverlay?.classList.add('hidden');
    inventoryOverlay?.classList.add('hidden');
  }

  function openProfileOverlay() {
    closeAllOverlays();
    profileOverlay?.classList.remove('hidden');
  }

  function openInventoryOverlay() {
    closeAllOverlays();
    inventoryOverlay?.classList.remove('hidden');
  }

  const profileLoading = document.getElementById('profile-loading');
  const profileErrorAlert = document.getElementById('profile-error-alert');
  const profileSuccessAlert = document.getElementById('profile-success-alert');

  const profileVerifyPanel = document.getElementById('profile-verify-panel');
  const profileVerifyForm = document.getElementById('profile-verify-form');
  const verifyNameInput = document.getElementById('verify-name');
  const verifyPhoneLast4Container = document.getElementById('verify-phone-last4-container');
  const verifyPhoneLast4Input = document.getElementById('verify-phone-last4');
  const verifyPhoneFullContainer = document.getElementById('verify-phone-full-container');
  const verifyPhoneFullInput = document.getElementById('verify-phone-full');
  const profileClearTokenBtn = document.getElementById('profile-clear-token-btn');

  const profileViewPanel = document.getElementById('profile-view-panel');
  const profileEditForm = document.getElementById('profile-edit-form');

  // Fields
  const profileNameInput = document.getElementById('profile-name');
  const profileEmailInput = document.getElementById('profile-email');
  const profilePhoneInput = document.getElementById('profile-phone');
  const profileStringPrefInput = document.getElementById('profile-string-pref');
  const profileTensionInput = document.getElementById('profile-tension');
  const profileTensionCrossInput = document.getElementById('profile-tension-cross');
  const profileGripInput = document.getElementById('profile-grip');
  const profileNotesInput = document.getElementById('profile-notes');

  // Lists & inventory
  const profileJobsList = document.getElementById('profile-jobs-list');
  const profileRacketSlots = document.getElementById('profile-racket-slots');
  const profileRacketDetail = document.getElementById('profile-racket-detail');
  const profileRacketInventory = document.getElementById('profile-racket-inventory');
  const profileJobStatus = document.getElementById('profile-job-status');
  const profileImage = document.getElementById('profile-image');

  // Tabs
  const profileTabButtons = document.querySelectorAll('.profile-tab-btn');
  const profileTabContents = document.querySelectorAll('.profile-tab-content');

  let currentPlayerData = null;
  let currentPlayerRackets = [];
  let isCollisionActive = false;
  let alertDismissTimeout = null;

  const ALERT_DISMISS_MS = 4000;
  const DEFAULT_RACKET_IMAGE = 'assets/images/rackets/Wilson Pro Staff.png';
  const GENERIC_PROFILE_IMAGE = 'assets/images/profile/generic.png';
  const QUEUED_JOB_STATUSES = new Set(['queued', 'in_queue']);
  const READY_JOB_STATUS = 'ready_for_pickup';
  const RACKET_INVENTORY_SLOTS = [
    { left: '16%', bottom: '6%', width: '16%' },
    { left: '32%', bottom: '6%', width: '16%' },
    { left: '48%', bottom: '6%', width: '16%' },
    { left: '64%', bottom: '6%', width: '16%' },
    { left: '80%', bottom: '6%', width: '16%' },
  ];

  const RACKET_IMAGE_MAP = {
    'babolat pure aero': 'assets/images/rackets/Babolat Pure Aero.png',
    'babolat pure drive': 'assets/images/rackets/Babolat Pure Drive.png',
    'babolat pure strike': 'assets/images/rackets/Babolat Pure Strike.png',
    'head gravity': 'assets/images/rackets/Head Gravity.png',
    'head radical': 'assets/images/rackets/Head Radical.png',
    'head speed': 'assets/images/rackets/Head Speed.png',
    'wilson blade': 'assets/images/rackets/Wilson Blade.png',
    'wilson pro staff': 'assets/images/rackets/Wilson Pro Staff.png',
    'wilson redline': 'assets/images/rackets/Wilson Redline.png',
    'yonex ezone': 'assets/images/rackets/Yonex Ezone.png',
    'yonex vcore': 'assets/images/rackets/Yonex VCORE.png',
  };

  function getRacketImage(brand, model) {
    const fullKey = `${brand || ''} ${model || ''}`.trim().toLowerCase();
    if (!fullKey) return DEFAULT_RACKET_IMAGE;

    if (RACKET_IMAGE_MAP[fullKey]) return RACKET_IMAGE_MAP[fullKey];

    let bestMatch = null;
    let bestLength = 0;
    for (const [key, path] of Object.entries(RACKET_IMAGE_MAP)) {
      if (fullKey.includes(key) || key.includes(fullKey)) {
        if (key.length > bestLength) {
          bestLength = key.length;
          bestMatch = path;
        }
      }
    }

    return bestMatch || DEFAULT_RACKET_IMAGE;
  }

  function getRacketImageForText(racquetText, playerRackets = []) {
    const text = (racquetText || '').trim().toLowerCase();

    for (const racket of playerRackets) {
      const fullName = `${racket.brand || ''} ${racket.model || ''}`.trim().toLowerCase();
      if (!fullName) continue;

      if (
        (text && (text.includes(fullName) || fullName.includes(text))) ||
        (racket.model && text.includes(racket.model.toLowerCase()))
      ) {
        return getRacketImage(racket.brand, racket.model);
      }
    }

    if (text) {
      let bestMatch = null;
      let bestLength = 0;
      for (const [key, path] of Object.entries(RACKET_IMAGE_MAP)) {
        if (text.includes(key) || key.includes(text)) {
          if (key.length > bestLength) {
            bestLength = key.length;
            bestMatch = path;
          }
        }
      }
      if (bestMatch) return bestMatch;
    }

    if (playerRackets.length > 0) {
      return getRacketImage(playerRackets[0].brand, playerRackets[0].model);
    }

    return DEFAULT_RACKET_IMAGE;
  }

  function formatJobTypeLabel(rawType) {
    const type = (rawType || '').toLowerCase();
    if (type === 'stringing' || type === 'string') return 'string';
    if (type === 'customization') return 'customization';
    if (type === 'matching') return 'matching';
    return type || 'string';
  }

  function buildMergedJobEntries(jobs, history) {
    const stringingEntries = (jobs || []).map((job) => ({
      source: 'stringing',
      created_at: job.created_at,
      job_type: formatJobTypeLabel(job.job_type),
      data: job,
    }));

    const historyEntries = (history || []).map((record) => ({
      source: 'history',
      created_at: record.created_at,
      job_type: formatJobTypeLabel(record.job_type),
      data: record,
    }));

    return [...stringingEntries, ...historyEntries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  function renderJobTypeLabel(jobType) {
    const label = formatJobTypeLabel(jobType);
    return `<span class="job-type-label job-type-label--${label}">${label}</span>`;
  }

  function renderRacketInventory(rackets) {
    currentPlayerRackets = rackets || [];

    if (profileRacketDetail) {
      profileRacketDetail.classList.add('hidden');
      profileRacketDetail.innerHTML = '';
    }

    if (!profileRacketSlots) return;

    if (currentPlayerRackets.length === 0) {
      profileRacketSlots.innerHTML = '';
      return;
    }

    profileRacketSlots.innerHTML = currentPlayerRackets
      .slice(0, RACKET_INVENTORY_SLOTS.length)
      .map((racket, index) => {
        const slot = RACKET_INVENTORY_SLOTS[index];
        const src = getRacketImage(racket.brand, racket.model);
        const label = `${racket.brand || ''} ${racket.model || ''}`.trim();

        return `
          <button
            type="button"
            class="profile-racket-inventory__slot"
            data-racket-index="${index}"
            style="left:${slot.left};bottom:${slot.bottom};width:${slot.width};height:80%;"
            aria-label="${label || 'Racquet'}"
          >
            <img src="${src}" alt="" />
          </button>
        `;
      })
      .join('');
  }

  function showRacketDetail(racket, selectedButton) {
    if (!profileRacketDetail || !racket) return;

    profileRacketSlots?.querySelectorAll('.profile-racket-inventory__slot').forEach((slot) => {
      slot.classList.toggle('is-selected', slot === selectedButton);
    });

    profileRacketDetail.innerHTML = `
      <div><strong>${racket.brand || 'Unknown'} ${racket.model || ''}</strong></div>
      ${racket.year ? `<div><strong>Year:</strong> ${racket.year}</div>` : ''}
      ${racket.notes ? `<div><strong>Notes:</strong> ${racket.notes}</div>` : ''}
    `;
    profileRacketDetail.classList.remove('hidden');
  }

  function renderRacketImageMarkup(racquetText, playerRackets, altText) {
    const src = getRacketImageForText(racquetText, playerRackets);
    const alt = altText || racquetText || 'Racquet';
    return `<img src="${src}" alt="${alt}" class="racket-item__image" />`;
  }

  function renderStringingJobEntry(job, playerRackets) {
    const statusLabel =
      isJobQueued(job.status) && job.queue_position
        ? `${job.status} (#${job.queue_position})`
        : job.status || 'N/A';

    return `
      <div class="job-item flex items-center gap-md panel-pixel pixel-borders pixel-borders--1" style="padding: var(--space-xs); margin-bottom: var(--space-xs); background: var(--color-gray-100); text-align: left;">
        ${renderRacketImageMarkup(job.racquet, playerRackets, job.racquet)}
        <div class="flex flex-col gap-xs">
          ${renderJobTypeLabel(job.job_type || 'stringing')}
          <div><strong>Racquet:</strong> ${job.racquet || 'N/A'}</div>
          <div><strong>String:</strong> ${job.string_mains || job.string || 'N/A'} ${job.string_crosses ? `/ ${job.string_crosses}` : ''}</div>
          <div><strong>Tension:</strong> ${job.tension_mains || job.tension || 'N/A'}${job.tension_unit || ''} ${job.tension_crosses ? `/ ${job.tension_crosses}${job.tension_unit_crosses || ''}` : ''}</div>
          <div><strong>Status:</strong> ${statusLabel}</div>
          <div><strong>Date:</strong> ${new Date(job.created_at).toLocaleDateString()}</div>
        </div>
      </div>
    `;
  }

  function renderHistoryJobEntry(record, playerRackets) {
    return `
      <div class="job-item flex items-center gap-md panel-pixel pixel-borders pixel-borders--1" style="padding: var(--space-xs); margin-bottom: var(--space-xs); background: var(--color-gray-100); text-align: left;">
        ${renderRacketImageMarkup(record.racquet, playerRackets, record.racquet)}
        <div class="flex flex-col gap-xs">
          ${renderJobTypeLabel(record.job_type || 'customization')}
          <div><strong>Racquet:</strong> ${record.racquet || 'N/A'}</div>
          <div><strong>Current Wt / Bal:</strong> ${record.current_weight ? `${record.current_weight}g` : 'N/A'} / ${record.current_balance ? `${record.current_balance}cm` : 'N/A'}</div>
          <div><strong>Target Wt / Bal:</strong> ${record.target_weight ? `${record.target_weight}g` : 'N/A'} / ${record.target_balance ? `${record.target_balance}cm` : 'N/A'}</div>
          <div><strong>Mass Added:</strong> ${record.mass_added ? `${record.mass_added}g` : 'N/A'} ${record.mass_location ? `@ ${record.mass_location}` : ''}</div>
          <div><strong>SW Delta / Result:</strong> ${record.sw_delta ? `+${record.sw_delta}` : 'N/A'} / ${record.sw_result ? `${record.sw_result}` : 'N/A'}</div>
          ${record.notes ? `<div><strong>Notes:</strong> ${record.notes}</div>` : ''}
          <div><strong>Date:</strong> ${new Date(record.created_at).toLocaleDateString()}</div>
        </div>
      </div>
    `;
  }

  function isJobQueued(status) {
    return QUEUED_JOB_STATUSES.has((status || '').toLowerCase());
  }

  function renderProfileJobStatus(jobs) {
    if (!profileJobStatus) return;

    const readyJobs = (jobs || []).filter((job) => job.status === READY_JOB_STATUS);
    if (readyJobs.length > 0) {
      const countLabel = readyJobs.length > 1 ? ` (${readyJobs.length} racquets)` : '';
      profileJobStatus.textContent = `Ready to pick up${countLabel}`;
      profileJobStatus.className = 'profile-job-status profile-job-status--ready';
      profileJobStatus.classList.remove('hidden');
      return;
    }

    const queuedJobs = (jobs || []).filter((job) => isJobQueued(job.status));
    if (queuedJobs.length > 0) {
      const primaryJob = queuedJobs.reduce((best, job) => {
        const bestPosition = best.queue_position ?? Number.MAX_SAFE_INTEGER;
        const jobPosition = job.queue_position ?? Number.MAX_SAFE_INTEGER;
        return jobPosition < bestPosition ? job : best;
      });
      const position = primaryJob.queue_position;
      const positionLabel = position ? `#${position} in queue` : 'In queue';
      const countLabel = queuedJobs.length > 1 ? ` · ${queuedJobs.length} jobs` : '';
      profileJobStatus.textContent = `${positionLabel}${countLabel}`;
      profileJobStatus.className = 'profile-job-status profile-job-status--queue';
      profileJobStatus.classList.remove('hidden');
      return;
    }

    profileJobStatus.textContent = '';
    profileJobStatus.className = 'profile-job-status hidden';
  }

  function showPanel(panelId) {
    [profileLoading, profileVerifyPanel, profileViewPanel].forEach((panel) => {
      if (panel) panel.classList.add('hidden');
    });
    const target = document.getElementById(panelId);
    if (target) target.classList.remove('hidden');
  }

  function showAlert(type, message, autoDismissMs = ALERT_DISMISS_MS) {
    if (alertDismissTimeout) {
      clearTimeout(alertDismissTimeout);
      alertDismissTimeout = null;
    }

    if (profileErrorAlert) profileErrorAlert.classList.add('hidden');
    if (profileSuccessAlert) profileSuccessAlert.classList.add('hidden');

    const alert = type === 'error' ? profileErrorAlert : profileSuccessAlert;
    if (alert) {
      alert.textContent = message;
      alert.classList.remove('hidden');
    }

    if (autoDismissMs > 0) {
      alertDismissTimeout = setTimeout(clearAlerts, autoDismissMs);
    }
  }

  function clearAlerts() {
    if (alertDismissTimeout) {
      clearTimeout(alertDismissTimeout);
      alertDismissTimeout = null;
    }
    if (profileErrorAlert) profileErrorAlert.classList.add('hidden');
    if (profileSuccessAlert) profileSuccessAlert.classList.add('hidden');
  }

  function setClearTokenButtonVisible(visible) {
    if (profileClearTokenBtn) {
      profileClearTokenBtn.classList.toggle('hidden', !visible);
    }
  }

  function resetVerificationFormState() {
    isCollisionActive = false;
    if (verifyPhoneLast4Container) verifyPhoneLast4Container.classList.remove('hidden');
    if (verifyPhoneFullContainer) verifyPhoneFullContainer.classList.add('hidden');
    if (verifyPhoneLast4Input) {
      verifyPhoneLast4Input.setAttribute('required', 'true');
      verifyPhoneLast4Input.value = '';
    }
    if (verifyPhoneFullInput) {
      verifyPhoneFullInput.removeAttribute('required');
      verifyPhoneFullInput.value = '';
    }
    if (verifyNameInput) verifyNameInput.value = '';
    clearAlerts();
  }

  async function loadProfileWithToken(token) {
    showPanel('profile-loading');
    clearAlerts();
    try {
      const response = await fetch(
        `${API_URL}/api/player-by-token?token=${encodeURIComponent(token)}`,
      );
      if (!response.ok) {
        throw new Error('Invalid token or network error');
      }
      const data = await response.json();
      renderProfileData(data, token);
      showPanel('profile-view-panel');
    } catch (err) {
      console.error(err);
      localStorage.removeItem('player_token');
      showVerificationForm();
      showAlert('error', 'Session expired. Please verify your info again.');
    }
  }

  function showVerificationForm() {
    setClearTokenButtonVisible(false);
    currentPlayerRackets = [];
    renderRacketInventory([]);
    if (profileJobStatus) {
      profileJobStatus.textContent = '';
      profileJobStatus.className = 'profile-job-status hidden';
    }
    showPanel('profile-verify-panel');
    resetVerificationFormState();
  }

  function renderProfileData(data, token) {
    currentPlayerData = data.player;
    currentPlayerData.token = token;
    setClearTokenButtonVisible(true);
    if (profileLoading) profileLoading.classList.add('hidden');

    const playerRackets = data.rackets || [];

    if (profileImage) {
      profileImage.src = GENERIC_PROFILE_IMAGE;
      profileImage.alt = 'profile';
    }

    renderRacketInventory(playerRackets);
    renderProfileJobStatus(data.jobs);

    // Populate Info Tab
    if (profileNameInput) profileNameInput.value = data.player.name || '';
    if (profileEmailInput) profileEmailInput.value = data.player.email || '';
    if (profilePhoneInput) profilePhoneInput.value = data.player.phone || '';
    if (profileStringPrefInput) profileStringPrefInput.value = data.player.string_pref || '';
    if (profileTensionInput) profileTensionInput.value = data.player.tension || '';
    if (profileTensionCrossInput) profileTensionCrossInput.value = data.player.tension_cross || '';
    if (profileGripInput) profileGripInput.value = data.player.grip || '';
    if (profileNotesInput) profileNotesInput.value = data.player.notes || '';

    // Populate merged Jobs list (stringing + history)
    if (profileJobsList) {
      const mergedEntries = buildMergedJobEntries(data.jobs, data.history);

      if (mergedEntries.length === 0) {
        profileJobsList.innerHTML = '<p>No jobs recorded yet.</p>';
      } else {
        profileJobsList.innerHTML = mergedEntries
          .map((entry) =>
            entry.source === 'stringing'
              ? renderStringingJobEntry(entry.data, playerRackets)
              : renderHistoryJobEntry(entry.data, playerRackets),
          )
          .join('');
      }
    }
  }

  // Check URL params for token on load
  const urlToken = urlParams.get('token');
  if (urlToken) {
    localStorage.setItem('player_token', urlToken);
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('token');
    window.history.replaceState({}, '', newUrl.pathname);
    if (profileOverlay) {
      openProfileOverlay();
      loadProfileWithToken(urlToken);
    }
  }

  if (profileButtons.length > 0 && profileOverlay) {
    profileButtons.forEach((profileButton) => {
      profileButton.addEventListener('click', () => {
        openProfileOverlay();
        const token = localStorage.getItem('player_token');
        if (token) {
          loadProfileWithToken(token);
        } else {
          showVerificationForm();
        }
      });
    });
  }

  if (profileCloseButton) {
    profileCloseButton.addEventListener('click', () => {
      closeAllOverlays();
    });
  }

  if (profileOverlay) {
    profileOverlay.addEventListener('click', (e) => {
      if (e.target === profileOverlay) {
        closeAllOverlays();
      }
    });
  }

  if (profileClearTokenBtn) {
    profileClearTokenBtn.addEventListener('click', () => {
      localStorage.removeItem('player_token');
      currentPlayerData = null;
      showVerificationForm();
    });
  }

  if (profileRacketInventory) {
    profileRacketInventory.addEventListener('click', (event) => {
      const slot = event.target.closest('.profile-racket-inventory__slot');
      if (!slot) return;

      const index = Number.parseInt(slot.dataset.racketIndex, 10);
      const racket = currentPlayerRackets[index];
      if (!racket) return;

      showRacketDetail(racket, slot);
    });
  }

  if (profileVerifyForm) {
    profileVerifyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlerts();

      const name = verifyNameInput.value.trim();
      const phone_last4 = verifyPhoneLast4Input.value.trim();
      const phone = verifyPhoneFullInput.value.trim();

      const payload = { name };
      if (isCollisionActive) {
        payload.phone = phone;
      } else {
        payload.phone_last4 = phone_last4;
      }

      showPanel('profile-loading');

      try {
        const response = await fetch(`${API_URL}/api/player-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'Verification failed. Player not found.');
        }

        const data = await response.json();
        if (data.multiple) {
          isCollisionActive = true;
          showPanel('profile-verify-panel');
          if (verifyPhoneLast4Container) verifyPhoneLast4Container.classList.add('hidden');
          if (verifyPhoneFullContainer) verifyPhoneFullContainer.classList.remove('hidden');
          if (verifyPhoneLast4Input) verifyPhoneLast4Input.removeAttribute('required');
          if (verifyPhoneFullInput) verifyPhoneFullInput.setAttribute('required', 'true');
          showAlert('error', 'Multiple matches found. Please enter your full phone number.');
        } else if (data.token) {
          localStorage.setItem('player_token', data.token);
          renderProfileData(data, data.token);
          showPanel('profile-view-panel');
          showAlert('success', 'Verified successfully!');
        }
      } catch (err) {
        console.error(err);
        showPanel('profile-verify-panel');
        showAlert('error', err.message || 'Player not found. Please verify details.');
      }
    });
  }

  // Handle Tab Switching
  profileTabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      profileTabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.dataset.tab;
      profileTabContents.forEach((content) => {
        if (content.id === `profile-tab-${targetTab}`) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });

  // Handle Profile Form Submission
  if (profileEditForm) {
    profileEditForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentPlayerData || !currentPlayerData.token) return;

      const payload = {
        name: currentPlayerData.name,
        club: currentPlayerData.club || null,
        level: currentPlayerData.level || null,
        style: currentPlayerData.style || null,
        email: profileEmailInput.value.trim(),
        phone: profilePhoneInput.value.trim(),
        string_pref: profileStringPrefInput.value.trim(),
        tension: profileTensionInput.value.trim(),
        tension_cross: profileTensionCrossInput ? profileTensionCrossInput.value.trim() : null,
        grip: profileGripInput.value.trim(),
        restring_interval_weeks: currentPlayerData.restring_interval_weeks || null,
        inventory_preferences: currentPlayerData.inventory_preferences || null,
        notes: profileNotesInput.value.trim(),
      };

      showPanel('profile-loading');
      clearAlerts();

      try {
        const response = await fetch(
          `${API_URL}/api/players/${currentPlayerData.id}?token=${encodeURIComponent(currentPlayerData.token)}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }

        await loadProfileWithToken(currentPlayerData.token);
        showAlert('success', 'Profile updated successfully!');
      } catch (err) {
        console.error(err);
        showPanel('profile-view-panel');
        showAlert('error', 'Error updating profile. Please try again.');
      }
    });
  }

  // Inventory Overlay
  const inventoryButtons = document.querySelectorAll('.inventory-button, .inventory-button-mobile');
  const inventoryCloseButton = document.querySelector('.inventory-overlay__close');
  const inventoryGrid = document.getElementById('inventory-grid');

  if (inventoryButtons.length > 0 && inventoryOverlay) {
    inventoryButtons.forEach((inventoryButton) => {
      inventoryButton.addEventListener('click', () => {
        openInventoryOverlay();
        fetchInventory();
      });
    });
  }

  if (inventoryCloseButton) {
    inventoryCloseButton.addEventListener('click', () => {
      closeAllOverlays();
    });
  }

  if (inventoryOverlay) {
    inventoryOverlay.addEventListener('click', (e) => {
      if (e.target === inventoryOverlay) {
        closeAllOverlays();
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
    items.sort((a, b) => {
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
      '<thead><tr><th><span class="dollar-sign">$</span></th><th>Name</th><th>Mat.</th><th>Det.</th></tr></thead>';
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
            <td class="inventory-price">${item.price ? `<span class="dollar-sign">$</span>${item.price}` : '-'}</td>
            <td>${item.name || 'N/A'}</td>
            <td>${item.string_type || '-'}</td>
            <td>${characteristicsHtml}</td>
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
            <td class="inventory-price"><span class="dollar-sign">$</span>${item.price ? `${item.price}` : '-'}</td>
            <td>${item.name || 'N/A'}</td>
            <td>-</td>
            <td>-</td>
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
            <td class="inventory-price"><span class="dollar-sign">$</span>${item.price ? `${item.price}` : '-'}</td>
            <td>${item.name || 'N/A'}</td>
            <td>-</td>
            <td>-</td>
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

      serviceGif.src = originalSrc;
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
