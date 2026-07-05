#!/usr/bin/env python3
"""
Generate default coverage GeoJSON for both simplex and repeater.
Uses FSPL + urban clutter with thresholds tuned to show 3 visible rings at Fan-district scale.

Default settings:
  Simplex: 5W handheld (37 dBm + 2 dBi = 39 dBm ERP), clutter 35 dB
  Repeater: 50W base (47 dBm + 3 dBi = 50 dBm ERP), clutter 25 dB
  Frequency: 462.575 MHz
"""
import json, math, numpy as np
from shapely.geometry import Point, mapping
from shapely.ops import unary_union

def destination(lat, lon, bearing_deg, dist_km):
    R = 6371.0
    lat1 = math.radians(lat)
    lon1 = math.radians(lon)
    b = math.radians(bearing_deg)
    lat2 = math.asin(math.sin(lat1) * math.cos(dist_km/R) +
                     math.cos(lat1) * math.sin(dist_km/R) * math.cos(b))
    lon2 = lon1 + math.atan2(math.sin(b) * math.sin(dist_km/R) * math.cos(lat1),
                              math.cos(dist_km/R) - math.sin(lat1) * math.sin(lat2))
    return (math.degrees(lat2), math.degrees(lon2))

def fspl(d_km, f_mhz=462.575):
    if d_km <= 0: return 0
    return 20 * math.log10(d_km) + 20 * math.log10(f_mhz) + 32.44

def generate_zones(tx_lat, tx_lon, tx_power_dbm, clutter_db, max_radius_km):
    """Generate zone points using polar coordinates. Returns dict of {zone: [Point, ...]}"""
    NUM_RINGS = 30
    NUM_BEARINGS = 36
    points_by_zone = {'strong': [], 'usable': [], 'fringe': []}

    for ring in range(1, NUM_RINGS + 1):
        d_km = (ring / NUM_RINGS) * max_radius_km
        for b in range(0, 360, 360 // NUM_BEARINGS):
            lat, lon = destination(tx_lat, tx_lon, b, d_km)
            path_loss = fspl(d_km)
            rssi = tx_power_dbm - path_loss - clutter_db

            if rssi > -78:
                zone = 'strong'
            elif rssi > -95:
                zone = 'usable'
            elif rssi > -115:
                zone = 'fringe'
            else:
                continue

            points_by_zone[zone].append(Point(lon, lat))

    return points_by_zone

def build_contours(points_by_zone):
    """Convert zone points to polygon contours."""
    colors = {
        'strong': {'fill': '#2563eb', 'stroke': '#1d4ed8'},
        'usable': {'fill': '#3b82f6', 'stroke': '#2563eb'},
        'fringe': {'fill': '#93c5fd', 'stroke': '#60a5fa'},
    }
    contours = []
    for zone in ['strong', 'usable', 'fringe']:
        pts = points_by_zone[zone]
        if len(pts) < 3:
            continue
        hull = unary_union(pts).convex_hull
        if hull.geom_type == 'MultiPolygon':
            hull = hull.convex_hull
        contours.append({
            'type': 'Feature',
            'geometry': mapping(hull),
            'properties': {'zone': zone, 'color': colors[zone]['fill'], 'stroke': colors[zone]['stroke']}
        })
    return {'type': 'FeatureCollection', 'features': contours}

# Coordinates for Stuart Ave base station
BASE_LAT, BASE_LON = 37.555492, -77.469064

# Simplex: 5W (37 dBm) + 2 dBi = 39 dBm, clutter 35 dB, max 5 km
simplex_zones = generate_zones(BASE_LAT, BASE_LON, 39, 35, 5.0)
simplex_geo = build_contours(simplex_zones)
with open('public/data/coverage-simplex.geojson', 'w') as f:
    json.dump(simplex_geo, f, indent=2)
print(f'SIMPLES: {len(simplex_geo["features"])} zones')
for z in ['strong', 'usable', 'fringe']:
    print(f'  {z}: {len(simplex_zones[z])} pts')

# Repeater: 50W (47 dBm) + 3 dBi = 50 dBm, clutter 25 dB, max 10 km
repeater_zones = generate_zones(BASE_LAT, BASE_LON, 50, 25, 10.0)
repeater_geo = build_contours(repeater_zones)
with open('public/data/coverage-repeater.geojson', 'w') as f:
    json.dump(repeater_geo, f, indent=2)
print(f'REPEATER: {len(repeater_geo["features"])} zones')
for z in ['strong', 'usable', 'fringe']:
    print(f'  {z}: {len(repeater_zones[z])} pts')

# Sample RSSI values
print('\nSimplex RSSI at various distances (clutter=35dB):')
for d in [0.2, 0.5, 1.0, 2.0, 3.0, 5.0]:
    rssi = 39 - fspl(d) - 35
    print(f'  {d}km: {rssi:.1f} dBm')

print('\nRepeater RSSI at various distances (clutter=25dB):')
for d in [0.5, 1.0, 2.0, 5.0, 8.0, 10.0]:
    rssi = 50 - fspl(d) - 25
    print(f'  {d}km: {rssi:.1f} dBm')