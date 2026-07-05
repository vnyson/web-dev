/**
 * Material penetration loss database for RF propagation modeling.
 * Based on ITU-R P.2346 and NIST construction material attenuation data.
 * Values are interpolated for 462 MHz GMRS frequencies.
 */

// Material penetration loss in dB at 462 MHz
const MATERIAL_LOSS_DB = {
  brick: {
    lossDb: 8.0,
    description: 'Standard brick construction',
    frequencyScaling: 1.0,
  },
  concrete: {
    lossDb: 12.0,
    description: 'Reinforced concrete',
    frequencyScaling: 1.1,
  },
  wood: {
    lossDb: 3.0,
    description: 'Wood frame with drywall',
    frequencyScaling: 0.9,
  },
  metal: {
    lossDb: 25.0,
    description: 'Metal siding or structure',
    frequencyScaling: 1.2,
  },
  glass: {
    lossDb: 3.0,
    description: 'Standard window glass',
    frequencyScaling: 0.8,
  },
  stone: {
    lossDb: 10.0,
    description: 'Stone masonry',
    frequencyScaling: 1.0,
  },
};

/**
 * Get penetration loss for a material at a given frequency.
 * @param {string} material - Material type (e.g., 'brick', 'concrete')
 * @param {number} frequencyMhz - Frequency in MHz (default 462 for GMRS)
 * @returns {number} Penetration loss in dB
 */
export function getPenetrationLoss(material, frequencyMhz = 462.0) {
  if (!MATERIAL_LOSS_DB[material]) {
    // Default to brick for unknown materials (Richmond residential)
    material = 'brick';
  }

  const materialData = MATERIAL_LOSS_DB[material];
  const baseLoss = materialData.lossDb;
  const scaling = materialData.frequencyScaling;

  // Apply frequency scaling (simple model: loss increases with frequency)
  const freqRatio = frequencyMhz / 462.0;
  const scaledLoss = baseLoss * Math.pow(freqRatio, scaling);

  return scaledLoss;
}

/**
 * Get information about a material.
 * @param {string} material - Material type
 * @returns {object} Material information
 */
export function getMaterialInfo(material) {
  if (!MATERIAL_LOSS_DB[material]) {
    material = 'brick';
  }

  return MATERIAL_LOSS_DB[material];
}

/**
 * Get list of all available materials.
 * @returns {string[]} Array of material names
 */
export function getAllMaterials() {
  return Object.keys(MATERIAL_LOSS_DB);
}

// Urban clutter factor (empirical adjustment for dense urban environments)
const URBAN_CLUTTER_LOSS_DB = 20.0; // dB

/**
 * Get urban clutter loss factor.
 * @returns {number} Urban clutter loss in dB
 */
export function getUrbanClutterLoss() {
  return URBAN_CLUTTER_LOSS_DB;
}
