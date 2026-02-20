import React, { useState, useEffect } from 'react';
import { FaBriefcase, FaExternalLinkAlt, FaChartLine, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';
import axios from 'axios';
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

const JobMarketInsights = ({ predictedRole }) => {
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [location, setLocation] = useState('in');

  useEffect(() => { injectTheme(); }, []);

  useEffect(() => {
    if (!predictedRole) { setLoading(false); return; }
    const fetchJobs = async () => {
      setLoading(true); setError(null);
      try {
        const res = await axios.post('http://localhost:5000/job-insights', { role: predictedRole, location });
        setJobs(res.data.listings || []);
        if (res.data.listings.length === 0)
          setError(`No job listings found for "${predictedRole}" in the selected location.`);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch job listings. Please ensure your Adzuna API credentials are configured.');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [predictedRole, location]);

  if (!predictedRole) return null;

  if (loading) {
    return (
      <div className="t-loading-center" style={{ marginTop: '2rem' }}>
        <div className="t-spinner t-spinner-accent t-spinner-lg" />
        <span>Fetching live job market data…</span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2.5rem', animation: 'tFade .5s ease both' }}>
      
      <div className="t-flex-between t-mb2">
        <div>
          <h2 className="t-title" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)' }}>
            Job Market for <span>{predictedRole}</span>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginTop: '.3rem' }}>
            Real-time listings from Adzuna. Click any job to apply!
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <label className="t-label" style={{ marginBottom: '.4rem' }}>Filter by Location</label>
          <select
            className="t-select"
            style={{ maxWidth: '200px', background: 'rgba(255,255,255,.06)' }}
            value={location}
            onChange={e => setLocation(e.target.value)}
          >
            {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="t-alert t-alert-warning" style={{ position: 'relative' }}>
          <FaBriefcase style={{ flexShrink: 0 }} /> {error}
          <button onClick={() => setError(null)} style={{
            position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.1rem',
          }}>×</button>
        </div>
      )}
      {jobs.length > 0 ? jobs.map((job, index) => (
        <div key={index} className="t-job-card" style={{ animationDelay: `${index * .05}s` }}>
          <div style={{ flex: 1 }}>
            <div className="t-job-title">{job.title}</div>
            <div className="t-job-meta"><FaBriefcase size={11} /> {job.company}</div>
            <div className="t-job-meta"><FaMapMarkerAlt size={11} /> {job.location}</div>
            {job.salary_min && (
              <span className="t-badge t-badge-success" style={{ marginTop: '.35rem' }}>
                <FaDollarSign size={10} />
                Est. ${job.salary_min.toLocaleString()}{job.salary_max ? ` – $${job.salary_max.toLocaleString()}` : ''}
              </span>
            )}
            {job.description && (
              <p style={{ color: 'var(--muted)', fontSize: '.82rem', marginTop: '.5rem',
                lineHeight: 1.5, maxHeight: '52px', overflow: 'hidden' }}>
                {job.description}…
              </p>
            )}
          </div>
          <a
            href={job.url} target="_blank" rel="noopener noreferrer"
            className="t-btn t-btn-accent2 t-btn-sm"
            style={{ textDecoration: 'none', flexShrink: 0, alignSelf: 'flex-start' }}
          >
            View Job <FaExternalLinkAlt size={11} />
          </a>
        </div>
      )) : (
        <div className="t-card t-text-center" style={{ padding: '3rem' }}>
          <FaBriefcase size={36} style={{ color: 'var(--muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--muted)' }}>No job listings available for this role at the moment.</p>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="t-alert t-alert-info t-mt">
          <strong> Found {jobs.length} active listing for {predictedRole}</strong>
        </div>
      )}
    </div>
  );
};

export default JobMarketInsights;