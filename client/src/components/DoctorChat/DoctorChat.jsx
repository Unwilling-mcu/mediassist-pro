import React, { useState, useEffect, useRef, useCallback } from 'react';
import useStore from '../../store/useStore';
import { useSocket } from '../../hooks/useSocket';
import { messageAPI } from '../../api';

// Real Asansol doctors for chat
const DOCTORS = [
  { id:1, name:'Dr. Debdweep Roy',   spec:'Diabetologist',     avatar:'DR', color:'var(--mint)',   bg:'var(--mintd)',             online:true  },
  { id:2, name:'Dr. Aurobindo Maji', spec:'Orthopedic',         avatar:'AM', color:'var(--purple)', bg:'rgba(155,130,244,.12)',    online:false },
  { id:3, name:'Dr. Kalyan Mondal',  spec:'General Physician',  avatar:'KM', color:'var(--amber)',  bg:'rgba(255,170,68,.12)',     online:true  },
  { id:4, name:'Dr. Priya Menon',    spec:'Dermatologist',      avatar:'PM', color:'var(--coral)',  bg:'rgba(255,107,107,.12)',    online:true  },
  { id:5, name:'Dr. Rohit Kumar',    spec:'Neurologist',        avatar:'RK', color:'var(--blue)',   bg:'var(--blued)',             online:false },
  { id:6, name:'Dr. Neha Choudhary',spec:'Pediatrician',       avatar:'NC', color:'var(--green)',  bg:'rgba(82,214,122,.12)',     online:true  },
];

function timeStr(date) {
  return new Date(date).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true });
}

export default function DoctorChat() {
  const { user } = useStore();
  const { joinRoom, sendMessage, onMessage, onHistory, sendTyping, onTyping } = useSocket();

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [typing,      setTyping]      = useState('');
  const [connected,   setConnected]   = useState(false);
  const [loading,     setLoading]     = useState(false);
  const bottomRef  = useRef(null);
  const typingTimer= useRef(null);
  const inputRef   = useRef(null);

  const userId   = user?._id || user?.id || 'patient';
  const userName = user?.name || 'Patient';

  // Auto scroll
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, typing]);

  // Socket listeners
  useEffect(() => {
    const offMsg = onMessage(msg => {
      setMessages(prev => [...prev, msg]);
    });
    const offHist = onHistory(hist => {
      setMessages(hist);
      setLoading(false);
      setConnected(true);
    });
    const offTyping = onTyping(
      ({ userName: n }) => { setTyping(`${n} is typing…`); },
      ()              => { setTyping(''); }
    );
    return () => { offMsg(); offHist(); offTyping(); };
  }, [onMessage, onHistory, onTyping]);

  const selectDoctor = async (doc) => {
    setSelectedDoc(doc);
    setMessages([]);
    setConnected(false);
    setLoading(true);
    const roomId = [userId, `doc_${doc.id}`].sort().join('_');
    joinRoom(roomId);
    // Timeout fallback
    setTimeout(() => setLoading(false), 3000);
  };

  const send = () => {
    if (!input.trim() || !selectedDoc) return;
    const roomId = [userId, `doc_${selectedDoc.id}`].sort().join('_');
    sendMessage(roomId, input.trim(), userId, userName);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = '';
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = '';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
    if (!selectedDoc) return;
    const roomId = [userId, `doc_${selectedDoc.id}`].sort().join('_');
    sendTyping(roomId, userName, true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTyping(roomId, userName, false), 1500);
  };

  return (
    <div className="fade-up">
      <div className="page-heading">
        <h1>Doctor <em>Live Chat</em></h1>
        <p>Real-time messaging with your doctors · Powered by Socket.io</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', height:'calc(100vh - 160px)', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r)', overflow:'hidden' }}>

        {/* Doctor list */}
        <div style={{ borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'16px 18px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Your Doctors</div>
            <div style={{ fontSize:12, color:'var(--text2)' }}>{DOCTORS.filter(d=>d.online).length} online now</div>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {DOCTORS.map(doc => (
              <div key={doc.id} onClick={() => selectDoctor(doc)} style={{
                display:'flex', alignItems:'center', gap:12, padding:'14px 18px',
                borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'all .18s',
                background: selectedDoc?.id === doc.id ? 'var(--mintd)' : 'transparent',
                borderLeft: selectedDoc?.id === doc.id ? '3px solid var(--mint)' : '3px solid transparent',
              }}
                onMouseEnter={e => { if (selectedDoc?.id!==doc.id) e.currentTarget.style.background='var(--bg3)'; }}
                onMouseLeave={e => { if (selectedDoc?.id!==doc.id) e.currentTarget.style.background='transparent'; }}
              >
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:44, height:44, borderRadius:13, background:doc.bg, color:doc.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 }}>{doc.avatar}</div>
                  <div style={{ position:'absolute', bottom:1, right:1, width:10, height:10, borderRadius:'50%', background:doc.online?'var(--green)':'var(--text3)', border:'2px solid var(--card)' }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{doc.name}</div>
                  <div style={{ fontSize:11, color:'var(--text2)' }}>{doc.spec}</div>
                  <div style={{ fontSize:11, color:doc.online?'var(--green)':'var(--text3)', marginTop:2 }}>{doc.online?'● Online':'○ Offline'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {!selectedDoc ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, color:'var(--text3)' }}>
            <div style={{ fontSize:48 }}>💬</div>
            <div style={{ fontSize:16, fontWeight:600, color:'var(--text2)' }}>Select a doctor to start chatting</div>
            <div style={{ fontSize:13, color:'var(--text3)' }}>Real-time messaging powered by Socket.io</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', minHeight:0 }}>
            {/* Header */}
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
              <div style={{ position:'relative' }}>
                <div style={{ width:40, height:40, borderRadius:11, background:selectedDoc.bg, color:selectedDoc.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 }}>{selectedDoc.avatar}</div>
                <div style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%', background:selectedDoc.online?'var(--green)':'var(--text3)', border:'2px solid var(--card)' }}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>{selectedDoc.name}</div>
                <div style={{ fontSize:12, color:selectedDoc.online?'var(--green)':'var(--text2)' }}>
                  {selectedDoc.online ? '● Online · Usually replies in minutes' : '○ Offline · Will reply when available'}
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ padding:'6px 12px', borderRadius:'var(--rs)', background:'var(--bg3)', border:'1px solid var(--border)', fontSize:12, color:'var(--text2)', cursor:'pointer' }}>📋 View Profile</div>
                <div style={{ padding:'6px 12px', borderRadius:'var(--rs)', background:'var(--bg3)', border:'1px solid var(--border)', fontSize:12, color:'var(--text2)', cursor:'pointer' }}>📅 Book Appt</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:12, minHeight:0 }}>
              {/* Welcome message */}
              {messages.length === 0 && !loading && (
                <div style={{ textAlign:'center', padding:'30px 0' }}>
                  <div style={{ width:64, height:64, borderRadius:'50%', background:selectedDoc.bg, color:selectedDoc.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:22, margin:'0 auto 14px' }}>{selectedDoc.avatar}</div>
                  <div style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>{selectedDoc.name}</div>
                  <div style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>{selectedDoc.spec}</div>
                  <div style={{ fontSize:13, color:'var(--text2)', background:'var(--bg3)', borderRadius:'var(--rs)', padding:'12px 18px', display:'inline-block', maxWidth:380 }}>
                    👋 Hello! I'm {selectedDoc.name}. How can I help you today? Please describe your symptoms or concerns and I'll do my best to assist.
                  </div>
                </div>
              )}

              {loading && (
                <div style={{ display:'flex', justifyContent:'center', padding:20 }}>
                  <div style={{ display:'flex', gap:5 }}>
                    {[0,1,2].map(i=><span key={i} style={{ width:8, height:8, background:'var(--mint)', borderRadius:'50%', animation:`bounce 1.2s infinite ${i*.2}s` }}/>)}
                  </div>
                </div>
              )}

              {messages.map((m, i) => {
                const isMe = m.senderId === userId;
                return (
                  <div key={m._id || i} style={{ display:'flex', gap:10, alignSelf:isMe?'flex-end':'flex-start', maxWidth:'75%', flexDirection:isMe?'row-reverse':'row' }}>
                    {!isMe && (
                      <div style={{ width:32, height:32, borderRadius:9, background:selectedDoc.bg, color:selectedDoc.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0 }}>{selectedDoc.avatar}</div>
                    )}
                    <div>
                      <div style={{ background:isMe?'var(--mintd)':'var(--bg3)', border:`1px solid ${isMe?'rgba(0,212,168,.2)':'var(--border)'}`, borderRadius:14, padding:'10px 14px', fontSize:13, lineHeight:1.7 }}>
                        {m.text}
                      </div>
                      <div style={{ fontSize:10, color:'var(--text3)', marginTop:3, textAlign:isMe?'right':'left' }}>
                        {timeStr(m.createdAt || new Date())}
                      </div>
                    </div>
                  </div>
                );
              })}

              {typing && (
                <div style={{ display:'flex', gap:10, alignSelf:'flex-start' }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:selectedDoc.bg, color:selectedDoc.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, flexShrink:0 }}>{selectedDoc.avatar}</div>
                  <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:14, padding:'10px 14px' }}>
                    <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                      {[0,1,2].map(i=><span key={i} style={{ width:6, height:6, background:'var(--mint)', borderRadius:'50%', animation:`bounce 1.2s infinite ${i*.2}s` }}/>)}
                      <span style={{ fontSize:11, color:'var(--text2)', marginLeft:4 }}>{typing}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Quick replies */}
            <div style={{ padding:'8px 20px', display:'flex', gap:7, flexWrap:'wrap', borderTop:'1px solid var(--border)', flexShrink:0 }}>
              {['What are my test results?','I have a question about my prescription','I need to reschedule my appointment','My symptoms have changed'].map(q=>(
                <div key={q} onClick={()=>{ setInput(q); inputRef.current?.focus(); }}
                  style={{ padding:'4px 12px', borderRadius:100, fontSize:11, cursor:'pointer', background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text2)', transition:'all .18s', whiteSpace:'nowrap' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--mint)';e.currentTarget.style.color='var(--mint)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text2)';}}>
                  {q}
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'flex-end', gap:10, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--rs)', padding:'10px 14px', transition:'border-color .2s' }}
                onFocus={e=>e.currentTarget.style.borderColor='var(--mint)'}
                onBlur={e=>e.currentTarget.style.borderColor='var(--border)'}>
                <textarea ref={inputRef} value={input} onChange={handleInput} onKeyDown={handleKey}
                  placeholder={selectedDoc.online ? `Message ${selectedDoc.name}…` : 'Doctor is offline — message will be sent when they return'}
                  rows={1}
                  style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--sans)', resize:'none', lineHeight:1.6, maxHeight:100 }}/>
                <button onClick={send} disabled={!input.trim()}
                  style={{ width:36, height:36, borderRadius:9, background:input.trim()?'var(--mint)':'var(--bg3)', border:'none', cursor:input.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s', opacity:input.trim()?1:.4 }}>
                  ➤
                </button>
              </div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:6, textAlign:'center' }}>
                ⚕️ For medical emergencies, call 112. This chat is for non-urgent consultations only.
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}
