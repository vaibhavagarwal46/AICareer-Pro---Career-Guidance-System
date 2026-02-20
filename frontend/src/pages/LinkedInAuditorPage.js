import React, { useState, useEffect } from 'react';
import { FaPaste, FaFileUpload, FaArrowLeft, FaInfoCircle, FaMagic, FaUserTie, FaCheckCircle, FaCopy, FaLightbulb } from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { injectTheme } from './theme';

const LinkedInAuditorPage = () => {
  const [inputText, setInputText]   = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [activeTab, setActiveTab]   = useState('paste');
  const [howOpen, setHowOpen]       = useState(false);
  const [copied, setCopied]         = useState('');

  useEffect(() => { injectTheme(); }, []);

  const handleAudit = async () => {
    if (!inputText || !targetRole) {
      alert('Please provide both a target role and profile content.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post('http://localhost:5000/audit-linkedin', {
        content: inputText,
        career: targetRole,
        type: activeTab,
      });
      setResult(res.data);
    } catch (err) {
      alert('Error auditing profile. Ensure your Flask server and Ollama are running.');
      console.error(err);
    }
    setLoading(false);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputText(`[System: File "${file.name}" attached. Please analyze this profile for a ${targetRole} role.]`);
    }
  };

  return (
    <div className="t-page">
      <div className="t-glow t-glow-a" />
      <div className="t-glow t-glow-b" />
      <div className="t-inner" style={{ maxWidth: '820px' }}>

        <div className="t-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <div>
            <h1 className="t-title">
            
            LinkedIn Profile <span>Auditor</span>
            </h1>
            <p className="t-subtitle">Get AI-powered feedback and optimized copy for your LinkedIn profile.</p>
          </div>
          <Link to="/dashboard" className="t-back"><FaArrowLeft size={12} /> Back to Dashboard</Link>
        </div>

        <div className="t-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setHowOpen(v => !v)}
            style={{
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              padding: '1.1rem 1.75rem', display: 'flex', alignItems: 'center', gap: '.6rem',
              color: 'rgba(232,232,240,.7)', fontFamily: "'DM Sans'", fontSize: '.92rem',
              transition: 'color .2s',
            }}
          >
            <FaInfoCircle style={{ color: '#00e5c8', flexShrink: 0 }} />
            <strong style={{ color: '#e8e8f0'}}>How to export your LinkedIn profile?</strong>
            <span style={{ marginLeft: 'auto', transition: 'transform .2s', transform: howOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>
          {howOpen && (
            <div style={{ padding: '0 1.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,.06)' }}>
              <ol style={{ color: 'rgba(232,232,240,.55)', lineHeight: 1.85, paddingLeft: '1.25rem', margin: 0 }}>
                <li>Open your LinkedIn Profile page.</li>
                <li>Click the More button (next to 'Add Profile Section').</li>
                <li>Select Save to PDF and upload it here, or copy-paste your About section.</li>
              </ol>
            </div>
          )}
        </div> 

        <div className="t-card">
          <div className="t-group">
            <label className="t-label">1. Target Career Goal</label>
            <input
              className="t-input"
              type="text"
              placeholder="e.g. Senior Full Stack Developer"
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '.75rem' }}>
            <label className="t-label">2. Profile Content</label>
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.45rem' }}>
              {[
                { key: 'paste',  label: 'Paste Text',   icon: <FaPaste /> },
                { key: 'upload', label: 'Upload PDF',   icon: <FaFileUpload /> },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className="t-btn t-btn-sm"
                  style={{
                    width: 'auto',
                    background: activeTab === t.key ? 'rgba(124,107,255,.18)' : 'rgba(255,255,255,.05)',
                    border: `1px solid ${activeTab === t.key ? 'rgba(124,107,255,.45)' : 'rgba(255,255,255,.1)'}`,
                    color: activeTab === t.key ? '#a89fff' : 'var(--muted)',
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'paste' ? (
            <textarea
              className="t-textarea"
              rows={7}
              placeholder="Paste your current LinkedIn summary or experience here…"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />
          ) : (
            <div style={{
              border: '1px dashed rgba(255,255,255,.15)', borderRadius: '14px',
              padding: '2.5rem 1.5rem', textAlign: 'center', background: 'rgba(255,255,255,.02)',
            }}>
              <FaFileUpload size={36} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
              <div>
                <input
                  className="t-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  style={{ maxWidth: '280px', margin: '0 auto' }}
                />
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '.82rem', marginTop: '.75rem' }}>
                Upload the 'Save to PDF' file from your LinkedIn profile.
              </p>
              {inputText && (
                <div className="t-alert t-alert-success" style={{ marginTop: '1rem', textAlign: 'left' }}>
                  ✓ {inputText}
                </div>
              )}
            </div>
          )}

          <button
            className="t-btn t-btn-primary t-btn-lg t-mt2"
            onClick={handleAudit}
            disabled={loading || !inputText || !targetRole}
          >
            {loading
              ? <><span className="t-spinner" /> Analyzing Profile…</>
              : <>Generate AI Audit</>}
          </button>
        </div>

        {result && (
          <div style={{ animation: 'tFade .5s ease both' }}>
            <div className="t-section-label" style={{ marginBottom: '.5rem' }}>Audit Complete</div>
            <h2 className="t-title" style={{ marginBottom: '1.5rem' }}>Your <span>Audit Results</span></h2>

            <div className="t-card">
              <div className="t-flex-between" style={{ marginBottom: '1rem' }}>
                <div className="t-card-title" style={{ marginBottom: 0 }}>
                  <FaMagic style={{ color: '#7c6bff' }} /> Suggested Headline
                </div>
                <button
                  className="t-btn t-btn-outline t-btn-sm"
                  style={{ width: 'auto' }}
                  onClick={() => copyToClipboard(result.headline, 'headline')}
                >
                  <FaCopy size={12} /> {copied === 'headline' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div style={{
                background: 'rgba(124,107,255,.1)', border: '1px solid rgba(124,107,255,.3)',
                borderRadius: '12px', padding: '1.1rem 1.4rem',
                color: '#e8e8f0', fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.5,
              }}>
                {result.headline}
              </div>
            </div>

            <div className="t-card">
              <div className="t-flex-between" style={{ marginBottom: '1rem' }}>
                <div className="t-card-title" style={{ marginBottom: 0 }}>
                  <FaUserTie style={{ color: '#00e5c8' }} /> Optimized 'About' Summary
                </div>
                <button
                  className="t-btn t-btn-outline t-btn-sm"
                  style={{ width: 'auto' }}
                  onClick={() => copyToClipboard(result.summary, 'summary')}
                >
                  <FaCopy size={12} /> {copied === 'summary' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div style={{
                background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)',
                borderRadius: '12px', padding: '1.25rem 1.4rem',
                color: 'rgba(232,232,240,.75)', lineHeight: 1.8, whiteSpace: 'pre-line',
              }}>
                {result.summary}
              </div>
            </div>

            <div className="t-card">
              <div className="t-card-title">
                <FaLightbulb style={{ color: '#ff9a3c' }} /> Expert Recommendations
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                {result.suggestions.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '.8rem',
                    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)',
                    borderRadius: '12px', padding: '1rem 1.1rem',
                    animation: `tFade .4s ${i * .06}s ease both`,
                  }}>
                    <FaCheckCircle style={{ color: '#00e5c8', marginTop: '.15rem', flexShrink: 0 }} />
                    <span style={{ color: 'rgba(232,232,240,.7)', lineHeight: 1.65 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default LinkedInAuditorPage;