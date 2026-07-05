#!/usr/bin/env python3
"""
Generate concentric circular coverage zones using polar coordinates.
No northeast bias — points are equally distributed in all directions.

Output: GeoJSON FeatureCollection with 'strong' and 'usable' polygon rings.
"""
import json, math
from shapely.geometry import mapping, Point
from shapely.ops import unary_union
import numpy as np

def haversine(lat1, lon1, lat2, lon2):
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return 6371.0 * 2 * math.asin(math.sqrt(a))

def fspl(d_km, f_mhz):
    if d_km <= 0:
        return 0
    return 20 * math.log10(d_km) + 20 * math.log10(f_mhz) + 32.44

def destination(lat, lon, bearing_deg, dist_km):
    """Return (lat, lon) after moving dist_km at bearing_deg from (lat, lon)."""
    R = 6371.0
    lat1 = math.radians(lat)
    lon1 = math.radians(lon)
    bearing = math.radians(bearing_deg)
    lat2 = math.asin(math.sin(lat1) * math.cos(dist_km/R) +
                     math.cos(lat1) * math.sin(dist_km/R) * math.cos(bearing))
    lon2 = lon1 + math.atan2(math.sin(bearing) * math.sin(dist_km/R) * math.cos(lat1),
                              math.cos(dist_km/R) - math.sin(lat1) * math.sin(lat2))
    return (math.degrees(lat2), math.degrees(lon2))

# Config
tx_lat, tx_lon = 37.5483, -77.4602
frequency = 462.575  # MHz
tx_power_dbm = 37.0  # 5W
radius_km = 1.6

# Generate points in polar coordinates — perfectly symmetric
NUM_RINGS = 20      # concentric rings at different distances
NUM_BEARINGS = 36   # every 10 degrees

points_by_zone = {'strong': [], 'usable': [], 'fringe': []}

for ring in range(1, NUM_RINGS + 1):
    frac = ring / NUM_RINGS
    d_km = frac * radius_km

    for bearing in range(0, 360, 360 // NUM_BEARINGS):
        lat, lon = destination(tx_lat, tx_lon, bearing, d_km)
        path_loss = fspl(d_km, frequency)
        # Distance-dependent clutter: 30 dB ramp to 60 dB
        clutter = 30.0 + frac * 30.0
        rssi = tx_power_dbm - path_loss - clutter

        if rssi > -100:
            zone = 'strong'
        elif rssi > -115:
            zone = 'usable'
        elif rssi > -120:
            zone = 'fringe'
        else:
            continue

        points_by_zone[zone].append(Point(lon, lat))

# Create zone polygons using convex hull for each zone
# To get proper concentric rings, we create a polygon for each zone's outermost ring
contours = []
zone_colors = {
    'strong': {'fill': '#22c55e', 'stroke': '#15803d'},
    'usable': {'fill': '#eab308', 'stroke': '#a16207'},
    'fringe': {'fill': '#f97316', 'stroke': '#c2410c'},
}

for zone in ['strong', 'usable', 'fringe']:
    pts = points_by_zone[zone]
    if len(pts) < 3:
        continue
    hull = unary_union(pts).convex_hull
    if hull.geom_type == 'MultiPolygon':
        hull = hull.convex_hull  # simplify
    contours.append({
        'type': 'Feature',
        'geometry': mapping(hull),
        'properties': {
            'zone': zone,
            'fillColor': zone_colors[zone]['fill'],
            'strokeColor': zone_colors[zone]['stroke'],
        }
    })

geojson = {'type': 'FeatureCollection', 'features': contours}
with open('public/data/coverage.geojson', 'w') as f:
    json.dump(geojson, f, indent=2)

print(f'Generated {len(contours)} concentric zone polygons')
for z in ['strong', 'usable', 'fringe']:
    print(f'  {z}: {len(points_by_zone[z])} points')
# Show RSSI at each fraction
for frac in [0.25, 0.5, 0.75, 1.0]:
    d_km = frac * radius_km
    l = fspl(d_km, frequency)
    c = 30.0 + frac * 30.0
    r = tx_power_dbm - l - c
    print(f'  {frac*100:.0f}% dist ({d_km:.2f}km): RSSI={r:.1f} dBm')