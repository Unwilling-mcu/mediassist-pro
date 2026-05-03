// ── MediAssist Notification Service ──
// Handles browser push notifications + medication reminder scheduling

const STORAGE_KEY = 'mediassist-reminders';

// ── Permission ──
export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  const result = await Notification.requestPermission();
  return result;
}

export function getPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

// ── Fire a browser notification ──
export function fireNotification(title, body, options = {}) {
  if (Notification.permission !== 'granted') return null;
  const n = new Notification(title, {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: options.tag || 'mediassist',
    requireInteraction: options.requireInteraction || false,
    silent: false,
    ...options,
  });
  n.onclick = () => {
    window.focus();
    n.close();
    if (options.onClick) options.onClick();
  };
  return n;
}

// ── Reminder store (localStorage) ──
export function getReminders() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function saveReminders(reminders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export function addReminder(reminder) {
  const all = getReminders();
  const existing = all.findIndex(r => r.id === reminder.id);
  if (existing >= 0) all[existing] = reminder;
  else all.push(reminder);
  saveReminders(all);
}

export function removeReminder(id) {
  saveReminders(getReminders().filter(r => r.id !== id));
}

export function toggleReminder(id, enabled) {
  const all = getReminders().map(r => r.id === id ? { ...r, enabled } : r);
  saveReminders(all);
}

// ── Default reminders ──
export const DEFAULT_REMINDERS = [
  { id: 'med-1', medicine: 'Metformin 500mg',    time: '08:00', label: 'After breakfast', enabled: true,  days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
  { id: 'med-2', medicine: 'Atorvastatin 10mg',  time: '20:00', label: 'After dinner',    enabled: true,  days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
  { id: 'med-3', medicine: 'Vitamin D3 1000 IU', time: '07:30', label: 'Morning with food',enabled: false, days: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
];

// ── Scheduler: checks every minute if a reminder should fire ──
let schedulerInterval = null;
const firedToday = new Set();

export function startScheduler(onFire) {
  if (schedulerInterval) return;

  const check = () => {
    const now   = new Date();
    const hhmm  = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][now.getDay()];
    const todayKey = `${now.toDateString()}`;

    const reminders = getReminders();
    reminders.forEach(r => {
      if (!r.enabled) return;
      if (r.time !== hhmm) return;
      if (!r.days.includes(dayName)) return;
      const key = `${todayKey}-${r.id}`;
      if (firedToday.has(key)) return;

      firedToday.add(key);
      fireNotification(
        `💊 Medicine Reminder`,
        `Time to take ${r.medicine} — ${r.label}`,
        { tag: r.id, requireInteraction: true }
      );
      if (onFire) onFire(r);
    });
  };

  check(); // run immediately
  schedulerInterval = setInterval(check, 60 * 1000); // check every minute
  return () => { clearInterval(schedulerInterval); schedulerInterval = null; };
}

export function stopScheduler() {
  if (schedulerInterval) { clearInterval(schedulerInterval); schedulerInterval = null; }
}