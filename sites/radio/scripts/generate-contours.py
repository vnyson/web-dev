#!/usr/bin/env python3
"""
Generate polygon contour coverage map from FSPL + distance-dependent urban clutter model.
Outputs a GeoJSON FeatureCollection of zone polygons (strong/usable/fringe).
Uses distance-based clutter to create realistic concentric zone rings.
"""
import json, math, numpy as np
from shapely.geometry import MultiPoint, mapping

with open('coverage-config.json') as f:
    config = json.load(f)

tx = config['transmitter']
coverage = config['coverage']
tx_lat, tx_lon = tx['lat'], tx['lng']
frequency = tx['frequency_mhz']
tx_power_dbm = 37.0
radius_km = coverage['radius_km']
grid_spacing_m = coverage['grid_spacing_m']

def haversine(lat1, lon1, lat2, lon2):
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return 6371.0 * 2 * math.asin(math.sqrt(a))

def fspl(d_km, f_mhz):
    if d_km <= 0:
        return 0
    return 20 * math.log10(d_km) + 20 * math.log10(f_mhz) + 32.44

radius_deg_lat = radius_km / 111.32
radius_deg_lng = radius_km / (111.32 * math.cos(math.radians(tx_lat)))
grid_spacing_lat = grid_spacing_m / (111.32 * 1000.0)
grid_spacing_lng = grid_spacing_m / (111.32 * 1000.0 * math.cos(math.radians(tx_lat)))

lats = np.arange(tx_lat - radius_deg_lat, tx_lat + radius_deg_lat, grid_spacing_lat)
lons = np.arange(tx_lon - radius_deg_lng, tx_lon + radius_deg_lng, grid_spacing_lng)

features = []
for lat in lats:
    for lon in lons:
        d_deg = math.sqrt((lat - tx_lat)**2 + (lon - tx_lon)**2)
        if d_deg > radius_deg_lat:
            continue
        d_km = haversine(tx_lat, tx_lon, lat, lon)
        path_loss = fspl(d_km, frequency)
        # Distance-dependent clutter: more buildings in path at longer range
        # 30 dB at base, ramps to ~60 dB at edge (dense Fan rowhouses)
        frac = d_km / radius_km
        clutter = 30.0 + frac * 30.0
        rssi = tx_power_dbm - path_loss - clutter

        if rssi > -100:
            zone = 'strong'
        elif rssi > -115:
            zone = 'usable'
        elif rssi > -120:
            zone = 'fringe'
        else:
            zone = 'none'

        features.append({
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [lon, lat]},
            'properties': {'rssi': round(rssi, 2), 'zone': zone}
        })

zones = {}
for f in features:
    z = f['properties']['zone']
    if z == 'none':
        continue
    if z not in zones:
        zones[z] = []
    zones[z].append(f['geometry']['coordinates'])

contours = []
for zone, coords in zones.items():
    if len(coords) < 3:
        continue
    hull = MultiPoint(coords).convex_hull
    contours.append({
        'type': 'Feature',
        'geometry': mapping(hull),
        'properties': {'zone': zone}
    })

geojson = {'type': 'FeatureCollection', 'features': contours}
with open('public/data/coverage.geojson', 'w') as f:
    json.dump(geojson, f, indent=2)

print(f'Generated {len(contours)} contour polygons from {len(features)} points')
for z, c in sorted(zones.items()):
    print(f'  {z}: {len(c)} points')
# Sample RSSI at various distances
for frac in [0.1, 0.25, 0.5, 0.75, 1.0]:
    d_km = frac * radius_km
    l = fspl(d_km, frequency)
    c = 30.0 + frac * 30.0
    r = 37 - l - c
    print(f'  {frac*100:.0f}% distance ({d_km:.2f}km): RSSI={r:.1f} dBm (clutter={c:.1f} dB)')