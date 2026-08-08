const healthcareService = require('../services/healthcareService');

// @desc    Get nearby healthcare facilities
// @route   GET /api/healthcare/nearby
// @access  Private
const getNearbyFacilities = async (req, res, next) => {
  try {
    const { lat, lng, radius, type, address } = req.query;

    let searchLat = parseFloat(lat);
    let searchLng = parseFloat(lng);

    // If address is provided instead of lat/lng, geocode it
    if (address && (!lat || !lng)) {
      const geoResult = await healthcareService.geocodeAddress(address);
      if (!geoResult) {
        return res.status(404).json({
          success: false,
          error: `Could not find coordinates for "${address}". Try adding a city/state name (e.g. "${address}, Karnataka") or use your device GPS location.`
        });
      }
      searchLat = geoResult.lat;
      searchLng = geoResult.lng;
    }

    if (!searchLat || !searchLng || isNaN(searchLat) || isNaN(searchLng)) {
      return res.status(400).json({
        success: false,
        error: 'Valid latitude and longitude or an address are required'
      });
    }

    const radiusKm = parseFloat(radius) || 5;
    const facilityType = type || 'all';

    const facilities = await healthcareService.findNearbyFacilities(searchLat, searchLng, radiusKm, facilityType);

    res.json({
      success: true,
      searchCenter: {
        lat: searchLat,
        lng: searchLng
      },
      data: facilities
    });
  } catch (error) {
    console.error('Healthcare Controller Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error while fetching healthcare facilities'
    });
  }
};

module.exports = {
  getNearbyFacilities
};
