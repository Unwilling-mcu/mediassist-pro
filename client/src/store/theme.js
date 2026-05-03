// Theme: 'dark' | 'light' | 'system'
const STORAGE_KEY = 'mediassist-theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(preference) {
  const resolved = preference === 'system' ? getSystemTheme() : preference;
  document.documentElement.setAttribute('data-theme', resolved);
}

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  applyTheme(saved);

  // Listen to system changes if 'system' is selected
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = localStorage.getItem(STORAGE_KEY) || 'dark';
    if (current === 'system') applyTheme('system');
  });

  return saved;
}

export function setTheme(preference) {
  localStorage.setItem(STORAGE_KEY, preference);
  applyTheme(preference);
}

export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) || 'dark';
}
