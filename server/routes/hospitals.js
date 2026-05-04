const express = require('express');
const router  = express.Router();

async function fetchFromOverpass(lat, lng, radiusMeters = 5000) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
      node["amenity"="doctors"](around:${radiusMeters},${lat},${lng});
      node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="hospital"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="clinic"](around:${radiusMeters},${lat},${lng});
      node["healthcare"="doctor"](around:${radiusMeters},${lat},${lng});
    );
    out center;
  `;

  // ✅ Fixed: Added proper User-Agent header — Overpass requires this
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method:  'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent':   'MediAssistPro/2.0 (medical-app; contact@mediassist.app)',
      'Accept':       'application/json',
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }
  return response.json();
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R  = 6371000;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a  = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function formatDistance(m) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(1)} km`;
}

function classifyType(tags) {
  const a = tags.amenity || '', h = tags.healthcare || '';
  if (a === 'hospital' || h === 'hospital') return 'hospital';
  if (a === 'pharmacy')                     return 'pharmacy';
  return 'clinic';
}

function transformElement(el, userLat, userLng) {
  const tags = el.tags || {};
  const elat = el.lat || el.center?.lat;
  const elng = el.lon || el.center?.lon;
  if (!elat || !elng) return null;

  const dist = haversineDistance(userLat, userLng, elat, elng);
  const type = classifyType(tags);

  const addrParts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'] || tags['addr:neighbourhood'],
    tags['addr:city']   || tags['addr:district'],
    tags['addr:state'],
  ].filter(Boolean);

  return {
    id:            el.id,
    name:          tags.name || tags['name:en'] || `${type.charAt(0).toUpperCase()+type.slice(1)}`,
    type,
    specialty:     tags.healthcare_specialty || tags.speciality || (type === 'hospital' ? 'Multi-Speciality' : type === 'pharmacy' ? 'Pharmacy' : 'General'),
    address:       addrParts.length > 0 ? addrParts.join(', ') : 'Address not available',
    phone:         tags.phone || tags['contact:phone'] || tags['contact:mobile'] || null,
    hours:         tags.opening_hours || (type === 'hospital' ? 'Open 24 Hours' : 'Check with facility'),
    open:          type === 'hospital',
    fee:           type === 'pharmacy' ? 'Medicines only' : type === 'hospital' ? '₹200–1000' : '₹100–500',
    rating:        null,
    lat:           elat,
    lng:           elng,
    distance:      dist,
    distanceLabel: formatDistance(dist),
    emoji:         { hospital:'🏥', clinic:'🩺', pharmacy:'💊' }[type] || '🏥',
    tags:          [type === 'hospital' ? 'Emergency' : '', tags.wheelchair === 'yes' ? 'Wheelchair' : ''].filter(Boolean),
    website:       tags.website || tags['contact:website'] || null,
    emergency:     type === 'hospital',
  };
}

// GET /api/hospitals?lat=23.69&lng=86.96&radius=5000
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 5000, type, open } = req.query;

    if (!lat || !lng) {
      return res.json({ success: true, count: 0, data: [], message: 'Provide lat and lng' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    const osm = await fetchFromOverpass(userLat, userLng, Math.min(parseInt(radius), 20000));

    let places = osm.elements
      .map(el => transformElement(el, userLat, userLng))
      .filter(Boolean)
      .filter(p => p.name);

    if (type)  places = places.filter(p => p.type === type);
    if (open)  places = places.filter(p => p.open);

    places.sort((a, b) => a.distance - b.distance);
    places = places.slice(0, 30);

    res.json({ success: true, count: places.length, data: places, userLocation: { lat: userLat, lng: userLng } });
  } catch (err) {
    console.error('Hospital fetch error:', err.message);
    res.status(500).json({ success: false, message: 'Could not fetch nearby facilities.', data: [] });
  }
});

module.exports = router;