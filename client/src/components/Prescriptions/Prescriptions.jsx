import React, { useState, useEffect, useRef } from 'react';
import { prescriptionAPI } from '../../api';
import useStore from '../../store/useStore';
import { exportPrescriptionPDF, exportHealthReportPDF } from '../../services/pdfService';

const EMPTY = { medicineName:'', dosage:'', frequency:'', timing:'', duration:'', purpose:'', prescribedBy:'', prescribedAt:'', daysSupply:30, costPerUnit:'', refillsLeft:0, pharmacy:'', notes:'' };

const DEMO = [
  { id:1, medicineName:'Metformin 500mg',    dosage:'500mg',    frequency:'Twice daily',  timing:'After meals',        duration:'60 days ongoing', purpose:'Type 2 Diabetes',       prescribedBy:'Dr. Vivek Rao',    prescribedAt:'Mar 12, 2026', daysSupply:60, daysRemaining:28, costPerUnit:'₹12/strip',   refillsLeft:3, pharmacy:'Apollo Pharmacy', status:'active',        notes:'Take with food to reduce stomach upset.' },
  { id:2, medicineName:'Atorvastatin 10mg',  dosage:'10mg',     frequency:'Once daily',   timing:'After dinner',       duration:'Ongoing',         purpose:'Cholesterol',           prescribedBy:'Dr. Debdweep Roy', prescribedAt:'Feb 5, 2026',  daysSupply:30, daysRemaining:7,  costPerUnit:'₹8/tablet',   refillsLeft:2, pharmacy:'MedPlus',         status:'refill_needed', notes:'' },
  { id:3, medicineName:'Vitamin D3 1000 IU', dosage:'1000 IU',  frequency:'Once daily',   timing:'Morning with food',  duration:'90 days',         purpose:'Vitamin D deficiency',  prescribedBy:'Dr. Vivek Rao',    prescribedAt:'Apr 1, 2026',  daysSupply:90, daysRemaining:60, costPerUnit:'₹5/capsule',  refillsLeft:5, pharmacy:'Apollo Pharmacy', status:'active',        notes:'' },
  { id:4, medicineName:'Amlodipine 5mg',     dosage:'5mg',      frequency:'Once daily',   timing:'Morning',            duration:'30 days',         purpose:'Blood pressure',        prescribedBy:'Dr. Deepa Sharma', prescribedAt:'Jan 20, 2026', daysSupply:30, daysRemaining:0,  costPerUnit:'₹6/tablet',   refillsLeft:0, pharmacy:'Netmeds',         status:'completed',     notes:'' },
];

export default function Prescriptions() {
  const { patient, user }       = useStore();
  const [list, setList]         = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast]       = useState('');
  const [uploadedImg, setUploadedImg] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef            = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''),3000); };

  useEffect(() => {
    prescriptionAPI.getAll()
      .then(({ data }) => setList(data.data))
      .catch(() => setList(DEMO))
      .finally(() => setLoading(false));
  }, []);

  const add = async () => {
    if (!form.medicineName) return;
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (uploadedImg) fd.append('image', uploadedImg);
      const { data } = await prescriptionAPI.create(fd.has('image')
        ? fd
        : form
      );
      setList(l=>[data.data,...l]);
      setShowAdd(false); setForm(EMPTY); setUploadedImg(null); setUploadPreview(null);
      showToast('✅ Prescription saved!');
    } catch { showToast('❌ Save failed. Check server.'); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this prescription?')) return;
    try { await prescriptionAPI.remove(id); setList(l=>l.filter(r=>r._id!==id&&r.id!==id)); setSelected(null); showToast('🗑️ Deleted.'); }
    catch { showToast('❌ Delete failed.'); }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('❌ File too large. Max 5MB.'); return; }
    setUploadedImg(file);
    const reader = new FileReader();
    reader.onload = (ev) => setUploadPreview(ev.target.result);
    reader.readAsDataURL(file);
    showToast(`📎 ${file.name} selected`);
  };

  const handleExportSingle = async (rx) => {
    if (!exportPrescriptionPDF) { showToast('Install jsPDF: npm install jspdf'); return; }
    setExporting(true); showToast('📄 Generating PDF…');
    try { await exportPrescriptionPDF(rx, patient, user); showToast('✅ PDF downloaded!'); }
    catch(e) { showToast('❌ PDF failed: ' + e.message); }
    setExporting(false);
  };

  const handleExportReport = async () => {
    if (!exportHealthReportPDF) { showToast('Install jsPDF: npm install jspdf'); return; }
    setExporting(true); showToast('📊 Generating Health Report…');
    try {
      await exportHealthReportPDF(patient, user, list.filter(r=>r.status==='active'||r.status==='refill_needed'), { heartRate:74, bp:'118/76', spo2:99, temp:98.4 });
      showToast('✅ Health Report downloaded!');
    } catch(e) { showToast('❌ Report failed: ' + e.message); }
    setExporting(false);
  };

  const statusBadge = s => ({active:'badge-active',refill_needed:'badge-refill',expired:'badge-expired',completed:'badge-expired'}[s]||'badge-active');
  const active = list.filter(r=>r.status==='active'||r.status==='refill_needed');
  const past   = list.filter(r=>r.status==='expired' ||r.status==='completed');

  const RxCard = ({ rx }) => (
    <div onClick={()=>setSelected(rx)} style={{ display:'flex', gap:14, padding:16, background:'var(--card)', border:`1px solid ${selected?._id===rx._id||selected?.id===rx.id?'var(--mint)':'var(--border)'}`, borderRadius:'var(--r)', cursor:'pointer', marginBottom:10, transition:'all .18s' }}>
      <div style={{ width:42, height:42, borderRadius:11, background:'var(--mintd)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>💊</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:500, marginBottom:3 }}>{rx.medicineName}</div>
        <div style={{ fontSize:12, color:'var(--text2)', marginBottom:5 }}>{rx.prescribedBy||'—'} · {rx.prescribedAt||'—'}</div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span className={`badge ${statusBadge(rx.status)}`}>{(rx.status||'active').replace('_',' ')}</span>
          <span style={{ fontSize:11, color:'var(--text2)' }}>{rx.frequency} · {rx.daysRemaining??rx.daysSupply??'—'} days left</span>
        </div>
      </div>
      <button onClick={e=>{e.stopPropagation();handleExportSingle(rx);}} title="Export PDF"
        style={{ background:'none', border:'1px solid var(--border)', borderRadius:9, padding:'6px 10px', cursor:'pointer', color:'var(--text3)', fontSize:13, alignSelf:'center', transition:'all .18s', fontFamily:'var(--sans)' }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--mint)';e.currentTarget.style.color='var(--mint)';}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text3)';}}>
        📄
      </button>
    </div>
  );

  return (
    <div className="fade-up">
      {toast&&<div style={{ position:'fixed', top:20, right:20, zIndex:9999, background:'var(--card)', border:'1px solid var(--border2)', borderRadius:'var(--rs)', padding:'12px 20px', fontSize:13, fontWeight:500, boxShadow:'var(--shadow-lg)', animation:'fadeUp .3s ease' }}>{toast}</div>}

      <div className="page-heading">
        <h1>My <em>Prescriptions</em></h1>
        <p>Medications, dosage schedules, refills · Export as PDF</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 350px', gap:18 }}>
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
            <button className="btn btn-primary" onClick={()=>setShowAdd(s=>!s)}>{showAdd?'✕ Cancel':'+ Add Prescription'}</button>
            <button className="btn btn-ghost" onClick={handleExportReport} disabled={exporting}>📊 Export Health Report PDF</button>
            {/* Real file upload */}
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display:'none' }}/>
            <button className="btn btn-ghost" onClick={()=>fileInputRef.current?.click()}>📎 Upload Prescription</button>
          </div>

          {/* Upload preview */}
          {uploadPreview&&(
            <div style={{ marginBottom:14, padding:14, background:'var(--card)', border:'1px solid var(--mint)', borderRadius:'var(--r)', display:'flex', gap:14, alignItems:'center' }}>
              <img src={uploadPreview} alt="preview" style={{ width:60, height:60, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)' }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>📎 {uploadedImg?.name}</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>{(uploadedImg?.size/1024).toFixed(0)} KB · Ready to attach to next prescription</div>
              </div>
              <button onClick={()=>{setUploadedImg(null);setUploadPreview(null);}} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'var(--coral)', fontSize:12, fontFamily:'var(--sans)' }}>Remove</button>
            </div>
          )}

          {showAdd&&(
            <div className="card" style={{ marginBottom:16, borderColor:'var(--mint)' }}>
              <div style={{ fontWeight:600, marginBottom:14, color:'var(--mint)' }}>➕ Add New Prescription</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[['Medicine Name *','medicineName','text','Metformin 500mg'],['Dosage *','dosage','text','500mg'],['Frequency *','frequency','text','Twice daily'],['Timing','timing','text','After meals'],['Duration','duration','text','30 days'],['Purpose','purpose','text','Diabetes'],['Prescribed By','prescribedBy','text','Dr. Name'],['Date Prescribed','prescribedAt','text','Apr 29, 2026'],['Days Supply','daysSupply','number','30'],['Cost/Unit','costPerUnit','text','₹12'],['Refills Left','refillsLeft','number','3'],['Pharmacy','pharmacy','text','Apollo Pharmacy']].map(([l,k,t,ph])=>(
                  <div key={k}>
                    <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:4 }}>{l}</label>
                    <input className="input" type={t} placeholder={ph} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
                  </div>
                ))}
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:4 }}>Notes</label>
                  <textarea className="input" rows={2} style={{ resize:'none' }} placeholder="Any special instructions…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
                </div>
                {uploadPreview&&(
                  <div style={{ gridColumn:'1/-1', fontSize:12, color:'var(--mint)' }}>📎 Prescription image attached: {uploadedImg?.name}</div>
                )}
              </div>
              <div style={{ display:'flex', gap:10, marginTop:14 }}>
                <button className="btn btn-primary" onClick={add} disabled={saving}>{saving?'⏳ Saving…':'💾 Save'}</button>
                <button className="btn btn-ghost" onClick={()=>{setShowAdd(false);setForm(EMPTY);}}>Cancel</button>
              </div>
            </div>
          )}

          {loading ? <div style={{ textAlign:'center', padding:40, color:'var(--text2)' }}>Loading…</div> : (
            <>
              <div className="section-title">Active Medications ({active.length})</div>
              {active.length===0&&<div className="card" style={{ color:'var(--text2)', fontSize:13, textAlign:'center', padding:24 }}>No active prescriptions. Add one above.</div>}
              {active.map(rx=><RxCard key={rx._id||rx.id} rx={rx}/>)}
              {past.length>0&&<>
                <div className="section-title" style={{ marginTop:20 }}>Past ({past.length})</div>
                {past.map(rx=><RxCard key={rx._id||rx.id} rx={rx}/>)}
              </>}

              {/* Upload drop zone */}
              <div style={{ border:'2px dashed var(--border2)', borderRadius:'var(--r)', padding:28, textAlign:'center', cursor:'pointer', marginTop:14, transition:'all .2s' }}
                onClick={()=>fileInputRef.current?.click()}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--mint)';e.currentTarget.style.background='var(--mintd)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.background='transparent';}}>
                <div style={{ fontSize:28, marginBottom:8 }}>📎</div>
                <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>Upload a Prescription</div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>Click to browse · JPG, PNG, PDF · Max 5MB</div>
              </div>
            </>
          )}
        </div>

        {/* Detail panel */}
        <div className="card" style={{ position:'sticky', top:0, alignSelf:'start' }}>
          {!selected?(
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text3)' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>💊</div>
              <div style={{ fontSize:14, marginBottom:8 }}>Select a medication</div>
              <div style={{ fontSize:12 }}>to view details and export PDF</div>
            </div>
          ):(
            <>
              <div style={{ display:'flex', gap:14, marginBottom:18, paddingBottom:16, borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:50, height:50, borderRadius:13, background:'var(--mintd)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>💊</div>
                <div><div style={{ fontSize:15, fontWeight:600 }}>{selected.medicineName}</div><div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>{selected.purpose||'General use'}</div></div>
              </div>

              {/* Progress ring */}
              {(()=>{
                const rem=selected.daysRemaining??selected.daysSupply??30, tot=selected.daysSupply||30;
                const pct=Math.min(100,Math.round((rem/tot)*100)), r=36, c=2*Math.PI*r;
                return (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:16, background:'var(--bg3)', borderRadius:'var(--rs)', marginBottom:18 }}>
                    <div style={{ fontSize:11, color:'var(--text2)', textTransform:'uppercase', letterSpacing:.4, marginBottom:8 }}>Supply Remaining</div>
                    <svg width="90" height="90" viewBox="0 0 90 90">
                      <circle cx="45" cy="45" r={r} fill="none" stroke="var(--border)" strokeWidth="7"/>
                      <circle cx="45" cy="45" r={r} fill="none" stroke="var(--mint)" strokeWidth="7" strokeDasharray={c} strokeDashoffset={c*(1-pct/100)} strokeLinecap="round" transform="rotate(-90 45 45)" style={{ transition:'stroke-dashoffset .8s ease' }}/>
                      <text x="45" y="45" textAnchor="middle" dy=".3em" style={{ fontSize:15, fontWeight:700, fill:'var(--mint)', fontFamily:'DM Sans' }}>{pct}%</text>
                    </svg>
                    <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>{rem} of {tot} days</div>
                  </div>
                );
              })()}

              {[['Prescribed By',selected.prescribedBy],['Date',selected.prescribedAt],['Dosage',selected.dosage],['Frequency',selected.frequency],['Timing',selected.timing],['Duration',selected.duration],['Cost/unit',selected.costPerUnit],['Refills left',selected.refillsLeft],['Pharmacy',selected.pharmacy]].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:12, color:'var(--text2)' }}>{l}</span>
                  <span style={{ fontSize:13, fontWeight:500 }}>{v??'—'}</span>
                </div>
              ))}

              {selected.notes&&(
                <div style={{ marginTop:14, padding:12, background:'var(--mintd)', borderRadius:'var(--rs)', border:'1px solid rgba(0,212,168,.15)' }}>
                  <div style={{ fontSize:12, color:'var(--mint)', fontWeight:600, marginBottom:4 }}>⚑ Notes</div>
                  <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>{selected.notes}</div>
                </div>
              )}

              {selected.imageUrl&&(
                <div style={{ marginTop:14 }}>
                  <div style={{ fontSize:12, color:'var(--text2)', marginBottom:6 }}>📎 Prescription Image</div>
                  <img src={`http://localhost:5000${selected.imageUrl}`} alt="prescription" style={{ width:'100%', borderRadius:8, border:'1px solid var(--border)', cursor:'pointer' }} onClick={()=>window.open(`http://localhost:5000${selected.imageUrl}`)}/>
                </div>
              )}

              <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:16 }} onClick={()=>handleExportSingle(selected)} disabled={exporting}>
                {exporting?'⏳ Generating…':'📄 Export Prescription PDF'}
              </button>
              <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', marginTop:8 }}>🔄 Request Refill</button>
              <button className="btn btn-danger" style={{ width:'100%', justifyContent:'center', marginTop:8 }} onClick={()=>del(selected._id||selected.id)}>🗑️ Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
