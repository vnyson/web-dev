"""
Material penetration loss database for RF propagation modeling.
Based on ITU-R P.2346 and NIST construction material attenuation data.
Values are interpolated for 462 MHz GMRS frequencies.
"""

# Material penetration loss in dB at 462 MHz
# Source: ITU-R P.2346 + interpolation from 900 MHz measurements
MATERIAL_LOSS_DB = {
    'brick': {
        'loss_db': 8.0,
        'description': 'Standard brick construction',
        'frequency_scaling': 1.0,  # Scaling factor for frequency dependence
    },
    'concrete': {
        'loss_db': 12.0,
        'description': 'Reinforced concrete',
        'frequency_scaling': 1.1,
    },
    'wood': {
        'loss_db': 3.0,
        'description': 'Wood frame with drywall',
        'frequency_scaling': 0.9,
    },
    'metal': {
        'loss_db': 25.0,
        'description': 'Metal siding or structure',
        'frequency_scaling': 1.2,
    },
    'glass': {
        'loss_db': 3.0,
        'description': 'Standard window glass',
        'frequency_scaling': 0.8,
    },
    'stone': {
        'loss_db': 10.0,
        'description': 'Stone masonry',
        'frequency_scaling': 1.0,
    },
}


def get_penetration_loss(material, frequency_mhz=462.0):
    """
    Get penetration loss for a material at a given frequency.
    
    Args:
        material: Material type string (e.g., 'brick', 'concrete')
        frequency_mhz: Frequency in MHz (default 462 for GMRS)
    
    Returns:
        Penetration loss in dB
    """
    if material not in MATERIAL_LOSS_DB:
        # Default to brick for unknown materials (Richmond residential)
        material = 'brick'
    
    material_data = MATERIAL_LOSS_DB[material]
    base_loss = material_data['loss_db']
    scaling = material_data['frequency_scaling']
    
    # Apply frequency scaling (simple model: loss increases with frequency)
    # Reference frequency is 462 MHz
    freq_ratio = frequency_mhz / 462.0
    scaled_loss = base_loss * (freq_ratio ** scaling)
    
    return scaled_loss


def get_material_info(material):
    """Get information about a material."""
    if material not in MATERIAL_LOSS_DB:
        material = 'brick'
    
    return MATERIAL_LOSS_DB[material]


def get_all_materials():
    """Get list of all available materials."""
    return list(MATERIAL_LOSS_DB.keys())


# Urban clutter factor (empirical adjustment for dense urban environments)
# This accounts for additional attenuation from trees, vehicles, etc.
URBAN_CLUTTER_LOSS_DB = 20.0  # dB


def get_urban_clutter_loss():
    """Get urban clutter loss factor."""
    return URBAN_CLUTTER_LOSS_DB


if __name__ == '__main__':
    # Test the material loss database
    print("Material Penetration Loss Database (462 MHz)")
    print("=" * 50)
    
    for material in get_all_materials():
        loss = get_penetration_loss(material)
        info = get_material_info(material)
        print(f"{material:12s}: {loss:5.1f} dB - {info['description']}")
    
    print(f"\nUrban Clutter Loss: {get_urban_clutter_loss()} dB")
