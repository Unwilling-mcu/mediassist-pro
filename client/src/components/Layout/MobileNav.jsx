import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';

// Primary 5 tabs shown in bottom bar
const PRIMARY_NAV = [
  { path: '/',           label: 'Home',      icon: '⊞' },
  { path: '/symptoms',   label: 'Symptoms',  icon: '🩺' },
  { path: '/chat',       label: 'AI Chat',   icon: '🤖' },
  { path: '/reminders',  label: 'Reminders', icon: '🔔' },
  { path: '/more',       label: 'More',      icon: '☰'  },
];

// All nav items shown in the "More" drawer
const MORE_NAV = [
  { path: '/nearby',        label: 'Nearby Care',    icon: '📍' },
  { path: '/book',          label: 'Book Doctor',    icon: '📅' },
  { path: '/appointments',  label: 'Appointments',   icon: '🗓️' },
  { path: '/doctor-chat',   label: 'Doctor Chat',    icon: '💬', badge: 'Live', bc: 'var(--green)' },
  { path: '/analytics',     label: 'Analytics',      icon: '📊' },
  { path: '/prescriptions', label: 'Prescriptions',  icon: '💊' },
  { path: '/wearables',     label: 'Wearables',      icon: '⌚', badge: 'Live', bc: 'var(--mint)' },
  { path: '/profile',       label: 'My Profile',     icon: '👤' },
  { path: '/settings',      label: 'Settings',       icon: '⚙️' },
];

export default function MobileNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, theme, setTheme } = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isMore = MORE_NAV.some(n => pathname === n.path || (n.path !== '/' && pathname.startsWith(n.path)));

  const goTo = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const nextTheme = () => {
    const c = { dark: 'light', light: 'system', system: 'dark' };
    setTheme(c[theme] || 'dark');
  };
  const themeIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '💻';
  const themeLabel = theme === 'dark' ? 'Dark Mode' : theme === 'light' ? 'Light Mode' : 'System';

  return (
    <>
      {/* More Drawer Overlay */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            zIndex: 998, backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* More Drawer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999,
        background: 'var(--card)', borderTop: '1px solid var(--border2)',
        borderRadius: '20px 20px 0 0',
        transform: drawerOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(.4,0,.2,1)',
        padding: '0 0 calc(80px + env(safe-area-inset-bottom)) 0',
        maxHeight: '80vh', overflowY: 'auto',
      }}>
        {/* Drawer handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border2)' }} />
        </div>

        <div style={{ padding: '8px 16px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, padding: '0 4px' }}>
            All Features
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {MORE_NAV.map(item => {
              const active = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => goTo(item.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 14px', borderRadius: 14,
                    background: active ? 'var(--mintd)' : 'var(--bg3)',
                    border: `1px solid ${active ? 'rgba(0,212,168,.25)' : 'var(--border)'}`,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all .18s', fontFamily: 'var(--sans)',
                  }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: active ? 'var(--mint)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </div>
                    {item.badge && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 100, background: item.bc, color: item.bc === 'var(--mint)' ? '#080E1C' : '#fff' }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Theme + Logout */}
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={nextTheme} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px', borderRadius: 14, background: 'var(--bg3)',
              border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'var(--sans)',
              fontSize: 13, color: 'var(--text2)', fontWeight: 500,
            }}>
              <span>{themeIcon}</span> {themeLabel}
            </button>
            <button onClick={logout} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '13px', borderRadius: 14, background: 'rgba(255,107,107,.08)',
              border: '1px solid rgba(255,107,107,.2)', cursor: 'pointer', fontFamily: 'var(--sans)',
              fontSize: 13, color: 'var(--coral)', fontWeight: 500,
            }}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 997,
        height: `calc(64px + env(safe-area-inset-bottom))`,
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'var(--bg2)', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'stretch',
        backdropFilter: 'blur(12px)',
      }}>
        {PRIMARY_NAV.map(item => {
          const isMoreTab = item.path === '/more';
          const active = isMoreTab
            ? (drawerOpen || isMore)
            : (pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path)));

          return (
            <button
              key={item.path}
              onClick={() => {
                if (isMoreTab) {
                  setDrawerOpen(d => !d);
                } else {
                  setDrawerOpen(false);
                  navigate(item.path);
                }
              }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 4px', fontFamily: 'var(--sans)',
                position: 'relative', transition: 'all .18s',
              }}
            >
              {/* Active indicator dot */}
              {active && (
                <div style={{
                  position: 'absolute', top: 6, width: 4, height: 4,
                  borderRadius: '50%', background: 'var(--mint)',
                }} />
              )}
              <span style={{
                fontSize: 22,
                filter: active ? 'none' : 'grayscale(30%)',
                transform: active ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform .18s',
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: 10, fontWeight: active ? 600 : 400,
                color: active ? 'var(--mint)' : 'var(--text3)',
                letterSpacing: 0.1,
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}