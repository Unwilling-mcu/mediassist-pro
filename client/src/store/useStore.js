import { create } from 'zustand';
import { getTheme, setTheme as applyTheme } from './theme';

const useStore = create((set, get) => ({
  // ── Theme ──
  theme: getTheme(),
  setTheme: (t) => { applyTheme(t); set({ theme: t }); },

  // ── Auth ──
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, patient: null });
  },

  // ── Patient Profile ──
  patient: null,
  setPatient: (patient) => set({ patient }),

  // ── Active View ──
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),

  // ── Sidebar ──
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // ── Vitals (live from wearable simulation) ──
  liveVitals: {
    heartRate: 74,
    spo2: 99,
    temperature: 98.4,
    steps: 7240,
    sleepHours: 6.67,
    calories: 312,
  },
  setLiveVitals: (vitals) => set((s) => ({ liveVitals: { ...s.liveVitals, ...vitals } })),

  // ── Notifications ──
  notifications: [
    { id: 1, text: 'Atorvastatin refill needed in 7 days', type: 'warning', read: false },
    { id: 2, text: 'Appointment tomorrow at 10:30 AM', type: 'info', read: false },
    { id: 3, text: 'Blood test results ready', type: 'success', read: true },
  ],
  markNotifRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
    })),
}));

export default useStore;
