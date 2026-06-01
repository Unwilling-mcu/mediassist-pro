import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API  = BASE.endsWith('/api') ? BASE : `${BASE}/api`;

const SPECIALISATIONS = [
  'General Physician','Cardiologist','Dermatologist','Neurologist',
  'Orthopaedic','Gynaecologist','Paediatrician','Psychiatrist',
  'ENT Specialist','Ophthalmologist','Urologist','Gastroenterologist',
  'Pulmonologist','Endocrinologist','Oncologist','Radiologist','Other',
];

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const input = {
  padding: '9px 13px', borderRadius: 10, border: '1px solid var(--border2)',
  background: 'var(--bg3)', color: 'var(--text)', fontSize: 13,
  outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--sans)',
};

export default function DoctorOnboarding() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem('token');
  const [existing, setExisting]   = useState(null);
  const [loading,  setLoading]    = useState(true);
  const [saving,   setSaving]     = useState(false);
  const [error,    setError]      = useState('');
  const [success,  setSuccess]    = useState('');

  const [form, setForm] = useState({
    specialisation: '',
    licenceNumber:  '',
    experience:     '',
    qualification:  '',
    hospital:       '',
    bio:            '',
    consultFee:     '',
    availableDays:  ['Mon','Tue','Wed','Thu','Fri'],
    availableFrom:  '09:00',
    availableTo:    '17:00',
  });

  useEffect(() => {
    fetch(`${API}/doctors/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setExisting(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter(d => d !== day)
        : [...f.availableDays, day],
    }));
  };

  const handleSubmit = async () => {
    if (!form.specialisation || !form.licenceNumber || !form.experience) {
      setError('Specialisation, licence number, and experience are required'); return;
    }
    setSaving(true); setError('');
    try {
      const res  = await fetch(`${API}/doctors/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, experience: Number(form.experience), consultFee: Number(form.consultFee) || 0 }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Your profile has been submitted for approval! Your org admin will review it shortly.');
        setExisting(data.data);
      } else setError(data.message);
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>⏳ Loading…</div>
  );

  // Already submitted
  if (existing) return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="card" style={{ padding: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>
          {existing.status === 'approved' ? '✅' : existing.status === 'rejected' ? '❌' : '⏳'}
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 20 }}>
          {existing.status === 'approved' ? 'You are an approved doctor!' :
           existing.status === 'rejected' ? 'Application rejected' :
           'Application under review'}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, margin: '0 0 16px' }}>
          {existing.status === 'approved'
            ? `Specialisation: ${existing.specialisation} · ${existing.experience} years experience`
            : existing.status === 'rejected'
            ? `Reason: ${existing.rejectionReason || 'Contact your org admin'}`
            : 'Your org admin will approve or reject your application. You will be notified.'}
        </p>
        {existing.status === 'approved' && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/doctor-chat')} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: 'var(--mint)', color: '#080E1C', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              💬 Go to Doctor Chat
            </button>
            <button onClick={() => navigate('/appointments')} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>
              📅 View Appointments
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>🩺 Doctor Registration</h1>
        <p style={{ color: 'var(--text2)', fontSize: 13, margin: 0 }}>
          Submit your professional details for approval by your organisation admin.
        </p>
      </div>

      {error   && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.2)', color: 'var(--coral)', fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {success && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(82,214,122,.08)', border: '1px solid rgba(82,214,122,.2)', color: 'var(--green)', fontSize: 13, marginBottom: 16 }}>{success}</div>}

      <div className="card" style={{ padding: '24px 28px', marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Professional Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Specialisation *</label>
            <select style={input} value={form.specialisation} onChange={e => setForm(f => ({ ...f, specialisation: e.target.value }))}>
              <option value="">Select specialisation</option>
              {SPECIALISATIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Medical Licence Number *</label>
            <input style={input} placeholder="e.g. MCI-12345" value={form.licenceNumber} onChange={e => setForm(f => ({ ...f, licenceNumber: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Years of Experience *</label>
            <input style={input} type="number" min="0" max="60" placeholder="e.g. 8" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Qualification</label>
            <input style={input} placeholder="e.g. MBBS, MD" value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Hospital / Clinic Name</label>
            <input style={input} placeholder="e.g. Apollo Hospital Asansol" value={form.hospital} onChange={e => setForm(f => ({ ...f, hospital: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Consultation Fee (₹)</label>
            <input style={input} type="number" min="0" placeholder="e.g. 500" value={form.consultFee} onChange={e => setForm(f => ({ ...f, consultFee: e.target.value }))} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Bio (optional)</label>
          <textarea style={{ ...input, height: 80, resize: 'vertical' }} placeholder="Brief professional bio — specialisations, notable experience, etc." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}>
          </textarea>
        </div>
      </div>

      <div className="card" style={{ padding: '24px 28px', marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Availability</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Available Days</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DAYS.map(day => (
              <button key={day} onClick={() => toggleDay(day)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)',
                border: '1px solid var(--border2)',
                background: form.availableDays.includes(day) ? 'var(--mint)' : 'var(--bg3)',
                color: form.availableDays.includes(day) ? '#080E1C' : 'var(--text2)',
              }}>{day}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Available From</label>
            <input style={input} type="time" value={form.availableFrom} onChange={e => setForm(f => ({ ...f, availableFrom: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>Available To</label>
            <input style={input} type="time" value={form.availableTo} onChange={e => setForm(f => ({ ...f, availableTo: e.target.value }))} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontSize: 13, cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={saving} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--mint)', color: '#080E1C', fontWeight: 700, fontSize: 13, cursor: saving ? 'wait' : 'pointer' }}>
          {saving ? '⏳ Submitting…' : '✓ Submit for Approval'}
        </button>
      </div>
    </div>
  );
}