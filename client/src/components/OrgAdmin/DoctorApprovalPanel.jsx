import { useState, useEffect } from 'react';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API  = BASE.endsWith('/api') ? BASE : `${BASE}/api`;

export default function DoctorApprovalPanel() {
  const token = localStorage.getItem('token');
  const [pending,   setPending]   = useState([]);
  const [approved,  setApproved]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [acting,    setActing]    = useState(null);
  const [tab,       setTab]       = useState('pending');
  const [rejectId,  setRejectId]  = useState(null);
  const [reason,    setReason]    = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        fetch(`${API}/doctors/pending`,  { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/doctors`,          { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [pData, aData] = await Promise.all([pRes.json(), aRes.json()]);
      if (pData.success) setPending(pData.data);
      if (aData.success) setApproved(aData.data);
    } catch {}
    setLoading(false);
  };

  const approve = async (id) => {
    setActing(id);
    await fetch(`${API}/doctors/${id}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    setActing(null);
    loadAll();
  };

  const reject = async () => {
    if (!rejectId) return;
    setActing(rejectId);
    await fetch(`${API}/doctors/${rejectId}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason }),
    });
    setActing(null); setRejectId(null); setReason('');
    loadAll();
  };

  const DoctorCard = ({ doctor, showActions }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--mintd)', color: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
        🩺
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{doctor.user?.name || 'Unknown'}</span>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(74,159,213,.1)', color: 'var(--blue)' }}>{doctor.specialisation}</span>
          {doctor.qualification && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{doctor.qualification}</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>
          {doctor.user?.email} · {doctor.experience} yrs exp
          {doctor.licenceNumber && ` · Licence: ${doctor.licenceNumber}`}
          {doctor.hospital && ` · ${doctor.hospital}`}
        </div>
        {doctor.bio && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4, fontStyle: 'italic' }}>"{doctor.bio}"</div>}
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
          Available: {(doctor.availableDays || []).join(', ')} · {doctor.availableFrom}–{doctor.availableTo}
          {doctor.consultFee > 0 && ` · ₹${doctor.consultFee} consult fee`}
        </div>
      </div>
      {showActions && (
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => approve(doctor._id)}
            disabled={acting === doctor._id}
            style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'var(--mint)', color: '#080E1C', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
          >
            {acting === doctor._id ? '…' : '✓ Approve'}
          </button>
          <button
            onClick={() => { setRejectId(doctor._id); setReason(''); }}
            disabled={acting === doctor._id}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--coral)', fontSize: 12, cursor: 'pointer' }}
          >
            ✗ Reject
          </button>
        </div>
      )}
      {!showActions && (
        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: 'rgba(82,214,122,.1)', color: 'var(--green)', flexShrink: 0 }}>
          ✓ Approved
        </span>
      )}
    </div>
  );

  return (
    <div className="card" style={{ padding: '20px 22px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
          🩺 Doctors
          {pending.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(255,170,68,.15)', color: 'var(--amber)' }}>
              {pending.length} pending
            </span>
          )}
        </h3>
        <div style={{ display: 'flex', gap: 6 }}>
          {['pending', 'approved'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)',
              border: '1px solid var(--border2)',
              background: tab === t ? 'var(--text)' : 'transparent',
              color: tab === t ? 'var(--bg)' : 'var(--text2)',
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)} ({t === 'pending' ? pending.length : approved.length})
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 20, color: 'var(--text2)', fontSize: 13 }}>⏳ Loading…</div>}

      {!loading && tab === 'pending' && (
        pending.length === 0
          ? <div style={{ textAlign: 'center', padding: 20, color: 'var(--text3)', fontSize: 13 }}>No pending doctor applications</div>
          : pending.map(d => <DoctorCard key={d._id} doctor={d} showActions={true} />)
      )}

      {!loading && tab === 'approved' && (
        approved.length === 0
          ? <div style={{ textAlign: 'center', padding: 20, color: 'var(--text3)', fontSize: 13 }}>No approved doctors yet</div>
          : approved.map(d => <DoctorCard key={d._id} doctor={d} showActions={false} />)
      )}

      {/* Reject modal */}
      {rejectId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Reject Doctor Application</h3>
            <p style={{ fontSize: 13, color: 'var(--text2)', margin: '0 0 12px' }}>Provide a reason (optional — will be shown to the doctor):</p>
            <textarea
              style={{ width: '100%', padding: '9px 13px', borderRadius: 10, border: '1px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, height: 80, resize: 'vertical', fontFamily: 'var(--sans)', boxSizing: 'border-box' }}
              placeholder="e.g. Licence number could not be verified"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectId(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--text2)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={reject} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--coral)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}