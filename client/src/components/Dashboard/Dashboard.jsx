import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip, LineChart, Line, BarChart, Bar } from 'recharts';
import useStore from '../../store/useStore';

// Mini sparkline data
const HR_DATA  = [72,75,70,78,74,68,76,73,71,74].map((v,i)=>({v}));
const BP_DATA  = [118,122,115,120,117,119,116,121,118,118].map((v,i)=>({v}));
const SPO_DATA = [98,99,97,99,98,99,99,98,99,99].map((v,i)=>({v}));
const STEP_DATA= [6200,7100,5400,8200,7240,6800,9100,7500,6900,7240].map((v,i)=>({v}));
const SLEEP_DATA=[7,6.5,8,6,6.7,7.5,7,6.5,7.2,6.7].map((v,i)=>({v}));
const WEEK_DATA= ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>({ d, hr:68+i*2, steps:5500+i*400 }));

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

function StatCard({ icon, label, value, unit, sub, color, data, chartType, trend, trendUp }) {
  return (
    <div className="card" style={{ position:'relative', overflow:'hidden', padding:'18px 18px 10px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 }}>
        <div>
          <div style={{ fontSize:12, color:'var(--text2)', marginBottom:6 }}>{icon} {label}</div>
          <div style={{ fontSize:24, fontWeight:700, color, letterSpacing:-.5 }}>
            {value}<span style={{ fontSize:12, fontWeight:400, marginLeft:3 }}>{unit}</span>
          </div>
          <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{sub}</div>
        </div>
        <div style={{ fontSize:11, fontWeight:600, padding:'3px 8px', borderRadius:100, background: trendUp?'rgba(82,214,122,.1)':'rgba(255,107,107,.1)', color:trendUp?'var(--green)':'var(--coral)' }}>
          {trendUp?'↑':'↓'} {trend}
        </div>
      </div>
      <MiniChart data={data} color={color} type={chartType} height={46}/>
    </div>
  );
}

function MedRow({ name, timing, done, onToggle }) {
  return (
    <div style={{ padding:'11px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
      <span style={{ fontSize:18 }}>💊</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:500 }}>{name}</div>
        <div style={{ fontSize:11, color:'var(--text2)' }}>{timing}</div>
      </div>
      <div onClick={onToggle} style={{ width:26, height:26, borderRadius:'50%', cursor:'pointer', border:`2px solid ${done?'var(--mint)':'var(--border2)'}`, background:done?'var(--mint)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:done?'#080E1C':'var(--text3)', fontSize:11, transition:'all .2s' }}>
        {done?'✓':'○'}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { liveVitals, patient, user } = useStore();
  const navigate = useNavigate();
  const [meds, setMeds] = useState([
    { id:1, name:'Metformin 500mg',    timing:'After breakfast',     done:true  },
    { id:2, name:'Atorvastatin 10mg',  timing:'After dinner · 8 PM', done:false },
    { id:3, name:'Vitamin D3 1000 IU', timing:'Morning · With food', done:true  },
  ]);

  const toggleMed = id => setMeds(m => m.map(x => x.id===id ? {...x, done:!x.done} : x));

  return (
    <div className="fade-up">
      <div className="page-heading">
        <h1>Your health, <em>at a glance.</em></h1>
        <p>Last synced just now · Smart watch connected · All vitals normal</p>
      </div>

      {/* Stat cards with mini charts */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:22 }}>
        <StatCard icon="❤️" label="Heart Rate"     value={liveVitals.heartRate} unit="bpm"  sub="Normal range"  color="var(--coral)"  data={HR_DATA}   chartType="area" trend="2%"  trendUp={true}  />
        <StatCard icon="📊" label="Blood Pressure" value="118/76"               unit=""     sub="Excellent"     color="var(--blue)"   data={BP_DATA}   chartType="area" trend="1%"  trendUp={true}  />
        <StatCard icon="🫁" label="SpO2"           value={liveVitals.spo2}      unit="%"    sub="Great"         color="var(--mint)"   data={SPO_DATA}  chartType="area" trend="0%"  trendUp={true}  />
        <StatCard icon="🚶" label="Steps Today"    value={liveVitals.steps.toLocaleString()} unit="" sub="/ 10,000 goal" color="var(--amber)" data={STEP_DATA} chartType="bar"  trend="8%"  trendUp={true}  />
        <StatCard icon="😴" label="Sleep"          value="6h 40m"               unit=""     sub="Last night"    color="var(--purple)" data={SLEEP_DATA} chartType="area" trend="5%"  trendUp={false} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:18 }}>
        {/* Left */}
        <div>
          {/* Weekly trend chart */}
          <div className="card" style={{ marginBottom:18 }}>
            <div className="section-title">Weekly Heart Rate & Steps</div>
            <div style={{ height:140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEEK_DATA} margin={{top:5,right:10,left:-20,bottom:0}}>
                  <Tooltip contentStyle={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:8, fontSize:11, color:'var(--text)' }}/>
                  <Line type="monotone" dataKey="hr"    name="HR (bpm)"   stroke="var(--coral)"  strokeWidth={2} dot={{ fill:'var(--coral)',  r:3 }}/>
                  <Line type="monotone" dataKey="steps" name="Steps (÷100)" stroke="var(--amber)" strokeWidth={2} dot={{ fill:'var(--amber)', r:3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display:'flex', gap:20, justifyContent:'center', marginTop:8 }}>
              {[['var(--coral)','Heart Rate (bpm)'],['var(--amber)','Steps (÷100)']].map(([c,l])=>(
                <div key={l} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--text2)' }}>
                  <div style={{ width:12, height:2, background:c, borderRadius:1 }}/>
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Appointments */}
          <div className="section-title">
            Upcoming Appointments
            <span className="link" onClick={()=>navigate('/appointments')} style={{ fontSize:12, color:'var(--mint)', cursor:'pointer' }}>View all →</span>
          </div>
          {[
            { init:'DR', name:'Dr. Debdweep Roy',   spec:'Diabetologist · Sormistha Clinic', time:'10:30 AM', date:'Tomorrow',   status:'confirmed', c:'var(--mint)',   bg:'var(--mintd)' },
            { init:'AM', name:'Dr. Aurobindo Maji', spec:'Orthopedic · The Park Clinic',    time:'5:30 PM',  date:'May 2, 2026', status:'pending',   c:'var(--purple)', bg:'rgba(155,130,244,.12)' },
          ].map((a,i)=>(
            <div key={i} className="card" style={{ marginBottom:10, display:'flex', alignItems:'center', gap:14, padding:16, cursor:'pointer' }} onClick={()=>navigate('/appointments')}>
              <div style={{ width:46, height:46, borderRadius:12, background:a.bg, color:a.c, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:14 }}>{a.init}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500 }}>{a.name}</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>{a.spec}</div>
                <span style={{ fontSize:11, padding:'3px 9px', borderRadius:100, background:a.status==='confirmed'?'rgba(0,212,168,.1)':'rgba(255,170,68,.1)', color:a.status==='confirmed'?'var(--mint)':'var(--amber)', marginTop:5, display:'inline-block' }}>● {a.status}</span>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--mint)' }}>{a.time}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{a.date}</div>
              </div>
            </div>
          ))}

          {/* Quick actions */}
          <div className="section-title" style={{ marginTop:20 }}>Quick Actions</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {[
              { icon:'🩺', title:'Check Symptoms',  desc:'AI analysis',        path:'/symptoms' },
              { icon:'🏥', title:'Find Care',        desc:'Hospitals & clinics', path:'/nearby'   },
              { icon:'📅', title:'My Appointments',  desc:'View & manage',       path:'/appointments' },
              { icon:'💬', title:'Doctor Chat',      desc:'Live messaging',       path:'/doctor-chat'  },
              { icon:'📊', title:'Analytics',        desc:'Health trends',        path:'/analytics'    },
              { icon:'💊', title:'Prescriptions',    desc:'3 active',            path:'/prescriptions'},
              { icon:'🔔', title:'Reminders',        desc:'Medication alerts',    path:'/reminders'    },
              { icon:'⌚', title:'Wearables',        desc:'Watch connected',      path:'/wearables'    },
            ].map(a=>(
              <div key={a.path} className="card" style={{ cursor:'pointer', textAlign:'center', padding:14 }} onClick={()=>navigate(a.path)}>
                <div style={{ fontSize:22, marginBottom:6 }}>{a.icon}</div>
                <div style={{ fontSize:12, fontWeight:600 }}>{a.title}</div>
                <div style={{ fontSize:10, color:'var(--text2)', marginTop:2 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div>
          {/* Live vitals */}
          <div className="section-title">Today's Live Vitals</div>
          <div className="card" style={{ marginBottom:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { val:`${liveVitals.spo2}%`, lbl:'SpO2',        pct:liveVitals.spo2,    color:'var(--mint)'   },
                { val:'98.4°F',              lbl:'Temperature',  pct:70,                 color:'var(--blue)'   },
                { val:liveVitals.steps.toLocaleString(), lbl:'Steps', pct:Math.round(liveVitals.steps/100), color:'var(--amber)' },
                { val:'6h 40m',              lbl:'Sleep',        pct:67,                 color:'var(--purple)' },
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

          {/* Medications */}
          <div className="section-title">Medications Today</div>
          <div className="card" style={{ padding:0, overflow:'hidden', marginBottom:14 }}>
            {meds.map(m=><MedRow key={m.id} {...m} onToggle={()=>toggleMed(m.id)}/>)}
          </div>

          {/* AI Quick Start */}
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
      </div>
    </div>
  );
}
