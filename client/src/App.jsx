import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import { initTheme } from './store/theme';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import './styles/globals.css';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API  = BASE.endsWith('/api') ? BASE : `${BASE}/api`;

// Init theme before first render
initTheme();

function PrivateRoute({ children }) {
  const token = useStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const token = useStore((s) => s.token);
  return !token ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { token, setAuth, user } = useStore();

  // On app load, refresh token so org/role changes are picked up
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.token) {
          localStorage.setItem('token', d.token);
          setAuth(d.user, d.token);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/*" element={<PrivateRoute><Layout /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}