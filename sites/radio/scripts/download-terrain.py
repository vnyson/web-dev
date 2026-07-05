#!/usr/bin/env python3
"""
Download USGS 3DEP elevation data for Richmond, VA area.
Uses the USGS TNM Access API to download 1/3 arc-second (~10m) resolution terrain.
"""

import requests
import os
from rasterio.transform import from_bounds
import rasterio
from rasterio.crs import CRS
import numpy as np

# Richmond Fan area bounding box (1-mile radius around 2417 Stuart Ave)
CENTER_LAT = 37.5483
CENTER_LNG = -77.4602
RADIUS_DEG = 0.014

BBOX = (
    CENTER_LNG - RADIUS_DEG,  # min lng
    CENTER_LAT - RADIUS_DEG,  # min lat
    CENTER_LNG + RADIUS_DEG,  # max lng
    CENTER_LAT + RADIUS_DEG,  # max lat
)

OUTPUT_FILE = '../public/data/terrain.tif'


def get_3dep_elevation(bbox):
    """
    Download elevation data from USGS 3DEP service.
    Uses the Elevation Point Query Service for simplicity.
    For production, we'd use the TNM Access API for full tiles.
    """
    # For now, we'll use a simpler approach: generate a grid and query EPQS
    # This is slower but doesn't require handling large tile downloads
    
    print("Generating elevation grid using USGS EPQS...")
    print(f"Bounding box: {bbox}")
    
    # Grid resolution: 10m ≈ 0.00009 degrees
    resolution = 0.00009
    
    # Generate grid points
    lons = np.arange(bbox[0], bbox[2], resolution)
    lats = np.arange(bbox[1], bbox[3], resolution)
    
    print(f"Grid size: {len(lons)} x {len(lats)} = {len(lons) * len(lats)} points")
    
    # Query EPQS for each point
    elevation_data = []
    
    for i, lat in enumerate(lats):
        row = []
        for j, lon in enumerate(lons):
            if (i * len(lons) + j) % 100 == 0:
                print(f"Progress: {i * len(lons) + j} / {len(lons) * len(lats)}")
            
            try:
                url = f"https://epqs.nationalmap.gov/v1/json"
                params = {'x': lon, 'y': lat, 'units': 'Meters'}
                response = requests.get(url, params=params, timeout=5)
                response.raise_for_status()
                data = response.json()
                elevation = data.get('value', 0)
                row.append(elevation)
            except Exception as e:
                print(f"Error at {lat}, {lon}: {e}")
                row.append(0)
        
        elevation_data.append(row)
    
    return np.array(elevation_data), (lons, lats)


def save_geotiff(elevation_data, lons_lats, output_file):
    """Save elevation data as GeoTIFF."""
    lons, lats = lons_lats
    
    # Create transform
    transform = from_bounds(
        lons[0], lats[0], lons[-1], lats[-1],
        elevation_data.shape[1], elevation_data.shape[0]
    )
    
    # Save as GeoTIFF
    with rasterio.open(
        output_file,
        'w',
        driver='GTiff',
        height=elevation_data.shape[0],
        width=elevation_data.shape[1],
        count=1,
        dtype=elevation_data.dtype,
        crs=CRS.from_epsg(4326),
        transform=transform,
    ) as dst:
        dst.write(elevation_data, 1)
    
    print(f"Saved terrain data to {output_file}")


def main():
    # Create output directory if needed
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # Download elevation data
    elevation_data, lons_lats = get_3dep_elevation(BBOX)
    
    # Save as GeoTIFF
    save_geotiff(elevation_data, lons_lats, OUTPUT_FILE)
    
    print("Done!")


if __name__ == '__main__':
    main()
