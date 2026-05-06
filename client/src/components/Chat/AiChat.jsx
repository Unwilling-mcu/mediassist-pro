import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../api';
import { useIsMobile } from '../../hooks/useIsMobile';

const SUGGESTIONS = [
  'What are the side effects of Metformin?',
  'Is my blood pressure 118/76 normal?',
  'Foods to avoid with Atorvastatin',
  'Why do I feel tired often?',
];

function formatMessage(text) {
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let key = 0;
  const flushList = () => {
    if (listItems.length) { elements.push(<ul key={key++} style={{ paddingLeft:18, margin:'6px 0' }}>{listItems}</ul>); listItems = []; }
  };
  lines.forEach(line => {
    const t = line.trim();
    if (!t) { flushList(); return; }
    if (t.match(/^[-*•]\s/) || t.match(/^\d+\.\s/)) {
      listItems.push(<li key={key++} style={{ marginBottom:4 }}>{t.replace(/^[-*•]\s|^\d+\.\s/,'')}</li>);
    } else {
      flushList();
      elements.push(<p key={key++} style={{ margin:'4px 0', lineHeight:1.7 }}>{t}</p>);
    }
  });
  flushList();
  return elements;
}

export default function AiChat() {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState([{
    role:'assistant',
    content:"Hello! I'm MediAssist AI, powered by Claude.\n\nI can help you with:\n- Understanding your symptoms\n- Medication questions and interactions\n- Interpreting your health vitals\n- Preparing for doctor visits\n\nWhat would you like to know today?",
  }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const bottomRef             = useRef(null);
  const textareaRef           = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput(''); setError('');
    if (textareaRef.current) textareaRef.current.style.height = '';
    const newMsgs = [...messages, { role:'user', content:msg }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const { data } = await aiAPI.chat(newMsgs.map(m => ({ role:m.role, content:m.content })));
      setMessages(prev => [...prev, { role:'assistant', content:data.message }]);
    } catch(err) {
      const errMsg = err.response?.data?.message || 'Connection error. Make sure your server is running on port 5000.';
      setError(errMsg);
      setMessages(prev => [...prev, { role:'assistant', content:`Sorry, I encountered an issue: ${errMsg}` }]);
    } finally { setLoading(false); }
  };

  const newChat = () => {
    setMessages([{ role:'assistant', content:'New conversation! How can I help you today?' }]);
    setError('');
  };

  /* ── MOBILE LAYOUT ── */
  if (isMobile) {
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 56px - 64px - env(safe-area-inset-bottom))', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r)', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,var(--mint),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>✚</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:600 }}>MediAssist AI</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'var(--text2)' }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--mint)', animation:'pulse 2s infinite' }} />
              Powered by Claude
            </div>
          </div>
          <button onClick={newChat} style={{ padding:'7px 13px', borderRadius:20, background:'var(--mintd)', border:'1px solid rgba(0,212,168,.25)', color:'var(--mint)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--sans)' }}>
            + New
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px 12px', display:'flex', flexDirection:'column', gap:12 }}>
          {messages.map((m,i) => (
            <div key={i} style={{ display:'flex', gap:8, maxWidth:'88%', alignSelf:m.role==='user'?'flex-end':'flex-start', flexDirection:m.role==='user'?'row-reverse':'row' }}>
              <div style={{ width:30, height:30, borderRadius:9, flexShrink:0, background:m.role==='user'?'linear-gradient(135deg,var(--blue),var(--purple))':'linear-gradient(135deg,var(--mint),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#fff' }}>
                {m.role==='user'?'👤':'✚'}
              </div>
              <div style={{ background:m.role==='user'?'var(--mintd)':'var(--bg3)', border:`1px solid ${m.role==='user'?'rgba(0,212,168,.25)':'var(--border)'}`, borderRadius:m.role==='user'?'16px 4px 16px 16px':'4px 16px 16px 16px', padding:'10px 14px', fontSize:13, lineHeight:1.7 }}>
                {formatMessage(m.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', gap:8, maxWidth:'88%' }}>
              <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,var(--mint),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}>✚</div>
              <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'4px 16px 16px 16px', padding:'12px 16px', display:'flex', gap:5, alignItems:'center' }}>
                {[0,1,2].map(i=><span key={i} style={{ width:7, height:7, background:'var(--mint)', borderRadius:'50%', display:'block', animation:`bounce 1.2s infinite ${i*0.2}s` }}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Suggestions */}
        <div style={{ padding:'8px 12px', borderTop:'1px solid var(--border)', display:'flex', gap:7, overflowX:'auto', flexShrink:0 }}>
          {SUGGESTIONS.map(s=>(
            <button key={s} onClick={()=>!loading&&send(s)} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:100, padding:'6px 13px', fontSize:11, cursor:'pointer', color:'var(--text2)', whiteSpace:'nowrap', fontFamily:'var(--sans)', flexShrink:0 }}>
              {s}
            </button>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{ fontSize:10, color:'var(--text3)', padding:'4px 14px', flexShrink:0, textAlign:'center' }}>
          ℹ️ For informational purposes only. Consult a licensed doctor for medical decisions.
        </div>

        {/* Input */}
        <div style={{ padding:'10px 12px 12px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
          {error && (
            <div style={{ background:'rgba(255,107,107,.1)', border:'1px solid rgba(255,107,107,.2)', borderRadius:8, padding:'7px 12px', color:'var(--coral)', fontSize:11, marginBottom:8 }}>
              ⚠️ Server not reachable. Run: <code>cd server && npm run dev</code>
            </div>
          )}
          <div style={{ display:'flex', alignItems:'flex-end', gap:8, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:20, padding:'10px 12px' }}>
            <textarea
              ref={textareaRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
              onInput={e=>{e.target.style.height='';e.target.style.height=Math.min(e.target.scrollHeight,100)+'px';}}
              placeholder="Ask about symptoms, medications..."
              rows={1}
              style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:14, fontFamily:'var(--sans)', resize:'none', lineHeight:1.5, maxHeight:100 }}
            />
            <button onClick={()=>send()} disabled={loading||!input.trim()}
              style={{ width:38, height:38, borderRadius:'50%', background:input.trim()&&!loading?'var(--mint)':'var(--bg3)', border:'none', cursor:input.trim()&&!loading?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, opacity:input.trim()&&!loading?1:.4, fontSize:16 }}>
              ➤
            </button>
          </div>
        </div>

        <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
      </div>
    );
  }

  /* ── DESKTOP LAYOUT (unchanged) ── */
  return (
    <div style={{ height:'calc(100vh - 112px)', display:'grid', gridTemplateColumns:'250px 1fr', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r)', overflow:'hidden' }}>
      <div style={{ borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:18, borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:10 }}>Conversations</div>
          <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', fontSize:13 }} onClick={newChat}>
            + New Chat
          </button>
        </div>
        <div style={{ flex:1, overflow:'auto', padding:10 }}>
          {['Heart medication inquiry','Blood pressure readings','Diet with diabetes','Understanding ECG'].map((t,i) => (
            <div key={i} style={{ padding:'9px 11px', borderRadius:8, cursor:'pointer', marginBottom:3, background:i===0?'var(--mintd)':'transparent', fontSize:12 }}
              onMouseEnter={e=>{if(i!==0)e.currentTarget.style.background='var(--bg3)';}}
              onMouseLeave={e=>{if(i!==0)e.currentTarget.style.background='transparent';}}>
              <div style={{ fontWeight:500, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t}</div>
              <div style={{ fontSize:11, color:'var(--text3)' }}>{['2h ago','Yesterday','Apr 25','Apr 22'][i]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', minHeight:0 }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'linear-gradient(135deg,var(--mint),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>✚</div>
          <div>
            <div style={{ fontSize:14, fontWeight:600 }}>MediAssist AI</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--text2)' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--mint)', animation:'pulse 2s infinite' }} />
              Powered by Claude · Secure backend routing
            </div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:16, minHeight:0 }}>
          {messages.map((m,i) => (
            <div key={i} style={{ display:'flex', gap:10, maxWidth:'82%', alignSelf:m.role==='user'?'flex-end':'flex-start', flexDirection:m.role==='user'?'row-reverse':'row' }}>
              <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, background:m.role==='user'?'linear-gradient(135deg,var(--blue),var(--purple))':'linear-gradient(135deg,var(--mint),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#fff' }}>
                {m.role==='user'?'👤':'✚'}
              </div>
              <div style={{ background:m.role==='user'?'var(--mintd)':'var(--bg3)', border:`1px solid ${m.role==='user'?'rgba(0,212,168,.2)':'var(--border)'}`, borderRadius:14, padding:'12px 16px', fontSize:13, lineHeight:1.7 }}>
                {formatMessage(m.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', gap:10, maxWidth:'82%' }}>
              <div style={{ width:34, height:34, borderRadius:9, background:'linear-gradient(135deg,var(--mint),var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexShrink:0 }}>✚</div>
              <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 18px', display:'flex', gap:5, alignItems:'center' }}>
                {[0,1,2].map(i=><span key={i} style={{ width:7, height:7, background:'var(--mint)', borderRadius:'50%', display:'block', animation:`bounce 1.2s infinite ${i*0.2}s` }}/>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div style={{ fontSize:11, color:'var(--text3)', padding:'4px 20px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
          ℹ️ For informational purposes only. Always consult a licensed doctor for medical decisions.
        </div>

        <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
          {error && (
            <div style={{ background:'rgba(255,107,107,.1)', border:'1px solid rgba(255,107,107,.2)', borderRadius:8, padding:'8px 14px', color:'var(--coral)', fontSize:12, marginBottom:10 }}>
              ⚠️ Server not reachable. Run: <code>cd server && npm run dev</code>
            </div>
          )}
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--rs)', padding:'12px 14px' }}>
            <textarea ref={textareaRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
              onInput={e=>{e.target.style.height='';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px';}}
              placeholder="Ask about symptoms, medications, test results..." rows={1}
              style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--sans)', resize:'none', lineHeight:1.6, maxHeight:120 }}/>
            <button onClick={()=>send()} disabled={loading||!input.trim()}
              style={{ width:36, height:36, borderRadius:9, background:input.trim()&&!loading?'var(--mint)':'var(--bg3)', border:'none', cursor:input.trim()&&!loading?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, opacity:input.trim()&&!loading?1:.4 }}>
              ➤
            </button>
          </div>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:10 }}>
            {SUGGESTIONS.map(s=>(
              <div key={s} onClick={()=>!loading&&send(s)} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:100, padding:'5px 12px', fontSize:11, cursor:'pointer', color:'var(--text2)' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--mint)';e.currentTarget.style.color='var(--mint)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text2)';}}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}