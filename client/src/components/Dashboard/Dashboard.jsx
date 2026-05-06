import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip, LineChart, Line, BarChart, Bar } from 'recharts';
import useStore from '../../store/useStore';
import { useIsMobile } from '../../hooks/useIsMobile';

const HR_DATA   = [72,75,70,78,74,68,76,73,71,74].map(v=>({v}));
const BP_DATA   = [118,122,115,120,117,119,116,121,118,118].map(v=>({v}));
const SPO_DATA  = [98,99,97,99,98,99,99,98,99,99].map(v=>({v}));
const STEP_DATA = [6200,7100,5400,8200,7240,6800,9100,7500,6900,7240].map(v=>({v}));
const SLEEP_DATA= [7,6.5,8,6,6.7,7.5,7,6.5,7.2,6.7].map(v=>({v}));
const WEEK_DATA = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>({ d, hr:68+i*2, steps:5500+i*400 }));

function MiniChart({ data, color, type='area', height=50 }) {
  if (type==='bar') return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{top:2,right:0,left:0,bottom:0}}>
        <Bar dataKey="v" fill={color} radius={[2,2,0,0]} opacity={0.8}/>
      </BarChart>
    </ResponsiveContainer>
  );
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{top:2,right:0,left:0,bottom:0}}>
        <defs>
          <linearGradient id={`g${color.replace(/[^a-z]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Tooltip contentStyle={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:8, fontSize:11, color:'var(--text)' }} itemStyle={{ color }} formatter={v=>[v,'']}/>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#g${color.replace(/[^a-z]/gi,'')})`} dot={false}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatCard({ icon, label, value, unit, sub, color, data, chartType, trend, trendUp, isMobile }) {
  return (
    <div className="card" style={{ position:'relative', overflow:'hidden', padding: isMobile ? '14px 14px 8px' : '18px 18px 10px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
        <div>
          <div style={{ fontSize: isMobile ? 11 : 12, color:'var(--text2)', marginBottom:4 }}>{icon} {label}</div>
          <div style={{ fontSize: isMobile ? 20 : 24, fontWeight:700, color, letterSpacing:-.5 }}>
            {value}<span style={{ fontSize:11, fontWeight:400, marginLeft:3 }}>{unit}</span>
          </div>
          {!isMobile && <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{sub}</div>}
        </div>
        <div style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:100, background:trendUp?'rgba(82,214,122,.1)':'rgba(255,107,107,.1)', color:trendUp?'var(--green)':'var(--coral)', whiteSpace:'nowrap' }}>
          {trendUp?'↑':'↓'} {trend}
        </div>
      </div>
      <MiniChart data={data} color={color} type={chartType} height={isMobile ? 36 : 46}/>
    </div>
  );
}

function MedRow({ name, timing, done, onToggle, isMobile }) {
  return (
    <div style={{ padding: isMobile ? '13px 14px' : '11px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12 }}>
      <span style={{ fontSize: isMobile ? 22 : 18 }}>💊</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:500 }}>{name}</div>
        <div style={{ fontSize:11, color:'var(--text2)', marginTop:1 }}>{timing}</div>
      </div>
      <div onClick={onToggle} style={{ width: isMobile ? 32 : 26, height: isMobile ? 32 : 26, borderRadius:'50%', cursor:'pointer', border:`2px solid ${done?'var(--mint)':'var(--border2)'}`, background:done?'var(--mint)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:done?'#080E1C':'var(--text3)', fontSize: isMobile ? 14 : 11, transition:'all .2s', flexShrink:0 }}>
        {done?'✓':'○'}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { liveVitals } = useStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [meds, setMeds] = useState([
    { id:1, name:'Metformin 500mg',    timing:'After breakfast',     done:true  },
    { id:2, name:'Atorvastatin 10mg',  timing:'After dinner · 8 PM', done:false },
    { id:3, name:'Vitamin D3 1000 IU', timing:'Morning · With food', done:true  },
  ]);
  const toggleMed = id => setMeds(m => m.map(x => x.id===id ? {...x, done:!x.done} : x));

  const QUICK_ACTIONS = [
    { icon:'🩺', title:'Check Symptoms',  desc:'AI analysis',        path:'/symptoms'      },
    { icon:'🏥', title:'Find Care',        desc:'Hospitals & clinics', path:'/nearby'        },
    { icon:'📅', title:'Appointments',     desc:'View & manage',       path:'/appointments'  },
    { icon:'💬', title:'Doctor Chat',      desc:'Live messaging',       path:'/doctor-chat'   },
    { icon:'📊', title:'Analytics',        desc:'Health trends',        path:'/analytics'     },
    { icon:'💊', title:'Prescriptions',    desc:'3 active',            path:'/prescriptions' },
    { icon:'🔔', title:'Reminders',        desc:'Medication alerts',    path:'/reminders'     },
    { icon:'⌚', title:'Wearables',        desc:'Watch connected',      path:'/wearables'     },
  ];

  return (
    <div className="fade-up">
      {/* Page heading — compact on mobile */}
      {!isMobile && (
        <div className="page-heading">
          <h1>Your health, <em>at a glance.</em></h1>
          <p>Last synced just now · Smart watch connected · All vitals normal</p>
        </div>
      )}
      {isMobile && (
        <div style={{ marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:12, color:'var(--text2)' }}>🟢 All vitals normal · Synced now</div>
          <div style={{ fontSize:11, padding:'4px 10px', borderRadius:100, background:'var(--mintd)', color:'var(--mint)', fontWeight:600 }}>Live</div>
        </div>
      )}

      {/* Stat cards — 2 col on mobile, 5 col on desktop */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 16 : 22 }}>
        <StatCard icon="❤️" label="Heart Rate"     value={liveVitals.heartRate} unit="bpm"  sub="Normal range"  color="var(--coral)"  data={HR_DATA}   chartType="area" trend="2%"  trendUp={true}  isMobile={isMobile}/>
        <StatCard icon="📊" label="Blood Pressure" value="118/76"               unit=""     sub="Excellent"     color="var(--blue)"   data={BP_DATA}   chartType="area" trend="1%"  trendUp={true}  isMobile={isMobile}/>
        <StatCard icon="🫁" label="SpO2"           value={liveVitals.spo2}      unit="%"    sub="Great"         color="var(--mint)"   data={SPO_DATA}  chartType="area" trend="0%"  trendUp={true}  isMobile={isMobile}/>
        <StatCard icon="🚶" label="Steps"          value={liveVitals.steps.toLocaleString()} unit="" sub="/ 10,000 goal" color="var(--amber)" data={STEP_DATA} chartType="bar" trend="8%" trendUp={true} isMobile={isMobile}/>
        {!isMobile && <StatCard icon="😴" label="Sleep" value="6h 40m" unit="" sub="Last night" color="var(--purple)" data={SLEEP_DATA} chartType="area" trend="5%" trendUp={false} isMobile={isMobile}/>}
      </div>

      {/* Mobile: Sleep card full width */}
      {isMobile && (
        <div className="card" style={{ marginBottom:14, padding:'12px 14px 8px', display:'flex', alignItems:'center', gap:12 }}>
          <div>
            <div style={{ fontSize:11, color:'var(--text2)', marginBottom:2 }}>😴 Sleep Last Night</div>
            <div style={{ fontSize:22, fontWeight:700, color:'var(--purple)' }}>6h 40m</div>
          </div>
          <div style={{ flex:1 }}><MiniChart data={SLEEP_DATA} color="var(--purple)" height={40}/></div>
          <div style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:100, background:'rgba(255,107,107,.1)', color:'var(--coral)' }}>↓ 5%</div>
        </div>
      )}

      {/* Main layout — single col on mobile, two col on desktop */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: isMobile ? 14 : 18 }}>

        {/* ── LEFT / MAIN ── */}
        <div>

          {/* Live vitals grid — mobile only (moved here from right column) */}
          {isMobile && (
            <>
              <div className="section-title" style={{ marginBottom:10 }}>Live Vitals</div>
              <div className="card" style={{ marginBottom:14, padding:12 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[
                    { val:`${liveVitals.spo2}%`, lbl:'SpO2',        pct:liveVitals.spo2, color:'var(--mint)'   },
                    { val:'98.4°F',               lbl:'Temperature',  pct:70,              color:'var(--blue)'   },
                    { val:liveVitals.steps.toLocaleString(), lbl:'Steps', pct:Math.round(liveVitals.steps/100), color:'var(--amber)' },
                    { val:'6h 40m',               lbl:'Sleep',        pct:67,              color:'var(--purple)' },
                  ].map(v=>(
                    <div key={v.lbl} style={{ background:'var(--bg3)', borderRadius:'var(--rs)', padding:12 }}>
                      <div style={{ fontSize:18, fontWeight:600, color:v.color }}>{v.val}</div>
                      <div style={{ fontSize:10, color:'var(--text2)', textTransform:'uppercase', letterSpacing:.4, marginTop:2 }}>{v.lbl}</div>
                      <div style={{ height:4, background:'var(--border)', borderRadius:2, marginTop:8, overflow:'hidden' }}>
                        <div style={{ width:`${Math.min(v.pct,100)}%`, height:'100%', background:v.color, borderRadius:2, transition:'width .5s' }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Medications — mobile first */}
          {isMobile && (
            <>
              <div className="section-title" style={{ marginBottom:10 }}>
                Medications Today
                <span onClick={()=>navigate('/prescriptions')} style={{ fontSize:12, color:'var(--mint)', cursor:'pointer' }}>View all →</span>
              </div>
              <div className="card" style={{ padding:0, overflow:'hidden', marginBottom:14 }}>
                {meds.map(m=><MedRow key={m.id} {...m} onToggle={()=>toggleMed(m.id)} isMobile={true}/>)}
              </div>
            </>
          )}

          {/* Weekly chart */}
          <div className="card" style={{ marginBottom: isMobile ? 14 : 18 }}>
            <div className="section-title">Weekly Heart Rate & Steps</div>
            <div style={{ height: isMobile ? 110 : 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEEK_DATA} margin={{top:5,right:10,left:-20,bottom:0}}>
                  <Tooltip contentStyle={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:8, fontSize:11, color:'var(--text)' }}/>
                  <Line type="monotone" dataKey="hr"    name="HR (bpm)"    stroke="var(--coral)"  strokeWidth={2} dot={{ fill:'var(--coral)',  r:3 }}/>
                  <Line type="monotone" dataKey="steps" name="Steps (÷100)" stroke="var(--amber)" strokeWidth={2} dot={{ fill:'var(--amber)', r:3 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display:'flex', gap:20, justifyContent:'center', marginTop:8 }}>
              {[['var(--coral)','Heart Rate (bpm)'],['var(--amber)','Steps (÷100)']].map(([c,l])=>(
                <div key={l} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--text2)' }}>
                  <div style={{ width:12, height:2, background:c, borderRadius:1 }}/>{l}
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div className="section-title">
            Upcoming Appointments
            <span className="link" onClick={()=>navigate('/appointments')}>View all →</span>
          </div>
          {[
            { init:'DR', name:'Dr. Debdweep Roy',   spec:'Diabetologist · Sormistha Clinic', time:'10:30 AM', date:'Tomorrow',    status:'confirmed', c:'var(--mint)',   bg:'var(--mintd)' },
            { init:'AM', name:'Dr. Aurobindo Maji', spec:'Orthopedic · The Park Clinic',    time:'5:30 PM',  date:'May 2, 2026', status:'pending',   c:'var(--purple)', bg:'rgba(155,130,244,.12)' },
          ].map((a,i)=>(
            <div key={i} className="card" style={{ marginBottom:10, display:'flex', alignItems:'center', gap: isMobile ? 12 : 14, padding: isMobile ? '13px 14px' : 16, cursor:'pointer' }} onClick={()=>navigate('/appointments')}>
              <div style={{ width:44, height:44, borderRadius:12, background:a.bg, color:a.c, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:14, flexShrink:0 }}>{a.init}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.name}</div>
                <div style={{ fontSize:11, color:'var(--text2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.spec}</div>
                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:100, background:a.status==='confirmed'?'rgba(0,212,168,.1)':'rgba(255,170,68,.1)', color:a.status==='confirmed'?'var(--mint)':'var(--amber)', marginTop:4, display:'inline-block' }}>● {a.status}</span>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--mint)' }}>{a.time}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{a.date}</div>
              </div>
            </div>
          ))}

          {/* Quick actions */}
          <div className="section-title" style={{ marginTop: isMobile ? 16 : 20 }}>Quick Actions</div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(4,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 8 : 10 }}>
            {QUICK_ACTIONS.map(a=>(
              <div key={a.path} className="card" style={{ cursor:'pointer', textAlign:'center', padding: isMobile ? '14px 8px' : 14 }} onClick={()=>navigate(a.path)}>
                <div style={{ fontSize: isMobile ? 24 : 22, marginBottom: isMobile ? 6 : 6 }}>{a.icon}</div>
                <div style={{ fontSize: isMobile ? 11 : 12, fontWeight:600, lineHeight:1.3 }}>{a.title}</div>
                {!isMobile && <div style={{ fontSize:10, color:'var(--text2)', marginTop:2 }}>{a.desc}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT (desktop only) ── */}
        {!isMobile && (
          <div>
            <div className="section-title">Today's Live Vitals</div>
            <div className="card" style={{ marginBottom:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { val:`${liveVitals.spo2}%`, lbl:'SpO2',        pct:liveVitals.spo2, color:'var(--mint)'   },
                  { val:'98.4°F',               lbl:'Temperature',  pct:70,              color:'var(--blue)'   },
                  { val:liveVitals.steps.toLocaleString(), lbl:'Steps', pct:Math.round(liveVitals.steps/100), color:'var(--amber)' },
                  { val:'6h 40m',               lbl:'Sleep',        pct:67,              color:'var(--purple)' },
                ].map(v=>(
                  <div key={v.lbl} style={{ background:'var(--bg3)', borderRadius:'var(--rs)', padding:12 }}>
                    <div style={{ fontSize:18, fontWeight:600, color:v.color }}>{v.val}</div>
                    <div style={{ fontSize:10, color:'var(--text2)', textTransform:'uppercase', letterSpacing:.4, marginTop:2 }}>{v.lbl}</div>
                    <div style={{ height:4, background:'var(--border)', borderRadius:2, marginTop:8, overflow:'hidden' }}>
                      <div style={{ width:`${Math.min(v.pct,100)}%`, height:'100%', background:v.color, borderRadius:2, transition:'width .5s' }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-title">Medications Today</div>
            <div className="card" style={{ padding:0, overflow:'hidden', marginBottom:14 }}>
              {meds.map(m=><MedRow key={m.id} {...m} onToggle={()=>toggleMed(m.id)} isMobile={false}/>)}
            </div>

            <div style={{ background:'linear-gradient(135deg,rgba(0,212,168,.08),rgba(74,159,213,.08))', border:'1px solid var(--mintd)', borderRadius:'var(--r)', padding:18 }}>
              <div style={{ fontFamily:'var(--serif)', fontSize:15, color:'var(--mint)', marginBottom:6 }}>✦ AI Health Insights</div>
              <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, marginBottom:14 }}>Your vitals are stable. Heart rate normal. 1 medication refill needed this week.</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {['Analyze vitals','Drug interactions','Heart health tips','I feel tired'].map(c=>(
                  <div key={c} onClick={()=>navigate('/chat')} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:100, padding:'6px 13px', fontSize:12, cursor:'pointer', color:'var(--text2)', transition:'all .2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--mint)';e.currentTarget.style.color='var(--mint)';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text2)';}}>
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Quick Start — mobile only at bottom */}
        {isMobile && (
          <div style={{ background:'linear-gradient(135deg,rgba(0,212,168,.08),rgba(74,159,213,.08))', border:'1px solid var(--mintd)', borderRadius:'var(--r)', padding:16 }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:15, color:'var(--mint)', marginBottom:6 }}>✦ AI Health Insights</div>
            <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, marginBottom:12 }}>Your vitals are stable. 1 medication refill needed this week.</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
              {['Analyze vitals','Drug interactions','I feel tired'].map(c=>(
                <div key={c} onClick={()=>navigate('/chat')} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:100, padding:'7px 13px', fontSize:12, cursor:'pointer', color:'var(--text2)' }}>{c}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}