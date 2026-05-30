import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';

const NAV = [
  { path:'/',              label:'Dashboard',      icon:'⊞' },
  { path:'/symptoms',      label:'Symptom Check',  icon:'🩺', badge:'AI',   bc:'var(--coral)' },
  { path:'/nearby',        label:'Nearby Care',    icon:'📍' },
  { path:'/book',          label:'Book Doctor',    icon:'📅' },
  { path:'/appointments',  label:'Appointments',   icon:'🗓️' },
  { path:'/doctor-chat',   label:'Doctor Chat',    icon:'💬', badge:'Live', bc:'var(--green)' },
  { path:'/chat',          label:'AI Assistant',   icon:'🤖' },
  { path:'/analytics',     label:'Analytics',      icon:'📊' },
  { path:'/reminders',     label:'Reminders',      icon:'🔔' },
  { path:'/profile',       label:'My Profile',     icon:'👤' },
  { path:'/prescriptions', label:'Prescriptions',  icon:'💊' },
  { path:'/wearables',     label:'Wearables',      icon:'⌚', badge:'Live', bc:'var(--mint)'  },
  { path:'/org-admin',     label:'Organisation',   icon:'🏥', badge:'New',  bc:'var(--purple)' },
  { path:'/pricing',       label:'Upgrade Plan',   icon:'⚡', badge:'Pro',  bc:'var(--amber)' },
  { path:'/legal',         label:'Legal & Privacy',icon:'📋' },
  { path:'/settings',      label:'Settings',       icon:'⚙️' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, logout, theme, setTheme } = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const w = sidebarOpen ? 230 : 64;

  const nextTheme = () => { const c={dark:'light',light:'system',system:'dark'}; setTheme(c[theme]||'dark'); };
  const themeIcon = theme==='dark'?'🌙':theme==='light'?'☀️':'💻';

  return (
    <div style={{ width:w, minHeight:'100vh', background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', padding:sidebarOpen?'16px 12px':'16px 0', gap:3, transition:'width .28s cubic-bezier(.4,0,.2,1)', flexShrink:0, zIndex:200, overflow:'hidden' }}>
      <div onClick={toggleSidebar} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 4px 16px', cursor:'pointer', flexShrink:0 }}>
        <div style={{ width:38, height:38, background:'linear-gradient(135deg,var(--mint),var(--blue))', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:18, color:'#fff', fontWeight:700 }}>✚</div>
        {sidebarOpen && <span style={{ fontFamily:'var(--serif)', fontSize:16, color:'var(--text)', whiteSpace:'nowrap' }}>MediAssist Pro</span>}
      </div>
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', display:'flex', flexDirection:'column', gap:2 }}>
        {NAV.map(item => {
          const active = pathname===item.path||(item.path!=='/'&&pathname.startsWith(item.path));
          return (
            <div key={item.path} onClick={()=>navigate(item.path)} style={{ display:'flex', alignItems:'center', gap:10, padding:sidebarOpen?'9px 12px':'9px', borderRadius:'var(--rs)', cursor:'pointer', justifyContent:sidebarOpen?'flex-start':'center', background:active?'var(--mintd)':'transparent', color:active?'var(--mint)':'var(--text2)', position:'relative', transition:'all .18s', flexShrink:0 }}
              onMouseEnter={e=>{if(!active)e.currentTarget.style.background='var(--bg3)';}}
              onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent';}}>
              {active && <div style={{ position:'absolute', left:sidebarOpen?-12:-10, width:3, height:20, background:'var(--mint)', borderRadius:'0 3px 3px 0' }}/>}
              <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span style={{ fontSize:13, fontWeight:500, flex:1, whiteSpace:'nowrap' }}>{item.label}</span>
                  {item.badge && <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:100, background:item.bc, color:item.bc==='var(--mint)'||item.bc==='var(--amber)'?'#080E1C':'#fff', flexShrink:0 }}>{item.badge}</span>}
                </>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ flexShrink:0 }}>
        <div onClick={nextTheme} style={{ display:'flex', alignItems:'center', gap:10, padding:sidebarOpen?'9px 12px':'9px', borderRadius:'var(--rs)', cursor:'pointer', color:'var(--text2)', justifyContent:sidebarOpen?'flex-start':'center', transition:'all .18s', marginBottom:2 }}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--bg3)';e.currentTarget.style.color='var(--text)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text2)';}}>
          <span style={{ fontSize:16 }}>{themeIcon}</span>
          {sidebarOpen && <span style={{ fontSize:13, fontWeight:500, flex:1 }}>{theme==='dark'?'Dark Mode':theme==='light'?'Light Mode':'System'}</span>}
        </div>
        <div onClick={logout} style={{ display:'flex', alignItems:'center', gap:10, padding:sidebarOpen?'9px 12px':'9px', borderRadius:'var(--rs)', cursor:'pointer', color:'var(--text3)', justifyContent:sidebarOpen?'flex-start':'center', transition:'all .18s', marginBottom:6 }}
          onMouseEnter={e=>{e.currentTarget.style.color='var(--coral)';e.currentTarget.style.background='rgba(255,107,107,.06)';}}
          onMouseLeave={e=>{e.currentTarget.style.color='var(--text3)';e.currentTarget.style.background='transparent';}}>
          <span style={{ fontSize:16 }}>🚪</span>
          {sidebarOpen && <span style={{ fontSize:13, fontWeight:500 }}>Logout</span>}
        </div>
        <div onClick={toggleSidebar} style={{ width:30, height:30, borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border2)', cursor:'pointer', color:'var(--text2)', display:'flex', alignItems:'center', justifyContent:'center', margin:sidebarOpen?'0':'0 auto', transition:'all .2s', fontSize:12 }}>
          {sidebarOpen?'◀':'▶'}
        </div>
      </div>
    </div>
  );
}