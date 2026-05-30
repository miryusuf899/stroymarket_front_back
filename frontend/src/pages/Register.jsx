import { AuthLayout, AuthInput, AuthBtn } from '../components/ui/AuthLayout';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/auth/register/', form);
      toast.success('Аккаунт создан! Войдите в систему');
      navigate('/login');
    } catch (e) {
      toast.error('Ошибка регистрации');
    }
    setLoading(false);
  };

  return <AuthLayout title="Регистрация">
    <AuthInput placeholder="Логин" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
    <AuthInput placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
    <AuthInput placeholder="Пароль" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
    <AuthBtn loading={loading} onClick={handleSubmit}>Зарегистрироваться</AuthBtn>
    <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '1rem' }}>
      Уже есть аккаунт? <Link to="/login" style={{ color: 'var(--primary)' }}>Войти</Link>
    </p>
  </AuthLayout>;
}