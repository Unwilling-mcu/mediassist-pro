import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import DoctorApprovalPanel from './DoctorApprovalPanel';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API = BASE.endsWith('/api') ? BASE : `${BASE}/api`;

const token = () => localStorage.getItem('token');

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...opts.headers },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color = 'var(--mint)' }) {
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function PlanBadge({ status }) {
  const map = {
    active:    { color: 'var(--green)',  bg: 'rgba(82,214,122,.1)',  label: 'Active' },
    trialing:  { color: 'var(--amber)',  bg: 'rgba(255,170,68,.1)',  label: 'Trial' },
    past_due:  { color: 'var(--coral)',  bg: 'rgba(255,107,107,.1)', label: 'Past Due' },
    cancelled: { color: 'var(--text3)', bg: 'rgba(255,255,255,.06)', label: 'Cancelled' },
  };
  const s = map[status] || map.trialing;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function UsageBar({ label, used, max, color = 'var(--mint)' }) {
  const pct = max >= 99999 ? 100 : Math.min(100, Math.round((used / max) * 100));
  const unlimited = max >= 99999;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
        <span style={{ color: 'var(--text2)' }}>{label}</span>
        <span style={{ color: 'var(--text)', fontWeight: 500 }}>
          {unlimited ? `${used} / ∞` : `${used} / ${max}`}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'var(--bg3)' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${unlimited ? 30 : pct}%`,
          background: pct > 80 ? 'var(--coral)' : color,
          transition: 'width .4s ease',
        }} />
      </div>
    </div>
  );
}

function MemberRow({ member, isOwner, onRemove, removing }) {
  const roleColors = {
    org_admin: { color: 'var(--purple)', bg: 'rgba(155,130,244,.1)' },
    doctor:    { color: 'var(--blue)',   bg: 'rgba(74,159,213,.1)'  },
    staff:     { color: 'var(--text2)',  bg: 'rgba(255,255,255,.06)' },
  };
  const rc = roleColors[member.role] || roleColors.staff;
  const initials = (member.user?.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--mintd)', color: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {member.user?.name || 'Unknown'} {isOwner && <span style={{ fontSize: 10, color: 'var(--text3)' }}>(owner)</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{member.user?.email}</div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99, background: rc.bg, color: rc.color, flexShrink: 0 }}>
        {member.role}
      </span>
      {!isOwner && (
        <button
          onClick={() => onRemove(member.user?._id)}
          disabled={removing === member.user?._id}
          style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--coral)', cursor: 'pointer', flexShrink: 0 }}
        >
          {removing === member.user?._id ? '…' : 'Remove'}
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrgAdmin() {
  const navigate   = useNavigate();
  const isMobile   = useIsMobile();

  const [stats,    setStats]    = useState(null);
  const [billing,  setBilling]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole,  setInviteRole]  = useState('staff');
  const [inviting,    setInviting]    = useState(false);
  const [inviteMsg,   setInviteMsg]   = useState('');

  // Remove
  const [removing, setRemoving] = useState(null);

  // Create org form (shown if user has no org)
  const [noOrg,    setNoOrg]    = useState(false);
  const [orgName,  setOrgName]  = useState('');
  const [orgType,  setOrgType]  = useState('clinic');
  const [orgEmail, setOrgEmail] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [statsRes, billingRes] = await Promise.all([
        apiFetch('/organisations/stats'),
        apiFetch('/billing/status'),
      ]);
      if (!statsRes.success) { setNoOrg(true); setLoading(false); return; }
      setStats(statsRes.data);
      setBilling(billingRes.data);
    } catch {
      setError('Could not load dashboard. Is the server running?');
    }
    setLoading(false);
  };

  const handleCreateOrg = async () => {
    if (!orgName || !orgEmail) return;
    setCreating(true);
    const res = await apiFetch('/organisations', { method: 'POST', body: { name: orgName, type: orgType, email: orgEmail } });
    setCreating(false);
    if (res.success) { setNoOrg(false); loadAll(); }
    else setError(res.message);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true); setInviteMsg('');
    const res = await apiFetch('/organisations/invite', { method: 'POST', body: { email: inviteEmail, role: inviteRole } });
    setInviting(false);
    if (res.success) { setInviteMsg('✓ ' + res.message); setInviteEmail(''); loadAll(); }
    else setInviteMsg('✗ ' + res.message);
  };

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member?')) return;
    setRemoving(userId);
    await apiFetch(`/organisations/members/${userId}`, { method: 'DELETE' });
    setRemoving(null);
    loadAll();
  };

  const input = {
    padding: '9px 13px', borderRadius: 10, border: '1px solid var(--border2)',
    background: 'var(--bg3)', color: 'var(--text)', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  const btn = (color = 'var(--mint)') => ({
    padding: '9px 18px', borderRadius: 10, border: 'none', background: color,
    color: color === 'var(--mint)' ? '#080E1C' : '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
  });

  // ── No org yet ──
  if (!loading && noOrg) return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px' }}>
      <div className="card" style={{ padding: 28 }}>
        <div style={{ fontSize: 22, marginBottom: 4 }}>🏥</div>
        <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>Create your Organisation</h2>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>Set up your clinic or hospital to start managing patients and staff.</p>
        {error && <div style={{ color: 'var(--coral)', fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input style={input} placeholder="Organisation name *" value={orgName} onChange={e => setOrgName(e.target.value)} />
          <input style={input} placeholder="Contact email *" value={orgEmail} onChange={e => setOrgEmail(e.target.value)} />
          <select style={input} value={orgType} onChange={e => setOrgType(e.target.value)}>
            <option value="clinic">Clinic</option>
            <option value="hospital">Hospital</option>
            <option value="diagnostic_lab">Diagnostic Lab</option>
            <option value="corporate">Corporate</option>
            <option value="other">Other</option>
          </select>
          <button style={btn()} onClick={handleCreateOrg} disabled={creating}>
            {creating ? 'Creating…' : 'Create Organisation'}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 10, color: 'var(--text2)' }}>
      <span style={{ fontSize: 20 }}>⏳</span> Loading dashboard…
    </div>
  );

  if (error && !stats) return (
    <div style={{ textAlign: 'center', padding: 40, color: 'var(--coral)' }}>{error}</div>
  );

  const { org, members } = stats;
  const trialDaysLeft = org.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(org.trialEndsAt) - Date.now()) / 86400000))
    : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 700 }}>🏥 {org.name}</h1>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            Admin Dashboard
            <PlanBadge status={org.plan.status} />
            <span style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize' }}>{org.plan.type} plan</span>
          </div>
        </div>
        <button style={btn()} onClick={() => navigate('/pricing')}>⚡ Upgrade Plan</button>
      </div>

      {/* ── Trial warning ── */}
      {org.plan.status === 'trialing' && (
        <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(255,170,68,.08)', border: '1px solid rgba(255,170,68,.2)', color: 'var(--amber)', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span>⏳ Free trial ends in <strong>{trialDaysLeft} days</strong> — subscribe to keep access</span>
          <button onClick={() => navigate('/pricing')} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 8, border: '1px solid var(--amber)', background: 'transparent', color: 'var(--amber)', cursor: 'pointer' }}>
            View Plans
          </button>
        </div>
      )}

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard icon="👥" label="Members"     value={org.memberCount}     color="var(--mint)"   sub="Staff + doctors" />
        <StatCard icon="🧑‍⚕️" label="Patients"    value={org.patientCount}    color="var(--blue)"   sub={`of ${org.plan.maxPatients >= 99999 ? '∞' : org.plan.maxPatients} allowed`} />
        <StatCard icon="📅" label="Appointments" value={org.appointmentCount} color="var(--purple)" sub="Total booked" />
        <StatCard icon="💳" label="Plan"         value={org.plan.type?.charAt(0).toUpperCase() + org.plan.type?.slice(1)} color="var(--amber)" sub={billing?.status || ''} />
      </div>

      {/* ── Two column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Usage limits */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>📊 Usage</h3>
          <UsageBar label="Patients"    used={org.patientCount}    max={org.plan.maxPatients} color="var(--blue)" />
          <UsageBar label="Members"     used={org.memberCount}     max={org.plan.maxDoctors + 5} color="var(--mint)" />
          <UsageBar label="Appointments" used={org.appointmentCount} max={500} color="var(--purple)" />
          {billing?.currentPeriodEnd && (
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
              Next billing: {new Date(billing.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          )}
        </div>

        {/* Plan features */}
        <div className="card" style={{ padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>✨ Your Plan Features</h3>
          {(billing?.features || ['AI symptom checker', 'Appointment booking', 'Prescription tracking']).map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 13, color: 'var(--text2)' }}>
              <span style={{ color: 'var(--mint)', fontWeight: 700 }}>✓</span> {f}
            </div>
          ))}
          <button onClick={() => navigate('/pricing')} style={{ marginTop: 14, width: '100%', padding: '9px', borderRadius: 10, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--mint)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
            View all plans →
          </button>
        </div>
      </div>

      {/* ── Members ── */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>👥 Team Members</h3>

        {/* Invite form */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            style={{ ...input, flex: 1, minWidth: 180 }}
            placeholder="Invite by email address"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
          />
          <select style={{ ...input, width: 'auto', flex: '0 0 auto' }} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
            <option value="staff">Staff</option>
            <option value="doctor">Doctor</option>
            <option value="org_admin">Admin</option>
          </select>
          <button style={btn()} onClick={handleInvite} disabled={inviting}>
            {inviting ? '…' : '+ Invite'}
          </button>
        </div>

        {inviteMsg && (
          <div style={{ fontSize: 12, marginBottom: 12, color: inviteMsg.startsWith('✓') ? 'var(--green)' : 'var(--coral)' }}>
            {inviteMsg}
          </div>
        )}

        {/* Members list */}
        <div>
          {members?.map(member => (
            <MemberRow
              key={member.user?._id}
              member={member}
              isOwner={member.role === 'org_admin' && members.indexOf(member) === 0}
              onRemove={handleRemove}
              removing={removing}
            />
          ))}
          {(!members || members.length === 0) && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 13 }}>
              No members yet — invite your first team member above
            </div>
          )}
        </div>
      </div>

      {/* ── Doctor approvals ── */}
      <DoctorApprovalPanel />

      {/* ── Quick actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { icon: '📅', label: 'Appointments', path: '/appointments' },
          { icon: '💊', label: 'Prescriptions', path: '/prescriptions' },
          { icon: '📊', label: 'Analytics',     path: '/analytics' },
          { icon: '⚙️', label: 'Settings',      path: '/settings' },
        ].map(({ icon, label, path }) => (
          <button key={path} onClick={() => navigate(path)} style={{ padding: '14px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', cursor: 'pointer', color: 'var(--text)', fontSize: 13, fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

    </div>
  );
}