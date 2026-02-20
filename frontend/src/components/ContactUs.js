import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

.con-page {
  min-height: 100vh; background: #050816;
  font-family: 'DM Sans', sans-serif; color: #e8e8f0;
  position: relative; overflow-x: hidden;
  display: flex; align-items: center; justify-content: center;
  padding: 5rem 1.5rem;
}
.con-glow {
  position: fixed; border-radius: 50%; filter: blur(130px); pointer-events: none; z-index: 0;
}
.con-glow-a {
  width: 500px; height: 500px; top: -80px; right: -100px;
  background: radial-gradient(circle, rgba(0,229,200,.16) 0%, transparent 70%);
}
.con-glow-b {
  width: 450px; height: 450px; bottom: -80px; left: -100px;
  background: radial-gradient(circle, rgba(124,107,255,.16) 0%, transparent 70%);
}
.con-inner {
  position: relative; z-index: 1; width: 100%; max-width: 560px;
  animation: conFade .6s ease both;
}
.con-header { text-align: center; margin-bottom: 2.25rem; }
.con-badge {
  display: inline-flex; align-items: center; gap: .5rem;
  background: rgba(0,229,200,.1); border: 1px solid rgba(0,229,200,.25);
  color: #00e5c8; padding: .32rem .9rem; border-radius: 99px;
  font-size: .77rem; letter-spacing: .08em; text-transform: uppercase;
  font-weight: 500; margin-bottom: 1.25rem;
}
.con-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #00e5c8; animation: conPulse 2s infinite; }
@keyframes conPulse { 0%,100%{opacity:1} 50%{opacity:.3} }
.con-header h1 {
  font-family: 'Syne', sans-serif; font-size: clamp(1.9rem,4vw,2.8rem);
  font-weight: 800; color: #fff; letter-spacing: -.03em; margin-bottom: .6rem;
}
.con-header p { color: rgba(232,232,240,.5); font-size: .95rem; line-height: 1.65; }

.con-card {
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  border-radius: 24px; backdrop-filter: blur(20px); padding: 2.5rem;
}

/* form fields */
.con-group { margin-bottom: 1.25rem; }
.con-label {
  display: block; font-size: .82rem; font-weight: 600;
  color: rgba(232,232,240,.7); margin-bottom: .5rem; letter-spacing: .03em;
}
.con-input, .con-textarea {
  width: 100%; background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.1); border-radius: 12px;
  padding: .8rem 1.1rem; color: #e8e8f0; font-family: 'DM Sans', sans-serif;
  font-size: .95rem; outline: none; transition: border-color .2s, box-shadow .2s;
  -webkit-appearance: none;
}
.con-input::placeholder, .con-textarea::placeholder { color: rgba(232,232,240,.3); }
.con-input:focus, .con-textarea:focus {
  border-color: rgba(0,229,200,.5);
  box-shadow: 0 0 0 3px rgba(0,229,200,.1);
  background: rgba(255,255,255,.07);
}
.con-textarea { resize: vertical; min-height: 120px; line-height: 1.6; }

.con-btn {
  width: 100%; padding: .9rem; border: none; border-radius: 12px;
  background: linear-gradient(135deg,#7c6bff,#00e5c8);
  color: #fff; font-family: 'Syne', sans-serif; font-size: 1rem;
  font-weight: 700; letter-spacing: .02em; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: .5rem;
  transition: transform .2s, box-shadow .2s;
  box-shadow: 0 0 30px rgba(124,107,255,.3), 0 4px 15px rgba(0,0,0,.3);
  margin-top: 1.5rem;
}
.con-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 50px rgba(124,107,255,.45), 0 8px 25px rgba(0,0,0,.4);
}
.con-btn:disabled { opacity: .6; cursor: not-allowed; }

.con-spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%;
  animation: conSpin .7s linear infinite;
}
@keyframes conSpin { to { transform: rotate(360deg); } }

.con-alert {
  border-radius: 12px; padding: .9rem 1.1rem;
  font-size: .88rem; margin-bottom: 1.25rem; border: 1px solid;
  display: flex; align-items: flex-start; gap: .6rem;
}
.con-alert-success {
  background: rgba(0,229,200,.08); border-color: rgba(0,229,200,.3); color: #00e5c8;
}
.con-alert-danger {
  background: rgba(255,107,107,.08); border-color: rgba(255,107,107,.3); color: #ff6b6b;
}
.con-alert-icon { font-size: 1rem; flex-shrink: 0; margin-top: .05rem; }

.con-footer-note {
  margin-top: 1.75rem; padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,.07);
  text-align: center;
}
.con-footer-note p { color: rgba(232,232,240,.4); font-size: .82rem; margin: 0; }
.con-footer-note a { color: #a89fff; text-decoration: none; }
.con-footer-note a:hover { text-decoration: underline; }

@keyframes conFade { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
`;

function ContactUs() {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState({ type: null, message: null });

  useEffect(() => {
    if (document.getElementById('con-styles')) return;
    const el = document.createElement('style');
    el.id = 'con-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: null });
    try {
      const response = await axios.post(`${API_URL}/contact`, { name, email, message });
      setStatus({ type: 'success', message: response.data.message });
      setName(''); setEmail(''); setMessage('');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to submit. Please check your network and try again.';
      setStatus({ type: 'danger', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="con-page">
      <div className="con-glow con-glow-a" />
      <div className="con-glow con-glow-b" />
      <div className="con-inner">
        <div className="con-header">
          <div className="con-badge"><span className="con-badge-dot" /> Contact</div>
          <h1>Get in Touch</h1>
          <p>We value your feedback and inquiries. Reach out and we'll get back to you shortly.</p>
        </div>

        <div className="con-card">
          {status.message && (
            <div className={`con-alert con-alert-${status.type}`}>
              <span className="con-alert-icon">{status.type === 'success' ? '✓' : '!'}</span>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="con-group">
              <label className="con-label">Full Name</label>
              <input className="con-input" type="text" placeholder="Your Name"
                value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="con-group">
              <label className="con-label">Email Address</label>
              <input className="con-input" type="email" placeholder="example@gmail.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="con-group">
              <label className="con-label">Message</label>
              <textarea className="con-textarea" placeholder="Write your message here..."
                value={message} onChange={e => setMessage(e.target.value)} required />
            </div>

            <button type="submit" className="con-btn" disabled={loading}>
              {loading ? <><div className="con-spinner" /> Sending...</> : 'Send Message'}
            </button>
          </form>

          <div className="con-footer-note">
            <p>Or email us directly at <a href="mailto:vaibhavwork478@gmail.com">vaibhavwork478@gmail.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;