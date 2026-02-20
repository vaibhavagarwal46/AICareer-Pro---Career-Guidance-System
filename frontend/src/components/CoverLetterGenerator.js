import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { injectTheme } from './theme';

const API_URL = 'http://localhost:5000';

function CoverLetterGenerator({ user }) {
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userName = user || '';

  useEffect(() => { injectTheme(); }, []);

  const handleGenerate = async () => {
    if (jobDescription.length < 50) {
      setError('Please paste a comprehensive job description (at least 50 characters).');
      return;
    }
    setLoading(true);
    setError(null);
    setCoverLetter('Generating your cover letter…');
    try {
      const response = await axios.post(`${API_URL}/api/generate_cover_letter`, {
        jobDescription,
        userName,
      });
      setCoverLetter(response.data.cover_letter);
    } catch (err) {
      const msg = err.response?.data?.error || 'Error: Failed to connect to the backend LLM. Check Flask console for details.';
      setError(msg);
      setCoverLetter('Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const canCopy = !loading && !error && coverLetter.length > 50;

  return (
    <div className="t-page">
      <div className="t-glow t-glow-a" />
      <div className="t-glow t-glow-b" />
      <div className="t-inner">
        <div className="t-header">
          <div>
            <h1 className="t-title">Cover Letter <span>Generator</span></h1>
            <p className="t-subtitle">Paste a job description and our local LLM will write a tailored cover letter for you.</p>
          </div>
          <Link to="/dashboard" className="t-back">← Back to Dashboard</Link>
        </div>

        <div className="t-card">
          <div className="t-card-title">Your Name</div>

          <div className="t-group">
            <label className="t-label">Logged-in User</label>
            <input className="t-input" type="text" value={userName} readOnly disabled />
          </div>

          <div className="t-group">
            <label className="t-label">Job Description</label>
            <textarea
              className="t-textarea"
              rows={9}
              style={{ minHeight: '220px' }}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here (minimum 50 characters)...."
            />
          </div>

          <button
            className="t-btn t-btn-primary t-btn-lg t-mt"
            onClick={handleGenerate}
            disabled={loading || !userName || jobDescription.length < 50}
          >
            {loading
              ? <><span className="t-spinner" /> Generating (uses local CPU — please wait)…</>
              : 'Generate Cover Letter'}
          </button>
        </div>
        <div className="t-card">
          <div className="t-card-title">Generated Cover Letter</div>

          {error && (
            <div className="t-alert t-alert-danger">⚠ {error}</div>
          )}

          <div className="t-letter-output">
            {coverLetter || 'Your generated cover letter will appear here…'}
          </div>

          <button
            className="t-btn t-btn-outline t-mt"
            onClick={() => navigator.clipboard.writeText(coverLetter)}
            disabled={!canCopy}
            style={{ width: 'auto' }}
          >
             Copy to Clipboard
          </button>
        </div>

      </div>
    </div>
  );
}

export default CoverLetterGenerator;