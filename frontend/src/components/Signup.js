import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

.auth-page {
  min-height: 100vh; background: #050816;
  font-family: 'DM Sans', sans-serif; color: #e8e8f0;
  display: flex; align-items: center; justify-content: center;
  padding: 4rem 1.5rem; position: relative; overflow: hidden;
}
.auth-glow {
  position: fixed; border-radius: 50%; filter: blur(130px); pointer-events: none; z-index: 0;
}
.auth-glow-a {
  width: 550px; height: 550px; top: -120px; left: -120px;
  background: radial-gradient(circle, rgba(124,107,255,.2) 0%, transparent 70%);
  animation: authFloat 9s ease-in-out infinite;
}
.auth-glow-b {
  width: 450px; height: 450px; bottom: -100px; right: -80px;
  background: radial-gradient(circle, rgba(0,229,200,.15) 0%, transparent 70%);
  animation: authFloat 12s ease-in-out infinite reverse;
}
@keyframes authFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }

.auth-card {
  position: relative; z-index: 1;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09);
  border-radius: 28px; backdrop-filter: blur(24px);
  padding: 2.75rem 2.5rem; width: 100%; max-width: 420px;
  box-shadow: 0 30px 80px rgba(0,0,0,.4);
  animation: authFade .6s ease both;
}
.auth-logo { text-align: center; margin-bottom: 2rem; }
.auth-logo-mark {
  width: 58px; height: 58px; border-radius: 18px; margin: 0 auto 1rem;
  background: linear-gradient(135deg,#7c6bff,#00e5c8);
  display: flex; align-items: center; justify-content: center; font-size: 1.5rem;
  box-shadow: 0 0 0 3px rgba(124,107,255,.2), 0 0 40px rgba(124,107,255,.25);
}
.auth-logo h2 {
  font-family: 'Syne', sans-serif; font-size: 1.55rem; font-weight: 800;
  color: #fff; letter-spacing: -.02em; margin: 0;
}
.auth-logo p { color: rgba(232,232,240,.45); font-size: .88rem; margin: .35rem 0 0; }
.auth-alert {
  background: rgba(255,107,107,.08); border: 1px solid rgba(255,107,107,.3);
  color: #ff8a8a; border-radius: 12px; padding: .8rem 1rem;
  font-size: .87rem; margin-bottom: 1.25rem;
  display: flex; align-items: center; gap: .55rem;
}
.auth-group { margin-bottom: 1.1rem; }
.auth-label {
  display: block; font-size: .81rem; font-weight: 600;
  color: rgba(232,232,240,.65); margin-bottom: .45rem; letter-spacing: .03em;
}
.auth-input {
  width: 100%; background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.1); border-radius: 12px;
  padding: .78rem 1.1rem; color: #e8e8f0;
  font-family: 'DM Sans', sans-serif; font-size: .95rem;
  outline: none; transition: border-color .2s, box-shadow .2s, background .2s;
  -webkit-appearance: none;
}
.auth-input::placeholder { color: rgba(232,232,240,.28); }
.auth-input:focus {
  border-color: rgba(124,107,255,.55);
  box-shadow: 0 0 0 3px rgba(124,107,255,.12);
  background: rgba(255,255,255,.08);
}
.auth-btn {
  width: 100%; padding: .88rem; border: none; border-radius: 12px;
  background: linear-gradient(135deg,#7c6bff,#00e5c8);
  color: #fff; font-family: 'Syne', sans-serif; font-size: 1rem;
  font-weight: 700; letter-spacing: .02em; cursor: pointer; margin-top: 1.5rem;
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  transition: transform .2s, box-shadow .2s;
  box-shadow: 0 0 30px rgba(124,107,255,.3), 0 4px 15px rgba(0,0,0,.3);
}
.auth-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 50px rgba(124,107,255,.45), 0 8px 25px rgba(0,0,0,.4);
}
.auth-btn:disabled { opacity: .6; cursor: not-allowed; }
.auth-spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%; animation: authSpin .7s linear infinite;
}
@keyframes authSpin { to { transform: rotate(360deg); } }
.auth-divider {
  display: flex; align-items: center; gap: .8rem;
  margin: 1.5rem 0; color: rgba(232,232,240,.2); font-size: .82rem;
}
.auth-divider::before, .auth-divider::after {
  content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.07);
}
.auth-footer { text-align: center; margin-top: 1.4rem; }
.auth-footer p { color: rgba(232,232,240,.45); font-size: .87rem; margin: 0; }
.auth-footer a { color: #a89fff; text-decoration: none; font-weight: 500; }
.auth-footer a:hover { text-decoration: underline; }
@keyframes authFade { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
`;

function Signup({ onSignup }) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (document.getElementById('auth-styles')) return;
    const el = document.createElement('style');
    el.id = 'auth-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const response = await axios.post(`${API_URL}/signup`, { name, email, password });
      onSignup(response.data.name);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please check your backend server status.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-a" />
      <div className="auth-glow auth-glow-b" />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">✨</div>
          <h2>Create Account</h2>
        </div>

        {error && (
          <div className="auth-alert">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="auth-group">
            <label className="auth-label">Full Name</label>
            <input className="auth-input" type="text" placeholder="Your Full Name"
              value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="auth-group">
            <label className="auth-label">Email Address</label>
            <input className="auth-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="auth-group">
            <label className="auth-label">Password</label>
            <input className="auth-input" type="password" placeholder="Minimum 6 characters"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading
              ? <><div className="auth-spinner" /> Creating Account...</>
              : 'Create Account →'}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;