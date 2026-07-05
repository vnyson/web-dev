# Fix Map Location and Add Comparison Features

Fix incorrect base station location, restore missing UI elements, and add simplex vs repeater comparison with location-based signal estimation.

## Issues to Fix

1. **Incorrect base station location**: Current coordinates (37.5483, -77.4602) should be 37.555492, -77.469064
2. **Missing UI elements**: Index page only shows header and map; missing sidebar, navigation, layer toggles
3. **New feature**: Compare simplex walkie-talkie range vs repeater range with toggleable overlays
4. **New feature**: Allow users to click anywhere to estimate signal strength at that location

## Implementation Plan

### 1. Fix Base Station Coordinates
- Update `coverage-config.json` with correct coordinates: 37.555492, -77.469064
- Regenerate coverage.geojson with correct location
- Update map center in CoverageMap.astro

### 2. Restore UI Elements
- Add sidebar to index.astro with:
  - Network status section
  - Coverage legend with labeled ranges
  - Navigation links to /programming and /report
  - Layer toggles (coverage, buildings, signal reports)
- Use BaseLayout.astro for consistent navigation across pages
- Apply Tailwind styling per project conventions

### 3. Simplex vs Repeater Comparison
- Add radio type toggle in sidebar (Simplex Handheld / Repeater)
- Create separate coverage configs for each mode:
  - Simplex: 5W handheld (tidradio_h3), lower antenna height (1.5m)
  - Repeater: 50W mobile (midland_mxt575), higher antenna height (12m)
- Generate two coverage GeoJSON files:
  - `coverage-simplex.geojson` for handheld range
  - `coverage-repeater.geojson` for repeater range
- Overlay both coverages with different colors:
  - Simplex: Blue tones
  - Repeater: Green tones
- Add toggle switches to show/hide each range independently
- Add legend showing which color represents which mode with labels

### 4. Click-to-Estimate Range
- Add click handler to map for placing user pins
- When user clicks:
  - Place a marker at clicked location
  - Calculate RSSI from base station to that point using propagation.js
  - Display estimated signal strength in a popup
  - Show distance from base station
  - Show which zone (strong/usable/fringe/none)
- Allow multiple pins for comparison
- Add "Clear Pins" button in sidebar

### 5. Technical Details
- Use existing propagation.js for RSSI calculations in browser
- Fetch coverage data dynamically based on selected mode
- Store user pins in client-side state (no persistence needed)
- Update coverage-config.json to support multiple radio configurations
- Add script to generate both simplex and repeater coverage files
