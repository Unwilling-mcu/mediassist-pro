import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../api';

const STATUS_STYLE = {
  confirmed: { bg:'rgba(0,212,168,.1)',   color:'var(--mint)',   label:'Confirmed' },
  pending:   { bg:'rgba(255,170,68,.1)',  color:'var(--amber)',  label:'Pending'   },
  cancelled: { bg:'rgba(255,107,107,.1)', color:'var(--coral)',  label:'Cancelled' },
  completed: { bg:'rgba(74,159,213,.1)',  color:'var(--blue)',   label:'Completed' },
};

// Demo data for when backend has none
const DEMO_APPTS = [
  { _id:'1', doctorName:'Dr. Debdweep Roy',    doctorSpec:'Diabetologist',    clinic:'Sormistha Clinic',    address:'Sen Releigh Rd, Asansol', phone:'+91 81019 22199', fee:300, date:'Apr 29, 2026', time:'10:30 AM', reason:'Diabetes follow-up',      status:'confirmed', createdAt: new Date() },
  { _id:'2', doctorName:'Dr. Aurobindo Maji',  doctorSpec:'Orthopedic',       clinic:'The Park Clinic',     address:'Ushagram, Asansol',       phone:'+91 79084 83174', fee:500, date:'May 2, 2026',  time:'5:30 PM',  reason:'Knee pain review',          status:'pending',   createdAt: new Date() },
  { _id:'3', doctorName:'Dr. Kalyan Mondal',   doctorSpec:'General Physician', clinic:'Mondal Medical',      address:'Hutton Rd, Asansol',      phone:'+91 94345 45200', fee:150, date:'Apr 20, 2026', time:'11:00 AM', reason:'Routine checkup',           status:'completed', createdAt: new Date() },
  { _id:'4', doctorName:'Dr. Priya Menon',     doctorSpec:'Dermatologist',    clinic:'The Park Clinic',     address:'Ushagram, Asansol',       phone:'+91 79084 83174', fee:600, date:'Apr 10, 2026', time:'10:00 AM', reason:'Skin rash consultation',    status:'cancelled', createdAt: new Date() },
];

export default function Appointments() {
  const navigate = useNavigate();
  const [appts,    setAppts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);
  const [reschedModal, setReschedModal] = useState(false);
  const [newDate,  setNewDate]  = useState('');
  const [newTime,  setNewTime]  = useState('');
  const [toast,    setToast]    = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''), 3000); };

  useEffect(() => {
    appointmentAPI.getAll()
      .then(({ data }) => setAppts(data.data?.length ? data.data : DEMO_APPTS))
      .catch(() => setAppts(DEMO_APPTS))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(id);
      setAppts(a => a.map(x => x._id===id ? {...x, status:'cancelled'} : x));
      if (selected?._id === id) setSelected(prev => ({...prev, status:'cancelled'}));
      showToast('Appointment cancelled.');
    } catch {
      // Demo mode — just update UI
      setAppts(a => a.map(x => x._id===id ? {...x, status:'cancelled'} : x));
      showToast('Appointment cancelled.');
    }
  };

  const reschedule = async () => {
    if (!newDate || !newTime) return;
    try {
      await appointmentAPI.update(selected._id, { date: newDate, time: newTime, status:'pending' });
    } catch {}
    setAppts(a => a.map(x => x._id===selected._id ? {...x, date:newDate, time:newTime, status:'pending'} : x));
    setSelected(prev => ({...prev, date:newDate, time:newTime, status:'pending'}));
    setReschedModal(false); setNewDate(''); setNewTime('');
    showToast('✅ Appointment rescheduled!');
  };

  const filtered = appts.filter(a => filter==='all' || a.status===filter);
  const upcoming = appts.filter(a => a.status==='confirmed'||a.status==='pending').length;
  const completed = appts.filter(a => a.status==='completed').length;

  return (
    <div className="fade-up">
      {toast && <div style={{ position:'fixed', top:20, right:20, zIndex:9999, background:'var(--card)', border:'1px solid var(--border2)', borderRadius:'var(--rs)', padding:'12px 20px', fontSize:13, fontWeight:500, boxShadow:'var(--shadow-lg)', animation:'fadeUp .3s ease' }}>{toast}</div>}

      {/* Reschedule modal */}
      {reschedModal && selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border2)', borderRadius:'var(--r)', padding:28, maxWidth:400, width:'100%', animation:'fadeUp .3s ease' }}>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:18 }}>📅 Reschedule Appointment</div>
            <div style={{ fontSize:14, color:'var(--text2)', marginBottom:18 }}>{selected.doctorName} · {selected.clinic}</div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:5 }}>New Date</label>
              <input className="input" type="date" value={newDate} min={new Date().toISOString().slice(0,10)} onChange={e=>setNewDate(e.target.value)} style={{ colorScheme:'dark' }}/>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:5 }}>New Time</label>
              <select className="input" value={newTime} onChange={e=>setNewTime(e.target.value)}>
                <option value="">Select time</option>
                {['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','05:00 PM','05:30 PM','06:00 PM','06:30 PM','07:00 PM'].map(t=>(
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-primary" onClick={reschedule} disabled={!newDate||!newTime} style={{ flex:1, justifyContent:'center' }}>Confirm Reschedule</button>
              <button className="btn btn-ghost" onClick={()=>setReschedModal(false)} style={{ flex:1, justifyContent:'center' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-heading">
        <h1>My <em>Appointments</em></h1>
        <p>View, reschedule or cancel your bookings</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        {[
          { label:'Total',     val:appts.length,  color:'var(--text)',   bg:'var(--card)' },
          { label:'Upcoming',  val:upcoming,       color:'var(--mint)',   bg:'var(--mintd)' },
          { label:'Completed', val:completed,      color:'var(--blue)',   bg:'var(--blued)' },
          { label:'Cancelled', val:appts.filter(a=>a.status==='cancelled').length, color:'var(--coral)', bg:'rgba(255,107,107,.1)' },
        ].map(s=>(
          <div key={s.label} className="card" style={{ textAlign:'center', background:s.bg, borderColor:'transparent' }}>
            <div style={{ fontSize:28, fontWeight:700, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:18 }}>
        <div>
          {/* Filters */}
          <div style={{ display:'flex', gap:8, marginBottom:16, justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', gap:8 }}>
              {['all','confirmed','pending','completed','cancelled'].map(f=>(
                <div key={f} onClick={()=>setFilter(f)} style={{ padding:'6px 14px', borderRadius:100, fontSize:12, cursor:'pointer', border:`1px solid ${filter===f?'var(--mint)':'var(--border)'}`, background:filter===f?'var(--mintd)':'var(--card)', color:filter===f?'var(--mint)':'var(--text2)', transition:'all .18s', textTransform:'capitalize' }}>{f}</div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={()=>navigate('/book')} style={{ fontSize:13 }}>+ Book New</button>
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:40, color:'var(--text2)' }}>Loading appointments…</div>
          ) : filtered.length===0 ? (
            <div className="card" style={{ textAlign:'center', padding:40 }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
              <div style={{ fontSize:15, fontWeight:500, marginBottom:8 }}>No {filter==='all'?'':filter} appointments</div>
              <button className="btn btn-primary" onClick={()=>navigate('/book')}>Book a Doctor</button>
            </div>
          ) : filtered.map(a => {
            const st = STATUS_STYLE[a.status] || STATUS_STYLE.pending;
            return (
              <div key={a._id} onClick={()=>setSelected(a)} style={{ padding:18, background:'var(--card)', border:`2px solid ${selected?._id===a._id?'var(--mint)':'var(--border)'}`, borderRadius:'var(--r)', cursor:'pointer', marginBottom:12, transition:'all .2s' }}>
                <div style={{ display:'flex', gap:14, marginBottom:12 }}>
                  <div style={{ width:50, height:50, borderRadius:13, background:'var(--mintd)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>👨‍⚕️</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:600, marginBottom:2 }}>{a.doctorName}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginBottom:4 }}>{a.doctorSpec} · {a.clinic}</div>
                    <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:100, background:st.bg, color:st.color }}>● {st.label}</span>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--mint)' }}>{a.time}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{a.date}</div>
                    <div style={{ fontSize:12, color:'var(--mint)', marginTop:4 }}>₹{a.fee}</div>
                  </div>
                </div>
                {a.reason && <div style={{ fontSize:12, color:'var(--text2)', paddingTop:10, borderTop:'1px solid var(--border)' }}>📝 {a.reason}</div>}
                {(a.status==='confirmed'||a.status==='pending') && (
                  <div style={{ display:'flex', gap:8, marginTop:12 }}>
                    <button onClick={e=>{e.stopPropagation();setSelected(a);setReschedModal(true);}} className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:12, padding:'7px' }}>📅 Reschedule</button>
                    <button onClick={e=>{e.stopPropagation();cancel(a._id);}} className="btn btn-danger" style={{ flex:1, justifyContent:'center', fontSize:12, padding:'7px' }}>✕ Cancel</button>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.address)}`} target="_blank" rel="noreferrer"
                      onClick={e=>e.stopPropagation()} className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:12, padding:'7px', textDecoration:'none' }}>📍 Directions</a>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="card" style={{ position:'sticky', top:0, alignSelf:'start' }}>
          {!selected ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text3)' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
              <div style={{ fontSize:14 }}>Select an appointment to view details</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize:15, fontWeight:600, marginBottom:18, paddingBottom:14, borderBottom:'1px solid var(--border)' }}>Appointment Details</div>
              {[
                ['👨‍⚕️ Doctor',   selected.doctorName],
                ['🏥 Clinic',    selected.clinic],
                ['📍 Address',   selected.address],
                ['📞 Phone',     selected.phone],
                ['📅 Date',      selected.date],
                ['⏰ Time',      selected.time],
                ['💰 Fee',       `₹${selected.fee}`],
                ['📝 Reason',    selected.reason||'General consultation'],
                ['📊 Status',    selected.status],
              ].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:12, color:'var(--text2)' }}>{l}</span>
                  <span style={{ fontSize:13, fontWeight:500, textAlign:'right', maxWidth:180 }}>{v||'—'}</span>
                </div>
              ))}

              <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:16 }}>
                {(selected.status==='confirmed'||selected.status==='pending') && (
                  <>
                    <button className="btn btn-primary" style={{ justifyContent:'center' }} onClick={()=>setReschedModal(true)}>📅 Reschedule</button>
                    <button className="btn btn-danger" style={{ justifyContent:'center' }} onClick={()=>cancel(selected._id)}>✕ Cancel Appointment</button>
                  </>
                )}
                {selected.phone && (
                  <a href={`tel:${selected.phone.replace(/\s/g,'')}`} className="btn btn-ghost" style={{ justifyContent:'center', textDecoration:'none' }}>📞 Call Clinic</a>
                )}
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ justifyContent:'center', textDecoration:'none' }}>📍 Get Directions</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
