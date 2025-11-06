import React, { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      nav('/');
    } catch (err) {
      alert(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Sign up</h2>
      <label>Name</label>
      <input value={form.name} onChange={(e)=>setForm(s=>({...s,name:e.target.value}))} required />
      <label>Email</label>
      <input value={form.email} onChange={(e)=>setForm(s=>({...s,email:e.target.value}))} required />
      <label>Password</label>
      <input type="password" value={form.password} onChange={(e)=>setForm(s=>({...s,password:e.target.value}))} required />
      <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
    </form>
  );
}
