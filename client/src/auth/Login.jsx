import React, { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      nav('/');
    } catch (err) {
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Login</h2>
      <label>Email</label>
      <input value={form.email} onChange={(e)=>setForm(s=>({...s,email:e.target.value}))} required />
      <label>Password</label>
      <input type="password" value={form.password} onChange={(e)=>setForm(s=>({...s,password:e.target.value}))} required />
      <button className="btn" type="submit" disabled={loading}>{loading ? 'Logging...' : 'Login'}</button>
    </form>
  );
}
