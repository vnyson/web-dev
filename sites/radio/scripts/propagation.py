"""
RF propagation calculations for GMRS frequencies.
Implements Free Space Path Loss, building penetration, diffraction, and terrain effects.
"""

import math
import numpy as np
from shapely.geometry import Point, LineString
from building_index import BuildingIndex
from material_loss import get_penetration_loss, get_urban_clutter_loss


def calculate_fspl(distance_km, frequency_mhz=462.0):
    """
    Calculate Free Space Path Loss (FSPL).
    
    Formula: FSPL(dB) = 20*log10(d) + 20*log10(f) + 32.44
    Where d = distance in km, f = frequency in MHz
    
    Args:
        distance_km: Distance in kilometers
        frequency_mhz: Frequency in MHz (default 462 for GMRS)
    
    Returns:
        Path loss in dB
    """
    if distance_km <= 0:
        return 0.0
    
    fspl = 20 * math.log10(distance_km) + 20 * math.log10(frequency_mhz) + 32.44
    return fspl


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate great-circle distance between two points using Haversine formula.
    
    Args:
        lat1, lon1: Latitude and longitude of point 1 (degrees)
        lat2, lon2: Latitude and longitude of point 2 (degrees)
    
    Returns:
        Distance in kilometers
    """
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    # Haversine formula
    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(delta_lon / 2) ** 2)
    c = 2 * math.asin(math.sqrt(a))
    
    # Earth's radius in km
    r = 6371.0
    
    return r * c


def calculate_bearing(lat1, lon1, lat2, lon2):
    """
    Calculate bearing from point 1 to point 2.
    
    Args:
        lat1, lon1: Latitude and longitude of point 1 (degrees)
        lat2, lon2: Latitude and longitude of point 2 (degrees)
    
    Returns:
        Bearing in degrees (0 = North, 90 = East)
    """
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lon = math.radians(lon2 - lon1)
    
    y = math.sin(delta_lon) * math.cos(lat2_rad)
    x = (math.cos(lat1_rad) * math.sin(lat2_rad) -
         math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(delta_lon))
    
    bearing = math.atan2(y, x)
    bearing = math.degrees(bearing)
    bearing = (bearing + 360) % 360
    
    return bearing


def cast_ray_through_buildings(tx_lat, tx_lon, rx_lat, rx_lon, building_index):
    """
    Cast a ray from transmitter to receiver and count building intersections.
    
    Args:
        tx_lat, tx_lon: Transmitter coordinates
        rx_lat, rx_lon: Receiver coordinates
        building_index: BuildingIndex instance
    
    Returns:
        List of buildings intersected by the ray
    """
    tx_point = (tx_lon, tx_lat)
    rx_point = (rx_lon, rx_lat)
    
    # Query buildings that intersect the line
    buildings = building_index.query_line(tx_point, rx_point)
    
    return buildings


def calculate_building_penetration_loss(tx_lat, tx_lon, rx_lat, rx_lon, 
                                       building_index, frequency_mhz=462.0,
                                       indoor=False):
    """
    Calculate total building penetration loss along the ray path.
    
    Args:
        tx_lat, tx_lon: Transmitter coordinates
        rx_lat, rx_lon: Receiver coordinates
        building_index: BuildingIndex instance
        frequency_mhz: Frequency in MHz
        indoor: Whether receiver is indoors (adds one extra penetration)
    
    Returns:
        Total penetration loss in dB
    """
    # Cast ray through buildings
    buildings = cast_ray_through_buildings(tx_lat, tx_lon, rx_lat, rx_lon, building_index)
    
    total_loss = 0.0
    
    # Sum penetration losses for each building
    for building in buildings:
        material = building['properties'].get('material', 'brick')
        loss = get_penetration_loss(material, frequency_mhz)
        total_loss += loss
    
    # If receiver is indoors, add one extra penetration for the building they're in
    if indoor:
        rx_building = building_index.get_building_at_point((rx_lon, rx_lat))
        if rx_building:
            material = rx_building['properties'].get('material', 'brick')
            loss = get_penetration_loss(material, frequency_mhz)
            total_loss += loss
    
    return total_loss


def calculate_diffraction_loss(tx_height, rx_height, distance_km, frequency_mhz=462.0):
    """
    Calculate single-edge diffraction loss using ITU-R P.526.
    Simplified knife-edge diffraction model.
    
    Args:
        tx_height: Transmitter height above ground (meters)
        rx_height: Receiver height above ground (meters)
        distance_km: Distance between TX and RX (km)
        frequency_mhz: Frequency in MHz
    
    Returns:
        Diffraction loss in dB
    """
    # Calculate Fresnel zone parameter
    wavelength = 300.0 / frequency_mhz  # wavelength in meters
    distance_m = distance_km * 1000.0
    
    # Effective height (simplified - assumes single obstacle at midpoint)
    h_eff = (tx_height + rx_height) / 2.0
    
    # Fresnel-Kirchhoff diffraction parameter
    if h_eff > 0:
        v = h_eff * math.sqrt(2 / (wavelength * distance_m))
    else:
        v = 0
    
    # Diffraction loss (approximate formula)
    if v < -0.78:
        loss = 0.0
    elif v < 0:
        loss = 6.0 + 20.0 * math.log10(0.5 + 0.62 * v)
    else:
        loss = 6.0 + 20.0 * math.log10(v + math.sqrt(v ** 2 + 1))
    
    return max(0.0, loss)


def calculate_terrain_loss(tx_lat, tx_lon, tx_height, rx_lat, rx_lon, rx_height,
                           terrain_data, distance_km):
    """
    Calculate terrain-based path loss using terrain profile.
    Simplified implementation - uses terrain elevation difference.
    
    Args:
        tx_lat, tx_lon: Transmitter coordinates
        tx_height: Transmitter height above ground (meters)
        rx_lat, rx_lon: Receiver coordinates
        rx_height: Receiver height above ground (meters)
        terrain_data: Terrain elevation data (GeoTIFF or array)
        distance_km: Distance between TX and RX (km)
    
    Returns:
        Terrain loss in dB
    """
    # For now, simplified: use elevation difference
    # In full implementation, would extract terrain profile along path
    
    # This is a placeholder - full implementation would use rasterio
    # to extract terrain profile along the great-circle path
    
    # Simplified: assume flat terrain for now
    return 0.0


def calculate_total_path_loss(tx_lat, tx_lon, tx_height, tx_power_dbm,
                               rx_lat, rx_lon, rx_height, indoor,
                               building_index, terrain_data=None,
                               frequency_mhz=462.0):
    """
    Calculate total path loss from transmitter to receiver.
    
    Args:
        tx_lat, tx_lon: Transmitter coordinates
        tx_height: Transmitter height above ground (meters)
        tx_power_dbm: Transmitter power in dBm
        rx_lat, rx_lon: Receiver coordinates
        rx_height: Receiver height above ground (meters)
        indoor: Whether receiver is indoors
        building_index: BuildingIndex instance
        terrain_data: Terrain elevation data (optional)
        frequency_mhz: Frequency in MHz
    
    Returns:
        Tuple of (total_path_loss_db, rssi_dbm)
    """
    # Calculate distance
    distance_km = calculate_distance(tx_lat, tx_lon, rx_lat, rx_lon)
    
    # Free space path loss
    fspl = calculate_fspl(distance_km, frequency_mhz)
    
    # Building penetration loss
    building_loss = calculate_building_penetration_loss(
        tx_lat, tx_lon, rx_lat, rx_lon, building_index, frequency_mhz, indoor
    )
    
    # Diffraction loss
    diffraction_loss = calculate_diffraction_loss(
        tx_height, rx_height, distance_km, frequency_mhz
    )
    
    # Terrain loss
    terrain_loss = 0.0
    if terrain_data is not None:
        terrain_loss = calculate_terrain_loss(
            tx_lat, tx_lon, tx_height, rx_lat, rx_lon, rx_height,
            terrain_data, distance_km
        )
    
    # Urban clutter loss
    clutter_loss = get_urban_clutter_loss()
    
    # Total path loss
    total_loss = fspl + building_loss + diffraction_loss + terrain_loss + clutter_loss
    
    # Calculate RSSI
    rssi = tx_power_dbm - total_loss
    
    return total_loss, rssi


def watts_to_dbm(watts):
    """Convert watts to dBm."""
    if watts <= 0:
        return -100.0  # Minimum reasonable value
    return 10 * math.log10(watts * 1000)


def dbm_to_watts(dbm):
    """Convert dBm to watts."""
    return 10 ** ((dbm - 30) / 10)


if __name__ == '__main__':
    # Test FSPL calculation
    print("Testing FSPL calculation...")
    distances = [0.1, 0.5, 1.0, 2.0, 5.0]  # km
    for d in distances:
        fspl = calculate_fspl(d)
        print(f"Distance: {d:4.1f} km, FSPL: {fspl:6.2f} dB")
    
    # Test distance calculation
    print("\nTesting distance calculation...")
    d = calculate_distance(37.5483, -77.4602, 37.5500, -77.4500)
    print(f"Distance: {d:.4f} km")
    
    # Test power conversion
    print("\nTesting power conversion...")
    for watts in [1, 5, 10, 50]:
        dbm = watts_to_dbm(watts)
        back = dbm_to_watts(dbm)
        print(f"{watts:2d} W = {dbm:6.2f} dBm (back: {back:.2f} W)")
