import React, { useState } from 'react';
import Login from './Login.jsx';
import Signup from './Signup.jsx';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  return (
    <div className="auth-page">
      <div className="card">
        {mode === 'login' ? <Login /> : <Signup />}
        <div style={{ marginTop: 12 }}>
          {mode === 'login' ? (
            <p>Don't have an account? <button className="link" onClick={() => setMode('signup')}>Sign up</button></p>
          ) : (
            <p>Already have an account? <button className="link" onClick={() => setMode('login')}>Log in</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
