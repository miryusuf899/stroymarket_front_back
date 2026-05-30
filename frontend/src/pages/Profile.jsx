import { useState, useEffect } from 'react';
import { Package, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export default function Profile() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [spending, setSpending] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.get('/orders/my/').then((r) => setOrders(r.data));
    api.get('/my-spending/').then((r) => setSpending(r.data));
  }, [user]);

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted)' }}>
      <p>Войдите в аккаунт</p>
    </div>
  );

  const chartData = spending.map((s) => ({
    month: new Date(s.month).toLocaleDateString('ru', { month: 'short', year: '2-digit' }),
    сумма: Number(s.total),
  }));

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: '70px', height: '70px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
          {user.username[0].toUpperCase()}
        </div>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.5rem' }}>{user.username}</h2>
          <p style={{ color: 'var(--muted)' }}>{user.email}</p>
          {user.is_staff && <span style={{ background: 'var(--accent)', color: 'white', padding: '2px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>Администратор</span>}
        </div>
      </div>

      {chartData.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--primary)" /> Мои расходы по месяцам
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px' }} />
              <Bar dataKey="сумма" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={20} color="var(--primary)" /> Мои заказы
        </h3>
        {orders.length === 0 ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>Заказов пока нет</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Заказ #{order.id}</span>
                <StatusBadge status={order.status} />
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>📍 {order.address}</p>
              <p style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '0.3rem' }}>{Number(order.total_price).toLocaleString()} сом</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { pending: ['#f59e0b', 'Ожидает'], confirmed: ['#6366f1', 'Подтверждён'], shipped: ['#3b82f6', 'Отправлен'], delivered: ['#22c55e', 'Доставлен'], cancelled: ['#ef4444', 'Отменён'] };
  const [color, label] = map[status] || ['gray', status];
  return <span style={{ background: color + '22', color, padding: '3px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>{label}</span>;
}