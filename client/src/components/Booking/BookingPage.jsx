import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DOCTORS = [
  { id:1, name:'Dr. Debdweep Roy',    spec:'Diabetologist',    clinic:'Sormistha Clinic',   addr:'Sen Releigh Rd, Munshi Bazar, Asansol', phone:'+91 81019 22199', fee:300, rating:5.0, reviews:704, exp:'18 yrs', avatar:'DR', color:'var(--mint)',   bg:'var(--mintd)',              tags:['Diabetes','General Medicine'], available:['Mon','Tue','Wed','Thu','Fri','Sat'], slots:{morning:['10:30','11:00','11:30','12:00'],          evening:['17:30','18:00','18:30','19:00','19:30']}, about:'Highly rated diabetologist with 18 years of experience. Type 2 Diabetes, insulin therapy, and preventive care.' },
  { id:2, name:'Dr. Aurobindo Maji',  spec:'Orthopedic',       clinic:'The Park Clinic',    addr:'Ushagram, Asansol',                     phone:'+91 79084 83174', fee:500, rating:4.8, reviews:95,  exp:'14 yrs', avatar:'AM', color:'var(--purple)', bg:'rgba(155,130,244,.12)',     tags:['Orthopedics','Knee','Sports'], available:['Mon','Wed','Thu','Fri','Sat'],          slots:{morning:['09:00','09:30','10:00','10:30'],          evening:['17:00','17:30','18:00','18:30']},          about:'Expert orthopedic surgeon — knee/hip replacement, sports injuries, spine.' },
  { id:3, name:'Dr. Kalyan Mondal',   spec:'General Physician', clinic:'Mondal Medical',     addr:'Hutton Rd, Asansol',                    phone:'+91 94345 45200', fee:150, rating:5.0, reviews:6,   exp:'10 yrs', avatar:'KM', color:'var(--amber)',  bg:'rgba(255,170,68,.12)',      tags:['Fever','Preventive','General'], available:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], slots:{morning:['10:30','11:00','11:30','12:00','12:30'], evening:['17:30','18:00','18:30','19:00','19:30']},  about:'General physician handling fever, infections, diabetes, hypertension, preventive checkups.' },
  { id:4, name:'Dr. Priya Menon',     spec:'Dermatologist',     clinic:'The Park Clinic',    addr:'Ushagram, Asansol',                     phone:'+91 79084 83174', fee:600, rating:4.7, reviews:312, exp:'9 yrs',  avatar:'PM', color:'var(--coral)',  bg:'rgba(255,107,107,.12)',     tags:['Acne','Eczema','Cosmetic'],    available:['Tue','Thu','Sat'],                        slots:{morning:['10:00','10:30','11:00','11:30'],          evening:['16:00','16:30','17:00','17:30']},          about:'Medical and cosmetic dermatology — acne, eczema, psoriasis, hair loss, skin rejuvenation.' },
  { id:5, name:'Dr. Rohit Kumar',     spec:'Neurologist',       clinic:'Healthworld Hospital',addr:'Shristinagar, Asansol',               phone:'+91 81018 80088', fee:800, rating:4.8, reviews:198, exp:'12 yrs', avatar:'RK', color:'var(--blue)',   bg:'var(--blued)',              tags:['Migraines','Epilepsy','Stroke'],available:['Mon','Tue','Wed','Thu','Fri'],            slots:{morning:['09:00','09:30','10:00'],                 evening:['16:00','16:30','17:00','17:30','18:00']},  about:'Senior neurologist — migraines, epilepsy, stroke, peripheral nerve disorders.' },
  { id:6, name:'Dr. Neha Choudhary', spec:'Pediatrician',      clinic:'Child Care Center',  addr:'GT Road, Asansol',                      phone:'+91 98765 11223', fee:400, rating:4.9, reviews:521, exp:'11 yrs', avatar:'NC', color:'var(--green)',  bg:'rgba(82,214,122,.12)',      tags:['Child Health','Vaccination'],  available:['Mon','Tue','Wed','Thu','Fri','Sat'],       slots:{morning:['09:00','09:30','10:00','10:30','11:00'], evening:['17:00','17:30','18:00','18:30']},          about:'Child specialist — newborn care, vaccinations, growth monitoring, pediatric nutrition.' },
];

const SPECIALTIES = ['All','General Medicine','Diabetologist','Orthopedic','Dermatologist','Neurologist','Pediatrician'];

function getNext14Days() {
  const dn=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], mn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return Array.from({length:14},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()+i); return { idx:i, date:d.getDate(), month:mn[d.getMonth()], dayName:dn[d.getDay()] }; });
}
const DATES = getNext14Days();

function Steps({ current }) {
  return (
    <div style={{ display:'flex', alignItems:'center', marginBottom:24 }}>
      {['Choose Doctor','Pick Date & Time','Confirm'].map((s,i)=>(
        <React.Fragment key={s}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
            <div style={{ width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, background:i<=current?'var(--mint)':'var(--bg3)', color:i<=current?'#080E1C':'var(--text3)', border:`2px solid ${i<=current?'var(--mint)':'var(--border2)'}`, transition:'all .3s' }}>
              {i<current?'✓':i+1}
            </div>
            <div style={{ fontSize:11, color:i===current?'var(--mint)':'var(--text3)', fontWeight:i===current?600:400, whiteSpace:'nowrap' }}>{s}</div>
          </div>
          {i<2&&<div style={{ flex:1, height:2, background:i<current?'var(--mint)':'var(--border)', margin:'-12px 8px 0', transition:'background .3s' }}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function BookingPage() {
  const navigate = useNavigate();
  const [step, setStep]           = useState(0);
  const [specialty, setSpecialty] = useState('All');
  const [search, setSearch]       = useState('');
  const [doctor, setDoctor]       = useState(null);
  const [dateIdx, setDateIdx]     = useState(0);
  const [slot, setSlot]           = useState('');
  const [reason, setReason]       = useState('');
  const [confirm, setConfirm]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  const filtered = DOCTORS.filter(d => {
    const ms = specialty==='All'||d.spec.toLowerCase().includes(specialty.toLowerCase());
    const mq = !search||d.name.toLowerCase().includes(search.toLowerCase())||d.spec.toLowerCase().includes(search.toLowerCase())||d.tags.some(t=>t.toLowerCase().includes(search.toLowerCase()));
    return ms&&mq;
  });

  const selDate       = DATES[dateIdx];
  const dayAvailable  = doctor&&doctor.available.includes(selDate.dayName);

  const pickDoctor = (doc) => { setDoctor(doc); setSlot(''); setTimeout(()=>setStep(1),200); };

  const doConfirm = async () => {
    setLoading(true);
    await new Promise(r=>setTimeout(r,1400));
    setConfirm(false); setSuccess(true); setLoading(false);
  };

  if (success) return (
    <div className="fade-up">
      <div className="page-heading"><h1>Book a <em>Doctor</em></h1></div>
      <div style={{ textAlign:'center', padding:'40px 20px' }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--mintd)', border:'3px solid var(--mint)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 20px' }}>✅</div>
        <div style={{ fontFamily:'var(--serif)', fontSize:24, marginBottom:8 }}>Appointment <em>Confirmed!</em></div>
        <div style={{ fontSize:14, color:'var(--text2)', marginBottom:28, lineHeight:1.7 }}>
          Your appointment with <strong style={{ color:'var(--text)' }}>{doctor.name}</strong> is booked for<br/>
          <strong style={{ color:'var(--mint)' }}>{selDate.date} {selDate.month} 2026 at {slot}</strong>
        </div>
        <div className="card" style={{ maxWidth:380, margin:'0 auto 24px', textAlign:'left' }}>
          {[['🏥','Clinic',doctor.clinic],['📍','Address',doctor.addr],['📞','Phone',doctor.phone],['💰','Fee',`₹${doctor.fee} (pay at clinic)`]].map(([ic,l,v])=>(
            <div key={l} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontSize:18 }}>{ic}</span>
              <div><div style={{ fontSize:11, color:'var(--text3)' }}>{l}</div><div style={{ fontSize:13, fontWeight:500 }}>{v}</div></div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
          <button className="btn btn-primary" onClick={()=>navigate('/')} style={{ padding:'11px 28px' }}>📅 Go to Dashboard</button>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.addr)}`} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ padding:'11px 28px', textDecoration:'none' }}>📍 Directions</a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade-up">
      {/* Confirm modal */}
      {confirm&&(
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:'var(--r)', padding:32, maxWidth:440, width:'100%', animation:'fadeUp .3s ease' }}>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
              <div style={{ fontFamily:'var(--serif)', fontSize:20, marginBottom:6 }}>Confirm Appointment</div>
            </div>
            <div style={{ background:'var(--bg3)', borderRadius:'var(--rs)', padding:18, marginBottom:20 }}>
              {[['👨‍⚕️ Doctor',doctor.name],['🏥 Clinic',doctor.clinic],['📅 Date',`${selDate.date} ${selDate.month} 2026`],['⏰ Time',slot],['💰 Fee',`₹${doctor.fee}`],['📝 Reason',reason||'General consultation']].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:13, color:'var(--text2)' }}>{l}</span>
                  <span style={{ fontSize:13, fontWeight:500 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-primary" onClick={doConfirm} disabled={loading} style={{ flex:1, justifyContent:'center', padding:12 }}>{loading?'⏳ Booking…':'✅ Confirm'}</button>
              <button className="btn btn-ghost" onClick={()=>setConfirm(false)} style={{ flex:1, justifyContent:'center', padding:12 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-heading"><h1>Book a <em>Doctor</em></h1><p>Real Asansol doctors · Choose specialty → Pick time → Confirm</p></div>
      <Steps current={step}/>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        <div>
          {step===0&&(
            <>
              <div style={{ display:'flex', gap:10, marginBottom:14 }}>
                <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--rs)', padding:'8px 14px' }}>
                  <span style={{ color:'var(--text3)' }}>🔍</span>
                  <input placeholder="Search doctor, specialty…" value={search} onChange={e=>setSearch(e.target.value)} style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--sans)', width:'100%' }}/>
                </div>
              </div>
              <div style={{ display:'flex', gap:7, marginBottom:16, flexWrap:'wrap' }}>
                {SPECIALTIES.map(s=>(
                  <div key={s} onClick={()=>setSpecialty(s)} style={{ padding:'6px 14px', borderRadius:100, fontSize:12, cursor:'pointer', border:`1px solid ${specialty===s?'var(--mint)':'var(--border)'}`, background:specialty===s?'var(--mintd)':'var(--card)', color:specialty===s?'var(--mint)':'var(--text2)', transition:'all .18s' }}>{s}</div>
                ))}
              </div>
              {filtered.map(d=>(
                <div key={d.id} onClick={()=>pickDoctor(d)} style={{ padding:18, cursor:'pointer', marginBottom:12, background:doctor?.id===d.id?'rgba(0,212,168,.04)':'var(--card)', border:`2px solid ${doctor?.id===d.id?'var(--mint)':'var(--border)'}`, borderRadius:'var(--r)', transition:'all .2s' }}>
                  <div style={{ display:'flex', gap:14, marginBottom:10 }}>
                    <div style={{ width:52, height:52, borderRadius:14, background:d.bg, color:d.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16, flexShrink:0 }}>{d.avatar}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15, fontWeight:600, marginBottom:2 }}>{d.name}</div>
                      <div style={{ fontSize:12, color:'var(--text2)', marginBottom:3 }}>{d.spec}</div>
                      <div style={{ fontSize:12, color:'var(--amber)' }}>{'★'.repeat(Math.floor(d.rating))} <span style={{ color:'var(--text2)' }}>{d.rating} ({d.reviews})</span></div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:15, fontWeight:700, color:'var(--mint)' }}>₹{d.fee}</div>
                      <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{d.exp} exp</div>
                      <div style={{ fontSize:11, color:'var(--green)', marginTop:4 }}>● Available</div>
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginBottom:8, lineHeight:1.5 }}>{d.about}</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                    {d.tags.map(t=><span key={t} className="tag">{t}</span>)}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>🏥 {d.clinic} · 📍 {d.addr}</div>
                  {doctor?.id===d.id&&<div style={{ marginTop:10, padding:'7px 14px', background:'var(--mintd)', borderRadius:8, fontSize:12, color:'var(--mint)', fontWeight:600, textAlign:'center' }}>✓ Selected — scroll down to choose date & time →</div>}
                </div>
              ))}
            </>
          )}

          {step===1&&doctor&&(
            <>
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'var(--mintd)', border:'1px solid rgba(0,212,168,.2)', borderRadius:'var(--rs)', marginBottom:20 }}>
                <div style={{ width:42, height:42, borderRadius:11, background:doctor.bg, color:doctor.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 }}>{doctor.avatar}</div>
                <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:600 }}>{doctor.name}</div><div style={{ fontSize:12, color:'var(--text2)' }}>{doctor.spec} · {doctor.clinic}</div></div>
                <button className="btn btn-ghost" style={{ fontSize:12, padding:'6px 12px' }} onClick={()=>{setStep(0);setSlot('');}}>Change</button>
              </div>

              <div className="section-title">Select Date</div>
              <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:20 }}>
                {DATES.map(d=>{
                  const av=doctor.available.includes(d.dayName), sel=dateIdx===d.idx;
                  return (
                    <div key={`d-${d.idx}`} onClick={()=>{if(av){setDateIdx(d.idx);setSlot('');}}} style={{ minWidth:54, padding:'10px 6px', borderRadius:12, textAlign:'center', cursor:av?'pointer':'not-allowed', border:`2px solid ${sel?'var(--mint)':'var(--border)'}`, background:sel?'var(--mintd)':av?'var(--card)':'var(--bg3)', opacity:av?1:.4, transition:'all .18s', flexShrink:0 }}>
                      <div style={{ fontSize:10, color:sel?'var(--mint)':'var(--text3)', fontWeight:600, marginBottom:3 }}>{d.dayName}</div>
                      <div style={{ fontSize:16, fontWeight:700, color:sel?'var(--mint)':'var(--text)' }}>{d.date}</div>
                      <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{d.month}</div>
                    </div>
                  );
                })}
              </div>

              {dayAvailable?(
                <>
                  <div className="section-title">Morning Slots</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                    {doctor.slots.morning.map(s=>(
                      <div key={`m-${s}`} onClick={()=>setSlot(s)} style={{ padding:'9px 16px', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:500, border:`2px solid ${slot===s?'var(--mint)':'var(--border)'}`, background:slot===s?'var(--mintd)':'var(--card)', color:slot===s?'var(--mint)':'var(--text)', transition:'all .18s' }}>{s} AM</div>
                    ))}
                  </div>
                  <div className="section-title">Evening Slots</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                    {doctor.slots.evening.map(s=>(
                      <div key={`e-${s}`} onClick={()=>setSlot(s)} style={{ padding:'9px 16px', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:500, border:`2px solid ${slot===s?'var(--mint)':'var(--border)'}`, background:slot===s?'var(--mintd)':'var(--card)', color:slot===s?'var(--mint)':'var(--text)', transition:'all .18s' }}>{s} PM</div>
                    ))}
                  </div>
                </>
              ):(
                <div style={{ padding:16, background:'rgba(255,107,107,.08)', border:'1px solid rgba(255,107,107,.2)', borderRadius:'var(--rs)', color:'var(--coral)', fontSize:13, marginBottom:20 }}>
                  ❌ Not available on {selDate.dayName}s. Please pick another date.
                </div>
              )}

              <div className="section-title">Reason for Visit (optional)</div>
              <textarea className="input" rows={3} style={{ resize:'none', marginBottom:20 }} placeholder="e.g. Diabetes follow-up, back pain, routine checkup…" value={reason} onChange={e=>setReason(e.target.value)}/>

              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-ghost" onClick={()=>setStep(0)} style={{ padding:'12px 20px' }}>← Back</button>
                <button className="btn btn-primary" disabled={!slot||!dayAvailable} onClick={()=>{setStep(2);setConfirm(true);}} style={{ flex:1, justifyContent:'center', padding:12, opacity:slot&&dayAvailable?1:.5, cursor:slot&&dayAvailable?'pointer':'not-allowed' }}>
                  {slot?`✅ Book ${slot} →`:'Select a time slot'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right summary */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>📋 Booking Summary</div>
            {[['Doctor',doctor?.name||'—'],['Specialty',doctor?.spec||'—'],['Clinic',doctor?.clinic||'—'],['Date',selDate?`${selDate.date} ${selDate.month}`:'—'],['Time',slot||'—'],['Fee',doctor?`₹${doctor.fee}`:'—']].map(([l,v])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:12, color:'var(--text2)' }}>{l}</span>
                <span style={{ fontSize:13, fontWeight:500, color:l==='Fee'?'var(--mint)':'var(--text)' }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>💡 Visit Tips</div>
            {[['🕐','Arrive 10 minutes early'],['📋','Bring prescription history'],['🩺','Note your symptoms'],['💊','Carry current medicines'],['📞','Call to reschedule if needed']].map(([ic,t])=>(
              <div key={t} style={{ display:'flex', gap:10, padding:'7px 0', borderBottom:'1px solid var(--border)', fontSize:12, color:'var(--text2)' }}>
                <span>{ic}</span><span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
