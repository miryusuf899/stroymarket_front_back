import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Sun, Moon, Bot, Home, LogOut } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { t } from '../../theme';

export default function Navbar({ theme, setTheme }) {
  const c = t(theme);
  const items = useCartStore((s) => s.items);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  const btn = {
    padding: '0.5rem 1rem', background: c.bg3,
    border: `1px solid ${c.border}`, borderRadius: '10px',
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    color: c.text, fontSize: '0.9rem', fontWeight: 500,
  };

  return (
    <nav style={{
      background: c.bg2, borderBottom: `1px solid ${c.border}`,
      padding: '0 2rem', height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🏗️</span>
        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: c.primary }}>СтройМаркет</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link to="/" style={btn}><Home size={18} />Главная</Link>
        <Link to="/ai" style={btn}><Bot size={18} />ИИ</Link>

        <Link to="/cart" style={{ ...btn, position: 'relative' }}>
          <ShoppingCart size={18} />
          Корзина
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: '-6px', right: '-6px',
              background: c.primary, color: 'white',
              borderRadius: '50%', width: '20px', height: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700,
            }}>{cartCount}</span>
          )}
        </Link>

        {user ? (
          <>
            <Link to="/profile" style={btn}><User size={18} />{user.username}</Link>
            <button onClick={() => { logout(); navigate('/login'); }} style={{ ...btn, color: c.danger }}>
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link to="/login" style={{ ...btn, background: c.primary, color: 'white', border: 'none' }}>
            <User size={18} />Войти
          </Link>
        )}

        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ ...btn, color: c.muted }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
}