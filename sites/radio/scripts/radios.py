"""
Radio hardware database for GMRS equipment.
Contains specifications for common handheld and mobile radios.
"""

# Radio hardware specifications
RADIOS = {
    'tidradio_h3': {
        'name': 'Tidradio H3',
        'type': 'handheld',
        'power_watts': 5.0,
        'power_dbm': 37.0,  # 10*log10(5*1000)
        'antenna_gain_dbi': 2.0,  # Typical stock antenna
        'sensitivity_dbm': -120.0,  # Typical for GMRS handhelds
        'frequency_range': '462-467 MHz',
        'description': '5W GMRS handheld with dual-band capability',
    },
    'baofeng_uv5r': {
        'name': 'Baofeng UV-5R',
        'type': 'handheld',
        'power_watts': 5.0,
        'power_dbm': 37.0,
        'antenna_gain_dbi': 0.0,  # Stock rubber duck
        'sensitivity_dbm': -118.0,
        'frequency_range': '136-174 MHz, 400-520 MHz',
        'description': 'Popular dual-band handheld',
    },
    'midland_mxt115': {
        'name': 'Midland MXT115',
        'type': 'mobile',
        'power_watts': 15.0,
        'power_dbm': 41.8,  # 10*log10(15*1000)
        'antenna_gain_dbi': 3.0,  # Typical mobile antenna
        'sensitivity_dbm': -122.0,
        'frequency_range': '462-467 MHz',
        'description': '15W GMRS mobile radio',
    },
    'midland_mxt575': {
        'name': 'Midland MXT575',
        'type': 'mobile',
        'power_watts': 50.0,
        'power_dbm': 47.0,  # 10*log10(50*1000)
        'antenna_gain_dbi': 3.0,
        'sensitivity_dbm': -122.0,
        'frequency_range': '462-467 MHz',
        'description': '50W GMRS mobile radio (max legal power)',
    },
    'wouxun_kg935g': {
        'name': 'Wouxun KG-935G',
        'type': 'handheld',
        'power_watts': 5.0,
        'power_dbm': 37.0,
        'antenna_gain_dbi': 2.0,
        'sensitivity_dbm': -120.0,
        'frequency_range': '462-467 MHz',
        'description': 'GMRS-specific handheld with NOAA weather',
    },
    'custom': {
        'name': 'Custom Radio',
        'type': 'custom',
        'power_watts': 5.0,
        'power_dbm': 37.0,
        'antenna_gain_dbi': 0.0,
        'sensitivity_dbm': -120.0,
        'frequency_range': '462-467 MHz',
        'description': 'User-configurable radio parameters',
    },
}


def get_radio(radio_id):
    """
    Get radio specifications by ID.
    
    Args:
        radio_id: Radio identifier (e.g., 'tidradio_h3')
    
    Returns:
        Dictionary with radio specifications
    """
    if radio_id not in RADIOS:
        radio_id = 'custom'
    
    return RADIOS[radio_id].copy()


def get_all_radios():
    """Get list of all available radios."""
    return list(RADIOS.keys())


def get_radio_names():
    """Get mapping of radio IDs to names."""
    return {rid: r['name'] for rid, r in RADIOS.items()}


def calculate_eirp(power_dbm, antenna_gain_dbi):
    """
    Calculate Effective Isotropic Radiated Power (EIRP).
    
    Args:
        power_dbm: Transmitter power in dBm
        antenna_gain_dbi: Antenna gain in dBi
    
    Returns:
        EIRP in dBm
    """
    return power_dbm + antenna_gain_dbi


def calculate_received_power(tx_power_dbm, antenna_gain_dbi, path_loss_db):
    """
    Calculate received power at receiver.
    
    Args:
        tx_power_dbm: Transmitter power in dBm
        antenna_gain_dbi: Antenna gain in dBi
        path_loss_db: Total path loss in dB
    
    Returns:
        Received power in dBm
    """
    eirp = calculate_eirp(tx_power_dbm, antenna_gain_dbi)
    rx_power = eirp - path_loss_db
    return rx_power


def is_signal_usable(rx_power_dbm, sensitivity_dbm):
    """
    Check if received signal is above sensitivity threshold.
    
    Args:
        rx_power_dbm: Received power in dBm
        sensitivity_dbm: Receiver sensitivity in dBm
    
    Returns:
        True if signal is usable, False otherwise
    """
    return rx_power_dbm >= sensitivity_dbm


def get_signal_quality(rx_power_dbm, sensitivity_dbm):
    """
    Get signal quality rating based on received power.
    
    Args:
        rx_power_dbm: Received power in dBm
        sensitivity_dbm: Receiver sensitivity in dBm
    
    Returns:
        Quality rating (1-5) and description
    """
    margin = rx_power_dbm - sensitivity_dbm
    
    if margin >= 20:
        return 5, 'Excellent'
    elif margin >= 10:
        return 4, 'Good'
    elif margin >= 3:
        return 3, 'Usable'
    elif margin >= 0:
        return 2, 'Weak'
    else:
        return 1, 'Unusable'


if __name__ == '__main__':
    # Test radio database
    print("Radio Hardware Database")
    print("=" * 50)
    
    for radio_id in get_all_radios():
        radio = get_radio(radio_id)
        print(f"\n{radio['name']} ({radio_id})")
        print(f"  Type: {radio['type']}")
        print(f"  Power: {radio['power_watts']}W ({radio['power_dbm']} dBm)")
        print(f"  Antenna Gain: {radio['antenna_gain_dbi']} dBi")
        print(f"  Sensitivity: {radio['sensitivity_dbm']} dBm")
        print(f"  {radio['description']}")
    
    # Test EIRP calculation
    print("\n\nEIRP Calculation Examples")
    print("=" * 50)
    for radio_id in ['tidradio_h3', 'midland_mxt575']:
        radio = get_radio(radio_id)
        eirp = calculate_eirp(radio['power_dbm'], radio['antenna_gain_dbi'])
        print(f"{radio['name']}: {eirp:.1f} dBm EIRP")
