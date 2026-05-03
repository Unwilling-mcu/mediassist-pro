import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { symptomAPI } from '../../api';

const CHIPS = [
  'Headache','Fever','Chest Pain','Shortness of Breath','Nausea','Fatigue',
  'Cough','Sore Throat','Body Aches','Dizziness','Stomach Pain','Back Pain',
  'Rash / Skin','Joint Pain','Eye Pain','Ear Pain','Blurred Vision','Swelling',
];

const BODY_PARTS = [
  { id:'Head',       cx:80,  cy:28,  rx:22, ry:24 },
  { id:'Chest',      cx:80,  cy:104, rx:26, ry:32 },
  { id:'Abdomen',    cx:80,  cy:162, rx:24, ry:24 },
  { id:'Left Arm',   cx:37,  cy:100, rx:14, ry:28 },
  { id:'Right Arm',  cx:123, cy:100, rx:14, ry:28 },
  { id:'Left Leg',   cx:65,  cy:222, rx:14, ry:32 },
  { id:'Right Leg',  cx:95,  cy:222, rx:14, ry:32 },
];

const SEV_COLOR = { mild:'82,214,122', moderate:'255,170,68', severe:'255,107,107', emergency:'255,50,50' };
const SEV_LABEL = {
  mild:      'Mild — Can be managed at home',
  moderate:  'Moderate — See a doctor soon',
  severe:    'Severe — Seek attention today',
  emergency: '🚨 EMERGENCY — Go to ER immediately!',
};

export default function SymptomChecker() {
  const [text, setText]         = useState('');
  const [chips, setChips]       = useState([]);
  const [bodyPart, setBodyPart] = useState('');
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const toggleChip = (c) => setChips(s => s.includes(c) ? s.filter(x=>x!==c) : [...s,c]);

  const clickBody = (id) => {
    setBodyPart(id);
    setText(prev => {
      const note = `Pain/discomfort in ${id}`;
      return prev.includes(note) ? prev : prev ? `${prev}. ${note}` : note;
    });
  };

  const analyze = async () => {
    const combined = [text, chips.join(', '), bodyPart?`Affected area: ${bodyPart}`:''].filter(Boolean).join('. ');
    if (!combined.trim()) { setError('Please describe your symptoms first.'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const { data } = await symptomAPI.analyze({ symptoms: combined, bodyPart });
      setResult(data.data);
    } catch(err) {
      setError(err.response?.data?.message || 'Analysis failed. Make sure your backend server is running.');
    }
    setLoading(false);
  };

  return (
    <div className="fade-up">
      <div className="page-heading">
        <h1>AI <em>Symptom</em> Checker</h1>
        <p>Describe what you feel — Claude AI gives accurate analysis and guides you to the right specialist</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        {/* LEFT */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <h3 style={{ fontFamily:'var(--serif)', fontSize:18, fontWeight:400, marginBottom:6 }}>What are you experiencing?</h3>
            <p style={{ color:'var(--text2)', fontSize:13, marginBottom:16, lineHeight:1.6 }}>
              Be detailed — mention duration, intensity, and when it started for the most accurate result.
            </p>
            <textarea className="input" rows={4} style={{ resize:'none', lineHeight:1.7 }}
              placeholder="e.g. I've had a severe headache for 2 days with mild fever, nausea, and sensitivity to light..."
              value={text} onChange={e=>setText(e.target.value)} />

            <div style={{ fontSize:12, color:'var(--text2)', margin:'14px 0 8px' }}>Tap to add common symptoms:</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
              {CHIPS.map(c=>(
                <div key={c} onClick={()=>toggleChip(c)} style={{
                  background: chips.includes(c)?'var(--mintd)':'var(--bg3)',
                  border:`1px solid ${chips.includes(c)?'var(--mint)':'var(--border)'}`,
                  color: chips.includes(c)?'var(--mint)':'var(--text2)',
                  borderRadius:100, padding:'6px 14px', fontSize:12, cursor:'pointer', userSelect:'none', transition:'all .18s',
                }}>{c}</div>
              ))}
            </div>

            {error && (
              <div style={{ background:'rgba(255,107,107,.1)', border:'1px solid rgba(255,107,107,.2)', borderRadius:8, padding:'10px 14px', color:'var(--coral)', fontSize:13, marginTop:14 }}>
                ⚠️ {error}
              </div>
            )}

            <button className="btn btn-primary" onClick={analyze} disabled={loading}
              style={{ width:'100%', justifyContent:'center', padding:13, fontSize:14, marginTop:16 }}>
              {loading ? '🔄 Analyzing with Claude AI...' : '🔍 Analyze My Symptoms'}
            </button>
          </div>

          {result && (
            <div className="card fade-up">
              {/* Severity */}
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:'var(--rs)', marginBottom:18, background:`rgba(${SEV_COLOR[result.severity]},.1)`, border:`1px solid rgba(${SEV_COLOR[result.severity]},.25)` }}>
                <span style={{ fontSize:20 }}>{result.emergency?'🚨':result.severity==='mild'?'✅':result.severity==='moderate'?'⚠️':'🆘'}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:`rgb(${SEV_COLOR[result.severity]})` }}>{SEV_LABEL[result.severity]}</div>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>Recommended specialist: {result.specialist}</div>
                </div>
              </div>

              <div className="section-title">Possible Conditions</div>
              {(result.conditions||[]).map((c,i)=>(
                <div key={i} style={{ background:'var(--bg3)', borderRadius:'var(--rs)', padding:14, marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontWeight:600, fontSize:14 }}>{c.name}</span>
                    <span style={{ fontWeight:600, color:'var(--mint)', fontSize:13 }}>{c.confidence}% match</span>
                  </div>
                  <div style={{ height:5, background:'var(--border)', borderRadius:3, overflow:'hidden', marginBottom:8 }}>
                    <div style={{ width:`${c.confidence}%`, height:'100%', background:'linear-gradient(90deg,var(--blue),var(--mint))', borderRadius:3, transition:'width 1s ease' }}/>
                  </div>
                  <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>{c.description}</div>
                </div>
              ))}

              <hr className="divider"/>
              <div className="section-title">Recommended Actions</div>
              <ul style={{ listStyle:'none', margin:'0 0 16px' }}>
                {(result.actions||[]).map((a,i)=>(
                  <li key={i} style={{ display:'flex', gap:8, padding:'7px 0', borderBottom:'1px solid var(--border)', fontSize:13, color:'var(--text2)', lineHeight:1.5 }}>
                    <span style={{ color:'var(--mint)', flexShrink:0 }}>→</span>{a}
                  </li>
                ))}
              </ul>

              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-primary" onClick={()=>navigate('/nearby')} style={{ flex:1, justifyContent:'center' }}>🏥 Find Nearby Doctors</button>
                <button className="btn btn-ghost" onClick={()=>navigate('/chat')} style={{ flex:1, justifyContent:'center' }}>💬 Ask AI More</button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — body diagram */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <div style={{ fontSize:13, fontWeight:600, marginBottom:4, textAlign:'center', color:'var(--text2)' }}>Tap a body area</div>
            {bodyPart && <div style={{ textAlign:'center', fontSize:12, color:'var(--mint)', marginBottom:8, fontWeight:600 }}>✓ {bodyPart} selected</div>}

            {/* SVG body — each part is a <g> with pointer-events:all */}
            <svg width="100%" viewBox="0 0 160 270" style={{ display:'block', maxWidth:200, margin:'0 auto' }}>
              {BODY_PARTS.map(p=>(
                <g key={p.id} onClick={()=>clickBody(p.id)} style={{ cursor:'pointer' }}>
                  <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry}
                    fill={bodyPart===p.id?'rgba(0,212,168,0.2)':'rgba(255,255,255,0.04)'}
                    stroke={bodyPart===p.id?'#00D4A8':'rgba(255,255,255,0.2)'}
                    strokeWidth={bodyPart===p.id?2:1.5}
                    style={{ transition:'all .2s', pointerEvents:'all' }}
                  />
                  <text x={p.cx} y={p.cy+4} textAnchor="middle"
                    fill={bodyPart===p.id?'#00D4A8':'#8899BB'}
                    fontSize="9" fontFamily="DM Sans,sans-serif"
                    fontWeight={bodyPart===p.id?'700':'400'}
                    style={{ pointerEvents:'none', userSelect:'none' }}>
                    {p.id}
                  </text>
                </g>
              ))}
            </svg>

            {/* Button fallback — always works */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:14, justifyContent:'center' }}>
              {BODY_PARTS.map(p=>(
                <div key={p.id} onClick={()=>clickBody(p.id)} style={{
                  padding:'5px 10px', borderRadius:8, fontSize:11, cursor:'pointer', userSelect:'none',
                  border:`1px solid ${bodyPart===p.id?'var(--mint)':'var(--border)'}`,
                  background:bodyPart===p.id?'var(--mintd)':'var(--bg3)',
                  color:bodyPart===p.id?'var(--mint)':'var(--text2)',
                  transition:'all .18s',
                }}>{p.id}</div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-title">Recent Checks</div>
            {[
              { sym:'Headache + Fatigue',  time:'2 days ago', sev:'mild',     tag:'Tension' },
              { sym:'Back Pain',            time:'Apr 24',     sev:'moderate', tag:'Muscular' },
              { sym:'Chest tightness',      time:'Apr 20',     sev:'moderate', tag:'Cardiac' },
            ].map((h,i)=>(
              <div key={i} style={{ padding:'10px 0', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:'var(--mintd)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🩺</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:500 }}>{h.sym}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>{h.time}</div>
                </div>
                <span className={`badge badge-${h.sev}`}>{h.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
