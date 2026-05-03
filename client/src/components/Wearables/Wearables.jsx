import React, { useState, useEffect, useRef } from 'react';
import useStore from '../../store/useStore';

const DEVICES = [
  { id:'galaxy',  name:'Samsung Galaxy Watch 6', icon:'⌚', desc:'Heart rate, SpO2, steps, sleep, stress', paired:true,  battery:68  },
  { id:'apple',   name:'Apple Watch Series 9',   icon:'⌚', desc:'All vitals + ECG + fall detection',      paired:false, battery:null },
  { id:'fitbit',  name:'Fitbit Charge 6',        icon:'📿', desc:'Activity, sleep, heart rate, SpO2',     paired:false, battery:null },
  { id:'garmin',  name:'Garmin Venu 3',          icon:'🏃', desc:'GPS, SpO2, stress, body battery',       paired:false, battery:null },
  { id:'mi',      name:'Mi Band 8 Pro',          icon:'📶', desc:'Heart rate, steps, SpO2, sleep',        paired:false, battery:null },
  { id:'boat',    name:'boAt Wave Sigma',        icon:'⌚', desc:'Heart rate, SpO2, activity tracking',  paired:false, battery:null },
];

function LiveBox({ icon, value, unit, label, color, trend, trendColor }) {
  return (
    <div style={{ background:'var(--bg3)', borderRadius:'var(--rs)', padding:16, textAlign:'center', position:'relative', overflow:'hidden' }}>
      <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:22, fontWeight:600, color }}>{value}</div>
      <div style={{ fontSize:11, color:'var(--text2)', marginTop:2 }}>{unit}</div>
      <div style={{ fontSize:10, color:'var(--text3)', marginTop:6, textTransform:'uppercase', letterSpacing:.4 }}>{label}</div>
      {trend&&<div style={{ position:'absolute', bottom:8, right:10, fontSize:10, fontWeight:600, color:trendColor||'var(--mint)' }}>{trend}</div>}
    </div>
  );
}

function ActivityRow({ icon, bg, name, value, pct, color }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
      <div style={{ width:36, height:36, borderRadius:9, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:13, fontWeight:500 }}>{name}</span>
          <span style={{ fontSize:13, fontWeight:600 }}>{value}</span>
        </div>
        <div style={{ height:5, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
          <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:3, transition:'width 1s ease' }}/>
        </div>
      </div>
    </div>
  );
}

export default function Wearables() {
  const { liveVitals } = useStore();
  const [devices, setDevices]         = useState(DEVICES.map(d=>({...d, connected:d.paired})));
  const [connecting, setConnecting]   = useState(null);
  const [showPairing, setShowPairing] = useState(false);
  const [pairingStep, setPairingStep] = useState(0);
  const [pairingDev, setPairingDev]   = useState(null);
  const [scanList, setScanList]       = useState([]);
  const [scanning, setScanning]       = useState(false);
  const [btSupported, setBtSupported] = useState(false);
  const [toast, setToast]             = useState('');

  useEffect(() => {
    setBtSupported('bluetooth' in navigator);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''),3000); };

  // Real Web Bluetooth API pairing
  const pairViaBluetooth = async (dev) => {
    if (!btSupported) {
      showToast('⚠️ Web Bluetooth not supported in this browser. Use Chrome on Android/desktop.');
      return;
    }
    try {
      showToast('🔍 Opening Bluetooth device picker…');
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          'heart_rate',
          'battery_service',
          'device_information',
          '0000180d-0000-1000-8000-00805f9b34fb', // Heart Rate
          '0000180f-0000-1000-8000-00805f9b34fb', // Battery
        ],
      });
      showToast(`✅ Paired: ${device.name || 'Device'}`);
      setDevices(d => d.map(x => x.id===dev.id ? {...x, connected:true, battery:85, realName:device.name} : x));
      setShowPairing(false);
    } catch(err) {
      if (err.name !== 'NotFoundError') {
        showToast(`❌ Pairing failed: ${err.message}`);
      } else {
        showToast('Pairing cancelled.');
      }
    }
  };

  // Simulate scanning for nearby devices
  const startScan = async () => {
    setScanning(true); setScanList([]);
    await new Promise(r=>setTimeout(r,1200));
    setScanList([
      { id:'s1', name:'Galaxy Watch6-A3F2',  rssi:-62, type:'Samsung' },
      { id:'s2', name:'Mi Band 8 Pro-1A2B',  rssi:-71, type:'Xiaomi'  },
      { id:'s3', name:'boAt-Wave-9C4D',      rssi:-80, type:'boAt'    },
      { id:'s4', name:'Fitbit Charge 6-7E8F',rssi:-68, type:'Fitbit'  },
    ]);
    setScanning(false);
  };

  const connectSim = async (dev) => {
    setConnecting(dev.id);
    await new Promise(r=>setTimeout(r,1800));
    setDevices(d => d.map(x => x.id===dev.id ? {...x, connected:true, battery:Math.floor(65+Math.random()*30)} : x));
    setConnecting(null);
    showToast(`✅ ${dev.name} connected!`);
  };

  const disconnect = (dev) => {
    setDevices(d => d.map(x => x.id===dev.id ? {...x, connected:false, battery:null} : x));
    showToast(`${dev.name} disconnected.`);
  };

  const connected = devices.find(d=>d.connected);

  return (
    <div className="fade-up">
      {/* Toast */}
      {toast&&(
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999, background:'var(--card)', border:'1px solid var(--border2)', borderRadius:'var(--rs)', padding:'12px 20px', fontSize:13, fontWeight:500, boxShadow:'var(--shadow-lg)', animation:'fadeUp .3s ease' }}>
          {toast}
        </div>
      )}

      {/* Pairing modal */}
      {showPairing&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:'var(--r)', padding:28, maxWidth:480, width:'100%', boxShadow:'var(--shadow-lg)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ fontFamily:'var(--serif)', fontSize:18 }}>📲 Pair a Device</div>
              <button onClick={()=>setShowPairing(false)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'var(--text2)' }}>✕</button>
            </div>

            {/* Bluetooth real pairing */}
            {btSupported&&(
              <div style={{ padding:16, background:'var(--mintd)', border:'1px solid rgba(0,212,168,.2)', borderRadius:'var(--rs)', marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--mint)', marginBottom:6 }}>🔵 Real Bluetooth Pairing (Chrome)</div>
                <div style={{ fontSize:12, color:'var(--text2)', marginBottom:12, lineHeight:1.6 }}>
                  Uses Web Bluetooth API — opens your browser's native device picker. Make sure your device is in pairing mode.
                </div>
                {DEVICES.filter(d=>!d.paired).map(dev=>(
                  <button key={dev.id} onClick={()=>pairViaBluetooth(dev)} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', background:'var(--card)', border:'1px solid var(--border2)', borderRadius:10, padding:'10px 14px', cursor:'pointer', marginBottom:8, fontFamily:'var(--sans)', color:'var(--text)', transition:'all .2s' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='var(--mint)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border2)'}>
                    <span style={{ fontSize:20 }}>{dev.icon}</span>
                    <div style={{ flex:1, textAlign:'left' }}>
                      <div style={{ fontSize:13, fontWeight:500 }}>{dev.name}</div>
                      <div style={{ fontSize:11, color:'var(--text2)' }}>{dev.desc}</div>
                    </div>
                    <span style={{ fontSize:12, color:'var(--mint)' }}>Pair →</span>
                  </button>
                ))}
              </div>
            )}

            {/* Simulated scan */}
            <div style={{ padding:16, background:'var(--bg3)', borderRadius:'var(--rs)' }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>📡 Scan Nearby Devices</div>
              <div style={{ fontSize:12, color:'var(--text2)', marginBottom:12 }}>
                {btSupported?'Simulated scan — use real pairing above for actual connection.':'Real Bluetooth requires Chrome browser on a supported device.'}
              </div>
              <button className="btn btn-primary" onClick={startScan} disabled={scanning} style={{ marginBottom:12 }}>
                {scanning?'🔍 Scanning…':'🔍 Start Scan'}
              </button>
              {scanning&&(
                <div style={{ display:'flex', gap:5, alignItems:'center', fontSize:13, color:'var(--mint)', marginBottom:10 }}>
                  {[0,1,2].map(i=><span key={i} style={{ width:7, height:7, background:'var(--mint)', borderRadius:'50%', animation:`bounce 1.2s infinite ${i*.2}s` }}/>)}
                  Scanning for Bluetooth devices…
                </div>
              )}
              {scanList.map(s=>(
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500 }}>{s.name}</div>
                    <div style={{ fontSize:11, color:'var(--text2)' }}>{s.type} · Signal: {s.rssi} dBm</div>
                  </div>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:s.rssi>-70?'var(--green)':s.rssi>-80?'var(--amber)':'var(--coral)' }}/>
                  <button className="btn btn-primary" style={{ fontSize:11, padding:'5px 12px' }}
                    onClick={async()=>{
                      const matched = DEVICES.find(d=>s.name.toLowerCase().includes(d.id));
                      if(matched){ await connectSim(matched); setShowPairing(false); }
                      else { showToast('✅ Device connected (simulated)'); setShowPairing(false); }
                    }}>
                    Connect
                  </button>
                </div>
              ))}
              {scanList.length===0&&!scanning&&(
                <div style={{ fontSize:12, color:'var(--text3)', textAlign:'center', padding:'10px 0' }}>
                  Click "Start Scan" to discover nearby devices
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="page-heading">
        <h1>Connected <em>Wearables</em></h1>
        <p>Real-time health data from smart devices · Bluetooth pairing</p>
      </div>

      {/* Live vitals */}
      <div className="card" style={{ marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
          <div style={{ width:9, height:9, borderRadius:'50%', background:connected?'var(--mint)':'var(--text3)', animation:connected?'pulse 1.5s infinite':'none' }}/>
          <div style={{ fontSize:15, fontWeight:600 }}>Live Health Monitor</div>
          <div style={{ marginLeft:'auto', fontSize:12, color:connected?'var(--green)':'var(--text3)' }}>
            {connected?`● ${connected.realName||connected.name} · Synced just now`:'○ No device connected'}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          <LiveBox icon="❤️" value={liveVitals.heartRate} unit="bpm"  label="Heart Rate"    color="var(--coral)"  trend={connected?"Normal":''} />
          <LiveBox icon="🫁" value={liveVitals.spo2}      unit="%"    label="SpO2"          color="var(--blue)"   trend={connected?"Great":''}  />
          <LiveBox icon="🌡️" value={liveVitals.temperature} unit="°F" label="Temperature"  color="var(--amber)"  trend={connected?"Normal":''} />
          <LiveBox icon="😴" value="6h 40m"               unit=""     label="Sleep Last Night" color="var(--purple)" trend={connected?"Fair":''} trendColor="var(--amber)"/>
        </div>
        {!connected&&(
          <div style={{ marginTop:14, padding:'10px 14px', background:'rgba(255,170,68,.08)', border:'1px solid rgba(255,170,68,.2)', borderRadius:'var(--rs)', fontSize:13, color:'var(--amber)', textAlign:'center' }}>
            ⚠️ No device connected — data shown is simulated. <span style={{ color:'var(--mint)', cursor:'pointer', fontWeight:600 }} onClick={()=>setShowPairing(true)}>Pair a device →</span>
          </div>
        )}
      </div>

      {/* Devices grid */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div className="section-title" style={{ margin:0 }}>Connected Devices</div>
        <button className="btn btn-primary" onClick={()=>setShowPairing(true)}>
          📲 + Pair Device
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
        {devices.map(dev=>(
          <div key={dev.id} className="card" style={{ display:'flex', alignItems:'center', gap:14, borderColor:dev.connected?'var(--mint)':'var(--border)', background:dev.connected?'rgba(0,212,168,.04)':'var(--card)' }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>{dev.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{dev.name}</div>
              <div style={{ fontSize:12, color:dev.connected?'var(--mint)':'var(--text3)', marginBottom:2 }}>
                {connecting===dev.id?'⏳ Connecting…':dev.connected?`● Connected · Battery ${dev.battery}%`:'○ Not connected'}
              </div>
              <div style={{ fontSize:11, color:'var(--text3)' }}>{dev.desc}</div>
            </div>
            {dev.connected?(
              <button onClick={()=>disconnect(dev)} style={{ padding:'7px 12px', borderRadius:100, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'var(--sans)', background:'var(--mintd)', border:'1px solid rgba(0,212,168,.3)', color:'var(--mint)', transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,107,107,.1)';e.currentTarget.style.borderColor='var(--coral)';e.currentTarget.style.color='var(--coral)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='var(--mintd)';e.currentTarget.style.borderColor='rgba(0,212,168,.3)';e.currentTarget.style.color='var(--mint)';}}>
                Disconnect
              </button>
            ):(
              <button onClick={()=>connectSim(dev)} disabled={connecting===dev.id} style={{ padding:'7px 12px', borderRadius:100, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'var(--sans)', background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text2)', transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--mint)';e.currentTarget.style.color='var(--mint)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text2)';}}>
                {connecting===dev.id?'…':'Connect'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Activity + Weekly trend */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <div className="card">
          <div className="section-title">Today's Activity</div>
          <ActivityRow icon="🚶" bg="rgba(255,170,68,.12)" name="Steps" value={`${liveVitals.steps.toLocaleString()} / 10,000`} pct={Math.round(liveVitals.steps/100)} color="var(--amber)"/>
          <ActivityRow icon="🔥" bg="rgba(255,107,107,.1)"  name="Calories" value={`${liveVitals.calories} / 500 kcal`} pct={Math.round(liveVitals.calories/5)} color="var(--coral)"/>
          <ActivityRow icon="🏃" bg="var(--blued)"          name="Active Minutes" value="38 / 60 min" pct={63} color="var(--blue)"/>
          <ActivityRow icon="💧" bg="var(--mintd)"          name="Hydration" value="1.4 / 2.5 L" pct={56} color="var(--mint)"/>
        </div>

        <div className="card">
          <div className="section-title">Weekly Vitals Trend</div>
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day,i)=>(
            <div key={day} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:32, fontSize:12, fontWeight:600, color:day==='Sun'?'var(--mint)':'var(--text2)' }}>{day}</div>
              <div style={{ flex:1, display:'flex', gap:14 }}>
                <span style={{ fontSize:12 }}>❤️ <strong style={{ color:'var(--coral)' }}>{68+i*2}</strong></span>
                <span style={{ fontSize:12 }}>📊 <strong style={{ color:'var(--blue)' }}>{115+i}/{73+i}</strong></span>
                <span style={{ fontSize:12 }}>🫁 <strong style={{ color:'var(--mint)' }}>{97+Math.floor(Math.random()*3)}%</strong></span>
              </div>
              {day==='Sun'&&<span style={{ fontSize:10, color:'var(--mint)', fontWeight:600 }}>TODAY</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop:18, padding:16, background:'rgba(74,159,213,.06)', border:'1px solid var(--blued)', borderRadius:'var(--r)', fontSize:13, color:'var(--text2)', lineHeight:1.7 }}>
        <strong style={{ color:'var(--blue)' }}>ℹ️ Bluetooth Note:</strong> Real device pairing requires <strong>Chrome browser</strong> on Windows/Mac/Android with Bluetooth enabled. The "Pair Device" button uses the Web Bluetooth API. For iOS, a native app (React Native) is required as Safari doesn't support Web Bluetooth yet.
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}
