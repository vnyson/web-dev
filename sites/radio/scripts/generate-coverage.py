#!/usr/bin/env python3
"""
Generate RF coverage map using propagation modeling.
Reads configuration from coverage-config.json and outputs GeoJSON coverage data.
"""

import json
import math
import numpy as np
from building_index import BuildingIndex
from propagation import (
    calculate_total_path_loss,
    watts_to_dbm,
)
from radios import get_radio
import sys
import os

# Add scripts directory to path for imports
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

CONFIG_FILE = os.path.join(SCRIPT_DIR, '..', 'coverage-config.json')


def load_config(config_file=CONFIG_FILE):
    """Load configuration from JSON file."""
    with open(config_file, 'r') as f:
        return json.load(f)


def generate_coverage_grid(config):
    """
    Generate coverage grid by calculating RSSI at each point.

    Args:
        config: Configuration dictionary

    Returns:
        List of GeoJSON features with RSSI values
    """
    tx = config['transmitter']
    rx = config['receiver']
    coverage = config['coverage']

    tx_lat = tx['lat']
    tx_lon = tx['lng']
    tx_height = tx['height_m']
    frequency = tx['frequency_mhz']

    # Get radio specifications
    radio = get_radio(tx['radio_id'])
    tx_power_dbm = radio['power_dbm']

    rx_height = rx['height_m']
    indoor = rx['indoor']

    radius_km = coverage['radius_km']
    grid_spacing_m = coverage['grid_spacing_m']

    # Convert grid spacing to degrees (approximate)
    # 1 degree ≈ 111 km at equator, varies with latitude
    lat_deg_per_m = 1.0 / (111.32 * 1000.0)
    lng_deg_per_m = 1.0 / (111.32 * 1000.0 * math.cos(math.radians(tx_lat)))

    grid_spacing_lat = grid_spacing_m * lat_deg_per_m
    grid_spacing_lng = grid_spacing_m * lng_deg_per_m

    # Calculate grid bounds
    radius_deg_lat = radius_km / 111.32
    radius_deg_lng = radius_km / (111.32 * math.cos(math.radians(tx_lat)))

    min_lat = tx_lat - radius_deg_lat
    max_lat = tx_lat + radius_deg_lat
    min_lng = tx_lon - radius_deg_lng
    max_lng = tx_lon + radius_deg_lng

    # Generate grid points
    lats = np.arange(min_lat, max_lat, grid_spacing_lat)
    lons = np.arange(min_lng, max_lng, grid_spacing_lng)

    print(f"Generating coverage grid...")
    print(f"Grid size: {len(lons)} x {len(lats)} = {len(lons) * len(lats)} points")
    print(f"Spacing: {grid_spacing_m}m")
    print(f"Radius: {radius_km}km")

    # Load building index
    print("Loading building index...")
    building_index = BuildingIndex()
    try:
        building_index.load_index()
    except Exception as e:
        print(f"Warning: Could not load building index: {e}")
        print("Continuing without building data...")
        building_index = None

    # Calculate RSSI at each grid point
    features = []
    total_points = len(lons) * len(lats)
    processed = 0

    for lat in lats:
        for lon in lons:
            processed += 1
            if processed % 100 == 0:
                print(f"Progress: {processed}/{total_points} ({100*processed//total_points}%)")

            # Skip if outside circular radius
            distance = math.sqrt((lat - tx_lat)**2 + (lon - tx_lon)**2)
            if distance > radius_deg_lat:
                continue

            # Calculate path loss and RSSI
            if building_index:
                total_loss, rssi = calculate_total_path_loss(
                    tx_lat, tx_lon, tx_height, tx_power_dbm,
                    lat, lon, rx_height, indoor,
                    building_index, None, frequency
                )
            else:
                # Fallback: FSPL only
                from propagation import calculate_fspl, calculate_distance, get_urban_clutter_loss
                dist_km = calculate_distance(tx_lat, tx_lon, lat, lon)
                fspl = calculate_fspl(dist_km, frequency)
                clutter = get_urban_clutter_loss()
                total_loss = fspl + clutter
                rssi = tx_power_dbm - total_loss

            # Determine zone based on RSSI
            if rssi > -90:
                zone = 'strong'
            elif rssi > -105:
                zone = 'usable'
            elif rssi > -115:
                zone = 'fringe'
            else:
                zone = 'none'

            # Create GeoJSON feature
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [lon, lat]
                },
                'properties': {
                    'rssi': round(rssi, 2),
                    'path_loss': round(total_loss, 2),
                    'zone': zone,
                }
            }

            features.append(feature)

    print(f"Generated {len(features)} coverage points")

    return features


def convert_to_contours(features, grid_spacing_m):
    """
    Convert point grid to polygon contours for better visualization.
    Simplified version - groups points by zone and creates convex hulls.

    Args:
        features: List of GeoJSON point features
        grid_spacing_m: Grid spacing in meters

    Returns:
        List of GeoJSON polygon features
    """
    from shapely.geometry import MultiPoint, mapping
    from shapely.ops import unary_union

    # Group points by zone
    zones = {}
    for feature in features:
        zone = feature['properties']['zone']
        if zone not in zones:
            zones[zone] = []
        coords = feature['geometry']['coordinates']
        zones[zone].append(coords)

    # Create polygons for each zone
    contour_features = []

    for zone, coords in zones.items():
        if len(coords) < 3:
            continue

        # Create multipoint and get convex hull
        multi_point = MultiPoint(coords)
        hull = multi_point.convex_hull

        # Convert to GeoJSON
        contour_feature = {
            'type': 'Feature',
            'geometry': mapping(hull),
            'properties': {
                'zone': zone,
            }
        }

        contour_features.append(contour_feature)

    return contour_features


def save_coverage_geojson(features, output_file):
    """Save coverage data as GeoJSON."""
    geojson = {
        'type': 'FeatureCollection',
        'features': features
    }

    with open(output_file, 'w') as f:
        json.dump(geojson, f, indent=2)

    print(f"Saved coverage to {output_file}")


def main():
    # Load configuration
    full_config = load_config()

    # Iterate over simplex and repeater configurations
    for mode, config in full_config.items():
        print(f"\n========================================")
        print(f"Generating coverage for mode: {mode}")
        print(f"========================================")

        # Generate coverage grid
        features = generate_coverage_grid(config)

        # Convert to contours (enabled for proper Leaflet rendering)
        contours = convert_to_contours(features, config['coverage']['grid_spacing_m'])
        features = contours

        # Save output
        output_file = config['output']['file']
        # Make output file path relative to script location
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_file = os.path.join(script_dir, output_file)

        # Create output directory if needed
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        save_coverage_geojson(features, output_file)

    print("\nAll coverage generation complete!")


if __name__ == '__main__':
    main()