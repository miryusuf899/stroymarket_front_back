import { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, total } = useCartStore();
  const { user } = useAuthStore();
  const [address, setAddress] = useState('');
  const [guest, setGuest] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (!address) return toast.error('Введите адрес!');
    if (!user && !guest.name) return toast.error('Введите имя!');
    setLoading(true);
    try {
      await api.post('/orders/create/', {
        address,
        guest_name: guest.name,
        guest_phone: guest.phone,
        guest_email: guest.email,
        items: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
      });
      toast.success('🎉 Заказ оформлен! Уведомление отправлено в Telegram');
      clearCart();
      setAddress('');
    } catch {
      toast.error('Ошибка при оформлении заказа');
    }
    setLoading(false);
  };

  if (items.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
      <ShoppingBag size={64} color="var(--muted)" />
      <p style={{ color: 'var(--muted)', fontSize: '1.2rem' }}>Корзина пуста</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>🛒 Корзина</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {items.map((item) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}
              >
                <div style={{ width: '70px', height: '70px', background: 'var(--bg3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.image ? <img src={`http://127.0.0.1:8000${item.image}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} /> : '📦'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600 }}>{item.name}</p>
                  <p style={{ color: 'var(--primary)', fontWeight: 700 }}>{Number(item.price).toLocaleString()} сом</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <QtyBtn onClick={() => item.qty > 1 ? updateQty(item.id, item.qty - 1) : removeItem(item.id)}><Minus size={14} /></QtyBtn>
                  <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{item.qty}</span>
                  <QtyBtn onClick={() => updateQty(item.id, item.qty + 1)}><Plus size={14} /></QtyBtn>
                </div>
                <span style={{ fontWeight: 700, minWidth: '80px', textAlign: 'right' }}>{(item.price * item.qty).toLocaleString()} сом</span>
                <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: '0.3rem' }}><Trash2 size={18} /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.2rem' }}>Оформление заказа</h3>
          <Input placeholder="Адрес доставки *" value={address} onChange={(e) => setAddress(e.target.value)} />
          {!user && <>
            <Input placeholder="Ваше имя *" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} />
            <Input placeholder="Телефон" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
            <Input placeholder="Email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
          </>}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--muted)' }}>Итого:</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>{total().toLocaleString()} сом</span>
            </div>
            <button onClick={handleOrder} disabled={loading} style={{
              width: '100%', padding: '1rem', background: 'var(--primary)',
              color: 'white', border: 'none', borderRadius: '12px',
              fontWeight: 700, fontSize: '1rem',
            }}>
              {loading ? 'Оформляем...' : '✅ Оформить заказ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QtyBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{ width: '28px', height: '28px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)' }}>
      {children}
    </button>
  );
}

function Input({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none', marginBottom: '0.8rem' }}
    />
  );
}