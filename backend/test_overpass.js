const axios = require('axios');

async function testMirror(url) {
  const lat = 13.2462941;
  const lng = 74.9035859;
  const rKm = 20;

  const deltaLat = rKm / 111.0;
  const deltaLng = rKm / (111.0 * Math.cos(lat * (Math.PI / 180)));

  const s = (lat - deltaLat).toFixed(4);
  const w = (lng - deltaLng).toFixed(4);
  const n = (lat + deltaLat).toFixed(4);
  const e = (lng + deltaLng).toFixed(4);

  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](${s},${w},${n},${e});
      node["amenity"="clinic"](${s},${w},${n},${e});
      node["amenity"="doctors"](${s},${w},${n},${e});
      way["amenity"="hospital"](${s},${w},${n},${e});
      way["amenity"="clinic"](${s},${w},${n},${e});
    );
    out center;
  `;

  const start = Date.now();
  try {
    const res = await axios.get(url, {
      params: { data: query },
      headers: {
        'User-Agent': 'MediGuideAI-Healthcare/1.0 (contact@mediguide.ai)'
      },
      timeout: 10000
    });
    console.log(`[SUCCESS] ${url} -> ${res.data.elements.length} elements in ${Date.now() - start}ms`);
    return true;
  } catch (err) {
    console.log(`[FAILED] ${url} -> ${err.message} in ${Date.now() - start}ms`);
    return false;
  }
}

async function run() {
  const mirrors = [
    'https://lz4.overpass-api.de/api/interpreter',
    'https://z.overpass-api.de/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  for (const m of mirrors) {
    await testMirror(m);
  }
}

run();
