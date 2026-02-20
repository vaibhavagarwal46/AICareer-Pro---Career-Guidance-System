import React, { useState, useEffect } from 'react';
import { injectTheme } from './theme';
import { FaArrowLeft} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const StreamPredictionForm = () => {
  const [formData, setFormData] = useState({
    math_marks: 0, science_marks: 0, social_marks: 0, english_marks: 0,
    hobby: 'None', activity: 'None',
    logic_score: 0, creative_score: 0, leadership_score: 0,
  });
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { injectTheme(); }, []);

  const hobbyOptions   = ['Technical', 'Artistic', 'Literary', 'Business', 'None'];
  const activityOptions = ['Robotics', 'Debating', 'Drama', 'Volunteering', 'Entrepreneurship', 'Finance Club', 'None'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const response = await fetch('http://localhost:5000/api/predict_stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError(`Failed to get prediction. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const MARKS_FIELDS = [
    { name: 'math_marks', label: 'Mathematics' },
    { name: 'science_marks', label: 'Science' },
    { name: 'social_marks', label: 'Social Studies' },
    { name: 'english_marks', label: 'English' },
  ];
  const APT_FIELDS = [
    { name: 'logic_score', label: 'Logic' },
    { name: 'creative_score', label: 'Creativity' },
    { name: 'leadership_score', label: 'Leadership' },
  ];

  const STREAM_COLORS = {
    Science: '#7c6bff', Commerce: '#00e5c8', Humanities: '#ff9a3c',
  };

  return (
    <div className="t-page">
      <div className="t-glow t-glow-a" />
      <div className="t-glow t-glow-b" />
      <div className="t-inner">

        <div className="t-header">
          <div>
            <h1 className="t-title">Stream <span>Prediction</span></h1>
            <p className="t-subtitle">Analyze your marks, interests, and aptitudes to find your ideal stream.</p>
          </div>
          <Link to="/dashboard" className="t-back"><FaArrowLeft size={12} /> Back to Dashboard</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: '1.25rem', alignItems: 'start' }}>
          <form onSubmit={handleSubmit}>
            <div className="t-card" style={{ animationDelay: '0s' }}>
              <div className="t-card-title">Subject Marks <span style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 400 }}>(out of 100)</span></div>
              <div className="t-grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {MARKS_FIELDS.map(f => (
                  <div className="t-group" key={f.name}>
                    <label className="t-label">{f.label}</label>
                    <input className="t-input" type="number" name={f.name}
                      value={formData[f.name]} onChange={handleChange} min="0" max="100" required />
                  </div>
                ))}
              </div>
            </div>

            <div className="t-card" style={{ animationDelay: '.08s' }}>
              <div className="t-card-title">Interests & Activities</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="t-group">
                  <label className="t-label">Primary Hobby Type</label>
                  <select className="t-select" name="hobby" value={formData.hobby} onChange={handleChange} required>
                    {hobbyOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="t-group">
                  <label className="t-label">Extracurricular Activity</label>
                  <select className="t-select" name="activity" value={formData.activity} onChange={handleChange} required>
                    {activityOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="t-card" style={{ animationDelay: '.16s' }}>
              <div className="t-card-title">Aptitude Scores <span style={{ fontSize: '.8rem', color: 'var(--muted)', fontWeight: 400 }}>(1 = Low → 5 = High)</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {APT_FIELDS.map(f => (
                  <div className="t-group" key={f.name}>
                    <label className="t-label">{f.label}</label>
                    <input className="t-input" type="number" name={f.name}
                      value={formData[f.name]} onChange={handleChange} min="1" max="5" required />
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="t-alert t-alert-danger">⚠ {error}</div>}

            <button type="submit" className="t-btn t-btn-primary t-btn-lg" disabled={loading}>
              {loading ? <><span className="t-spinner" /> Analyzing…</> : 'Predict My Stream'}
            </button>
          </form>

          <div>
            <div className="t-card" style={{ position: 'sticky', top: '5rem', minHeight: '340px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              textAlign: 'center', animationDelay: '.2s' }}>
              <div className="t-card-title" style={{ justifyContent: 'center' }}>Prediction Result</div>

              {prediction ? (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                      display: 'inline-block', padding: '.35rem 1rem', borderRadius: '99px',
                      fontSize: '.78rem', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase',
                      background: `rgba(124,107,255,.15)`, border: '1px solid rgba(124,107,255,.35)', color: '#a89fff',
                      marginBottom: '1rem',
                    }}>Recommended Stream</span>
                  </div>
                  <div className="t-result-big" style={{
                    fontSize: 'clamp(2rem,8vw,1.5rem)',
                    background: `linear-gradient(135deg,${STREAM_COLORS[prediction.stream] || '#a89fff'},#00e5c8)`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>
                    {prediction.stream}
                  </div>
                  <div className="t-divider" style={{ width: '60%', margin: '1.25rem auto' }} />
                  <p style={{ color: 'var(--muted)', fontSize: '.9rem', lineHeight: 1.65 }}>{prediction.reasoning}</p>
                  <div className="t-alert t-alert-info t-mt2" style={{ textAlign: 'left' }}>
                    This is a data-driven recommendation. Please consult your teachers and parents before making a final decision.
                  </div>
                </>
              ) : (
                <div className="t-loading-center" style={{ color: 'var(--muted)', minHeight: '200px' }}>
                  {loading
                    ? <><div className="t-spinner t-spinner-accent t-spinner-lg" /><span>Analyzing your profile…</span></>
                    : <><span style={{ fontSize: '2.5rem' }}>🎓</span><p>Fill in your details and click predict to see your recommended stream.</p></>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamPredictionForm;