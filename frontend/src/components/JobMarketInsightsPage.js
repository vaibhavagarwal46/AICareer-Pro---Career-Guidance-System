import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaArrowLeft, FaSearch } from 'react-icons/fa';
import JobMarketInsights from './JobMarketInsights';
import { injectTheme } from './theme';

const LOCATIONS = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'in', label: 'India' },
  { value: 'au', label: 'Australia' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
];

const POPULAR_ROLES = [
  'Software Engineer', 'Data Scientist', 'Product Manager', 'UX Designer',
  'DevOps Engineer', 'Full Stack Developer', 'Python Developer',
  'Machine Learning Engineer', 'Business Analyst', 'Project Manager',
  'Cloud Architect', 'Mobile Developer',
];

function JobMarketInsightsPage({ user }) {
  const [role, setRole]         = useState('');
  const [location, setLocation] = useState('in');
  const [searched, setSearched] = useState(false);

  useEffect(() => { injectTheme(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!role.trim()) { alert('Please enter a job role'); return; }
    setSearched(true);
  };

  const handleClear = () => {
    setRole(''); setLocation('us'); setSearched(false);
  };

  return (
    <div className="t-page">
      <div className="t-glow t-glow-a" />
      <div className="t-glow t-glow-b" />
      <div className="t-inner">

        <div className="t-header">
          <div>
            <h1 className="t-title">
              Job Market <span>Insights</span>
            </h1>
            <p className="t-subtitle">Explore real-time job opportunities, salary ranges, and market trends.</p>
          </div>
          <Link to="/dashboard" className="t-back"><FaArrowLeft size={12} /> Back to Dashboard</Link>
        </div>

        <div className="t-card">
          <div className="t-card-title">Search Job Market</div>
          <form onSubmit={handleSearch}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="t-group">
                    <label className="t-label">Job Role or Title</label>
                    <input
                      className="t-input"
                      type="text"
                      placeholder="e.g., Data Scientist, Software Engineer…"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                    />
                  </div>
                  <div className="t-group">
                    <label className="t-label">Location</label>
                    <select className="t-select" value={location} onChange={e => setLocation(e.target.value)}>
                      {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.75rem', marginTop: '1rem' }}>
              <button type="submit" className="t-btn t-btn-primary t-btn-lg" style={{ flex: 1 }}>
                <FaSearch size={13} /> Search Jobs
              </button>
              <button type="button" className="t-btn t-btn-outline t-btn-lg" onClick={handleClear} style={{ width: 'auto' }}>
                Clear
              </button>
            </div>
          </form>
        </div>
        {!searched && (
          <div className="t-card">
            <div className="t-card-title">Popular Job Roles</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem' }}>
              {POPULAR_ROLES.map(r => (
                <button
                  key={r}
                  className="t-pill"
                  onClick={() => { setRole(r); setSearched(true); }}
                  style={{ border: 'none' }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {searched && <JobMarketInsights predictedRole={role} />}
      </div>
    </div>
  );
}
export default JobMarketInsightsPage;