const axios = require('axios');

class HealthcareService {
  constructor() {
    this.overpassUrl = 'https://overpass-api.de/api/interpreter';
    this.nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  }

  // Helper to calculate distance between two coordinates in km (Haversine)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  async findNearbyFacilities(lat, lng, radiusKm = 5, type = 'all') {
    // Build Overpass QL query
    // radius in meters for Overpass
    const radiusMeters = radiusKm * 1000;
    
    let typeFilter = '';
    if (type === 'hospitals') {
      typeFilter = `node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
                    way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
                    relation["amenity"="hospital"](around:${radiusMeters},${lat},${lng});`;
    } else if (type === 'clinics') {
      typeFilter = `node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
                    way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
                    node["amenity"="doctors"](around:${radiusMeters},${lat},${lng});`;
    } else {
      // all
      typeFilter = `node["amenity"~"hospital|clinic|doctors"](around:${radiusMeters},${lat},${lng});
                    way["amenity"~"hospital|clinic"](around:${radiusMeters},${lat},${lng});`;
    }

    const query = `
      [out:json][timeout:25];
      (
        ${typeFilter}
      );
      out center;
    `;

    try {
      const response = await axios.get(this.overpassUrl, {
        params: { data: query },
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'MediGuideAI/1.0'
        },
        timeout: 25000
      });

      const elements = response.data.elements || [];
      
      const facilities = elements.map(el => {
        const isWay = el.type === 'way' || el.type === 'relation';
        const facilityLat = isWay ? el.center.lat : el.lat;
        const facilityLng = isWay ? el.center.lon : el.lon;
        const distance = this.calculateDistance(lat, lng, facilityLat, facilityLng);
        
        return {
          id: el.id,
          name: el.tags?.name || 'Unnamed Facility',
          type: el.tags?.amenity || 'Healthcare Facility',
          latitude: facilityLat,
          longitude: facilityLng,
          address: el.tags?.['addr:street'] 
            ? `${el.tags['addr:housenumber'] ? el.tags['addr:housenumber'] + ' ' : ''}${el.tags['addr:street']}, ${el.tags['addr:city'] || ''}`
            : 'Address unlisted',
          phone: el.tags?.phone || 'Phone unlisted',
          website: el.tags?.website || 'Website unlisted',
          distance: parseFloat(distance.toFixed(2))
        };
      });

      // Sort by distance
      return facilities.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Overpass API Error:', error.message);
      throw new Error('Failed to fetch nearby facilities from Overpass API');
    }
  }

  async geocodeAddress(address) {
    try {
      const response = await axios.get(this.nominatimUrl, {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'MediGuide AI App'
        }
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon),
          displayName: response.data[0].display_name
        };
      }
      return null;
    } catch (error) {
      console.error('Nominatim API Error:', error.message);
      throw new Error('Failed to geocode address');
    }
  }
}

module.exports = new HealthcareService();
