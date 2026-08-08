const axios = require('axios');
const hs = require('./services/healthcareService');

async function test() {
  const geo = await hs.geocodeAddress('Kuntady');
  console.log('1. Nominatim Geocode for Kuntady:', geo);

  // Search facilities around Kuntady with radius 15km
  const facs = await hs.findNearbyFacilities(geo.lat, geo.lng, 15, 'all');
  console.log('2. Facilities found:', facs.length);
  facs.forEach(f => {
    console.log(`- ${f.name} (${f.type}): lat=${f.latitude}, lng=${f.longitude}, dist=${f.distance}km, dur=${f.estimatedDuration}, isRoad=${f.isRoadDistance}`);
  });
}

test().catch(console.error);
