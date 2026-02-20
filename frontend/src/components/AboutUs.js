import React, { useEffect } from 'react';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

.abt-page {
  min-height: 100vh;
  background: #050816;
  color: #e8e8f0;
  font-family: 'DM Sans', sans-serif;
  position: relative;
  overflow-x: hidden;
}
.abt-glow {
  position: fixed; border-radius: 50%; filter: blur(130px); pointer-events: none; z-index: 0;
}
.abt-glow-a {
  width: 500px; height: 500px; top: -100px; left: -120px;
  background: radial-gradient(circle, rgba(124,107,255,.18) 0%, transparent 70%);
}
.abt-glow-b {
  width: 400px; height: 400px; bottom: 0; right: -100px;
  background: radial-gradient(circle, rgba(0,229,200,.14) 0%, transparent 70%);
}
.abt-inner {
  position: relative; z-index: 1;
  max-width: 860px; margin: 0 auto; padding: 5rem 1.5rem 6rem;
}

/* hero */
.abt-hero { text-align: center; margin-bottom: 3.5rem; animation: abtFade .6s ease both; }
.abt-badge {
  display: inline-flex; align-items: center; gap: .5rem;
  background: rgba(124,107,255,.12); border: 1px solid rgba(124,107,255,.3);
  color: #a89fff; padding: .35rem 1rem; border-radius: 99px;
  font-size: .78rem; letter-spacing: .08em; text-transform: uppercase;
  font-weight: 500; margin-bottom: 1.5rem;
}
.abt-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #7c6bff; animation: abtPulse 2s infinite; }
@keyframes abtPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.6)} }
.abt-hero h1 {
  font-family: 'Syne', sans-serif; font-size: clamp(2.2rem,5vw,3.8rem);
  font-weight: 800; letter-spacing: -.03em; color: #fff; line-height: 1.1;
}
.abt-hero h1 span {
  background: linear-gradient(135deg,#a89fff,#00e5c8);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.abt-hero p {
  color: rgba(232,232,240,.5); font-size: 1.05rem; line-height: 1.7;
  max-width: 520px; margin: 1.25rem auto 0;
}

/* card */
.abt-card {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 24px; backdrop-filter: blur(20px);
  padding: 2.5rem; margin-bottom: 1.5rem;
  animation: abtFade .6s ease both;
}
.abt-card:hover { border-color: rgba(124,107,255,.3); }
.abt-card h2 {
  font-family: 'Syne', sans-serif; font-size: 1.45rem; font-weight: 700;
  color: #fff; margin-bottom: 1.1rem; display: flex; align-items: center; gap: .6rem;
}
.abt-card h2 .h2-icon {
  width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center;
  justify-content: center; font-size: .95rem; flex-shrink: 0;
  background: linear-gradient(135deg,#7c6bff,#5b4dd4);
}
.abt-card p { color: rgba(232,232,240,.6); line-height: 1.75; font-size: .97rem; margin-bottom: .85rem; }
.abt-card p:last-child { margin-bottom: 0; }
.abt-divider { height: 1px; background: rgba(255,255,255,.08); margin: 1.75rem 0; }

/* features list */
.abt-features { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: .5rem; }
@media(max-width:560px){ .abt-features { grid-template-columns: 1fr; } }
.abt-feature {
  display: flex; align-items: flex-start; gap: .75rem;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
  border-radius: 14px; padding: 1rem 1.1rem;
  transition: border-color .2s, transform .2s;
}
.abt-feature:hover { border-color: rgba(0,229,200,.3); transform: translateY(-2px); }
.abt-feat-icon {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: .85rem;
}
.abt-feat-text { font-size: .875rem; color: rgba(232,232,240,.65); line-height: 1.5; }
.abt-feat-title { font-weight: 600; color: #e8e8f0; display: block; margin-bottom: .2rem; font-size: .9rem; }

/* team */
.abt-team-card {
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  border-radius: 24px; backdrop-filter: blur(20px); padding: 2.5rem;
  display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;
  animation: abtFade .7s .1s ease both;
  transition: border-color .25s;
}
.abt-team-card:hover { border-color: rgba(124,107,255,.35); }
.abt-avatar {
  width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg,#7c6bff,#00e5c8);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff;
  box-shadow: 0 0 0 3px rgba(124,107,255,.25), 0 0 30px rgba(124,107,255,.2);
}
.abt-team-info h3 {
  font-family: 'Syne', sans-serif; font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: .25rem;
}
.abt-team-info p { color: rgba(232,232,240,.5); font-size: .9rem; line-height: 1.6; margin: 0; }
.abt-team-role {
  display: inline-block; background: rgba(124,107,255,.14);
  border: 1px solid rgba(124,107,255,.25); color: #a89fff;
  font-size: .75rem; letter-spacing: .06em; text-transform: uppercase;
  padding: .2rem .75rem; border-radius: 99px; margin-bottom: .5rem;
}

@keyframes abtFade { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
`;

const FEATURES = [
  { icon: '🧠', bg: 'linear-gradient(135deg,#7c6bff,#5b4dd4)', title: 'Career Prediction', text: 'AI/ML analysis of 17 skill scores to predict optimal career paths.' },
  { icon: '🎓', bg: 'linear-gradient(135deg,#4fc3f7,#0288d1)', title: 'Stream Prediction', text: 'Smart recommendations for Class 11 stream selection.' },
  { icon: '✍️', bg: 'linear-gradient(135deg,#ff9a3c,#e07b20)', title: 'LLM Cover Letters', text: 'Ollama-powered cover letter generation tailored to any JD.' },
  { icon: '🎤', bg: 'linear-gradient(135deg,#ff6b6b,#c0392b)', title: 'Mock Interviews', text: 'AI-driven interview questions with real-time feedback.' },
  { icon: '📄', bg: 'linear-gradient(135deg,#00e5c8,#00b89e)', title: 'Resume Builder', text: 'Instant industry-standard PDF resume, A4 format.' },
  { icon: '📊', bg: 'linear-gradient(135deg,#00e5c8,#00b89e)', title: 'Job Market Insights', text: 'Live job openings and salary data across 7+ countries.' },
  { icon: '💼', bg: 'linear-gradient(135deg,#7c6bff,#5b4dd4)', title: 'LinkedIn Auditor', text: 'SEO and tone audit to attract top recruiters.' },
  { icon: '🗂️', bg: 'linear-gradient(135deg,#a29bfe,#6c5ce7)', title: 'Portfolio Generator', text: 'Auto-generate a professional portfolio from your profile.' },
];

function AboutUs() {
  useEffect(() => {
    if (document.getElementById('abt-styles')) return;
    const el = document.createElement('style');
    el.id = 'abt-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
  }, []);

  return (
    <div className="abt-page">
      <div className="abt-glow abt-glow-a" />
      <div className="abt-glow abt-glow-b" />
      <div className="abt-inner">

        <div className="abt-hero">
          <div className="abt-badge"><span className="abt-badge-dot" /> About the Platform</div>
          <h1>Built to Accelerate<br /><span>Your Career Journey</span></h1>
          <p>A hybrid AI platform combining ML precision with LLM intelligence to guide you from student to professional.</p>
        </div>

        <div className="abt-card">
          <h2>Our Mission</h2>
          <p>
            AICareer Pro is dedicated to revolutionizing career guidance using Artificial Intelligence. Our mission is to bridge the gap between individual skills and dynamic industry demands by providing personalized, data-driven, and future-ready career pathways.
          </p>
          <p>
            Built as a hybrid platform, we combine the objectivity of Machine Learning for skill analysis and prediction with the human touch of contextual awareness provided by large language models — delivering nuanced, professional-quality outputs.
          </p>
        </div>

        <div className="abt-card">
          <h2> Key Features</h2>
          <div className="abt-features">
            {FEATURES.map(f => (
              <div className="abt-feature" key={f.title}>
                <div className="abt-feat-icon" style={{ background: f.bg }}>{f.icon}</div>
                <div className="abt-feat-text">
                  <span className="abt-feat-title">{f.title}</span>
                  {f.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="abt-team-card">
          <div className="abt-team-info">
            <div className="abt-team-role">Creator & Developer</div>
            <h3>Vaibhav Agarwal</h3>
            <p>Designed and built AICareer Pro as a full-stack AI platform combining Flask, React, Machine Learning, and Ollama LLM integration to deliver an end-to-end career guidance experience.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AboutUs;