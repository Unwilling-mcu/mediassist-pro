const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');

// ── OpenStreetMap Overpass API ──
// FREE — no API key needed, works anywhere in the world
// Finds real hospitals, clinics, doctors near any coordinates

async function fetchFromOverpass(lat, lng, radiusMeters = 5000) {
  // Overpass QL query — finds hospitals, clinics, doctors, pharmacies
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      node["amenity"="doctors"](around:${radiusMeters},${lat},${lng});
      way["amenity"="doctors"](around:${radiusMeters},${lat},${lng});
      node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="hospital"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="clinic"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="doctor"](around:${radiusMeters},${lat},${lng});
    );
    out center;
  `;

  const url = 'https://overpass-api.de/api/interpreter';
  const response = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);
  return response.json();
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a  = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  const d  = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return d;
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function classifyType(tags) {
  const amenity    = tags.amenity    || '';
  const healthcare = tags.healthcare || '';
  if (amenity === 'hospital' || healthcare === 'hospital') return 'hospital';
  if (amenity === 'pharmacy')                               return 'pharmacy';
  if (amenity === 'doctors' || healthcare === 'doctor')     return 'clinic';
  return 'clinic';
}

function getEmoji(type) {
  return { hospital:'🏥', clinic:'🩺', pharmacy:'💊' }[type] || '🏥';
}

function transformElement(el, userLat, userLng) {
  const tags = el.tags || {};
  const elat = el.lat || el.center?.lat;
  const elng = el.lon || el.center?.lon;
  if (!elat || !elng) return null;

  const dist = haversineDistance(userLat, userLng, elat, elng);
  const type = classifyType(tags);

  // Build phone number
  const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || null;

  // Build address
  const addrParts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'] || tags['addr:neighbourhood'],
    tags['addr:city']   || tags['addr:district'],
    tags['addr:state'],
  ].filter(Boolean);
  const address = addrParts.length > 0 ? addrParts.join(', ') : 'Address not available';

  // Opening hours
  const hours = tags.opening_hours || (type === 'hospital' ? 'Open 24 Hours' : 'Check with facility');

  return {
    id:       el.id,
    name:     tags.name || tags['name:en'] || `${type.charAt(0).toUpperCase()+type.slice(1)} (unnamed)`,
    type,
    specialty: tags.healthcare_specialty || tags.speciality || (type === 'hospital' ? 'Multi-Speciality' : type === 'pharmacy' ? 'Pharmacy' : 'General'),
    address,
    phone,
    hours,
    open:     type === 'hospital', // hospitals default open 24h
    fee:      type === 'pharmacy' ? 'Medicines only' : type === 'hospital' ? '₹200–1000' : '₹100–500',
    rating:   null,
    reviews:  null,
    lat:      elat,
    lng:      elng,
    distance: dist,
    distanceLabel: formatDistance(dist),
    emoji:    getEmoji(type),
    tags:     [type === 'hospital' ? 'Emergency' : '', tags.wheelchair === 'yes' ? 'Wheelchair' : '', tags['healthcare:speciality'] || ''].filter(Boolean),
    website:  tags.website || tags['contact:website'] || null,
    emergency: tags.emergency === 'yes' || type === 'hospital',
    osmId:    el.id,
  };
}

// GET /api/hospitals?lat=23.69&lng=86.96&radius=5000&type=hospital
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 5000, type, open } = req.query;

    // If no coordinates — return empty (frontend will request with coords)
    if (!lat || !lng) {
      return res.json({ success: true, count: 0, data: [], message: 'Provide lat and lng query params' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    // Fetch from OpenStreetMap
    const osm = await fetchFromOverpass(userLat, userLng, Math.min(parseInt(radius), 20000));

    let places = osm.elements
      .map(el => transformElement(el, userLat, userLng))
      .filter(Boolean)
      .filter(p => p.name && !p.name.includes('unnamed') || p.type === 'hospital');

    // Apply filters
    if (type)  places = places.filter(p => p.type === type);
    if (open)  places = places.filter(p => p.open);

    // Sort by distance
    places.sort((a, b) => a.distance - b.distance);

    // Limit to 30 results
    places = places.slice(0, 30);

    res.json({ success: true, count: places.length, data: places, userLocation: { lat: userLat, lng: userLng } });
  } catch (err) {
    console.error('Hospital fetch error:', err.message);
    // Return empty on error — frontend shows fallback message
    res.status(500).json({ success: false, message: 'Could not fetch nearby facilities. Please try again.', data: [] });
  }
});

// GET /api/hospitals/:id (OSM node details)
router.get('/:id', async (req, res) => {
  try {
    const query = `[out:json];(node(${req.params.id});way(${req.params.id}););out;`;
    const url   = 'https://overpass-api.de/api/interpreter';
    const resp  = await fetch(url, { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:`data=${encodeURIComponent(query)}` });
    const data  = await resp.json();
    const el    = data.elements?.[0];
    if (!el) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, data: transformElement(el, 0, 0) });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

module.exports = router;