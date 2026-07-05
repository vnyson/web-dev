# 📡 Richmond Fan Community GMRS Radio Network Plan

**GMRS License:** The base station hub requires an active FCC GMRS license/authorization (call sign) before transmitting. Mobile radios operating from this hub must also be covered under the same license.
**Base Station Hub:** 2417 Stuart Ave, Richmond, VA 23220
**Primary Mobile Hardware:** Tidradio H3 (5-Watt Handheld)

---

## 📅 PHASE 1: The Infrastructure Backbone & Simplex Baseline
*Objective: Build the antenna system and measure what a 5-watt radio achieves from two different indoor elevations to understand building and height impact.*

### ⚠️ CRITICAL TECHNICAL REQUIREMENT
* **DO NOT** transmit on the Ed Fong DBJ-1C antenna while it is a bare ribbon. It is custom-tuned to use the plastic casing of the PVC pipe as part of its wave design. Operating it bare will cause high SWR and can destroy your Tidradio H3 transmitter.

### 🔌 Connector Chain (Verify Against Your Hardware)
Before assembly, confirm the connector chain matches what you ordered:

```
DBJ-1C Antenna (SO-239 Female Port)
    ↓
LMR-400 coax — PL-259 Male end ← connects directly
    ↓
[Adapter: PL-259 Male to SMA-Male, if needed]
    ↓
Optional: SMA-Female to SMA-Female flexible pigtail (reduces strain on radio port)
    ↓
Tidradio H3 (SMA-Female antenna jack)
```

*Typical config: 50ft LMR-400 with PL-259 on antenna end, SMA-Male on radio end, plus a short SMA-F→SMA-F pigtail for strain relief.*

### 🛒 Phase 1 Shopping List
* [x] **The Antenna:** Ed Fong DBJ-1C GMRS Base Station Antenna (SO-239 End Connector version).
* [ ] **The Antenna Housing:** 5-foot section of 3/4" Class 200 Thin-Wall PVC Pipe (Lowe's Item #23990 or Home Depot SKU #282-477). *Do not use Schedule 40.*
* [x] **The Feedline:** 50ft LMR-400 Coaxial Cable. Order with PL-259 Male on the antenna end. The radio-end connector depends on your adapter setup. *50ft allows reaching the 3rd floor attic from the radio inside the house.*
* [x] **SWR Meter:** A simple SWR/power meter (e.g., Mustool MT688 or equivalent, ~$25-35). **Mandatory safety check** before any full-power transmission.
* [x] **Radio Pigtail:** SMA-Female to SMA-Female flexible adapter cable (strain relief for handheld radio port).
* [x] **Temporary Mount:** Heavy-duty Gorilla tape, painter's tape, or Command hooks (non-damaging) to secure the PVC pipe vertically.
* [ ] **Static Protection (optional):** Inline DC-grounded lightning/static arrestor (~$15-20) for peace of mind when leaving setup unattended.

### 🛠️ Assembly
1. Slide the flexible DBJ-1C antenna ribbon completely inside the 5-foot Class 200 PVC pipe and push the included end caps into place.
2. Mount the completed PVC pipe **vertically** against a window frame, interior wall, or door frame. Keep it clear of metal blinds, metal ductwork, and large metal objects. Tape or hook it securely.
3. Route the LMR-400 cable into the house, connect the SMA pigtail adapter, and screw it into your Tidradio H3.

**⚠️ Attic Heat Rule:** When testing from the attic, keep the Tidradio H3 **inside the conditioned house**. Only the coax/antenna enter the attic. Handheld electronics overheat quickly in attics, especially in a Richmond summer.

---

### 🧪 PHASE 1A: Room Baseline Test
*Run this test from a room on your current living floor to establish an indoor baseline.*

**Location:** Your room (estimated ~15-20 ft AGL if 2nd floor; lower if 1st floor)

**Radio Settings:** Set the home base Tidradio H3 to **GMRS Channel 16 (High Power)**. Turn **ALL** privacy tones (CTCSS/DCS) to **OFF/NONE**. Set Squelch to **1**.

**Pre-Test Check:** Measure SWR with the meter. Record the value. If SWR is high (>2:1), check connections and antenna seating before proceeding.

**The Route:** Have a friend with a second handheld radio walk this route (same channel, no tones). They stop and transmit at each point.

* *Point A (0.3 Mi):* Scuffletown Park (Corner of Strawberry & Park)
* *Point B (0.6 Mi):* Robinson St Commercial Strip (Near Joe's Inn)
* *Point C (1.0 Mi):* Science Museum of Virginia (Broad St Lawn)
* *Point D (1.4 Mi):* The Diamond Parking Lot (Fringe Limit)

**Log the Results:** Use the comparison table below. Note signal quality and the exact street where audio degrades.

---

### 🧪 PHASE 1B: Attic Window Test
*Repeat the identical route from the 3rd floor attic window to measure the real-world impact of elevation and roof attenuation.*

**Location:** 3rd floor attic window (estimated ~35-40 ft AGL)

**Re-measure SWR:** The antenna environment has changed (closer to roof, different window glass, nearby ductwork). Measure SWR again and log it. Do not transmit if SWR is elevated.

**Run the identical route** and fill in the comparison table below.

---

### 📊 Comparison Test Log

| Checkpoint | Room Result (Signal/Noise) | Room SWR | Attic Result (Signal/Noise) | Attic SWR | Notes |
|------------|---------------------------|----------|----------------------------|-----------|-------|
| Scuffletown Park (0.3 mi) | | | | | |
| Robinson St / Joe's Inn (0.6 mi) | | | | | |
| Science Museum (1.0 mi) | | | | | |
| The Diamond (1.4 mi) | | | | | |

**Signal quality key:** 5 = Crystal clear / 3 = Readable with some noise / 1 = Unusable

**After completing both tests, choose your permanent antenna location based on the data.**

---

## 📅 PHASE 2: The Automated Simplex Network
*Objective: Remove yourself as the manual relay middleman and lock down the network so only your friend group can trigger the automation.*

### 🛒 Phase 2 Shopping List
* [ ] **The Controller:** Surecom SR-112 Simplex Repeater Controller (with K1 Kenwood 2-pin connector cable).

### 🛠️ Split-Tone Programming Sequence
1. Plug the Surecom SR-112 into the side data/audio port of your home Tidradio H3 using the K1 cable.
2. **Home Base Radio Settings:**
   * GMRS Channel 16
   * Receive (RX) Tone: **100.0 Hz (CTCSS)**
   * Transmit (TX) Tone: **OFF / NONE**
3. **Friend Group Mobile Radio Settings:**
   * GMRS Channel 16
   * Transmit (TX) Tone: **100.0 Hz (CTCSS)**
   * Receive (RX) Tone: **OFF / NONE**

### 🧪 Distance & Quality Test #2 (The Automated Relay Check)
1. Have a friend stand 4 blocks away and transmit a short, 4-second sentence.
2. Verify that your home base station stays completely silent while they talk, and then automatically broadcasts their exact recording back out to the neighborhood 1 second later.
3. Have a third radio transmit on Channel 16 *without* the 100.0 Hz tone. Verify that your automated base station completely ignores the transmission.
4. Send your friend to the maximum boundary discovered in Phase 1 to verify that the recorded audio playback remains clean and intelligible.

---

## 📅 PHASE 3: Scaling & Upgrading to Real-Time Duplex
*Objective: As the friend group scales up across the neighborhood, swap out the temporary single-frequency brain for a zero-latency, live commercial hub.*

### 🛒 Phase 3 Shopping List
* [ ] **The Machine:** Retevis RT97S Portable GMRS Duplex Repeater (or Midland MXR10).

### 🔄 Redundancy Checklist (The Transition)
* [x] **Retired:** The Surecom SR-112 box and its K1 cable are unplugged and stored away (the $53 modular stepping cost).
* [x] **Repurposed:** Your home base Tidradio H3 is unplugged from the big antenna, its factory rubber antenna is reattached, and it is handed out to a new friend as a mobile field radio.
* [x] **Kept 100%:** The Ed Fong DBJ-1C antenna, the Class 200 PVC housing, and the LMR-400 coax cable lines stay exactly where they are.

### 🛠️ Final Duplex Installation & Tuning
1. Unbox the Retevis RT97S duplex repeater machine. Plug your existing LMR-400 coax cable directly into the **TX/RX Antenna Port** on the back of the chassis.
2. Program the machine to **Repeater Channel 16 (RPT-16)**. Set both the Transmit (TX) and Receive (RX) privacy tones to **100.0 Hz (CTCSS)**.
3. Have your entire friend group switch their mobile handheld dials over to **RPT-16** with matching **100.0 Hz** tones on both transmit and receive.

### 🧪 Distance & Quality Test #3 (The Live Community Grid)
1. Have Friend A stand near Carytown and Friend B stand near the VCU campus.
2. Have Friend A talk. Friend B should hear Friend A's voice live, instantly, with zero store-and-forward playback latency.
3. Walk the perimeter of the Fan. Because dedicated duplex base units put out a cleaner, higher duty-cycle wave than small handhelds, expect your stable clear communication zone to expand significantly past your original Phase 1 indoor limits.

---

## 📅 PHASE 4: Static Site & Coverage Map
*Objective: Build an Astro static site with an interactive 3D coverage map so friend group can visualize range and submit signal reports.*

### 🗺️ Map Technology
- **Library:** MapLibre GL JS (3D-tilted perspective, building extrusions from OSM)
- **Tiles:** MapTiler (free tier, up-to-date OSM building data, weekly updates)
- **Coverage Overlay:** Pre-computed at build time — builds a grid around Stuart Ave, applies Free Space Path Loss + ~20 dB urban clutter factor, uses Open-Elevation API (free SRTM) for terrain. Outputs a stepped GeoJSON polygon:
  - 🟢 Solid green = RSSI > -100 dBm (strong)
  - 🟡 Yellow = -100 dBm to -115 dBm (usable)
  - 🟠 Orange = -115 dBm to -120 dBm (fringe)
  - Transparent = < -120 dBm (no signal)

### 📱 Site Pages

| Page | Purpose |
|------|---------|
| **`/`** | Full-viewport MapLibre map with coverage overlay, base station marker, and user signal pins |
| **`/programming`** | Step-by-step radio programming tables (Ch 16, TX Tone 100.0 Hz, RX Tone OFF) |
| **`/report`** | Form: location (map pin), quality (1-5 dropdown), optional notes. Submits via Formspree. |

### 📍 User Signal Reports
- Stored in `src/data/checkpoints.json` as `{ lat, lng, quality, notes, submitted_by, date }`
- Displayed as color-coded circles on the map: 🟢 4-5 / 🟡 3 / 🔴 1-2
- Clicking a pin shows a popup with the report details
- New submissions go to Formspree; I periodically merge them into the JSON and rebuild

### 🏗️ Site Structure
```
radio/
├── astro.config.mjs
├── package.json              ← Astro 6 + Tailwind + MapLibre GL
├── tailwind.config.mjs
├── tsconfig.json
├── scripts/
│   └── generate-coverage.js  ← Build step: fetches elevation, computes coverage
├── public/
│   ├── data/
│   │   ├── coverage.geojson       ← Build output
│   │   └── checkpoints.json      ← User submissions
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

### 🔄 Workflow
1. Run `npm run build` — this generates the coverage GeoJSON from terrain data
2. Deploy to Cloudflare (matching the admin site's deployment model)
3. Friends visit the site, check coverage, submit signal reports
4. Periodically merge new Formspree submissions into `checkpoints.json` and rebuild