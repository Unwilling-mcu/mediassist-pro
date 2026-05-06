import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';

const TITLES = {
  '/':              'Dashboard',
  '/symptoms':      'Symptom Checker',
  '/nearby':        'Nearby Care',
  '/chat':          'AI Assistant',
  '/doctor-chat':   'Doctor Chat',
  '/analytics':     'Analytics',
  '/reminders':     'Reminders',
  '/book':          'Book Doctor',
  '/appointments':  'Appointments',
  '/profile':       'My Profile',
  '/prescriptions': 'Prescriptions',
  '/wearables':     'Wearables',
  '/settings':      'Settings',
};

export default function Topbar({ isMobile }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, notifications } = useStore();
  const [showNotif, setShowNotif] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const unread = notifications.filter(n => !n.read).length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  const firstName = user?.name?.split(' ')[0] || 'there';
  const title = TITLES[pathname] || 'MediAssist Pro';

  return (
    <div style={{
      height: isMobile ? 56 : 60,
      display: 'flex', alignItems: 'center',
      padding: isMobile ? '0 14px' : '0 24px',
      borderBottom: '1px solid var(--border)',
      gap: isMobile ? 10 : 14,
      flexShrink: 0,
      background: 'var(--bg)',
      zIndex: 100,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {isMobile ? (
          <div style={{ fontFamily: 'var(--serif)', fontSize: 17, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {pathname === '/'
              ? <><span style={{ color: 'var(--mint)' }}>{firstName}</span>, Good {greeting}!</>
              : title}
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>
            {pathname === '/'
              ? <>Good {greeting.toLowerCase()}, <span style={{ color: 'var(--mint)' }}>{firstName}</span> 👋</>
              : title}
          </div>
        )}
      </div>

      {!isMobile && (
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:100, padding:'7px 14px', width:240 }}>
          <span style={{ color:'var(--text3)', fontSize:13 }}>🔍</span>
          <input placeholder="Search symptoms, doctors..." style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--sans)', width:'100%' }} />
        </div>
      )}

      {isMobile && (
        <button onClick={() => setShowSearch(s => !s)} style={{ width:36, height:36, borderRadius:10, background:showSearch?'var(--mintd)':'var(--bg3)', border:`1px solid ${showSearch?'rgba(0,212,168,.3)':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:15, flexShrink:0 }}>
          🔍
        </button>
      )}

      <div style={{ position:'relative', flexShrink:0 }}>
        <button onClick={() => setShowNotif(s => !s)} style={{ width:isMobile?36:38, height:isMobile?36:38, borderRadius:9, background:'var(--bg3)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:isMobile?15:16, position:'relative' }}>
          🔔
          {unread > 0 && <span style={{ position:'absolute', top:6, right:6, width:8, height:8, background:'var(--coral)', borderRadius:'50%', border:'2px solid var(--bg)' }} />}
        </button>
        {showNotif && (
          <div style={{ position:'fixed', top:isMobile?56:68, right:10, width:isMobile?'calc(100vw - 20px)':300, background:'var(--card)', border:'1px solid var(--border2)', borderRadius:'var(--r)', zIndex:500, overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,.4)' }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)', fontSize:13, fontWeight:600 }}>
              Notifications {unread > 0 && <span style={{ color:'var(--coral)' }}>({unread} unread)</span>}
            </div>
            {notifications.map(n => (
              <div key={n.id} style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', fontSize:13, color:n.read?'var(--text3)':'var(--text)', background:n.read?'transparent':'rgba(0,212,168,.04)', display:'flex', gap:10, alignItems:'flex-start' }}>
                <span>{n.type==='warning'?'⚠️':n.type==='success'?'✅':'ℹ️'}</span>
                <span style={{ flex:1, lineHeight:1.5 }}>{n.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => navigate('/profile')} style={{ width:isMobile?34:38, height:isMobile?34:38, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#4A9FD5,#9B82F4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:isMobile?12:13, fontWeight:600, cursor:'pointer', border:'2px solid var(--border2)', color:'#fff' }}>
        {(user?.name || 'U').slice(0,1).toUpperCase()}
      </button>

      {isMobile && showSearch && (
        <div style={{ position:'fixed', top:56, left:0, right:0, background:'var(--bg)', borderBottom:'1px solid var(--border)', padding:'10px 14px', zIndex:200 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--bg3)', border:'1px solid var(--mint)', borderRadius:100, padding:'10px 16px', boxShadow:'0 0 0 3px var(--mintd)' }}>
            <span style={{ color:'var(--mint)', fontSize:14 }}>🔍</span>
            <input autoFocus placeholder="Search symptoms, doctors, medications..." style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:14, fontFamily:'var(--sans)', width:'100%' }} />
            <button onClick={() => setShowSearch(false)} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:18, padding:0 }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}