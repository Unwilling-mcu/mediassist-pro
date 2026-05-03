import React, { useState } from 'react';
import useStore from '../../store/useStore';

function Section({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SettingRow({ icon, label, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 12, cursor: 'pointer', flexShrink: 0,
      background: value ? 'var(--mint)' : 'var(--bg3)',
      border: `1px solid ${value ? 'var(--mint)' : 'var(--border2)'}`,
      position: 'relative', transition: 'all .25s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: value ? 22 : 2,
        width: 18, height: 18, borderRadius: '50%',
        background: value ? '#080E1C' : 'var(--text3)',
        transition: 'left .25s, background .25s',
      }} />
    </div>
  );
}

// Theme option card
function ThemeCard({ id, label, icon, desc, selected, onClick }) {
  return (
    <div onClick={() => onClick(id)} style={{
      padding: 16, borderRadius: 'var(--rs)', cursor: 'pointer',
      border: `2px solid ${selected ? 'var(--mint)' : 'var(--border)'}`,
      background: selected ? 'var(--mintd)' : 'var(--bg3)',
      textAlign: 'center', transition: 'all .2s', flex: 1,
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: selected ? 'var(--mint)' : 'var(--text)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--text2)' }}>{desc}</div>
      {selected && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--mint)', fontWeight: 600 }}>✓ Active</div>}
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme, user, logout } = useStore();

  const [notifs, setNotifs] = useState({
    medicationReminders: true,
    appointmentAlerts: true,
    healthTips: false,
    weeklyReport: true,
    emailNotifs: false,
  });

  const [privacy, setPrivacy] = useState({
    shareDataWithDoctors: true,
    anonymousAnalytics: false,
    locationAccess: true,
  });

  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const THEMES = [
    { id: 'dark',   icon: '🌙', label: 'Dark',   desc: 'Easy on eyes at night' },
    { id: 'light',  icon: '☀️', label: 'Light',  desc: 'Clean & bright' },
    { id: 'system', icon: '💻', label: 'System',  desc: 'Follows device setting' },
  ];

  return (
    <div className="fade-up">
      <div className="page-heading">
        <h1>App <em>Settings</em></h1>
        <p>Customize your MediAssist experience</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div>

          {/* ── THEME ── */}
          <Section title="🎨 Appearance & Theme">
            <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--text2)' }}>
              Choose how MediAssist looks on your device
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              {THEMES.map(t => (
                <ThemeCard key={t.id} {...t} selected={theme === t.id} onClick={setTheme} />
              ))}
            </div>

            {/* Live preview strip */}
            <div style={{ marginTop: 18, padding: 14, background: 'var(--bg3)', borderRadius: 'var(--rs)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>Preview</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, padding: 12, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--mint)', fontWeight: 600 }}>❤️ Heart Rate</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>74 bpm</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)' }}>Normal range</div>
                </div>
                <div style={{ flex: 1, padding: 12, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>📊 Blood Pressure</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>118/76</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)' }}>Excellent</div>
                </div>
                <div style={{ flex: 1, padding: 12, background: 'var(--mintd)', border: '1px solid rgba(0,212,168,.2)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--mint)', fontWeight: 600 }}>✚ MediAssist</div>
                  <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 4, lineHeight: 1.4 }}>AI-powered health companion</div>
                </div>
              </div>
            </div>
          </Section>

          {/* ── NOTIFICATIONS ── */}
          <Section title="🔔 Notification Preferences">
            <SettingRow icon="💊" label="Medication Reminders" desc="Get alerts when it's time to take your medicines">
              <Toggle value={notifs.medicationReminders} onChange={v => setNotifs(n => ({ ...n, medicationReminders: v }))} />
            </SettingRow>
            <SettingRow icon="📅" label="Appointment Alerts" desc="Reminders 1 hour before your doctor visits">
              <Toggle value={notifs.appointmentAlerts} onChange={v => setNotifs(n => ({ ...n, appointmentAlerts: v }))} />
            </SettingRow>
            <SettingRow icon="💡" label="Health Tips" desc="Daily health and wellness suggestions from AI">
              <Toggle value={notifs.healthTips} onChange={v => setNotifs(n => ({ ...n, healthTips: v }))} />
            </SettingRow>
            <SettingRow icon="📊" label="Weekly Health Report" desc="Summary of your vitals and activity every Monday">
              <Toggle value={notifs.weeklyReport} onChange={v => setNotifs(n => ({ ...n, weeklyReport: v }))} />
            </SettingRow>
            <SettingRow icon="📧" label="Email Notifications" desc="Receive reports and alerts to your email">
              <Toggle value={notifs.emailNotifs} onChange={v => setNotifs(n => ({ ...n, emailNotifs: v }))} />
            </SettingRow>
          </Section>

          {/* ── PRIVACY ── */}
          <Section title="🔒 Privacy & Data">
            <SettingRow icon="👨‍⚕️" label="Share Data with Doctors" desc="Allow your doctors to view your vitals and history">
              <Toggle value={privacy.shareDataWithDoctors} onChange={v => setPrivacy(p => ({ ...p, shareDataWithDoctors: v }))} />
            </SettingRow>
            <SettingRow icon="📍" label="Location Access" desc="Used to find hospitals and clinics near you">
              <Toggle value={privacy.locationAccess} onChange={v => setPrivacy(p => ({ ...p, locationAccess: v }))} />
            </SettingRow>
            <SettingRow icon="📈" label="Anonymous Analytics" desc="Help improve the app by sharing anonymous usage data">
              <Toggle value={privacy.anonymousAnalytics} onChange={v => setPrivacy(p => ({ ...p, anonymousAnalytics: v }))} />
            </SettingRow>
          </Section>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={saveSettings} style={{ padding: '11px 28px' }}>
              💾 Save Settings
            </button>
            {saved && <span style={{ color: 'var(--mint)', fontSize: 13, alignSelf: 'center' }}>✓ Settings saved!</span>}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Account info */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>👤 Account</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,var(--mint),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff' }}>
                {(user?.name || 'U').slice(0, 1)}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{user?.email}</div>
                <div style={{ fontSize: 11, color: 'var(--mint)', marginTop: 2 }}>● Active</div>
              </div>
            </div>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>✏️ Edit Profile</button>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>🔑 Change Password</button>
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>🚪 Logout</button>
          </div>

          {/* App info */}
          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>ℹ️ App Information</div>
            {[['Version', '2.0.0'], ['Build', '2026.04.29'], ['Server', 'localhost:5000'], ['Database', 'MongoDB Atlas'], ['AI Model', 'Claude Sonnet 4']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>{l}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div className="card" style={{ border: '1px solid rgba(255,107,107,.2)', background: 'rgba(255,107,107,.03)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--coral)' }}>⚠️ Danger Zone</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>
              These actions are permanent and cannot be undone.
            </div>
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
              onClick={() => confirm('Export all your health data as JSON?') && alert('Export started — check your email.')}>
              📤 Export My Data
            </button>
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => confirm('DELETE your account and all data? This cannot be undone.') && logout()}>
              🗑️ Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
