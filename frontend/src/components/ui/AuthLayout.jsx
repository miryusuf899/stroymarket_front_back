import { motion } from 'framer-motion';

export function AuthLayout({ title, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '420px' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.6rem', marginBottom: '1.5rem', textAlign: 'center' }}>{title}</h2>
        {children}
      </motion.div>
    </div>
  );
}

export function AuthInput({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ width: '100%', padding: '0.9rem 1.2rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', fontSize: '0.95rem', outline: 'none', marginBottom: '1rem', display: 'block' }}
    />
  );
}

export function AuthBtn({ children, onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem' }}>
      {loading ? 'Загрузка...' : children}
    </button>
  );
}