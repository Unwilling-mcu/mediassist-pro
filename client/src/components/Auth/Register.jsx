import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api';
import useStore from '../../store/useStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useStore((s) => s.setAuth);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      setAuth(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      <div style={S.box}>
        <div style={S.logo}><div style={S.logoIco}>✚</div><span style={S.logoTxt}>MediAssist Pro</span></div>
        <h2 style={S.title}>Create your account</h2>
        <p style={S.sub}>Start managing your health today</p>
        {error && <div style={S.err}>{error}</div>}
        <form onSubmit={submit}>
          {[['Full Name','text','name','John Doe'],['Email','email','email','you@email.com'],['Password','password','password','Min 6 characters']].map(([lbl,type,key,ph]) => (
            <div key={key} style={{marginBottom:'14px'}}>
              <label style={S.label}>{lbl}</label>
              <input className="input" type={type} placeholder={ph} value={form[key]}
                onChange={e => setForm(f => ({...f,[key]:e.target.value}))} required />
            </div>
          ))}
          <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px',marginTop:'8px',fontSize:'14px'}} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p style={S.footer}>Already have an account? <Link to="/login" style={{color:'var(--mint)'}}>Sign in</Link></p>
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
  label:   { display:'block', fontSize:'12px', color:'var(--text2)', fontWeight:'500', marginBottom:'6px' },
  footer:  { textAlign:'center', color:'var(--text2)', fontSize:'13px', marginTop:'20px' },
};
