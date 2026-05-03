import { useState, useEffect, useCallback } from 'react';
import {
  getReminders, saveReminders, addReminder, removeReminder,
  toggleReminder, DEFAULT_REMINDERS, startScheduler,
  requestPermission, getPermission,
} from '../services/notificationService';

export function useReminders() {
  const [reminders, setReminders]     = useState([]);
  const [permission, setPermission]   = useState(getPermission());
  const [lastFired, setLastFired]     = useState(null);

  // Load reminders from storage, seed defaults if empty
  useEffect(() => {
    let stored = getReminders();
    if (stored.length === 0) {
      stored = DEFAULT_REMINDERS;
      saveReminders(stored);
    }
    setReminders(stored);
  }, []);

  // Start scheduler when permission granted
  useEffect(() => {
    if (permission !== 'granted') return;
    const stop = startScheduler((fired) => {
      setLastFired(fired);
      // Refresh list so UI shows "just fired" state
      setReminders(getReminders());
    });
    return stop;
  }, [permission]);

  const askPermission = useCallback(async () => {
    const result = await requestPermission();
    setPermission(result);
    return result;
  }, []);

  const add = useCallback((reminder) => {
    addReminder(reminder);
    setReminders(getReminders());
  }, []);

  const remove = useCallback((id) => {
    removeReminder(id);
    setReminders(getReminders());
  }, []);

  const toggle = useCallback((id, enabled) => {
    toggleReminder(id, enabled);
    setReminders(getReminders());
  }, []);

  const update = useCallback((id, changes) => {
    const all = getReminders().map(r => r.id === id ? { ...r, ...changes } : r);
    saveReminders(all);
    setReminders(all);
  }, []);

  return { reminders, permission, lastFired, askPermission, add, remove, toggle, update };
}