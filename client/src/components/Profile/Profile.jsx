import React, { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { patientAPI } from '../../api';

function calcBMI(h, w) {
  if (!h || !w || h < 50 || w < 10) return null;
  return Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
}
function bmiCat(bmi) {
  if (!bmi) return { label:'—', color:'var(--text2)', pct:0 };
  if (bmi < 18.5) return { label:'Underweight',    color:'var(--blue)',  pct:15 };
  if (bmi < 25)   return { label:'✓ Normal Weight', color:'var(--mint)',  pct:45 };
  if (bmi < 30)   return { label:'Overweight',      color:'var(--amber)', pct:70 };
  return            { label:'Obese',              color:'var(--coral)', pct:90 };
}

function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn:full?'1/-1':'span 1', display:'flex', flexDirection:'column', gap:5 }}>
      <label style={{ fontSize:12, color:'var(--text2)', fontWeight:500 }}>{label}</label>
      {children}
    </div>
  );
}

export default function Profile() {
  const { patient, setPatient, user } = useStore();
  const [form, setForm] = useState({
    dateOfBirth:'', gender:'Male', bloodGroup:'B+',
    phone:'', address:'', city:'Asansol', state:'West Bengal',
    heightCm:'', weightKg:'', waistCm:'',
    allergies:'', chronicConditions:'', pastSurgeries:'', familyHistory:'',
    smokingStatus:'Non-Smoker', alcoholUse:'None',
    ec_name:'', ec_relation:'', ec_phone:'',
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState('');

  useEffect(() => {
    if (!patient) return;
    setForm(f => ({
      ...f,
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().slice(0,10) : '',
      gender:      patient.gender      || 'Male',
      bloodGroup:  patient.bloodGroup  || 'B+',
      phone:       patient.phone       || '',
      address:     patient.address     || '',
      city:        patient.city        || 'Asansol',
      state:       patient.state       || 'West Bengal',
      heightCm:    patient.heightCm    || '',
      weightKg:    patient.weightKg    || '',
      waistCm:     patient.waistCm     || '',
      allergies:         (patient.allergies         || []).join(', '),
      chronicConditions: (patient.chronicConditions || []).join(', '),
      pastSurgeries:     (patient.pastSurgeries     || []).join(', '),
      familyHistory:     (patient.familyHistory     || []).join(', '),
      smokingStatus: patient.smokingStatus || 'Non-Smoker',
      alcoholUse:    patient.alcoholUse    || 'None',
      ec_name:     patient.emergencyContacts?.[0]?.name         || '',
      ec_relation: patient.emergencyContacts?.[0]?.relationship || '',
      ec_phone:    patient.emergencyContacts?.[0]?.phone        || '',
    }));
  }, [patient]);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const bmi = calcBMI(Number(form.heightCm), Number(form.weightKg));
  const cat = bmiCat(bmi);

  const save = async () => {
    setSaving(true); setError('');
    try {
      const payload = {
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender, bloodGroup: form.bloodGroup,
        phone: form.phone, address: form.address, city: form.city, state: form.state,
        heightCm: Number(form.heightCm)||undefined, weightKg: Number(form.weightKg)||undefined, waistCm: Number(form.waistCm)||undefined,
        allergies:         form.allergies.split(',').map(s=>s.trim()).filter(Boolean),
        chronicConditions: form.chronicConditions.split(',').map(s=>s.trim()).filter(Boolean),
        pastSurgeries:     form.pastSurgeries.split(',').map(s=>s.trim()).filter(Boolean),
        familyHistory:     form.familyHistory.split(',').map(s=>s.trim()).filter(Boolean),
        smokingStatus: form.smokingStatus, alcoholUse: form.alcoholUse,
        emergencyContacts: form.ec_name ? [{ name:form.ec_name, relationship:form.ec_relation, phone:form.ec_phone }] : [],
      };
      const { data } = await patientAPI.updateProfile(payload);
      setPatient(data.data);
      setSaved(true); setTimeout(()=>setSaved(false), 2500);
    } catch(e) { setError(e.response?.data?.message || 'Save failed. Check server connection.'); }
    setSaving(false);
  };

  const inp = (key, type='text', ph='') => (
    <input className="input" type={type} placeholder={ph} value={form[key]} onChange={set(key)}
      style={type==='date'?{colorScheme:'dark'}:{}} />
  );
  const sel = (key, opts) => (
    <select className="input" value={form[key]} onChange={set(key)}>
      {opts.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="fade-up">
      <div className="page-heading">
        <h1>Patient <em>Profile</em></h1>
        <p>Your complete health identity · BMI auto-calculated · Emergency contacts</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:20 }}>
        {/* Left */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="card" style={{ textAlign:'center' }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,var(--mint),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:700, color:'#fff', margin:'0 auto 14px', border:'3px solid var(--border2)' }}>
              {(user?.name||'U').slice(0,1).toUpperCase()}
            </div>
            <div style={{ fontFamily:'var(--serif)', fontSize:18, marginBottom:4 }}>{user?.name||'—'}</div>
            <div style={{ fontSize:12, color:'var(--text2)', marginBottom:16 }}>
              ID: {patient?.patientId||'MA-XXXX'}<br/>{user?.email}
            </div>

            {/* BMI ring */}
            <div style={{ background:'var(--bg3)', borderRadius:'var(--rs)', padding:16, marginBottom:14 }}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ display:'block', margin:'0 auto 6px' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="8"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke={cat.color} strokeWidth="8"
                  strokeDasharray={`${2*Math.PI*40}`}
                  strokeDashoffset={`${2*Math.PI*40*(1-Math.min(cat.pct,100)/100)}`}
                  strokeLinecap="round" transform="rotate(-90 50 50)"
                  style={{ transition:'all .8s ease' }}/>
                <text x="50" y="50" textAnchor="middle" dy=".3em"
                  style={{ fontSize:18, fontWeight:700, fill:cat.color, fontFamily:'DM Sans' }}>
                  {bmi||'—'}
                </text>
              </svg>
              <div style={{ fontSize:11, color:'var(--text2)', textTransform:'uppercase', letterSpacing:.4 }}>BMI</div>
              <div style={{ fontSize:13, fontWeight:600, color:cat.color, marginTop:4 }}>{cat.label}</div>
              {bmi && <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>{form.heightCm}cm · {form.weightKg}kg</div>}
            </div>

            {/* Health chips */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
              {form.bloodGroup && <span className="badge" style={{ background:'rgba(255,107,107,.15)', color:'var(--coral)', fontWeight:700 }}>{form.bloodGroup}</span>}
              {form.allergies.split(',').filter(Boolean).map(a=>(
                <span key={a} className="badge" style={{ background:'rgba(255,107,107,.1)', color:'var(--coral)' }}>⚠ {a.trim()}</span>
              ))}
              {form.chronicConditions.split(',').filter(Boolean).map(c=>(
                <span key={c} className="badge" style={{ background:'var(--blued)', color:'var(--blue)' }}>{c.trim()}</span>
              ))}
            </div>
          </div>

          {/* Emergency contact */}
          <div className="card">
            <div className="section-title">🚨 Emergency Contact</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div>
                <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:4 }}>Full Name</label>
                <input className="input" placeholder="Contact name" value={form.ec_name} onChange={set('ec_name')}/>
              </div>
              <div>
                <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:4 }}>Relationship</label>
                <input className="input" placeholder="e.g. Father, Spouse" value={form.ec_relation} onChange={set('ec_relation')}/>
              </div>
              <div>
                <label style={{ fontSize:12, color:'var(--text2)', display:'block', marginBottom:4 }}>Phone Number</label>
                <input className="input" type="tel" placeholder="+91 XXXXX XXXXX" value={form.ec_phone} onChange={set('ec_phone')}/>
              </div>
              {form.ec_phone && (
                <a href={`tel:${form.ec_phone.replace(/\s/g,'')}`} className="btn btn-primary" style={{ justifyContent:'center', textDecoration:'none' }}>📞 Call Now</a>
              )}
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="card">
          <div className="section-title" style={{ marginBottom:16 }}>Personal Information</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
            <Field label="Date of Birth">
              <input className="input" type="date"
                value={form.dateOfBirth}
                max={new Date().toISOString().slice(0,10)}
                onChange={set('dateOfBirth')}
                style={{ colorScheme:'dark', cursor:'pointer' }}
              />
            </Field>
            <Field label="Gender">{sel('gender',['Male','Female','Other'])}</Field>
            <Field label="Blood Group">{sel('bloodGroup',['A+','A-','B+','B-','AB+','AB-','O+','O-'])}</Field>
            <Field label="Phone">{inp('phone','tel','+91 XXXXX XXXXX')}</Field>
            <Field label="City">{inp('city','text','Asansol')}</Field>
            <Field label="State">{inp('state','text','West Bengal')}</Field>
            <Field label="Address" full>{inp('address','text','42 Rabindra Nagar, Asansol')}</Field>
          </div>

          <hr className="divider"/>
          <div className="section-title" style={{ marginBottom:16 }}>
            Physical Stats <span style={{ fontSize:11, color:'var(--mint)', fontWeight:400 }}>BMI auto-calculated</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:20 }}>
            <Field label="Height (cm)">{inp('heightCm','number','172')}</Field>
            <Field label="Weight (kg)">{inp('weightKg','number','70')}</Field>
            <Field label="Waist (cm)">{inp('waistCm','number','82')}</Field>
          </div>

          <hr className="divider"/>
          <div className="section-title" style={{ marginBottom:16 }}>Medical History</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
            <Field label="Chronic Conditions (comma separated)">{inp('chronicConditions','text','Type 2 Diabetes, Hypertension')}</Field>
            <Field label="Drug Allergies (comma separated)">{inp('allergies','text','Penicillin')}</Field>
            <Field label="Past Surgeries">{inp('pastSurgeries','text','None')}</Field>
            <Field label="Family History">{inp('familyHistory','text','Heart Disease (Father)')}</Field>
            <Field label="Smoking Status">{sel('smokingStatus',['Non-Smoker','Smoker','Former Smoker'])}</Field>
            <Field label="Alcohol Use">{sel('alcoholUse',['None','Occasional','Regular'])}</Field>
          </div>

          {error && (
            <div style={{ background:'rgba(255,107,107,.1)', border:'1px solid rgba(255,107,107,.2)', borderRadius:8, padding:'10px 14px', color:'var(--coral)', fontSize:13, marginBottom:14 }}>
              ❌ {error}
            </div>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving} style={{ padding:'11px 28px' }}>
              {saving ? '⏳ Saving…' : '💾 Save Profile'}
            </button>
            {saved && <span style={{ color:'var(--mint)', fontSize:13 }}>✓ Profile saved successfully!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
