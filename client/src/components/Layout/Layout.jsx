import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useStore from '../../store/useStore';
import { patientAPI } from '../../api';
import { useLiveVitals } from '../../hooks/useLiveVitals';
import { usePWA } from '../../hooks/usePWA';
import { useIsMobile } from '../../hooks/useIsMobile';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import Dashboard from '../Dashboard/Dashboard';
import SymptomChecker from '../Symptom/SymptomChecker';
import NearbyMap from '../Nearby/NearbyMap';
import AiChat from '../Chat/AiChat';
import DoctorChat from '../DoctorChat/DoctorChat';
import Profile from '../Profile/Profile';
import Prescriptions from '../Prescriptions/Prescriptions';
import Wearables from '../Wearables/Wearables';
import Analytics from '../Analytics/Analytics';
import Reminders from '../Reminders/Reminders';
import BookingPage from '../Booking/BookingPage';
import Appointments from '../Appointments/Appointments';
import Settings from '../Settings/Settings';
import Pricing from '../../pages/Pricing';
import OrgAdmin from '../OrgAdmin/OrgAdmin';
import Legal from '../../pages/Legal';
import DoctorOnboarding from '../../pages/DoctorOnboarding';

export default function Layout() {
  const setPatient = useStore((s) => s.setPatient);
  const { isOnline, canInstall, install } = usePWA();
  const isMobile = useIsMobile();
  useLiveVitals(true);

  useEffect(() => {
    patientAPI.getProfile()
      .then(({ data }) => setPatient(data.data))
      .catch(() => {});
  }, []);

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {!isMobile && <Sidebar />}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
        <Topbar isMobile={isMobile} />
        {!isOnline && (
          <div style={{ background:'rgba(255,170,68,.15)', borderBottom:'1px solid rgba(255,170,68,.3)', padding:'8px 16px', fontSize:13, color:'var(--amber)', display:'flex', alignItems:'center', gap:8 }}>
            📡 You are offline — some features may not work.
          </div>
        )}
        {canInstall && (
          <div style={{ background:'linear-gradient(135deg,rgba(0,212,168,.1),rgba(74,159,213,.1))', borderBottom:'1px solid var(--mintd)', padding:'8px 16px', fontSize:13, display:'flex', alignItems:'center', gap:12 }}>
            <span>📱 Install MediAssist Pro!</span>
            <button onClick={install} style={{ background:'var(--mint)', color:'#080E1C', border:'none', borderRadius:8, padding:'5px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--sans)' }}>Install</button>
          </div>
        )}
        <div style={{ flex:1, overflowY:'auto', padding: isMobile ? '16px 14px' : '24px', paddingBottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom))' : '24px' }}>
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/symptoms"      element={<SymptomChecker />} />
            <Route path="/nearby"        element={<NearbyMap />} />
            <Route path="/chat"          element={<AiChat />} />
            <Route path="/doctor-chat"   element={<DoctorChat />} />
            <Route path="/analytics"     element={<Analytics />} />
            <Route path="/reminders"     element={<Reminders />} />
            <Route path="/book"          element={<BookingPage />} />
            <Route path="/appointments"  element={<Appointments />} />
            <Route path="/profile"       element={<Profile />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/wearables"     element={<Wearables />} />
            <Route path="/settings"      element={<Settings />} />
            <Route path="/pricing"       element={<Pricing />} />
            <Route path="/org-admin"     element={<OrgAdmin />} />
            <Route path="/legal"         element={<Legal />} />
            <Route path="/doctor-register" element={<DoctorOnboarding />} />
            <Route path="*"              element={<Dashboard />} />
          </Routes>
        </div>
      </div>
      {isMobile && <MobileNav />}
    </div>
  );
}