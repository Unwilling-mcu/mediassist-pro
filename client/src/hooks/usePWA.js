import { useState, useEffect } from 'react';

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled,   setIsInstalled]   = useState(false);
  const [isOnline,      setIsOnline]       = useState(navigator.onLine);
  const [swRegistered,  setSwRegistered]   = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => { setSwRegistered(true); console.log('SW registered:', reg.scope); })
        .catch(err => console.warn('SW registration failed:', err));
    }

    // Install prompt
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);

    // Already installed?
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    // Online/offline
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return false;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') { setIsInstalled(true); setInstallPrompt(null); }
    return outcome === 'accepted';
  };

  return { install, isInstalled, isOnline, swRegistered, canInstall: !!installPrompt };
}