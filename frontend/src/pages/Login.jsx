import { AuthLayout, AuthInput, AuthBtn } from '../components/ui/AuthLayout';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login/', form);
      localStorage.setItem('access', data.access);
      const me = await api.get('/auth/profile/');
      setAuth(me.data, data.access);
      toast.success('Добро пожаловать!');
      navigate('/');
    } catch {
      toast.error('Неверный логин или пароль');
    }
    setLoading(false);
  };

  return <AuthLayout title="Вход в аккаунт">
    <AuthInput placeholder="Логин" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
    <AuthInput placeholder="Пароль" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
    <AuthBtn loading={loading} onClick={handleSubmit}>Войти</AuthBtn>
    <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '1rem' }}>
      Нет аккаунта? <Link to="/register" style={{ color: 'var(--primary)' }}>Зарегистрироваться</Link>
    </p>
  </AuthLayout>;
}