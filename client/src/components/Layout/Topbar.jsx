import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';

const TITLES = {
  '/':              'Dashboard',
  '/symptoms':      'Symptom Checker',
  '/nearby':        'Nearby Care',
  '/chat':          'AI Medical Assistant',
  '/profile':       'Patient Profile',
  '/prescriptions': 'Prescriptions',
  '/wearables':     'Wearables & Vitals',
};

export default function Topbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, notifications } = useStore();
  const [showNotif, setShowNotif] = useState(false);
  const unread = notifications.filter(n => !n.read).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div style={{
      height:60, display:'flex', alignItems:'center', padding:'0 24px',
      borderBottom:'1px solid var(--border)', gap:14, flexShrink:0,
      background:'var(--bg)', zIndex:100,
    }}>
      <div style={{ flex:1, fontFamily:'var(--serif)', fontSize:18 }}>
        {pathname === '/'
          ? <>{greeting}, <span style={{ color:'var(--mint)' }}>{firstName}</span> 👋</>
          : TITLES[pathname] || 'MediAssist Pro'}
      </div>

      {/* Search */}
      <div style={{
        display:'flex', alignItems:'center', gap:8,
        background:'var(--bg3)', border:'1px solid var(--border)',
        borderRadius:100, padding:'7px 14px', width:240,
      }}>
        <span style={{ color:'var(--text3)', fontSize:13 }}>🔍</span>
        <input placeholder="Search symptoms, doctors..."
          style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--sans)', width:'100%' }} />
      </div>

      {/* Notifications */}
      <div style={{ position:'relative' }}>
        <div onClick={() => setShowNotif(s => !s)} style={{
          width:38, height:38, borderRadius:9, background:'var(--bg3)',
          border:'1px solid var(--border)', display:'flex', alignItems:'center',
          justifyContent:'center', cursor:'pointer', fontSize:16, position:'relative',
        }}>
          🔔
          {unread > 0 && (
            <span style={{
              position:'absolute', top:6, right:6, width:8, height:8,
              background:'var(--coral)', borderRadius:'50%', border:'2px solid var(--bg)',
            }} />
          )}
        </div>
        {showNotif && (
          <div style={{
            position:'absolute', top:46, right:0, width:300,
            background:'var(--card)', border:'1px solid var(--border2)',
            borderRadius:'var(--r)', zIndex:500, overflow:'hidden',
            boxShadow:'0 8px 24px rgba(0,0,0,.4)',
          }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', fontSize:13, fontWeight:600 }}>
              Notifications ({unread} unread)
            </div>
            {notifications.map(n => (
              <div key={n.id} style={{
                padding:'12px 16px', borderBottom:'1px solid var(--border)',
                fontSize:13, color: n.read ? 'var(--text3)' : 'var(--text)',
                background: n.read ? 'transparent' : 'rgba(0,212,168,.04)',
                display:'flex', gap:10, alignItems:'flex-start',
              }}>
                <span>{n.type==='warning'?'⚠️':n.type==='success'?'✅':'ℹ️'}</span>
                <span style={{ flex:1 }}>{n.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar */}
      <div onClick={() => navigate('/profile')} style={{
        width:38, height:38, borderRadius:'50%',
        background:'linear-gradient(135deg,#4A9FD5,#9B82F4)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:13, fontWeight:600, cursor:'pointer',
        border:'2px solid var(--border2)',
      }}>
        {(user?.name || 'U').slice(0,1).toUpperCase()}
      </div>
    </div>
  );
}
