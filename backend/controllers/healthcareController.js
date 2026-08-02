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
        res.status(404);
        return next(new Error('Could not find location for the provided address'));
      }
      searchLat = geoResult.lat;
      searchLng = geoResult.lng;
    }

    if (!searchLat || !searchLng || isNaN(searchLat) || isNaN(searchLng)) {
      res.status(400);
      return next(new Error('Valid latitude and longitude or an address are required'));
    }

    const radiusKm = parseFloat(radius) || 5;
    const facilityType = type || 'all';

    const facilities = await healthcareService.findNearbyFacilities(searchLat, searchLng, radiusKm, facilityType);

    res.json({
      success: true,
      data: facilities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNearbyFacilities
};
