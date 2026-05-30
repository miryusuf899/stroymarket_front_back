import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Привет! Я ИИ-ассистент СтройМаркета 🏗️ Помогу выбрать строительные материалы. Спрашивай!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/', { message: userMsg });
      setMessages((m) => [...m, { role: 'ai', text: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'Ошибка. Попробуй ещё раз.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontWeight: 800 }}>ИИ Ассистент</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Советник по строительным материалам</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }} />
          <span style={{ color: 'var(--success)', fontSize: '0.85rem' }}>Онлайн</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: msg.role === 'ai' ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {msg.role === 'ai' ? <Bot size={18} color="white" /> : <User size={18} color="var(--muted)" />}
              </div>
              <div style={{ maxWidth: '75%', background: msg.role === 'user' ? 'var(--primary)' : 'var(--card)', border: `1px solid ${msg.role === 'user' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '14px', padding: '0.8rem 1.2rem', color: msg.role === 'user' ? 'white' : 'var(--text)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} color="white" />
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '0.8rem 1.2rem', display: 'flex', gap: '4px' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: '8px', height: '8px', background: 'var(--muted)', borderRadius: '50%', animation: `bounce 1s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Спроси про строительные материалы..."
          style={{ flex: 1, padding: '1rem 1.2rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', fontSize: '0.95rem', outline: 'none' }}
        />
        <button onClick={send} disabled={loading} style={{ padding: '1rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}