# 📡 Richmond Fan GMRS — Site Build Plan

**Project:** Static site for network info, coverage map, and signal reporting
**Tech:** Astro 6 + Tailwind + MapLibre GL JS + MapTiler (free tier)
**Deploy:** Cloudflare (matching repo conventions)

---

## 🗺️ Map

| Decision | Choice |
|----------|--------|
| **Library** | MapLibre GL JS |
| **Tiles** | MapTiler free tier — 3D building extrusions, weekly OSM updates |
| **Coverage** | Build-time script (generate-coverage.js) using SRTM terrain + urban clutter |
| **Base station** | 2417 Stuart Ave, attic window ~35-40 ft AGL, Ch 16 |

### Coverage estimation model
- Grid of points around Stuart Ave
- Free Space Path Loss + ~20 dB urban clutter (dense brick rowhouses)
- Terrain from free Open-Elevation API (SRTM)
- Receiver sensitivity: ~ -120 dBm (Tidradio H3)
- Output: stepped GeoJSON polygon

| Color | RSSI | Meaning |
|-------|------|---------|
| 🟢 Green | > -100 dBm | Strong, clear |
| 🟡 Yellow | -100 to -115 dBm | Usable, some noise |
| 🟠 Orange | -115 to -120 dBm | Fringe, heavy static |
| Transparent | < -120 dBm | No signal |

---

## 📄 Pages

| Route | Content |
|-------|---------|
| **`/`** | Full-viewport MapLibre map + sidebar with network status, layer toggles |
| **`/programming`** | Radio settings tables — dead simple, one step per row |
| **`/report`** | Submit a signal report form → Formspree |

---

## 📍 Signal Reports (checkpoints.json)

```
{ lat, lng, quality: 1-5, notes: "", submitted_by: "", date: "" }
```

Color-coded on map:
- 🟢 4-5 — Crystal clear
- 🟡 3 — Readable with noise
- 🔴 1-2 — Barely usable

Click pin → popup with report details.

Submissions go to Formspree. I manually merge into checkpoints.json + rebuild.

---

## 🏗️ File structure

```
radio/
├── astro.config.mjs
├── package.json
├── tailwind.config.mjs
├── tsconfig.json
├── scripts/
│   └── generate-coverage.js
├── public/
│   ├── data/
│   │   ├── coverage.geojson
│   │   └── checkpoints.json
│   └── favicon.ico
└── src/
    ├── pages/
    │   ├── index.astro
    │   ├── programming.astro
    │   └── report.astro
    ├── components/
    │   ├── CoverageMap.astro
    │   └── ProgrammingTable.astro
    ├── layouts/
    │   └── BaseLayout.astro
    └── styles/
        └── global.css
```

---

## 🔧 Build & Deploy

1. `npm install` → `npm run dev` for local
2. `npm run build` → generates coverage GeoJSON from terrain data, builds static site
3. `npm run preview` to verify
4. Deploy to Cloudflare (matching admin site setup)

---

## 📝 To build (first pass)

- [ ] Scaffold Astro project with Tailwind
- [ ] Create BaseLayout.astro (nav, footer, global styles)
- [ ] Build ProgrammingTable component + /programming page
- [ ] Build CoverageMap component with MapLibre GL + MapTiler tiles
- [ ] Build / index.astro page (full map + sidebar)
- [ ] Write generate-coverage.js script
- [ ] Seed coverage.geojson and checkpoints.json
- [ ] Build /report page with Formspree form
- [ ] Test build + preview
- [ ] Deploy to Cloudflare