import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import RoadmapSection from './RoadmapSection';
import LearningRoadmap from './LearningRoadmap';
import JobMarketInsights from './JobMarketInsights';
import SkillGapChart from './SkillGapChart';
import { injectTheme } from './theme';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const skillsList = [
  'Database Fundamentals', 'Computer Architecture', 'Distributed Computing Systems',
  'Cyber Security', 'Networking', 'Software Development', 'Programming Skills',
  'Project Management', 'Computer Forensics Fundamentals', 'Technical Communication',
  'AI ML', 'Software Engineering', 'Business Analysis', 'Communication skills',
  'Data Science', 'Troubleshooting skills', 'Graphics Designing',
];

const ratings = ['Not Interested', 'Poor', 'Beginner', 'Average', 'Intermediate', 'Excellent', 'Professional'];

const ratingMap = {
  'Not Interested': 0, 'Poor': 1, 'Beginner': 2, 'Average': 3,
  'Intermediate': 4, 'Excellent': 5, 'Professional': 6,
};

function PredictionForm({ user }) {
  const [formData, setFormData]     = useState(skillsList.reduce((acc, s) => ({ ...acc, [s]: 'Not Interested' }), {}));
  const [prediction, setPrediction] = useState(null);
  const [description, setDescription] = useState(null);
  const [gapData, setGapData]       = useState(null);
  const [roadmap, setRoadmap]       = useState([]);
  const [loading, setLoading]       = useState(false);

  useEffect(() => { injectTheme(); }, []);

  const API_URL = 'http://localhost:5000';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setPrediction(null); setDescription(null); setGapData(null); setRoadmap([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null); setDescription(null); setGapData(null); setRoadmap([]);
    try {
      const res = await axios.post(`${API_URL}/predict`, { skills: formData });
      setPrediction(res.data.career);
      setDescription(res.data.description);
      setRoadmap(res.data.roadmap);
      setGapData({ user: res.data.user_scores, ideal: res.data.ideal_scores, labels: res.data.labels });
    } catch {
      alert('Backend Error: Ensure Flask is running and models are loaded.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    const currentSelections = skillsList.map(s => ratingMap[formData[s]]);
    const datasets = [{
      label: 'Your Current Profile',
      data: gapData ? gapData.user : currentSelections,
      backgroundColor: 'rgba(124,107,255,0.18)',
      borderColor: '#7c6bff',
      borderWidth: 2,
      pointBackgroundColor: '#7c6bff',
      pointBorderColor: '#050816',
    }];
    if (gapData) datasets.push({
      label: `Ideal ${prediction} Profile`,
      data: gapData.ideal,
      backgroundColor: 'rgba(0,229,200,0.12)',
      borderColor: '#00e5c8',
      borderWidth: 2,
      borderDash: [5, 5],
      pointBackgroundColor: '#00e5c8',
      pointBorderColor: '#050816',
    });
    return { labels: skillsList, datasets };
  }, [formData, gapData, prediction]);

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: false, color: 'rgba(255,255,255,.08)' },
        grid: { color: 'rgba(255,255,255,.08)' },
        pointLabels: { color: 'rgba(232,232,240,.6)', font: { size: 9, family: "'DM Sans'" } },
        ticks: { color: 'rgba(232,232,240,.4)', backdropColor: 'transparent', stepSize: 1, showLabelBackdrop: false, z: 10 },
        suggestedMin: 0, suggestedMax: 6,
      },
    },
    plugins: {
      legend: {
        display: true, position: 'top',
        labels: { color: 'rgba(232,232,240,.7)', font: { family: "'DM Sans'" }, boxWidth: 12, padding: 14 },
      },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="t-page">
      <div className="t-glow t-glow-a" />
      <div className="t-glow t-glow-b" />
      <div className="t-inner">

        <div className="t-header">
          <div>
            <h1 className="t-title">Career <span>Prediction</span></h1>
            <p className="t-subtitle">Rate your proficiency across 17 skills to discover your ideal career path.</p>
          </div>
          <Link to="/dashboard" className="t-back">← Back to Dashboard</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.25rem' }}>

          <div className="t-card" style={{ alignSelf: 'start' }}>
            <div className="t-card-title">Assess Your Skills</div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {skillsList.map(skill => (
                  <div className="t-group" key={skill}>
                    <label className="t-label">{skill}</label>
                    <select className="t-select" name={skill} value={formData[skill]} onChange={handleChange}>
                      {ratings.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button type="submit" className="t-btn t-btn-primary t-btn-lg t-mt2" disabled={loading}>
                {loading ? <><span className="t-spinner" /> Analyzing Data…</> : 'Predict Career Path'}
              </button>
            </form>
          </div>

          <div className="t-card" style={{ position: 'sticky', top: '5rem', alignSelf: 'start' }}>
            <div className="t-card-title">Skill Profile Visualization</div>
            <div style={{ width: '100%', height: '420px' }}>
              <Radar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
        {prediction && (
          <>
            <div className="t-card t-mt3" style={{ borderColor: 'rgba(0,229,200,.3)' }}>
              <div className="t-text-center">
                <div className="t-section-label">Final Prediction</div>
                <div className="t-result-big t-mt">{prediction}</div>
                <div className="t-divider" style={{ width: '60%', margin: '1.5rem auto' }} />

                <h3 style={{ fontFamily: "'Syne',sans-serif", color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>
                  Job Overview
                </h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.75, whiteSpace: 'pre-line', textAlign: 'left', maxWidth: '720px', margin: '0 auto' }}>
                  {description}
                </p>

                <div className="t-flex-center t-mt3">
                  <Link to="/resume" className="t-btn t-btn-accent2 t-btn-lg"
                    style={{ textDecoration: 'none' }}>
                    Start Resume Builder
                  </Link>
                  <Link to="/cover-letter" className="t-btn t-btn-lg"
                    style={{ background: 'linear-gradient(135deg,#ff9a3c,#e07b20)', color: '#fff', textDecoration: 'none' }}>
                    Generate Cover Letter
                  </Link>
                </div>
              </div>
            </div>

            <JobMarketInsights predictedRole={prediction} />
            <LearningRoadmap roadmap={roadmap} career={prediction} />
          </>
        )}
      </div>
    </div>
  );
}
export default PredictionForm;