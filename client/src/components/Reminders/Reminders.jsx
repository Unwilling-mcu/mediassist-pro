import React, { useState } from 'react';
import { useReminders } from '../../hooks/useReminders';
import { fireNotification } from '../../services/notificationService';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEDICINES = ['Metformin 500mg', 'Atorvastatin 10mg', 'Vitamin D3 1000 IU', 'Custom…'];

function Toggle({ value, onChange, size = 44 }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: size, height: size * 0.55, borderRadius: size, cursor: 'pointer', flexShrink: 0,
      background: value ? 'var(--mint)' : 'var(--bg3)',
      border: `1px solid ${value ? 'var(--mint)' : 'var(--border2)'}`,
      position: 'relative', transition: 'all .25s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: value ? size * 0.55 - 20 : 2,
        width: size * 0.55 - 6, height: size * 0.55 - 6,
        borderRadius: '50%', background: value ? '#080E1C' : 'var(--text3)',
        transition: 'left .25s, background .25s',
      }} />
    </div>
  );
}

function ReminderCard({ reminder, onToggle, onUpdate, onRemove, onTest }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ ...reminder });

  const save = () => { onUpdate(reminder.id, form); setEditing(false); };

  // Time until next fire
  const timeUntil = () => {
    if (!reminder.enabled) return 'Disabled';
    const [h, m] = reminder.time.split(':').map(Number);
    const now = new Date();
    const next = new Date();
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const diff = Math.round((next - now) / 60000);
    if (diff < 60) return `in ${diff} min`;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `in ${hrs}h ${mins}m`;
  };

  return (
    <div className="card" style={{
      marginBottom: 12, borderColor: reminder.enabled ? 'var(--border)' : 'var(--border)',
      opacity: reminder.enabled ? 1 : 0.65, transition: 'all .2s',
    }}>
      {!editing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Icon */}
          <div style={{ width: 46, height: 46, borderRadius: 13, background: reminder.enabled ? 'var(--mintd)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💊</div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{reminder.medicine}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{reminder.label}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint)' }}>⏰ {reminder.time}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{timeUntil()}</span>
              <div style={{ display: 'flex', gap: 3 }}>
                {DAYS.map(d => (
                  <span key={d} style={{ fontSize: 10, padding: '2px 5px', borderRadius: 5, fontWeight: 500, background: reminder.days.includes(d) ? 'var(--mintd)' : 'var(--bg3)', color: reminder.days.includes(d) ? 'var(--mint)' : 'var(--text3)' }}>{d}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => onTest(reminder)} title="Test notification" style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text2)', fontSize: 13, fontFamily: 'var(--sans)', transition: 'all .18s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--mint)'; e.currentTarget.style.color = 'var(--mint)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}>
              🔔 Test
            </button>
            <button onClick={() => setEditing(true)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text2)', fontSize: 13, fontFamily: 'var(--sans)', transition: 'all .18s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}>
              ✏️ Edit
            </button>
            <button onClick={() => onRemove(reminder.id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text2)', fontSize: 13, fontFamily: 'var(--sans)', transition: 'all .18s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--coral)'; e.currentTarget.style.color = 'var(--coral)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}>
              🗑️
            </button>
            <Toggle value={reminder.enabled} onChange={v => onToggle(reminder.id, v)} />
          </div>
        </div>
      ) : (
        /* Edit mode */
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>✏️ Edit Reminder</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Medicine</label>
              <input className="input" value={form.medicine} onChange={e => setForm(f => ({ ...f, medicine: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Time</label>
              <input className="input" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Label / Note</label>
              <input className="input" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. After breakfast" />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Repeat on days</label>
            <div style={{ display: 'flex', gap: 7 }}>
              {DAYS.map(d => (
                <div key={d} onClick={() => setForm(f => ({ ...f, days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d] }))} style={{
                  width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  background: form.days.includes(d) ? 'var(--mint)' : 'var(--bg3)',
                  color: form.days.includes(d) ? '#080E1C' : 'var(--text2)',
                  border: `1px solid ${form.days.includes(d) ? 'var(--mint)' : 'var(--border)'}`,
                  transition: 'all .15s',
                }}>{d}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={save}>Save</button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Reminders() {
  const { reminders, permission, lastFired, askPermission, add, remove, toggle, update } = useReminders();
  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState({ medicine: '', label: '', time: '08:00', days: [...DAYS], enabled: true });
  const [toast, setToast]     = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const testReminder = (r) => {
    if (permission !== 'granted') { showToast('⚠️ Enable notifications first!'); return; }
    fireNotification('💊 Medicine Reminder', `Time to take ${r.medicine} — ${r.label}`, { requireInteraction: false });
    showToast(`✅ Test notification sent for ${r.medicine}`);
  };

  const addNew = () => {
    if (!newForm.medicine) return;
    add({ ...newForm, id: `med-${Date.now()}` });
    setNewForm({ medicine: '', label: '', time: '08:00', days: [...DAYS], enabled: true });
    setShowAdd(false);
    showToast('✅ Reminder added!');
  };

  const enabledCount = reminders.filter(r => r.enabled).length;

  return (
    <div className="fade-up">
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 'var(--rs)', padding: '12px 20px', fontSize: 13, fontWeight: 500, boxShadow: 'var(--shadow-lg)', animation: 'fadeUp .3s ease' }}>
          {toast}
        </div>
      )}

      <div className="page-heading">
        <h1>Medication <em>Reminders</em></h1>
        <p>Browser push notifications · Never miss a dose</p>
      </div>

      {/* Permission Banner */}
      {permission !== 'granted' && (
        <div style={{ background: 'linear-gradient(135deg,rgba(0,212,168,.1),rgba(74,159,213,.1))', border: '1px solid var(--mintd)', borderRadius: 'var(--r)', padding: 20, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 32 }}>🔔</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Enable Notifications to get medicine alerts</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              {permission === 'denied'
                ? 'Notifications are blocked. Go to browser Settings → Site Settings → Notifications → Allow for localhost.'
                : 'Allow browser notifications so MediAssist can remind you when it\'s time to take your medicine.'}
            </div>
          </div>
          {permission !== 'denied' && (
            <button className="btn btn-primary" onClick={async () => {
              const r = await askPermission();
              if (r === 'granted') showToast('🎉 Notifications enabled!');
              else showToast('❌ Permission denied.');
            }} style={{ padding: '11px 22px', flexShrink: 0 }}>
              🔔 Enable Now
            </button>
          )}
        </div>
      )}

      {permission === 'granted' && (
        <div style={{ background: 'rgba(82,214,122,.08)', border: '1px solid rgba(82,214,122,.2)', borderRadius: 'var(--rs)', padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--green)' }}>✅</span>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>
            Notifications enabled · <strong style={{ color: 'var(--text)' }}>{enabledCount} active reminders</strong> · Scheduler running every minute
          </span>
          {lastFired && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--mint)' }}>Last fired: {lastFired.medicine}</span>}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 10 }}>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
              {reminders.length} Reminders · {enabledCount} Active
            </div>
            <button className="btn btn-primary" onClick={() => setShowAdd(s => !s)}>
              {showAdd ? '✕ Cancel' : '+ Add Reminder'}
            </button>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="card" style={{ marginBottom: 16, borderColor: 'var(--mint)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'var(--mint)' }}>➕ New Reminder</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Medicine Name *</label>
                  <input className="input" placeholder="e.g. Metformin 500mg" value={newForm.medicine} onChange={e => setNewForm(f => ({ ...f, medicine: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Time *</label>
                  <input className="input" type="time" value={newForm.time} onChange={e => setNewForm(f => ({ ...f, time: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Label</label>
                  <input className="input" placeholder="e.g. After breakfast, Before bed" value={newForm.label} onChange={e => setNewForm(f => ({ ...f, label: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>Repeat on</label>
                <div style={{ display: 'flex', gap: 7 }}>
                  {DAYS.map(d => (
                    <div key={d} onClick={() => setNewForm(f => ({ ...f, days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d] }))} style={{
                      width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                      background: newForm.days.includes(d) ? 'var(--mint)' : 'var(--bg3)',
                      color: newForm.days.includes(d) ? '#080E1C' : 'var(--text2)',
                      border: `1px solid ${newForm.days.includes(d) ? 'var(--mint)' : 'var(--border)'}`,
                      transition: 'all .15s',
                    }}>{d}</div>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" onClick={addNew} style={{ marginRight: 10 }}>Save Reminder</button>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          )}

          {/* Reminder cards */}
          {reminders.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
              <div>No reminders yet. Add one above!</div>
            </div>
          )}
          {reminders.map(r => (
            <ReminderCard key={r.id} reminder={r}
              onToggle={toggle} onUpdate={update} onRemove={remove} onTest={testReminder} />
          ))}
        </div>

        {/* Right: Schedule overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>📅 Today's Schedule</div>
            {reminders
              .filter(r => r.enabled)
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(r => {
                const now = new Date();
                const [h, m] = r.time.split(':').map(Number);
                const fired = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
                return (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: fired ? 'var(--mintd)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                      {fired ? '✅' : '💊'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: fired ? 'var(--text2)' : 'var(--text)', textDecoration: fired ? 'line-through' : 'none' }}>{r.medicine}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{r.label}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: fired ? 'var(--text3)' : 'var(--mint)' }}>{r.time}</div>
                  </div>
                );
              })}
            {reminders.filter(r => r.enabled).length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>No active reminders</div>
            )}
          </div>

          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>ℹ️ How it works</div>
            {[
              ['🔔', 'Enable notifications', 'Click "Enable Now" to allow browser alerts'],
              ['⏰', 'Set your times', 'Add reminders with exact medicine times'],
              ['📅', 'Pick repeat days', 'Choose which days each reminder fires'],
              ['🔕', 'Tab can be minimized', 'Alerts fire even if tab is in background'],
              ['🧪', 'Test anytime', 'Click "Test" to preview the notification'],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
