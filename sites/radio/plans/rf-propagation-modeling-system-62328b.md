# RF Propagation Modeling System Plan

This plan outlines a server-side RF propagation modeling system for GMRS frequencies that accounts for building penetration, diffraction, and terrain effects within a 1-mile radius of Richmond's Fan district.

---

## System Overview

**Goal**: Build a physics-based RF coverage prediction system that models signal interaction with buildings, terrain, and construction materials for GMRS (462-467 MHz) frequencies.

**Scope**: 1-mile radius around 2417 Stuart Ave, Richmond, VA. Static pre-computed coverage maps with user-configurable parameters (radio hardware, antenna, location, elevation, indoor/outdoor).

**Computation**: Server-side (Node.js/Python hybrid), static generation, no real-time compute costs.

---

## Technology Stack by Platform

### 📊 Data Platform

#### Building Data
- **Primary Source**: OpenStreetMap building footprints via Overpass API
  - Free, regularly updated, good coverage of Richmond
  - Fields: footprint polygon, building height (from tags), material type
- **Backup/Enhancement**: Virginia Building Footprints (VGIN)
  - State GIS dataset, higher accuracy for Virginia
  - Download once, store locally as GeoJSON
- **Processing**: 
  - Convert to spatial index (R-tree) for fast intersection queries
  - Extract height from `building:levels` tag (default: 3m per level)
  - Assign material penetration loss based on construction type

#### Terrain/Elevation Data
- **Primary Source**: USGS 3DEP 1/3 arc-second (~10m resolution)
  - Download via USGS TNM Access API or pre-fetch tiles
  - Coverage: Single 1x1 degree tile covering Richmond area
- **API Alternative**: USGS Elevation Point Query Service (EPQS)
  - REST API for point queries: `https://epqs.nationalmap.gov/v1/json`
  - Use for on-demand elevation at specific coordinates
- **Storage**: GeoTIFF raster, converted to height grid for computation

#### Material Penetration Loss Database
- **Source**: ITU-R P.2346 + NIST construction material attenuation data
- **Frequencies**: Interpolate for 462 MHz from 900 MHz measurements
- **Typical Values** (approximate for 462 MHz):
  - Concrete: 8-15 dB
  - Brick: 5-10 dB
  - Wood/drywall: 2-5 dB
  - Glass: 2-4 dB
  - Metal: 20+ dB

---

### 🧮 Computation Platform

#### RF Propagation Model
- **Primary Model**: ITU-R P.1411 (urban propagation) + custom building interaction
  - Designed for urban environments with building interactions
  - Accounts for street canyon effects, diffraction over rooftops
- **Secondary Model**: Longley-Rice (ITM) for terrain-based baseline
  - Good for free-space + terrain diffraction
  - Less accurate for dense urban environments
- **Implementation**: Python with NumPy/SciPy for numerical computation
  - Why Python: Rich scientific computing ecosystem, easier RF math
  - Integration: Called from Node.js build script via child process

#### Propagation Algorithm Components
1. **Free Space Path Loss (FSPL)**: Baseline calculation
   - Formula: `FSPL(dB) = 20log10(d) + 20log10(f) + 32.44`
   - Where d = distance in km, f = frequency in MHz

2. **Building Penetration Loss**:
   - Ray casting from transmitter to receiver point
   - Count intersections with building polygons
   - Sum material-specific penetration losses
   - Apply frequency-dependent scaling

3. **Diffraction Loss**:
   - Single-edge diffraction over building rooftops
   - Use ITU-R P.526 knife-edge diffraction model
   - Calculate Fresnel zone clearance

4. **Terrain Effect**:
   - Extract terrain profile along great-circle path
   - Apply Longley-Rice terrain diffraction
   - Combine with building effects

5. **Total Path Loss**:
   - `Total = FSPL + BuildingPenetration + Diffraction + Terrain + Clutter`
   - Clutter factor: ~20 dB urban attenuation (empirical)

#### Computation Workflow
```
1. Load building data (GeoJSON) → R-tree spatial index
2. Load terrain data (GeoTIFF) → 2D height array
3. Define receiver grid (e.g., 50m spacing over 1-mile radius)
4. For each grid point:
   a. Calculate distance and bearing from transmitter
   b. Extract terrain elevation profile
   c. Cast ray through building index
   d. Compute FSPL
   e. Add building penetration losses
   f. Add diffraction losses
   g. Add terrain effects
   h. Store RSSI = TX Power - Total Path Loss
5. Output: GeoJSON with RSSI values per grid point
```

#### Radio Hardware Database
- **Tidradio H3**: 5W, SMA antenna, sensitivity ~-120 dBm
- **Baofeng UV-5R**: 5W, SMA antenna, sensitivity ~-118 dBm
- **Midland MXT115**: 5W, mobile, sensitivity ~-122 dBm
- **Custom**: User-configurable power (1-50W), antenna gain, height

#### User Parameters
- **Transmitter**: Location (lat/lng), elevation (AGL), power (W), antenna gain (dBi)
- **Receiver**: Location (lat/lng), elevation (AGL), indoor/outdoor, building material
- **Environment**: Frequency (462-467 MHz), channel bandwidth

---

### 🖥️ Server Platform

#### Backend Framework
- **Primary**: Node.js (existing Astro setup)
- **Computation Service**: Python script invoked via build process
- **API**: None needed (static generation only)

#### Build Process
```
1. User updates parameters in config file or UI
2. `npm run build` triggers:
   a. Python script reads config + building/terrain data
   b. Computes coverage grid
   c. Outputs coverage.geojson
   d. Astro builds static site
3. Deploy to Cloudflare Pages
```

#### Data Storage
- **Building data**: `public/data/buildings.geojson` (~1-5 MB for 1-mile radius)
- **Terrain data**: `public/data/terrain.tif` (~1-2 MB for 1-mile radius)
- **Coverage output**: `public/data/coverage.geojson` (~500 KB - 1 MB)
- **Checkpoints**: `public/data/checkpoints.json` (user reports)

---

### 🗺️ Visualization Platform

#### Map Library
- **Primary**: Leaflet (lightweight, 2D-focused)
  - Better for 2D visualization than MapLibre GL
  - Smaller bundle size, simpler API
  - Good plugin ecosystem (heatmaps, legends)
- **Alternative**: MapLibre GL (if 3D needed later)

#### Coverage Visualization
- **Technique**: Heatmap or contour overlay
  - Leaflet.heat plugin for smooth gradient
  - Or GeoJSON polygon fill with stepped colors
- **Color Scale**:
  - Green: RSSI > -90 dBm (excellent)
  - Yellow: -90 to -105 dBm (good)
  - Orange: -105 to -115 dBm (usable)
  - Red: -115 to -120 dBm (fringe)
  - Transparent: < -120 dBm (no signal)

#### Building Visualization
- **Technique**: GeoJSON polygon overlay
  - Semi-transparent fill to show buildings
  - Height indicated by color intensity or label
  - Click to show material/penetration loss info

#### User Interface
- **Parameter Controls**: Form inputs for radio config
  - Radio type dropdown (with presets)
  - Antenna height slider
  - Power slider
  - Location picker (map click or manual)
  - Indoor/outdoor toggle
  - Building material dropdown (if indoor)
- **Actions**: "Generate Coverage" button triggers rebuild
- **Feedback**: Loading spinner during computation

---

## Implementation Phases

### Phase 1: Data Pipeline
- [ ] Download Richmond building data from OSM/VGIN
- [ ] Download USGS 3DEP terrain tile for Richmond
- [ ] Create scripts to convert to GeoJSON/GeoTIFF
- [ ] Build material penetration loss database
- [ ] Set up spatial indexing for buildings

### Phase 2: Propagation Engine
- [ ] Implement FSPL calculation
- [ ] Implement building ray casting
- [ ] Implement material penetration loss
- [ ] Implement ITU-R P.526 diffraction
- [ ] Implement terrain profile extraction
- [ ] Combine into total path loss model
- [ ] Create radio hardware database

### Phase 3: Build Integration
- [ ] Create Python computation script
- [ ] Integrate with Astro build process
- [ ] Add config file for user parameters
- [ ] Generate sample coverage map

### Phase 4: Visualization
- [ ] Replace MapLibre GL with Leaflet
- [ ] Implement coverage heatmap/contour
- [ ] Add building overlay
- [ ] Create parameter control UI
- [ ] Add "Generate Coverage" action

### Phase 5: Testing & Validation
- [ ] Compare predictions to real-world measurements
- [ ] Adjust empirical clutter factor
- [ ] Validate building penetration values
- [ ] Performance optimization (grid spacing, caching)

---

## Data Sources Summary

| Data Type | Source | Format | Cost | Update Frequency |
|-----------|--------|--------|------|------------------|
| Buildings | OpenStreetMap | GeoJSON | Free | Weekly (OSM updates) |
| Buildings | VGIN Virginia | Shapefile/GeoJSON | Free | Quarterly |
| Terrain | USGS 3DEP | GeoTIFF | Free | As needed (static) |
| Terrain | USGS EPQS API | JSON (point query) | Free | Real-time (optional) |
| Material Loss | ITU-R P.2346 | Static table | Free | Static |

---

## Estimated Compute Requirements

- **Coverage generation**: 1-5 minutes for 1-mile radius at 50m grid spacing
- **Memory**: 500 MB - 1 GB (building index + terrain grid)
- **Storage**: 10 MB total (buildings + terrain + coverage)
- **Build time**: Existing Astro build + 1-5 min coverage computation

---

## Resolved Decisions

1. **Grid spacing**: 50m resolution (~1,200 points for 1-mile radius) ✓
2. **Building height accuracy**: OSM estimates ✓
3. **Material classification**: Default to brick (residential Richmond Fan area). Note: Mark in code for future flexibility if expanding to other locations with different construction types.
4. **Diffraction complexity**: Single-edge diffraction (simpler, faster). Multi-edge would model signal bending over multiple building rooftops but is computationally expensive. Single-edge is sufficient for urban approximation.
5. **Validation**: Theoretical accuracy initially. Adjust empirical clutter factor (~20 dB) based on real-world measurements from radio operator feedback over time.
