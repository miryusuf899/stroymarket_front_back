import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { t } from '../theme';

export default function Home({ theme }) {
  const c = t(theme);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    Promise.all([api.get('/products/'), api.get('/categories/')]).then(([p, cat]) => {
      setProducts(p.data.results || p.data);
      setCategories(cat.data.results || cat.data);
      setLoading(false);
    });
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCat || p.category === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <div style={{
        background: `linear-gradient(135deg, ${c.bg2} 0%, ${c.bg3} 100%)`,
        borderRadius: '24px', padding: '3rem', marginBottom: '2rem',
        border: `1px solid ${c.border}`, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', background: c.primary, borderRadius: '50%', opacity: 0.08 }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '30%', width: '150px', height: '150px', background: c.accent, borderRadius: '50%', opacity: 0.06 }} />
        <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '0.5rem', color: c.text }}>
          🏗️ СтройМаркет
        </h1>
        <p style={{ color: c.muted, fontSize: '1.1rem', maxWidth: '500px' }}>
          Профессиональные строительные материалы и инструменты с доставкой по Душанбе
        </p>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
          {[['📦', products.length, 'товаров'], ['⭐', '4.9', 'рейтинг'], ['🚚', '1 день', 'доставка']].map(([icon, val, label]) => (
            <div key={label}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: c.primary }}>{icon} {val}</div>
              <div style={{ color: c.muted, fontSize: '0.85rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          flex: 1, minWidth: '250px', display: 'flex', alignItems: 'center',
          background: c.card, border: `1px solid ${c.border}`,
          borderRadius: '14px', padding: '0 1.2rem', gap: '0.8rem',
        }}>
          <Search size={18} color={c.muted} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск товаров..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '0.9rem 0', color: c.text, fontSize: '0.95rem' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setSelectedCat(null)} style={{
            padding: '0.7rem 1.4rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem',
            background: !selectedCat ? c.primary : c.card,
            color: !selectedCat ? 'white' : c.text,
            border: `1px solid ${!selectedCat ? c.primary : c.border}`,
          }}>Все</button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCat(cat.id)} style={{
              padding: '0.7rem 1.4rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem',
              background: selectedCat === cat.id ? c.primary : c.card,
              color: selectedCat === cat.id ? 'white' : c.text,
              border: `1px solid ${selectedCat === cat.id ? c.primary : c.border}`,
            }}>{cat.name}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ height: '200px', background: c.bg3, animation: 'pulse 1.5s infinite' }} />
              <div style={{ padding: '1.5rem' }}>
                {[120, 80, 60].map((w, j) => <div key={j} style={{ height: '14px', background: c.bg3, borderRadius: '6px', marginBottom: '0.8rem', width: `${w}px`, animation: 'pulse 1.5s infinite' }} />)}
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: c.muted }}>
          <Package size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>Товары не найдены</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((product, i) => (
            <motion.div key={product.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <div style={{ height: '200px', background: c.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '4rem', opacity: 0.3 }}>🧱</div>
                )}
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: product.stock > 0 ? '#22c55e22' : '#ef444422',
                  color: product.stock > 0 ? '#22c55e' : '#ef4444',
                  border: `1px solid ${product.stock > 0 ? '#22c55e44' : '#ef444444'}`,
                  borderRadius: '8px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700,
                }}>
                  {product.stock > 0 ? `✓ ${product.stock} шт` : '✗ Нет'}
                </div>
              </div>

              <div style={{ padding: '1.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ color: c.accent, fontSize: '0.8rem', fontWeight: 600, background: c.accent + '22', padding: '2px 8px', borderRadius: '6px' }}>
                    {product.category_name}
                  </span>
                  <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>★ 4.8</span>
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.05rem', color: c.text }}>{product.name}</h3>
                <p style={{ color: c.muted, fontSize: '0.85rem', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                  {product.description?.slice(0, 75)}{product.description?.length > 75 ? '...' : ''}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: c.primary }}>
                      {Number(product.price).toLocaleString()}
                    </span>
                    <span style={{ color: c.muted, fontSize: '0.85rem' }}> сом</span>
                  </div>
                  <button
                    onClick={() => { addItem(product); toast.success(`${product.name} добавлен!`); }}
                    disabled={product.stock === 0}
                    style={{
                      background: product.stock > 0 ? c.primary : c.bg3,
                      color: product.stock > 0 ? 'white' : c.muted,
                      border: 'none', borderRadius: '12px', padding: '0.7rem 1.2rem',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      fontWeight: 700, fontSize: '0.9rem',
                      boxShadow: product.stock > 0 ? `0 4px 12px ${c.primary}44` : 'none',
                    }}>
                    <ShoppingCart size={16} /> В корзину
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}