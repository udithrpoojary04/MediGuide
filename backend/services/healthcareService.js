const axios = require('axios');

class HealthcareService {
  constructor() {
    this.overpassUrl = 'https://overpass-api.de/api/interpreter';
    this.nominatimUrl = 'https://nominatim.openstreetmap.org/search';
    this.osrmTableUrl = 'http://router.project-osrm.org/table/v1/driving';
  }

  // Helper to calculate distance between two coordinates in km (Haversine straight-line fallback)
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

  // Build clean, human-readable address from all available OSM tags
  buildAddress(tags, facilityLat, facilityLng) {
    if (!tags) {
      return `Coordinates: ${facilityLat.toFixed(4)}, ${facilityLng.toFixed(4)}`;
    }

    if (tags['addr:full']) {
      return tags['addr:full'];
    }

    const parts = [];
    if (tags['addr:housename']) parts.push(tags['addr:housename']);
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:place']) parts.push(tags['addr:place']);
    if (tags['addr:suburb']) parts.push(tags['addr:suburb']);
    if (tags['addr:neighbourhood']) parts.push(tags['addr:neighbourhood']);

    const city = tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || tags['addr:municipality'];
    if (city) parts.push(city);

    const district = tags['addr:district'] || tags['addr:county'];
    if (district && district !== city) parts.push(district);

    if (tags['addr:state']) parts.push(tags['addr:state']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);

    if (parts.length > 0) {
      return parts.join(', ');
    }

    // Fallback to location hints in tags
    if (tags['is_in']) return tags['is_in'];
    if (tags['operator']) return `Operated by ${tags['operator']}`;

    return `Coordinates: ${facilityLat.toFixed(4)}, ${facilityLng.toFixed(4)}`;
  }

  // Calculate actual road driving distances and duration via Open Source Routing Machine (OSRM)
  async calculateRoadDistances(userLat, userLng, facilities) {
    if (!facilities || facilities.length === 0) return facilities;

    // Process in batches of up to 40 destinations per OSRM request
    const batchSize = 40;
    const updatedFacilities = [...facilities];

    for (let i = 0; i < updatedFacilities.length; i += batchSize) {
      const batch = updatedFacilities.slice(i, i + batchSize);
      
      // Construct coordinate string: user_lon,user_lat;dest1_lon,dest1_lat;dest2_lon,dest2_lat...
      const coordsString = [
        `${userLng},${userLat}`,
        ...batch.map(f => `${f.longitude},${f.latitude}`)
      ].join(';');

      try {
        const response = await axios.get(
          `${this.osrmTableUrl}/${coordsString}?sources=0&annotations=distance,duration`,
          { timeout: 8000 }
        );

        if (response.data && response.data.code === 'Ok' && response.data.distances?.[0]) {
          const distances = response.data.distances[0]; // distance in meters from source 0
          const durations = response.data.durations?.[0]; // duration in seconds from source 0

          batch.forEach((facility, batchIdx) => {
            const meterDist = distances[batchIdx + 1];
            const secDuration = durations ? durations[batchIdx + 1] : null;

            if (meterDist !== null && meterDist !== undefined && !isNaN(meterDist)) {
              facility.distance = parseFloat((meterDist / 1000).toFixed(2)); // in km
              facility.isRoadDistance = true;
              if (secDuration !== null && secDuration !== undefined && !isNaN(secDuration)) {
                const mins = Math.max(1, Math.round(secDuration / 60));
                facility.estimatedDuration = mins < 60 ? `${mins} min${mins > 1 ? 's' : ''}` : `${Math.floor(mins / 60)} hr ${mins % 60} min`;
              }
            } else {
              facility.isRoadDistance = false;
            }
          });
        }
      } catch (err) {
        console.warn('OSRM road routing unavailable, falling back to straight-line distance:', err.message);
        // Fallback is already initialized to Haversine distance
      }
    }

    return updatedFacilities;
  }

  async findNearbyFacilities(lat, lng, radiusKm = 5, type = 'all') {
    // Calculate bounding box for high-speed spatial R-Tree index in Overpass
    const deltaLat = radiusKm / 111.0;
    const deltaLng = radiusKm / (111.0 * Math.cos(lat * (Math.PI / 180)));

    const south = (lat - deltaLat).toFixed(5);
    const west = (lng - deltaLng).toFixed(5);
    const north = (lat + deltaLat).toFixed(5);
    const east = (lng + deltaLng).toFixed(5);
    
    let typeQuery = '';
    if (type === 'hospitals') {
      typeQuery = `node["amenity"="hospital"](${south},${west},${north},${east});
                   way["amenity"="hospital"](${south},${west},${north},${east});`;
    } else if (type === 'clinics') {
      typeQuery = `node["amenity"="clinic"](${south},${west},${north},${east});
                   node["amenity"="doctors"](${south},${west},${north},${east});
                   way["amenity"="clinic"](${south},${west},${north},${east});`;
    } else {
      // all
      typeQuery = `node["amenity"="hospital"](${south},${west},${north},${east});
                   node["amenity"="clinic"](${south},${west},${north},${east});
                   node["amenity"="doctors"](${south},${west},${north},${east});
                   way["amenity"="hospital"](${south},${west},${north},${east});
                   way["amenity"="clinic"](${south},${west},${north},${east});`;
    }

    const query = `
      [out:json][timeout:15];
      (
        ${typeQuery}
      );
      out center;
    `;

    // Active, high-performance Overpass API mirror pool
    const overpassEndpoints = [
      'https://lz4.overpass-api.de/api/interpreter',
      'https://z.overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://overpass-api.de/api/interpreter'
    ];

    let response = null;
    let lastError = null;

    for (const endpoint of overpassEndpoints) {
      try {
        response = await axios.get(endpoint, {
          params: { data: query },
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'MediGuideAI-Healthcare/1.0 (contact@mediguide.ai)'
          },
          timeout: 10000
        });
        if (response?.data?.elements) {
          break; // successfully fetched
        }
      } catch (err) {
        lastError = err;
        console.warn(`Overpass endpoint ${endpoint} failed (${err.message}), trying next mirror...`);
      }
    }

    if (!response || !response.data) {
      console.error('All Overpass API Endpoints Failed:', lastError?.message);
      throw new Error('Healthcare service currently busy. Please try again in a few moments.');
    }

    try {
      const elements = response.data.elements || [];
      
      let facilities = elements.map(el => {
        const isWay = el.type === 'way' || el.type === 'relation';
        const facilityLat = isWay ? el.center.lat : el.lat;
        const facilityLng = isWay ? el.center.lon : el.lon;
        const straightDistance = this.calculateDistance(lat, lng, facilityLat, facilityLng);
        
        return {
          id: el.id,
          name: el.tags?.name || 'Unnamed Facility',
          type: el.tags?.amenity || 'Healthcare Facility',
          latitude: facilityLat,
          longitude: facilityLng,
          address: this.buildAddress(el.tags, facilityLat, facilityLng),
          phone: el.tags?.phone || el.tags?.['contact:phone'] || 'Phone unlisted',
          website: el.tags?.website || el.tags?.['contact:website'] || 'Website unlisted',
          distance: parseFloat(straightDistance.toFixed(2)),
          isRoadDistance: false
        };
      });

      // Calculate actual road driving distances via free OSRM Routing Machine
      facilities = await this.calculateRoadDistances(lat, lng, facilities);

      // Sort by distance (road distance when available, otherwise straight-line)
      return facilities.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Overpass API Error:', error.message);
      throw new Error('Failed to fetch nearby facilities from Overpass API');
    }
  }

  async geocodeAddress(address) {
    if (!address || !address.trim()) return null;
    const cleanAddress = address.trim();

    // 1. Try Primary Nominatim
    try {
      const response = await axios.get(this.nominatimUrl, {
        params: {
          q: cleanAddress,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'MediGuideAI-Healthcare/1.0 (contact@mediguide.ai)'
        },
        timeout: 8000
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon),
          displayName: response.data[0].display_name
        };
      }
    } catch (error) {
      console.warn('Primary Nominatim Geocode Error:', error.message);
    }

    // 2. Try Nominatim with region suffix if query is a single word
    if (!cleanAddress.includes(',')) {
      try {
        const response = await axios.get(this.nominatimUrl, {
          params: {
            q: `${cleanAddress}, Karnataka, India`,
            format: 'json',
            limit: 1
          },
          headers: {
            'User-Agent': 'MediGuideAI-Healthcare/1.0 (contact@mediguide.ai)'
          },
          timeout: 8000
        });

        if (response.data && response.data.length > 0) {
          return {
            lat: parseFloat(response.data[0].lat),
            lng: parseFloat(response.data[0].lon),
            displayName: response.data[0].display_name
          };
        }
      } catch (error) {
        console.warn('Suffix Nominatim Geocode Error:', error.message);
      }
    }

    // 3. Try Photon Komoot OSM geocoder as fallback
    try {
      const response = await axios.get('https://photon.komoot.io/api/', {
        params: { q: cleanAddress, limit: 1 },
        timeout: 6000
      });

      if (response.data?.features?.length > 0) {
        const feat = response.data.features[0];
        const [lon, lat] = feat.geometry.coordinates;
        return {
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          displayName: feat.properties.name || feat.properties.city || cleanAddress
        };
      }
    } catch (error) {
      console.warn('Photon Geocode Fallback Error:', error.message);
    }

    return null;
  }
}

module.exports = new HealthcareService();
