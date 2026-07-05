/**
 * RF propagation calculations for GMRS frequencies.
 * Implements Free Space Path Loss, building penetration, diffraction, and terrain effects.
 */

import * as turf from '@turf/turf';
import { getPenetrationLoss, getUrbanClutterLoss } from './material-loss.js';

/**
 * Calculate Free Space Path Loss (FSPL).
 * Formula: FSPL(dB) = 20*log10(d) + 20*log10(f) + 32.44
 * Where d = distance in km, f = frequency in MHz
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} frequencyMhz - Frequency in MHz (default 462 for GMRS)
 * @returns {number} Path loss in dB
 */
export function calculateFspl(distanceKm, frequencyMhz = 462.0) {
  if (distanceKm <= 0) return 0.0;

  const fspl = 20 * Math.log10(distanceKm) + 20 * Math.log10(frequencyMhz) + 32.44;
  return fspl;
}

/**
 * Calculate great-circle distance between two points.
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lon1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lon2 - Longitude of point 2 (degrees)
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const point1 = turf.point([lon1, lat1]);
  const point2 = turf.point([lon2, lat2]);
  const distance = turf.distance(point1, point2, { units: 'kilometers' });
  return distance;
}

/**
 * Calculate bearing from point 1 to point 2.
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lon1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lon2 - Longitude of point 2 (degrees)
 * @returns {number} Bearing in degrees (0 = North, 90 = East)
 */
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const point1 = turf.point([lon1, lat1]);
  const point2 = turf.point([lon2, lat2]);
  const bearing = turf.bearing(point1, point2);
  return (bearing + 360) % 360;
}

/**
 * Get the bounding box [minX, minY, maxX, maxY] of a building feature.
 * Caches the result on the feature object for repeated queries.
 * @param {object} building - GeoJSON feature
 * @returns {number[]} [minX, minY, maxX, maxY]
 */
function getBuildingBbox(building) {
  if (building._bbox) return building._bbox;
  const coords = building.geometry?.coordinates?.[0];
  if (!coords || coords.length === 0) {
    building._bbox = [0, 0, 0, 0];
    return building._bbox;
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of coords) {
    if (c[0] < minX) minX = c[0];
    if (c[1] < minY) minY = c[1];
    if (c[0] > maxX) maxX = c[0];
    if (c[1] > maxY) maxY = c[1];
  }
  building._bbox = [minX, minY, maxX, maxY];
  return building._bbox;
}

/**
 * Check if two bounding boxes overlap.
 * @param {number[]} a - [minX, minY, maxX, maxY]
 * @param {number[]} b - [minX, minY, maxX, maxY]
 * @returns {boolean}
 */
function bboxOverlaps(a, b) {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

/**
 * Cast a ray from transmitter to receiver and count building intersections.
 * Uses bounding box pre-filtering for performance.
 * @param {number} txLat - Transmitter latitude
 * @param {number} txLon - Transmitter longitude
 * @param {number} rxLat - Receiver latitude
 * @param {number} rxLon - Receiver longitude
 * @param {Array} buildings - Array of building GeoJSON features
 * @returns {Array} Buildings intersected by the ray
 */
export function castRayThroughBuildings(txLat, txLon, rxLat, rxLon, buildings) {
  const line = turf.lineString([
    [txLon, txLat],
    [rxLon, rxLat],
  ]);

  // Ray bounding box for fast rejection
  const rayBbox = [
    Math.min(txLon, rxLon),
    Math.min(txLat, rxLat),
    Math.max(txLon, rxLon),
    Math.max(txLat, rxLat),
  ];

  const intersected = [];

  for (const building of buildings) {
    // Fast reject: skip buildings whose bbox doesn't overlap the ray bbox
    const bBbox = getBuildingBbox(building);
    if (!bboxOverlaps(rayBbox, bBbox)) continue;

    if (turf.lineIntersect(line, building).features.length > 0) {
      intersected.push(building);
    }
  }

  return intersected;
}

/**
 * Calculate total building penetration loss along the ray path.
 * @param {number} txLat - Transmitter latitude
 * @param {number} txLon - Transmitter longitude
 * @param {number} rxLat - Receiver latitude
 * @param {number} rxLon - Receiver longitude
 * @param {Array} buildings - Array of building GeoJSON features
 * @param {number} frequencyMhz - Frequency in MHz
 * @param {boolean} indoor - Whether receiver is indoors
 * @returns {number} Total penetration loss in dB
 */
export function calculateBuildingPenetrationLoss(
  txLat,
  txLon,
  rxLat,
  rxLon,
  buildings,
  frequencyMhz = 462.0,
  indoor = false
) {
  // Cast ray through buildings
  const intersected = castRayThroughBuildings(txLat, txLon, rxLat, rxLon, buildings);

  let totalLoss = 0.0;

  // Sum penetration losses for each building
  for (const building of intersected) {
    const material = building.properties?.material || 'brick';
    const loss = getPenetrationLoss(material, frequencyMhz);
    totalLoss += loss;
  }

  // If receiver is indoors, add one extra penetration for the building they're in
  if (indoor && buildings.length > 0) {
    const rxPoint = turf.point([rxLon, rxLat]);
    for (const building of buildings) {
      if (turf.booleanPointInPolygon(rxPoint, building)) {
        const material = building.properties?.material || 'brick';
        const loss = getPenetrationLoss(material, frequencyMhz);
        totalLoss += loss;
        break;
      }
    }
  }

  return totalLoss;
}

/**
 * Calculate single-edge diffraction loss using ITU-R P.526.
 * Simplified knife-edge diffraction model.
 * @param {number} txHeight - Transmitter height above ground (meters)
 * @param {number} rxHeight - Receiver height above ground (meters)
 * @param {number} distanceKm - Distance between TX and RX (km)
 * @param {number} frequencyMhz - Frequency in MHz
 * @returns {number} Diffraction loss in dB
 */
export function calculateDiffractionLoss(
  txHeight,
  rxHeight,
  distanceKm,
  frequencyMhz = 462.0
) {
  // Calculate Fresnel zone parameter
  const wavelength = 300.0 / frequencyMhz; // wavelength in meters
  const distanceM = distanceKm * 1000.0;

  // Effective height (simplified - assumes single obstacle at midpoint)
  const hEff = (txHeight + rxHeight) / 2.0;

  // Fresnel-Kirchhoff diffraction parameter
  let v;
  if (hEff > 0) {
    v = hEff * Math.sqrt(2 / (wavelength * distanceM));
  } else {
    v = 0;
  }

  // Diffraction loss (approximate formula)
  let loss;
  if (v < -0.78) {
    loss = 0.0;
  } else if (v < 0) {
    loss = 6.0 + 20.0 * Math.log10(0.5 + 0.62 * v);
  } else {
    loss = 6.0 + 20.0 * Math.log10(v + Math.sqrt(v * v + 1));
  }

  return Math.max(0.0, loss);
}

/**
 * Calculate terrain-based path loss using terrain profile.
 * Simplified implementation - assumes flat terrain for now.
 * @param {number} txLat - Transmitter latitude
 * @param {number} txLon - Transmitter longitude
 * @param {number} txHeight - Transmitter height above ground (meters)
 * @param {number} rxLat - Receiver latitude
 * @param {number} rxLon - Receiver longitude
 * @param {number} rxHeight - Receiver height above ground (meters)
 * @param {object} terrainData - Terrain elevation data (optional)
 * @param {number} distanceKm - Distance between TX and RX (km)
 * @returns {number} Terrain loss in dB
 */
export function calculateTerrainLoss(
  txLat,
  txLon,
  txHeight,
  rxLat,
  rxLon,
  rxHeight,
  terrainData,
  distanceKm
) {
  // Simplified: assume flat terrain for now
  // Full implementation would use terrain data to extract profile along path
  return 0.0;
}

/**
 * Calculate total path loss from transmitter to receiver.
 * @param {object} params - Calculation parameters
 * @param {number} params.txLat - Transmitter latitude
 * @param {number} params.txLon - Transmitter longitude
 * @param {number} params.txHeight - Transmitter height above ground (meters)
 * @param {number} params.txPowerDbm - Transmitter power in dBm
 * @param {number} params.rxLat - Receiver latitude
 * @param {number} params.rxLon - Receiver longitude
 * @param {number} params.rxHeight - Receiver height above ground (meters)
 * @param {boolean} params.indoor - Whether receiver is indoors
 * @param {Array} params.buildings - Array of building GeoJSON features
 * @param {object} params.terrainData - Terrain elevation data (optional)
 * @param {number} params.frequencyMhz - Frequency in MHz
 * @param {number} [params.clutterLossDb] - Optional override for urban clutter loss (dB). If undefined, uses the default from material-loss.
 * @returns {object} Object with totalPathLossDb, rssiDbm, and distanceKm
 */
export function calculateTotalPathLoss(params) {
  const {
    txLat,
    txLon,
    txHeight,
    txPowerDbm,
    rxLat,
    rxLon,
    rxHeight,
    indoor,
    buildings,
    terrainData,
    frequencyMhz = 462.0,
    clutterLossDb,
  } = params;

  // Calculate distance
  const distanceKm = calculateDistance(txLat, txLon, rxLat, rxLon);

  // Free space path loss
  const fspl = calculateFspl(distanceKm, frequencyMhz);

  // Building penetration loss
  const buildingLoss = calculateBuildingPenetrationLoss(
    txLat,
    txLon,
    rxLat,
    rxLon,
    buildings || [],
    frequencyMhz,
    indoor
  );

  // Diffraction loss
  const diffractionLoss = calculateDiffractionLoss(
    txHeight,
    rxHeight,
    distanceKm,
    frequencyMhz
  );

  // Terrain loss
  const terrainLoss = terrainData
    ? calculateTerrainLoss(
        txLat,
        txLon,
        txHeight,
        rxLat,
        rxLon,
        rxHeight,
        terrainData,
        distanceKm
      )
    : 0.0;

  // Urban clutter loss - use override if provided, otherwise default
  const clutterLoss = clutterLossDb !== undefined ? clutterLossDb : getUrbanClutterLoss();

  // Total path loss
  const totalLoss = fspl + buildingLoss + diffractionLoss + terrainLoss + clutterLoss;

  // Calculate RSSI
  const rssi = txPowerDbm - totalLoss;

  return { totalPathLossDb: totalLoss, rssiDbm: rssi, distanceKm };
}

/**
 * Convert watts to dBm.
 * @param {number} watts - Power in watts
 * @returns {number} Power in dBm
 */
export function wattsToDbm(watts) {
  if (watts <= 0) return -100.0; // Minimum reasonable value
  return 10 * Math.log10(watts * 1000);
}

/**
 * Convert dBm to watts.
 * @param {number} dbm - Power in dBm
 * @returns {number} Power in watts
 */
export function dbmToWatts(dbm) {
  return Math.pow(10, (dbm - 30) / 10);
}
