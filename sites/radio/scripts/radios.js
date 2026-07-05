/**
 * Radio hardware database for GMRS equipment.
 * Contains specifications for common handheld and mobile radios.
 */

export const RADIOS = {
  tidradio_h3: {
    name: 'Tidradio H3',
    type: 'handheld',
    powerWatts: 5.0,
    powerDbm: 37.0, // 10*log10(5*1000)
    antennaGainDbi: 2.0, // Typical stock antenna
    sensitivityDbm: -120.0, // Typical for GMRS handhelds
    frequencyRange: '462-467 MHz',
    description: '5W GMRS handheld with dual-band capability',
  },
  baofeng_uv5r: {
    name: 'Baofeng UV-5R',
    type: 'handheld',
    powerWatts: 5.0,
    powerDbm: 37.0,
    antennaGainDbi: 0.0, // Stock rubber duck
    sensitivityDbm: -118.0,
    frequencyRange: '136-174 MHz, 400-520 MHz',
    description: 'Popular dual-band handheld',
  },
  midland_mxt115: {
    name: 'Midland MXT115',
    type: 'mobile',
    powerWatts: 15.0,
    powerDbm: 41.8, // 10*log10(15*1000)
    antennaGainDbi: 3.0, // Typical mobile antenna
    sensitivityDbm: -122.0,
    frequencyRange: '462-467 MHz',
    description: '15W GMRS mobile radio',
  },
  midland_mxt575: {
    name: 'Midland MXT575',
    type: 'mobile',
    powerWatts: 50.0,
    powerDbm: 47.0, // 10*log10(50*1000)
    antennaGainDbi: 3.0,
    sensitivityDbm: -122.0,
    frequencyRange: '462-467 MHz',
    description: '50W GMRS mobile radio (max legal power)',
  },
  wouxun_kg935g: {
    name: 'Wouxun KG-935G',
    type: 'handheld',
    powerWatts: 5.0,
    powerDbm: 37.0,
    antennaGainDbi: 2.0,
    sensitivityDbm: -120.0,
    frequencyRange: '462-467 MHz',
    description: 'GMRS-specific handheld with NOAA weather',
  },
  custom: {
    name: 'Custom Radio',
    type: 'custom',
    powerWatts: 5.0,
    powerDbm: 37.0,
    antennaGainDbi: 0.0,
    sensitivityDbm: -120.0,
    frequencyRange: '462-467 MHz',
    description: 'User-configurable radio parameters',
  },
};

/**
 * Get radio specifications by ID.
 * @param {string} radioId - Radio identifier (e.g., 'tidradio_h3')
 * @returns {object} Radio specifications
 */
export function getRadio(radioId) {
  if (!RADIOS[radioId]) {
    radioId = 'custom';
  }

  return { ...RADIOS[radioId] };
}

/**
 * Get list of all available radios.
 * @returns {string[]} Array of radio IDs
 */
export function getAllRadios() {
  return Object.keys(RADIOS);
}

/**
 * Get mapping of radio IDs to names.
 * @returns {object} Radio ID to name mapping
 */
export function getRadioNames() {
  const names = {};
  for (const [id, radio] of Object.entries(RADIOS)) {
    names[id] = radio.name;
  }
  return names;
}

/**
 * Calculate Effective Isotropic Radiated Power (EIRP).
 * @param {number} powerDbm - Transmitter power in dBm
 * @param {number} antennaGainDbi - Antenna gain in dBi
 * @returns {number} EIRP in dBm
 */
export function calculateEirp(powerDbm, antennaGainDbi) {
  return powerDbm + antennaGainDbi;
}

/**
 * Calculate received power at receiver.
 * @param {number} txPowerDbm - Transmitter power in dBm
 * @param {number} antennaGainDbi - Antenna gain in dBi
 * @param {number} pathLossDb - Total path loss in dB
 * @returns {number} Received power in dBm
 */
export function calculateReceivedPower(txPowerDbm, antennaGainDbi, pathLossDb) {
  const eirp = calculateEirp(txPowerDbm, antennaGainDbi);
  const rxPower = eirp - pathLossDb;
  return rxPower;
}

/**
 * Check if received signal is above sensitivity threshold.
 * @param {number} rxPowerDbm - Received power in dBm
 * @param {number} sensitivityDbm - Receiver sensitivity in dBm
 * @returns {boolean} True if signal is usable
 */
export function isSignalUsable(rxPowerDbm, sensitivityDbm) {
  return rxPowerDbm >= sensitivityDbm;
}

/**
 * Get signal quality rating based on received power.
 * @param {number} rxPowerDbm - Received power in dBm
 * @param {number} sensitivityDbm - Receiver sensitivity in dBm
 * @returns {object} Quality rating (1-5) and description
 */
export function getSignalQuality(rxPowerDbm, sensitivityDbm) {
  const margin = rxPowerDbm - sensitivityDbm;

  if (margin >= 20) {
    return { rating: 5, description: 'Excellent' };
  } else if (margin >= 10) {
    return { rating: 4, description: 'Good' };
  } else if (margin >= 3) {
    return { rating: 3, description: 'Usable' };
  } else if (margin >= 0) {
    return { rating: 2, description: 'Weak' };
  } else {
    return { rating: 1, description: 'Unusable' };
  }
}
