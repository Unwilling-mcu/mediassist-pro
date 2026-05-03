import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import { initTheme } from './store/theme';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import './styles/globals.css';

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
