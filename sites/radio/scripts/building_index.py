"""
Spatial indexing for building data using R-tree.
Enables fast intersection queries for ray casting during RF propagation calculations.
"""

import json
import geopandas as gpd
from rtree import index
from shapely.geometry import Point, LineString
import pickle
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BUILDINGS_FILE = os.path.join(SCRIPT_DIR, '..', 'public', 'data', 'buildings.geojson')
INDEX_FILE = os.path.join(SCRIPT_DIR, '..', 'public', 'data', 'building_index.pkl')


class BuildingIndex:
    """R-tree spatial index for building data."""
    
    def __init__(self, buildings_file=None):
        self.buildings_file = buildings_file or BUILDINGS_FILE
        self.index = None
        self.buildings = None
        self.idx_to_building = {}
    
    def load_buildings(self):
        """Load building data from GeoJSON file."""
        print(f"Loading buildings from {self.buildings_file}")
        
        with open(self.buildings_file, 'r') as f:
            data = json.load(f)
        
        self.buildings = data['features']
        print(f"Loaded {len(self.buildings)} buildings")
        
        return self.buildings
    
    def build_index(self):
        """Build R-tree spatial index from building geometries."""
        if self.buildings is None:
            self.load_buildings()
        
        print("Building R-tree spatial index...")
        
        # Create R-tree index
        self.index = index.Index()
        
        # Add each building to the index
        for i, building in enumerate(self.buildings):
            geometry = building['geometry']
            
            if geometry['type'] == 'Polygon':
                coords = geometry['coordinates'][0]
                # Get bounding box
                min_x = min(c[0] for c in coords)
                min_y = min(c[1] for c in coords)
                max_x = max(c[0] for c in coords)
                max_y = max(c[1] for c in coords)
                
                # Insert into index
                self.index.insert(i, (min_x, min_y, max_x, max_y))
                self.idx_to_building[i] = building
        
        print(f"Built index with {len(self.idx_to_building)} buildings")
    
    def save_index(self, index_file=None):
        """Save index to file."""
        index_file = index_file or INDEX_FILE
        
        print(f"Saving index to {index_file}")
        
        with open(index_file, 'wb') as f:
            pickle.dump({
                'index': self.index,
                'buildings': self.buildings,
                'idx_to_building': self.idx_to_building,
            }, f)
        
        print("Index saved")
    
    def load_index(self, index_file=None):
        """Load index from file."""
        index_file = index_file or INDEX_FILE
        
        if not os.path.exists(index_file):
            print(f"Index file {index_file} not found, building new index")
            self.build_index()
            self.save_index()
            return
        
        print(f"Loading index from {index_file}")
        
        with open(index_file, 'rb') as f:
            data = pickle.load(f)
        
        self.index = data['index']
        self.buildings = data['buildings']
        self.idx_to_building = data['idx_to_building']
        
        print("Index loaded")
    
    def query_point(self, point):
        """
        Query buildings that contain a point.
        
        Args:
            point: (x, y) tuple or shapely Point
        
        Returns:
            List of building features that contain the point
        """
        if isinstance(point, Point):
            x, y = point.x, point.y
        else:
            x, y = point
        
        # Query index for potential candidates
        candidates = list(self.index.intersection((x, y, x, y)))
        
        # Check exact containment
        results = []
        for idx in candidates:
            building = self.idx_to_building[idx]
            geometry = building['geometry']
            
            if geometry['type'] == 'Polygon':
                coords = geometry['coordinates'][0]
                polygon = [(c[0], c[1]) for c in coords]
                
                # Simple point-in-polygon check
                from shapely.geometry import Polygon
                poly = Polygon(polygon)
                pt = Point(x, y)
                
                if poly.contains(pt):
                    results.append(building)
        
        return results
    
    def query_line(self, line_start, line_end):
        """
        Query buildings that intersect a line segment.
        
        Args:
            line_start: (x, y) tuple for line start
            line_end: (x, y) tuple for line end
        
        Returns:
            List of building features that intersect the line
        """
        x1, y1 = line_start
        x2, y2 = line_end
        
        # Bounding box of the line
        min_x = min(x1, x2)
        min_y = min(y1, y2)
        max_x = max(x1, x2)
        max_y = max(y1, y2)
        
        # Query index for potential candidates
        candidates = list(self.index.intersection((min_x, min_y, max_x, max_y)))
        
        # Check exact intersection
        results = []
        line = LineString([line_start, line_end])
        
        for idx in candidates:
            building = self.idx_to_building[idx]
            geometry = building['geometry']
            
            if geometry['type'] == 'Polygon':
                coords = geometry['coordinates'][0]
                polygon = [(c[0], c[1]) for c in coords]
                
                from shapely.geometry import Polygon
                poly = Polygon(polygon)
                
                if line.intersects(poly):
                    results.append(building)
        
        return results
    
    def get_building_at_point(self, point):
        """
        Get the building at a point (if any).
        Returns the first building that contains the point.
        """
        buildings = self.query_point(point)
        return buildings[0] if buildings else None


def main():
    # Create and build index
    building_idx = BuildingIndex()
    building_idx.load_index()
    
    # Test queries
    print("\nTesting queries...")
    
    # Test point query (Stuart Ave location)
    test_point = (-77.4602, 37.5483)
    buildings = building_idx.query_point(test_point)
    print(f"Point {test_point}: {len(buildings)} buildings")
    
    # Test line query
    line_start = (-77.4602, 37.5483)
    line_end = (-77.4500, 37.5500)
    buildings = building_idx.query_line(line_start, line_end)
    print(f"Line from {line_start} to {line_end}: {len(buildings)} buildings intersect")


if __name__ == '__main__':
    main()
