import { useEffect } from 'react';
import useStore from '../store/useStore';

/**
 * Simulates a connected smart watch sending live vitals every 4 seconds.
 * In production: replace with Bluetooth Web API, Samsung Health SDK,
 * Apple HealthKit (via native bridge), or a wearable WebSocket feed.
 */
export function useLiveVitals(enabled = true) {
  const setLiveVitals = useStore((s) => s.setLiveVitals);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      setLiveVitals({
        heartRate:   68 + Math.floor(Math.random() * 16),       // 68–84
        spo2:        97 + Math.floor(Math.random() * 3),        // 97–99
        temperature: +(98.2 + Math.random() * 0.6).toFixed(1), // 98.2–98.8
        steps:       7000 + Math.floor(Math.random() * 500),
        calories:    300 + Math.floor(Math.random() * 50),
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [enabled]);
}
