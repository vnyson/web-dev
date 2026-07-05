#!/usr/bin/env python3
"""
Download building footprints from OpenStreetMap for Richmond, VA area.
Extracts building polygons, heights, and material information.
"""

import json
import requests
from shapely.geometry import box
import geopandas as gpd

# Richmond Fan area bounding box (1-mile radius around 2417 Stuart Ave)
# Center: 37.5483, -77.4602
# 1 mile ≈ 0.014 degrees lat/lon
CENTER_LAT = 37.5483
CENTER_LNG = -77.4602
RADIUS_DEG = 0.014

BBOX = (
    CENTER_LNG - RADIUS_DEG,  # min lng
    CENTER_LAT - RADIUS_DEG,  # min lat
    CENTER_LNG + RADIUS_DEG,  # max lng
    CENTER_LAT + RADIUS_DEG,  # max lat
)

OUTPUT_FILE = '../public/data/buildings.geojson'


def download_buildings():
    """Download building data from Overpass API."""
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    # Overpass QL query to get buildings with height and material info
    query = f"""
    [out:json][timeout:300];
    (
      way["building"]({BBOX[1]},{BBOX[0]},{BBOX[3]},{BBOX[2]});
      relation["building"]({BBOX[1]},{BBOX[0]},{BBOX[3]},{BBOX[2]});
    );
    out body;
    >;
    out skel qt;
    """
    
    print(f"Downloading buildings from OSM...")
    print(f"Bounding box: {BBOX}")
    
    headers = {
        'User-Agent': 'RichmondFanGMRS/1.0 (your-email@example.com)'
    }
    
    response = requests.post(overpass_url, data=query, headers=headers, timeout=300)
    response.raise_for_status()
    
    data = response.json()
    print(f"Downloaded {len(data.get('elements', []))} elements")
    
    return data


def parse_building_height(element):
    """Parse building height from OSM tags."""
    tags = element.get('tags', {})
    
    # Try various height tags
    if 'height' in tags:
        try:
            # Remove 'm' suffix if present and convert to float
            height_str = tags['height'].replace('m', '').strip()
            return float(height_str)
        except (ValueError, AttributeError):
            pass
    
    # Estimate from building levels (3m per level default)
    if 'building:levels' in tags:
        try:
            levels = float(tags['building:levels'])
            return levels * 3.0  # 3m per level
        except (ValueError, AttributeError):
            pass
    
    # Default height for unknown buildings (2-story residential)
    return 6.0


def parse_building_material(element):
    """Parse building material from OSM tags."""
    tags = element.get('tags', {})
    
    material = tags.get('building:material', '').lower()
    
    # Map OSM materials to our simplified categories
    material_map = {
        'brick': 'brick',
        'concrete': 'concrete',
        'wood': 'wood',
        'steel': 'metal',
        'metal': 'metal',
        'glass': 'glass',
        'stone': 'brick',
        'masonry': 'brick',
    }
    
    return material_map.get(material, 'brick')  # Default to brick for Richmond


def convert_to_geojson(data):
    """Convert Overpass JSON to GeoJSON with height and material."""
    features = []
    
    for element in data.get('elements', []):
        if element['type'] not in ['way', 'relation']:
            continue
        
        # Get geometry
        if element['type'] == 'way':
            coords = []
            for node in element.get('nodes', []):
                # Find node coordinates from the data
                for node_el in data.get('elements', []):
                    if node_el['type'] == 'node' and node_el['id'] == node:
                        coords.append([node_el['lon'], node_el['lat']])
                        break
            
            if len(coords) < 3:
                continue
            
            # Close the polygon
            if coords[0] != coords[-1]:
                coords.append(coords[0])
            
            geometry = {
                'type': 'Polygon',
                'coordinates': [coords]
            }
        else:
            # Relations are more complex, skip for now
            continue
        
        # Extract properties
        height = parse_building_height(element)
        material = parse_building_material(element)
        
        # Material penetration loss (dB) at 462 MHz
        material_loss = {
            'brick': 8.0,
            'concrete': 12.0,
            'wood': 3.0,
            'metal': 25.0,
            'glass': 3.0,
        }
        
        feature = {
            'type': 'Feature',
            'geometry': geometry,
            'properties': {
                'osm_id': element['id'],
                'height': height,
                'material': material,
                'penetration_loss': material_loss.get(material, 8.0),
                'building_type': element.get('tags', {}).get('building', 'yes'),
            }
        }
        
        features.append(feature)
    
    return {
        'type': 'FeatureCollection',
        'features': features
    }


def main():
    # Download data
    data = download_buildings()
    
    # Convert to GeoJSON
    geojson = convert_to_geojson(data)
    
    # Save to file
    print(f"Saving {len(geojson['features'])} buildings to {OUTPUT_FILE}")
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(geojson, f, indent=2)
    
    print("Done!")


if __name__ == '__main__':
    main()
