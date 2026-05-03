import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api';
import useStore from '../../store/useStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useStore((s) => s.setAuth);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      setAuth(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.box}>
        <div style={S.logo}>
          <div style={S.logoIco}>✚</div>
          <span style={S.logoTxt}>MediAssist Pro</span>
        </div>
        <h2 style={S.title}>Welcome back</h2>
        <p style={S.sub}>Sign in to your health dashboard</p>
        {error && <div style={S.err}>{error}</div>}
        <form onSubmit={submit}>
          <div style={S.group}>
            <label style={S.label}>Email</label>
            <input className="input" type="email" placeholder="you@email.com" value={form.email}
              onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
          </div>
          <div style={S.group}>
            <label style={S.label}>Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
          </div>
          <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px',marginTop:'8px',fontSize:'14px'}} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={S.footer}>Don't have an account? <Link to="/register" style={{color:'var(--mint)'}}>Create one</Link></p>
      </div>
    </div>
  );
}

const S = {
  page:    { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' },
  box:     { width:'100%', maxWidth:'400px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'36px' },
  logo:    { display:'flex', alignItems:'center', gap:'10px', marginBottom:'28px' },
  logoIco: { width:'38px', height:'38px', background:'linear-gradient(135deg,var(--mint),var(--blue))', borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'20px', fontWeight:'700' },
  logoTxt: { fontFamily:'var(--serif)', fontSize:'18px', color:'var(--text)' },
  title:   { fontFamily:'var(--serif)', fontSize:'22px', fontWeight:'400', marginBottom:'6px' },
  sub:     { color:'var(--text2)', fontSize:'13px', marginBottom:'24px' },
  err:     { background:'rgba(255,107,107,.1)', border:'1px solid rgba(255,107,107,.2)', borderRadius:'8px', padding:'10px 14px', color:'var(--coral)', fontSize:'13px', marginBottom:'16px' },
  group:   { marginBottom:'14px' },
  label:   { display:'block', fontSize:'12px', color:'var(--text2)', fontWeight:'500', marginBottom:'6px' },
  footer:  { textAlign:'center', color:'var(--text2)', fontSize:'13px', marginTop:'20px' },
};
