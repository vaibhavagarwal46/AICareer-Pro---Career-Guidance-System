import React, { useState, useEffect } from 'react';
import {FaMagic, FaArrowRight, FaArrowLeft} from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { injectTheme } from './theme';

const STEPS = [
  { n: 1, label: 'General Info' },
  { n: 2, label: 'Education' },
  { n: 3, label: 'Skills' },
  { n: 4, label: 'Projects' },
  { n: 5, label: 'Done' },
];

const PortfolioGenerator = () => {
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [showPreview, setShowPreview]     = useState(false);
  const [userData, setUserData] = useState({
    name: '', role: '', bio: '',
    experienceYears: '', projectsCompleted: '', companiesWorked: '',
    contact: { email: '', phone: '', location: '' },
    resumeFile: null,
    education: [
      { level: 'Graduation', school: '', year: '', grade: '' },
      { level: '12th Standard', school: '', year: '', grade: '' },
      { level: '10th Standard', school: '', year: '', grade: '' },
    ],
    skills: [{ name: '', level: 80 }],
    projects: [{ title: '', desc: '', githubLink: '', image: null }],
    heroImage: null, aboutImage: null,
  });

  useEffect(() => { injectTheme(); }, []);

  const hd  = (f, v) => setUserData(p => ({ ...p, [f]: v }));
  const hdc = (f, v) => setUserData(p => ({ ...p, contact: { ...p.contact, [f]: v } }));
  const himg = (e, field, idx = null) => {
    const file = e.target.files[0]; if (!file) return;
    if (idx !== null) {
      const u = [...userData.projects]; u[idx].image = file;
      setUserData(p => ({ ...p, projects: u }));
    } else setUserData(p => ({ ...p, [field]: file }));
  };
  const hedu  = (i, f, v) => { const u = [...userData.education];  u[i][f] = v; setUserData(p => ({ ...p, education: u })); };
  const hskill = (i, f, v) => { const u = [...userData.skills];    u[i][f] = v; setUserData(p => ({ ...p, skills: u })); };
  const hproj  = (i, f, v) => { const u = [...userData.projects];  u[i][f] = v; setUserData(p => ({ ...p, projects: u })); };

  const handleGenerate = async () => {
    setLoading(true);
    const fd = new FormData();
    const activeEdu = userData.education
      .filter(e => e.school.trim() !== '')
      .map(e => ({ degree: `${e.level} (${e.grade})`, institution: e.school, year: e.year }));
    fd.append('userData', JSON.stringify({ ...userData, education: activeEdu, hasHeroImage: !!userData.heroImage, hasAboutImage: !!userData.aboutImage }));
    if (userData.heroImage)  fd.append('heroImage', userData.heroImage);
    if (userData.aboutImage) fd.append('aboutImage', userData.aboutImage);
    if (userData.resumeFile) fd.append('resume', userData.resumeFile);
    userData.projects.forEach((p, i) => { if (p.image) fd.append(`projectImage_${i}`, p.image); });
    try {
      const res = await axios.post('http://localhost:5000/generate-portfolio', fd);
      setGeneratedCode(res.data.html);
      setStep(5);
    } catch {
      alert('Generation failed. Check if backend is running on port 5000.');
    }
    setLoading(false);
  };

  const inp = (label, val, onChange, type = 'text', placeholder = '') => (
    <div className="t-group">
      <label className="t-label">{label}</label>
      <input className="t-input" type={type} value={val} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );

  return (
    <div className="t-page">
      <div className="t-glow t-glow-a" />
      <div className="t-glow t-glow-b" />
      <div className="t-inner" style={{ maxWidth: '860px' }}>

        <div className="t-header">
          <div>
            <h1 className="t-title">Portfolio <span>Builder</span></h1>
            <p className="t-subtitle">Fill in your details to generate a professional portfolio site.</p>
          </div>
          <Link to="/dashboard" className="t-back"><FaArrowLeft size={12} /> Back to Dashboard</Link>
        </div>

        <div className="t-steps">
          {STEPS.map(s => (
            <div key={s.n} className={`t-step ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`}>
              {step > s.n ? '✓' : s.n}. {s.label}
            </div>
          ))}
        </div>
        <div className="t-progress-wrap">
          <div className="t-progress-bar" style={{ width: `${((step - 1) / 4) * 100}%` }} />
        </div>

        <div className="t-card">

          {step === 1 && (
            <>
              <div className="t-card-title"> General Info & Stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {inp('Full Name', userData.name, v => hd('name', v), 'text', 'e.g. Vaibhav Agarwal')}
                {inp('Professional Role', userData.role, v => hd('role', v), 'text', 'e.g. Software Engineer')}
              </div>
              <div className="t-group">
                <label className="t-label">Short Bio</label>
                <textarea className="t-textarea" rows={3} value={userData.bio} onChange={e => hd('bio', e.target.value)} placeholder="Tell us about yourself…" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {inp('Experience (Years)', userData.experienceYears, v => hd('experienceYears', v), 'text', 'e.g. 1+')}
                {inp('Projects Completed', userData.projectsCompleted, v => hd('projectsCompleted', v), 'text', 'e.g. 10+')}
                {inp('Companies Worked', userData.companiesWorked, v => hd('companiesWorked', v), 'text', 'e.g. 2+')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {inp('Email', userData.contact.email, v => hdc('email', v), 'email')}
                {inp('Phone', userData.contact.phone, v => hdc('phone', v))}
                {inp('Location', userData.contact.location, v => hdc('location', v))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="t-group"><label className="t-label">Hero Image</label><input className="t-input" type="file" onChange={e => himg(e, 'heroImage')} /></div>
                <div className="t-group"><label className="t-label">About Image</label><input className="t-input" type="file" onChange={e => himg(e, 'aboutImage')} /></div>
                <div className="t-group"><label className="t-label">Resume (PDF)</label><input className="t-input" type="file" accept=".pdf" onChange={e => hd('resumeFile', e.target.files[0])} /></div>
              </div>
              <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                <button className="t-btn t-btn-primary" style={{ width: 'auto' }} onClick={() => setStep(2)}>
                  Next <FaArrowRight />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="t-card-title">Education History</div>
              {userData.education.map((edu, i) => (
                <div key={i} className="t-edu-row">
                  <span className="t-edu-level">{edu.level}</span>
                  <input className="t-input" placeholder="University / School" value={edu.school} onChange={e => hedu(i, 'school', e.target.value)} />
                  <input className="t-input" placeholder="Year (e.g. 2021–25)" value={edu.year} onChange={e => hedu(i, 'year', e.target.value)} />
                  <input className="t-input" placeholder="Grade / CGPA" value={edu.grade} onChange={e => hedu(i, 'grade', e.target.value)} />
                </div>
              ))}
              <div className="t-flex-between t-mt2">
                <button className="t-btn t-btn-outline" style={{ width: 'auto' }} onClick={() => setStep(1)}><FaArrowLeft /> Back</button>
                <button className="t-btn t-btn-primary" style={{ width: 'auto' }} onClick={() => setStep(3)}>Skills <FaArrowRight /></button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="t-card-title">Technical Skills</div>
              {userData.skills.map((s, i) => (
                <div key={i} className="t-skill-row">
                  <input className="t-input" placeholder="e.g. React.js" value={s.name} onChange={e => hskill(i, 'name', e.target.value)} />
                  <input className="t-range" type="range" min="0" max="100" value={s.level} onChange={e => hskill(i, 'level', +e.target.value)} />
                  <span className="t-skill-pct">{s.level}%</span>
                </div>
              ))}
              <button className="t-btn t-btn-outline t-btn-sm t-mt" style={{ width: 'auto' }}
                onClick={() => setUserData(p => ({ ...p, skills: [...p.skills, { name: '', level: 80 }] }))}>
                + Add Skill
              </button>
              <div className="t-flex-between t-mt2">
                <button className="t-btn t-btn-outline" style={{ width: 'auto' }} onClick={() => setStep(2)}><FaArrowLeft /> Back</button>
                <button className="t-btn t-btn-primary" style={{ width: 'auto' }} onClick={() => setStep(4)}>Projects <FaArrowRight /></button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="t-card-title">Featured Projects</div>
              {userData.projects.map((p, i) => (
                <div key={i} className="t-proj-block">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="t-group"><label className="t-label">Project Title</label><input className="t-input" value={p.title} onChange={e => hproj(i, 'title', e.target.value)} /></div>
                    <div className="t-group"><label className="t-label">Live Link / GitHub</label><input className="t-input" value={p.githubLink} onChange={e => hproj(i, 'githubLink', e.target.value)} /></div>
                  </div>
                  <div className="t-group"><label className="t-label">Description</label><textarea className="t-textarea" rows={2} value={p.desc} onChange={e => hproj(i, 'desc', e.target.value)} /></div>
                  <div className="t-group"><label className="t-label">Project Screenshot</label><input className="t-input" type="file" onChange={e => himg(e, null, i)} /></div>
                </div>
              ))}
              <button className="t-btn t-btn-outline t-btn-sm" style={{ width: 'auto' }}
                onClick={() => setUserData(p => ({ ...p, projects: [...p.projects, { title: '', desc: '', githubLink: '', image: null }] }))}>
                + Add Project
              </button>
              <div className="t-flex-between t-mt2">
                <button className="t-btn t-btn-outline" style={{ width: 'auto' }} onClick={() => setStep(3)}><FaArrowLeft /> Back</button>
                <button className="t-btn t-btn-primary" style={{ width: 'auto' }} onClick={handleGenerate} disabled={loading}>
                  {loading ? <><span className="t-spinner" /> Generating…</> : <><FaMagic /> Generate Portfolio</>}
                </button>
              </div>
            </>
          )}

          {step === 5 && (
            <div className="t-text-center" style={{ padding: '2rem 0' }}>
              <div className="t-result-big" style={{ marginBottom: '.5rem' }}>Your Portfolio is Ready</div>
              <p style={{ color: 'var(--muted)', marginBottom: '2.5rem' }}>
                You can now preview your site or download the source code.
              </p>
              <div className="t-flex-center" style={{ gap: '1rem' }}>
                <button className="t-btn t-btn-outline t-btn-lg" style={{ flex: 1, maxWidth: '220px' }} onClick={() => setShowPreview(true)}>
                  Live Preview
                </button>
                <button className="t-btn t-btn-primary t-btn-lg" style={{ flex: 1, maxWidth: '220px' }}
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(new Blob([generatedCode], { type: 'text/html' }));
                    a.download = `${userData.name.replace(/\s+/g, '_')}_Portfolio.html`;
                    a.click();
                  }}>
                    Download HTML
                </button>
              </div>
              <button className="t-btn t-btn-outline t-btn-sm" style={{ marginTop: '1.5rem', width: 'auto' }} onClick={() => setStep(1)}>
                ← Start Again
              </button>
            </div>
          )}

        </div>
      </div>
      {showPreview && (
        <div className="t-modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="t-modal" onClick={e => e.stopPropagation()}>
            <div className="t-modal-header">
              <h3>Portfolio Preview</h3>
              <button className="t-modal-close" onClick={() => setShowPreview(false)}>×</button>
            </div>
            <iframe title="preview" srcDoc={generatedCode} style={{ width: '100%', flex: 1, border: 'none' }} />
          </div>
        </div>
      )}
    </div>
  );
};
export default PortfolioGenerator;