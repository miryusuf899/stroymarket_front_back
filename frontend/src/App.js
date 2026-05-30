import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import Navbar from './components/ui/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AIChat from './pages/AIChat';

export default function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e2235', color: '#e8eaf6', border: '1px solid #2e3150' }
      }} />
      <Navbar theme={theme} setTheme={setTheme} />
      <Routes>
        <Route path="/" element={<Home theme={theme} />} />
        <Route path="/cart" element={<Cart theme={theme} />} />
        <Route path="/profile" element={<Profile theme={theme} />} />
        <Route path="/login" element={<Login theme={theme} />} />
        <Route path="/register" element={<Register theme={theme} />} />
        <Route path="/ai" element={<AIChat theme={theme} />} />
      </Routes>
    </BrowserRouter>
  );
}