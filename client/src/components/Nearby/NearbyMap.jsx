import React, { useState, useEffect, useRef } from 'react';
import { hospitalAPI } from '../../api';

export default function NearbyMap() {
  const [hospitals,     setHospitals]     = useState([]);
  const [selected,      setSelected]      = useState(null);
  const [filter,        setFilter]        = useState('all');
  const [loading,       setLoading]       = useState(true);
  const [locError,      setLocError]      = useState('');
  const [userLocation,  setUserLocation]  = useState(null);
  const [locStatus,     setLocStatus]     = useState('requesting'); // requesting | granted | denied
  const [radius,        setRadius]        = useState(5000);
  const [search,        setSearch]        = useState('');
  const mapRef      = useRef(null);
  const leafletMap  = useRef(null);
  const markersRef  = useRef({});
  const userMarker  = useRef(null);

  // ── Step 1: Get user location on mount ──
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError('Your browser does not support location access.');
      setLocStatus('denied');
      setLoading(false);
      return;
    }

    setLocStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocStatus('granted');
        fetchHospitals(loc.lat, loc.lng, radius);
      },
      (err) => {
        setLocStatus('denied');
        setLoading(false);
        if (err.code === 1) setLocError('Location access denied. Please allow location in browser settings and refresh.');
        else if (err.code === 2) setLocError('Location unavailable. Check your device GPS.');
        else setLocError('Location request timed out. Please refresh and try again.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  const fetchHospitals = async (lat, lng, rad = radius) => {
    setLoading(true);
    try {
      const { data } = await hospitalAPI.getAll({ lat, lng, radius: rad });
      setHospitals(data.data || []);
      if (data.data?.length === 0) setLocError(`No hospitals found within ${rad/1000}km. Try increasing radius.`);
      else setLocError('');
    } catch (err) {
      setLocError('Failed to load hospitals. Check your internet connection.');
    }
    setLoading(false);
  };

  // ── Step 2: Init map when location granted ──
  useEffect(() => {
    if (!userLocation || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, { zoomControl: false })
      .setView([userLocation.lat, userLocation.lng], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO', maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    leafletMap.current = map;

    // User location marker
    const userIcon = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;background:#00D4A8;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 4px rgba(0,212,168,.3)"></div>`,
      iconSize: [16, 16], iconAnchor: [8, 8],
    });
    userMarker.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b style="color:#00D4A8">📍 Your Location</b>');
  }, [userLocation]);

  // ── Step 3: Add hospital markers when data loads ──
  useEffect(() => {
    if (!leafletMap.current || !hospitals.length) return;
    const L = window.L;

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    hospitals.forEach(h => {
      const color = h.type === 'hospital' ? '#00D4A8' : h.type === 'pharmacy' ? '#9B82F4' : '#4A9FD5';
      const icon  = L.divIcon({
        className: '',
        html: `<div style="width:34px;height:34px;background:#131E34;border:2px solid ${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(0,0,0,.5);cursor:pointer">${h.emoji}</div>`,
        iconSize: [34, 34], iconAnchor: [17, 17],
      });

      const m = L.marker([h.lat, h.lng], { icon }).addTo(leafletMap.current);
      m.bindPopup(`
        <div style="min-width:200px;font-family:DM Sans,sans-serif;">
          <b style="color:#00D4A8;font-size:14px">${h.name}</b><br>
          <span style="color:#8899BB;font-size:11px">${h.specialty}</span><br><br>
          📍 ${h.address}<br>
          ${h.phone ? `📞 <a href="tel:${h.phone}" style="color:#00D4A8">${h.phone}</a><br>` : ''}
          ⏰ ${h.hours}<br>
          📏 ${h.distanceLabel} away<br>
          💰 ${h.fee}
        </div>
      `);
      markersRef.current[h.id] = m;
    });
  }, [hospitals]);

  const focusHospital = (h) => {
    setSelected(h.id);
    const m = markersRef.current[h.id];
    if (m && leafletMap.current) {
      leafletMap.current.flyTo([h.lat, h.lng], 17, { duration: 0.8 });
      m.openPopup();
    }
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    if (userLocation) fetchHospitals(userLocation.lat, userLocation.lng, newRadius);
  };

  const filtered = hospitals.filter(h => {
    const matchType   = filter === 'all' || h.type === filter;
    const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.specialty?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // ── Location requesting screen ──
  if (locStatus === 'requesting') {
    return (
      <div className="fade-up" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap:20 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--mintd)', border:'3px solid var(--mint)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, animation:'pulse 1.5s infinite' }}>📍</div>
        <div style={{ fontFamily:'var(--serif)', fontSize:22 }}>Getting your <em>location…</em></div>
        <div style={{ fontSize:14, color:'var(--text2)', textAlign:'center', maxWidth:400 }}>
          Please <strong>allow location access</strong> when your browser asks.<br/>
          This helps us find hospitals and clinics near you.
        </div>
      </div>
    );
  }

  // ── Location denied screen ──
  if (locStatus === 'denied') {
    return (
      <div className="fade-up" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60vh', gap:16 }}>
        <div style={{ fontSize:60 }}>🚫</div>
        <div style={{ fontFamily:'var(--serif)', fontSize:22 }}>Location <em>Access Denied</em></div>
        <div style={{ fontSize:14, color:'var(--coral)', textAlign:'center', maxWidth:420, background:'rgba(255,107,107,.1)', border:'1px solid rgba(255,107,107,.2)', borderRadius:'var(--rs)', padding:16 }}>
          {locError}
        </div>
        <div style={{ fontSize:13, color:'var(--text2)', textAlign:'center', maxWidth:400, lineHeight:1.7 }}>
          <strong>To fix:</strong> Click the 🔒 lock icon in your browser's address bar → Site Settings → Location → Allow → Refresh the page
        </div>
        <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ padding:'11px 28px' }}>
          🔄 Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ height:'calc(100vh - 112px)', display:'flex', flexDirection:'column' }}>
      <div className="page-heading" style={{ marginBottom:14, flexShrink:0 }}>
        <h1>Nearby <em>Care</em></h1>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <p style={{ margin:0 }}>
            {userLocation
              ? `📍 Real hospitals near you · ${hospitals.length} found`
              : 'Getting your location…'}
          </p>
          {userLocation && (
            <span style={{ fontSize:11, color:'var(--mint)', background:'var(--mintd)', padding:'3px 10px', borderRadius:100 }}>
              ● GPS Active · {(userLocation.lat).toFixed(4)}, {(userLocation.lng).toFixed(4)}
            </span>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', flex:1, background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r)', overflow:'hidden' }}>
        {/* ── List ── */}
        <div style={{ display:'flex', flexDirection:'column', borderRight:'1px solid var(--border)', overflow:'hidden' }}>
          {/* Filters */}
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
            {/* Search */}
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--rs)', padding:'7px 12px', marginBottom:10 }}>
              <span style={{ color:'var(--text3)' }}>🔍</span>
              <input placeholder="Search hospital, clinic, pharmacy…" value={search} onChange={e=>setSearch(e.target.value)}
                style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--sans)', width:'100%' }}/>
            </div>

            {/* Type filter */}
            <div style={{ display:'flex', gap:6, marginBottom:10 }}>
              {[['all','All'],['hospital','Hospitals'],['clinic','Clinics'],['pharmacy','Pharmacies']].map(([v,l])=>(
                <div key={v} onClick={()=>setFilter(v)} style={{ padding:'5px 11px', borderRadius:100, fontSize:11, cursor:'pointer', border:`1px solid ${filter===v?'var(--mint)':'var(--border)'}`, background:filter===v?'var(--mintd)':'transparent', color:filter===v?'var(--mint)':'var(--text2)', transition:'all .18s' }}>{l}</div>
              ))}
            </div>

            {/* Radius */}
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:12, color:'var(--text2)', whiteSpace:'nowrap' }}>Radius:</span>
              {[1000,3000,5000,10000].map(r=>(
                <div key={r} onClick={()=>handleRadiusChange(r)} style={{ padding:'4px 10px', borderRadius:100, fontSize:11, cursor:'pointer', border:`1px solid ${radius===r?'var(--mint)':'var(--border)'}`, background:radius===r?'var(--mintd)':'transparent', color:radius===r?'var(--mint)':'var(--text2)', transition:'all .18s' }}>
                  {r>=1000?`${r/1000}km`:`${r}m`}
                </div>
              ))}
              <button onClick={()=>fetchHospitals(userLocation.lat, userLocation.lng, radius)}
                style={{ marginLeft:'auto', padding:'4px 10px', borderRadius:100, fontSize:11, background:'var(--mint)', color:'#080E1C', border:'none', cursor:'pointer', fontFamily:'var(--sans)', fontWeight:600 }}>
                🔄
              </button>
            </div>
          </div>

          {/* Hospital list */}
          <div style={{ flex:1, overflowY:'auto' }}>
            {loading && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:40, gap:12 }}>
                <div style={{ display:'flex', gap:5 }}>
                  {[0,1,2].map(i=><span key={i} style={{ width:8, height:8, background:'var(--mint)', borderRadius:'50%', animation:`bounce 1.2s infinite ${i*.2}s` }}/>)}
                </div>
                <div style={{ fontSize:13, color:'var(--text2)' }}>Finding hospitals near you…</div>
              </div>
            )}

            {!loading && locError && (
              <div style={{ padding:20, textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🏥</div>
                <div style={{ fontSize:13, color:'var(--coral)', marginBottom:14 }}>{locError}</div>
                <button className="btn btn-primary" onClick={()=>handleRadiusChange(radius * 2)} style={{ fontSize:12 }}>
                  🔍 Search wider area
                </button>
              </div>
            )}

            {!loading && filtered.map(h => (
              <div key={h.id} onClick={()=>focusHospital(h)} style={{
                padding:'14px 16px', borderBottom:'1px solid var(--border)', cursor:'pointer',
                transition:'all .18s', borderLeft:`3px solid ${selected===h.id?'var(--mint)':'transparent'}`,
                background:selected===h.id?'var(--mintd)':'transparent',
              }}
                onMouseEnter={e=>{ if(selected!==h.id) e.currentTarget.style.background='var(--card2)'; }}
                onMouseLeave={e=>{ if(selected!==h.id) e.currentTarget.style.background='transparent'; }}
              >
                <div style={{ display:'flex', gap:10, marginBottom:8 }}>
                  <div style={{ width:42, height:42, borderRadius:11, background:h.type==='hospital'?'var(--mintd)':h.type==='pharmacy'?'rgba(155,130,244,.15)':'var(--blued)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{h.emoji}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, marginBottom:2, lineHeight:1.3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{h.name}</div>
                    <div style={{ fontSize:11, color:'var(--text2)' }}>{h.specialty}</div>
                    {h.rating && <div style={{ fontSize:11, color:'var(--amber)', marginTop:2 }}>{'★'.repeat(Math.round(h.rating))} {h.rating}</div>}
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--mint)' }}>{h.distanceLabel}</div>
                    <div style={{ fontSize:10, color:h.open?'var(--green)':'var(--coral)', marginTop:3 }}>{h.open?'● Open':'● Check hours'}</div>
                  </div>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:3, marginBottom:8 }}>
                  <div style={{ fontSize:11, color:'var(--text2)', display:'flex', gap:5 }}><span>📍</span><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{h.address}</span></div>
                  {h.phone && <div style={{ fontSize:11, color:'var(--mint)', display:'flex', gap:5 }}><span>📞</span><span>{h.phone}</span></div>}
                  <div style={{ fontSize:11, color:'var(--text2)', display:'flex', gap:5 }}><span>⏰</span><span>{h.hours}</span></div>
                  <div style={{ fontSize:11, color:'var(--text2)', display:'flex', gap:5 }}><span>💰</span><span>{h.fee}</span></div>
                </div>

                <div style={{ display:'flex', gap:7 }}>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`} target="_blank" rel="noreferrer"
                    onClick={e=>e.stopPropagation()}
                    style={{ flex:1, padding:'6px', borderRadius:8, background:'var(--mint)', color:'#080E1C', border:'none', fontSize:11, fontWeight:600, textAlign:'center', textDecoration:'none', cursor:'pointer' }}>
                    📍 Directions
                  </a>
                  {h.phone && (
                    <a href={`tel:${h.phone.replace(/\s/g,'')}`} onClick={e=>e.stopPropagation()}
                      style={{ flex:1, padding:'6px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text2)', fontSize:11, fontWeight:600, textAlign:'center', textDecoration:'none' }}>
                      📞 Call
                    </a>
                  )}
                  {h.website && (
                    <a href={h.website} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
                      style={{ flex:1, padding:'6px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text2)', fontSize:11, fontWeight:600, textAlign:'center', textDecoration:'none' }}>
                      🌐 Web
                    </a>
                  )}
                </div>
              </div>
            ))}

            {!loading && !locError && filtered.length === 0 && hospitals.length > 0 && (
              <div style={{ padding:30, textAlign:'center', color:'var(--text3)', fontSize:13 }}>
                No results for this filter. Try "All".
              </div>
            )}
          </div>
        </div>

        {/* ── Map ── */}
        <div style={{ position:'relative' }}>
          <div ref={mapRef} style={{ width:'100%', height:'100%' }}/>
          {/* Map overlay buttons */}
          <div style={{ position:'absolute', top:14, right:14, zIndex:1000, display:'flex', flexDirection:'column', gap:8 }}>
            <button className="btn btn-primary" onClick={()=>{
              if(userLocation && leafletMap.current) leafletMap.current.flyTo([userLocation.lat, userLocation.lng], 15, { duration:0.8 });
            }} style={{ fontSize:12, padding:'8px 14px' }}>📍 My Location</button>
            <button onClick={()=>handleRadiusChange(radius)} style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:'var(--rs)', padding:'8px 14px', fontSize:12, cursor:'pointer', color:'var(--text)', fontFamily:'var(--sans)' }}>
              🔄 Refresh
            </button>
          </div>
          {/* Loading overlay on map */}
          {loading && (
            <div style={{ position:'absolute', inset:0, background:'rgba(8,14,28,.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500 }}>
              <div style={{ textAlign:'center', color:'var(--mint)' }}>
                <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
                <div style={{ fontSize:14, fontWeight:500 }}>Searching nearby facilities…</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}