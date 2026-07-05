/**
 * Generate RF coverage map using propagation modeling.
 * Reads configuration from coverage-config.json and outputs GeoJSON coverage data.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateTotalPathLoss } from './propagation.js';
import { getRadio } from './radios.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE = path.join(__dirname, '../coverage-config.json');

/**
 * Load configuration from JSON file.
 * @param {string} configFile - Path to config file
 * @returns {object} Configuration object
 */
function loadConfig(configFile) {
  const data = fs.readFileSync(configFile, 'utf8');
  return JSON.parse(data);
}

/**
 * Generate coverage grid by calculating RSSI at each point.
 * @param {object} config - Configuration object
 * @returns {Array} Array of GeoJSON features with RSSI values
 */
function generateCoverageGrid(config) {
  const tx = config.transmitter;
  const rx = config.receiver;
  const coverage = config.coverage;

  const txLat = tx.lat;
  const txLon = tx.lng;
  const txHeight = tx.height_m;
  const frequency = tx.frequency_mhz;

  // Get radio specifications
  const radio = getRadio(tx.radio_id);
  const txPowerDbm = radio.powerDbm;

  const rxHeight = rx.height_m;
  const indoor = rx.indoor;

  const radiusKm = coverage.radius_km;
  const gridSpacingM = coverage.grid_spacing_m;

  // Convert grid spacing to degrees (approximate)
  const latDegPerM = 1.0 / (111.32 * 1000.0);
  const lngDegPerM = 1.0 / (111.32 * 1000.0 * Math.cos((txLat * Math.PI) / 180.0));

  const gridSpacingLat = gridSpacingM * latDegPerM;
  const gridSpacingLng = gridSpacingM * lngDegPerM;

  // Calculate grid bounds
  const radiusDegLat = radiusKm / 111.32;
  const radiusDegLng = radiusKm / (111.32 * Math.cos((txLat * Math.PI) / 180.0));

  const minLat = txLat - radiusDegLat;
  const maxLat = txLat + radiusDegLat;
  const minLng = txLon - radiusDegLng;
  const maxLng = txLon + radiusDegLng;

  // Generate grid points
  const lats = [];
  for (let lat = minLat; lat <= maxLat; lat += gridSpacingLat) {
    lats.push(lat);
  }

  const lons = [];
  for (let lon = minLng; lon <= maxLng; lon += gridSpacingLng) {
    lons.push(lon);
  }

  console.log(`Generating coverage grid...`);
  console.log(`Grid size: ${lons.length} x ${lats.length} = ${lons.length * lats.length} points`);
  console.log(`Spacing: ${gridSpacingM}m`);
  console.log(`Radius: ${radiusKm}km`);

  // Load building data if available
  let buildings = [];
  const buildingsFile = path.join(__dirname, '../public/data/buildings.geojson');
  if (fs.existsSync(buildingsFile)) {
    console.log('Loading building data...');
    const buildingsData = JSON.parse(fs.readFileSync(buildingsFile, 'utf8'));
    buildings = buildingsData.features || [];
    console.log(`Loaded ${buildings.length} buildings`);
  } else {
    console.log('No building data found, using FSPL only');
  }

  // Calculate RSSI at each grid point
  const features = [];
  const totalPoints = lons.length * lats.length;
  let processed = 0;

  for (const lat of lats) {
    for (const lon of lons) {
      processed++;
      if (processed % 100 === 0) {
        console.log(`Progress: ${processed}/${totalPoints} (${Math.floor((100 * processed) / totalPoints)}%)`);
      }

      // Skip if outside circular radius
      const distance = Math.sqrt(Math.pow(lat - txLat, 2) + Math.pow(lon - txLon, 2));
      if (distance > radiusDegLat) {
        continue;
      }

      // Calculate path loss and RSSI
      const { totalPathLossDb, rssiDbm } = calculateTotalPathLoss({
        txLat,
        txLon,
        txHeight,
        txPowerDbm,
        rxLat: lat,
        rxLon: lon,
        rxHeight,
        indoor,
        buildings,
        terrainData: null,
        frequencyMhz: frequency,
      });

      // Determine zone based on RSSI
      let zone;
      if (rssiDbm > -90) {
        zone = 'strong';
      } else if (rssiDbm > -105) {
        zone = 'usable';
      } else if (rssiDbm > -115) {
        zone = 'fringe';
      } else {
        zone = 'none';
      }

      // Create GeoJSON feature
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        properties: {
          rssi: Math.round(rssiDbm * 100) / 100,
          pathLoss: Math.round(totalPathLossDb * 100) / 100,
          zone,
        },
      });
    }
  }

  console.log(`Generated ${features.length} coverage points`);

  return features;
}

/**
 * Save coverage data as GeoJSON.
 * @param {Array} features - Array of GeoJSON features
 * @param {string} outputFile - Output file path
 */
function saveCoverageGeojson(features, outputFile) {
  const geojson = {
    type: 'FeatureCollection',
    features,
  };

  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(geojson, null, 2));
  console.log(`Saved coverage to ${outputFile}`);
}

/**
 * Main function.
 */
function main() {
  try {
    // Load configuration
    const config = loadConfig(CONFIG_FILE);

    // Generate coverage grid
    const features = generateCoverageGrid(config);

    // Save output
    const outputFile = path.join(__dirname, config.output.file);
    saveCoverageGeojson(features, outputFile);

    console.log('Coverage generation complete!');
  } catch (error) {
    console.error('Error generating coverage:', error);
    process.exit(1);
  }
}

main();
