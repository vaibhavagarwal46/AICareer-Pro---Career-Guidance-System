import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaGraduationCap, FaBrain, FaFileAlt, FaPenNib,
  FaLinkedin, FaMicrophone, FaChartLine, FaFolderOpen,
  FaArrowRight, FaLock, FaRocket, FaStar, FaUsers, FaTrophy
} from 'react-icons/fa';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg:       #050816;
    --surface:  rgba(255,255,255,0.04);
    --border:   rgba(255,255,255,0.08);
    --accent:   #7c6bff;
    --accent2:  #00e5c8;
    --accent3:  #ff6b6b;
    --text:     #e8e8f0;
    --muted:    rgba(232,232,240,0.45);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg) !important;
    color: var(--text) !important;
    font-family: 'DM Sans', sans-serif !important;
    overflow-x: hidden;
  }

  .cai-canvas {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
  }

  .cai-page { position: relative; z-index: 1; min-height: 100vh; }

  .cai-noise {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: .025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px;
  }

  .cai-hero {
    position: relative; min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 6rem 1.5rem 4rem;
    overflow: hidden;
  }
  .cai-hero-glow {
    position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none;
  }
  .cai-hero-glow-a {
    width: 600px; height: 600px; top: -100px; left: -150px;
    background: radial-gradient(circle, rgba(124,107,255,0.22) 0%, transparent 70%);
    animation: floatA 8s ease-in-out infinite;
  }
  .cai-hero-glow-b {
    width: 500px; height: 500px; bottom: -80px; right: -100px;
    background: radial-gradient(circle, rgba(0,229,200,0.18) 0%, transparent 70%);
    animation: floatB 10s ease-in-out infinite;
  }
  .cai-hero-glow-c {
    width: 300px; height: 300px; top: 40%; left: 55%;
    background: radial-gradient(circle, rgba(255,107,107,0.12) 0%, transparent 70%);
    animation: floatC 7s ease-in-out infinite;
  }
  @keyframes floatA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-30px)} }
  @keyframes floatB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,40px)} }
  @keyframes floatC { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,-20px)} }

  .cai-hero-inner { max-width: 820px; text-align: center; position: relative; }

  .cai-badge {
    display: inline-flex; align-items: center; gap: .5rem;
    background: rgba(124,107,255,.12);
    border: 1px solid rgba(124,107,255,.3);
    color: #a89fff;
    padding: .35rem 1rem; border-radius: 99px;
    font-size: .78rem; letter-spacing: .08em; text-transform: uppercase;
    font-family: 'DM Sans', sans-serif; font-weight: 500;
    margin-bottom: 1.75rem;
    animation: fadeUp .6s ease both;
  }
  .cai-badge-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #7c6bff;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }

  .cai-hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.6rem, 6vw, 5.2rem);
    font-weight: 800; line-height: 1.08;
    letter-spacing: -.03em;
    color: #fff;
    animation: fadeUp .7s .1s ease both;
  }
  .cai-hero h1 .grad {
    background: linear-gradient(135deg, #a89fff 0%, #00e5c8 55%, #7c6bff 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .cai-hero p {
    font-size: 1.15rem; color: var(--muted); line-height: 1.7;
    max-width: 580px; margin: 1.5rem auto 0;
    animation: fadeUp .7s .2s ease both;
  }

  .cai-hero-btns {
    display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
    margin-top: 2.5rem;
    animation: fadeUp .7s .3s ease both;
  }

  .cai-btn-primary {
    display: inline-flex; align-items: center; gap: .55rem;
    background: linear-gradient(135deg, #7c6bff, #00e5c8);
    color: #fff; font-family: 'DM Sans', sans-serif; font-weight: 600;
    padding: .8rem 2rem; border-radius: 99px; border: none;
    font-size: .95rem; cursor: pointer; text-decoration: none;
    position: relative; overflow: hidden;
    box-shadow: 0 0 40px rgba(124,107,255,.35), 0 4px 20px rgba(0,0,0,.3);
    transition: transform .2s ease, box-shadow .2s ease;
  }
  .cai-btn-primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 0 60px rgba(124,107,255,.5), 0 8px 30px rgba(0,0,0,.4);
    color: #fff; text-decoration: none;
  }
  .cai-btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,.18), transparent);
    opacity: 0; transition: opacity .2s;
  }
  .cai-btn-primary:hover::after { opacity: 1; }

  .cai-btn-outline {
    display: inline-flex; align-items: center; gap: .55rem;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.15);
    color: var(--text); font-family: 'DM Sans', sans-serif; font-weight: 500;
    padding: .8rem 1.8rem; border-radius: 99px;
    font-size: .95rem; cursor: pointer; text-decoration: none;
    transition: all .2s ease; backdrop-filter: blur(8px);
  }
  .cai-btn-outline:hover {
    background: rgba(255,255,255,.09);
    border-color: rgba(124,107,255,.5);
    color: #fff; text-decoration: none; transform: translateY(-2px);
  }

  .cai-stats {
    display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap;
    padding: 0 1.5rem 5rem;
    animation: fadeUp .7s .4s ease both;
  }
  .cai-stat { text-align: center; }
  .cai-stat-num {
    font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 800;
    background: linear-gradient(135deg, #a89fff, #00e5c8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .cai-stat-label { font-size: .82rem; color: var(--muted); text-transform: uppercase; letter-spacing: .07em; margin-top: .2rem; }

  .cai-section { padding: 5rem 1.5rem 6rem; max-width: 1280px; margin: 0 auto; }
  .cai-section-label {
    text-align: center; font-size: .78rem; letter-spacing: .12em;
    text-transform: uppercase; color: var(--accent); font-weight: 600;
    margin-bottom: .75rem;
  }
  .cai-section-title {
    text-align: center; font-family: 'Syne', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800;
    color: #fff; margin-bottom: .75rem; letter-spacing: -.02em;
  }
  .cai-section-sub {
    text-align: center; color: var(--muted); max-width: 520px;
    margin: 0 auto 3.5rem; line-height: 1.6; font-size: .95rem;
  }

  .cai-divider {
    width: 100%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent);
    margin: 0 auto;
  }

  .cai-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
  }

  .cai-card {
    position: relative; border-radius: 20px; overflow: hidden;
    background: var(--surface);
    border: 1px solid var(--border);
    backdrop-filter: blur(16px);
    padding: 2rem;
    display: flex; flex-direction: column; gap: 1rem;
    transition: transform .28s ease, border-color .28s ease, box-shadow .28s ease;
    text-decoration: none; color: inherit;
    cursor: pointer;
    animation: fadeUp .5s ease both;
  }
  .cai-card:hover {
    transform: translateY(-6px);
    border-color: rgba(124,107,255,.4);
    box-shadow: 0 24px 60px rgba(0,0,0,.4), 0 0 0 1px rgba(124,107,255,.15);
    text-decoration: none; color: inherit;
  }
  .cai-card::before {
    content: ''; position: absolute; inset: 0; border-radius: 20px;
    opacity: 0; transition: opacity .3s;
    background: radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(124,107,255,.06), transparent 40%);
    pointer-events: none;
  }
  .cai-card:hover::before { opacity: 1; }

  .cai-card-locked {
    opacity: .55; cursor: default;
    transform: none !important;
    box-shadow: none !important;
  }
  .cai-card-locked:hover { transform: none; }

  .cai-icon-wrap {
      width: 54px;
      height: 54px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
      margin: 0 auto;
  }
  .cai-icon-wrap::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,.12), transparent);
  }

  .cai-card-title {
    font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 700;
    color: #fff; line-height: 1.3;
  }
  .cai-card-desc {
    font-size: .875rem; color: var(--muted); line-height: 1.65; flex: 1;
  }
  .cai-card-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: .5rem;
  }
  .cai-card-cta {
    display: inline-flex; align-items: center; gap: .4rem;
    font-size: .82rem; font-weight: 600; color: var(--accent);
    transition: gap .2s ease;
  }
  .cai-card:hover .cai-card-cta { gap: .65rem; }
  .cai-lock-badge {
    display: inline-flex; align-items: center; gap: .35rem;
    font-size: .75rem; color: var(--muted);
    background: rgba(255,255,255,.06); border-radius: 99px;
    padding: .3rem .75rem;
  }

  /* ── WELCOME HERO (logged in) ── */
  .cai-welcome-hero {
    position: relative; padding: 7rem 1.5rem 5rem;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .cai-welcome-hero::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,107,255,.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .cai-welcome-inner { text-align: center; max-width: 680px; position: relative; }
  .cai-welcome-inner h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.2rem, 5vw, 4rem); font-weight: 800;
    color: #fff; letter-spacing: -.03em; line-height: 1.1;
    animation: fadeUp .6s ease both;
  }
  .cai-welcome-inner h1 span {
    background: linear-gradient(135deg, #a89fff, #00e5c8);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .cai-welcome-inner p {
    color: var(--muted); font-size: 1.1rem; line-height: 1.7;
    margin: 1.25rem auto 0; max-width: 500px;
    animation: fadeUp .6s .1s ease both;
  }
  .cai-welcome-btns {
    margin-top: 2.25rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
    animation: fadeUp .6s .2s ease both;
  }

  .cai-footer {
    text-align: center; padding: 1.75rem 1.5rem;
    border-top: 1px solid var(--border);
    color: var(--muted); font-size: .82rem;
  }
  .cai-footer a { color: var(--accent); text-decoration: none; }
  .cai-footer a:hover { text-decoration: underline; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(124,107,255,.4); border-radius: 3px; }
`;

const TOOLS = [
  {
    title: 'Career Prediction',
    description: 'Analyze your 17 skill scores using AI/ML to find the optimal career path for your profile.',
    icon: <FaBrain />,
    path: '/predict',
    color: '#7c6bff',
    bg: 'linear-gradient(135deg,#7c6bff,#5b4dd4)',
  },
  {
    title: 'Resume Builder',
    description: 'Customize your professional details and generate an instant, industry-standard PDF resume.',
    icon: <FaFileAlt />,
    path: '/resume',
    color: '#00e5c8',
    bg: 'linear-gradient(135deg,#00e5c8,#00b89e)',
  },
  {
    title: 'Cover Letter Generator',
    description: 'Leverage our local LLM to generate a personalized cover letter for any job description.',
    icon: <FaPenNib />,
    path: '/cover-letter',
    color: '#ff9a3c',
    bg: 'linear-gradient(135deg,#ff9a3c,#e07b20)',
  },
  {
    title: 'Stream Prediction (10th)',
    description: 'Analyze subjects, interests, and hobbies to recommend the best Class 11 stream.',
    icon: <FaGraduationCap />,
    path: '/stream-predict',
    color: '#4fc3f7',
    bg: 'linear-gradient(135deg,#4fc3f7,#0288d1)',
  },
  {
    title: 'LinkedIn Auditor',
    description: 'Audit your LinkedIn profile for SEO keywords and tone to attract top recruiters.',
    icon: <FaLinkedin />,
    path: '/linkedin-auditor',
    color: '#7c6bff',
    bg: 'linear-gradient(135deg,#7c6bff,#5b4dd4)',
  },
  {
    title: 'Mock Interview',
    description: 'Practice technical interview questions and get AI-driven feedback on your answers.',
    icon: <FaMicrophone />,
    path: '/mock-interview',
    color: '#ff6b6b',
    bg: 'linear-gradient(135deg,#ff6b6b,#c0392b)',
  },
  {
    title: 'Job Market Insights',
    description: 'Explore real-time job opportunities, salary ranges, and market trends across 7+ countries.',
    icon: <FaChartLine />,
    path: '/job-market-insights',
    color: '#00e5c8',
    bg: 'linear-gradient(135deg,#00e5c8,#00b89e)',
  },
  {
    title: 'Portfolio Generator',
    description: 'Generate a professional portfolio showcasing your projects and skills to impress recruiters.',
    icon: <FaFolderOpen />,
    path: '/portfolio-generator',
    color: '#a29bfe',
    bg: 'linear-gradient(135deg,#a29bfe,#6c5ce7)',
  },
];

const STATS = [
  { num: '17+', label: 'Skills Analyzed', icon: <FaStar /> },
  { num: '8',   label: 'Career Tools',    icon: <FaRocket /> },
  { num: '7+',  label: 'Countries',       icon: <FaUsers /> },
  { num: '99%', label: 'Accuracy',        icon: <FaTrophy /> },
];

function StarCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + .3,
      speed: Math.random() * .0002 + .00005,
      o: Math.random(),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.o += (Math.random() - .5) * .015;
        s.o = Math.max(.05, Math.min(1, s.o));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,170,255,${s.o})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="cai-canvas" />;
}

function ToolCard({ tool, locked = false }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
    ref.current.style.setProperty('--mx', x);
    ref.current.style.setProperty('--my', y);
  };

  const inner = (
    <div
      ref={ref}
      className={`cai-card${locked ? ' cai-card-locked' : ''}`}
      onMouseMove={locked ? undefined : handleMove}
      style={{ animationDelay: `${Math.random() * .3}s` }}
    >
      <div className="cai-icon-wrap" style={{ background: tool.bg }}>
        <span style={{ color: '#fff', position: 'relative', zIndex: 1 }}>{tool.icon}</span>
      </div>
      <div className="cai-card-title">{tool.title}</div>
      <div className="cai-card-desc">{tool.description}</div>
      <div className="cai-card-footer">
        {locked ? (
          <span className="cai-lock-badge"><FaLock size={10} /> Login to unlock</span>
        ) : (
          <span className="cai-card-cta" style={{ color: tool.color }}>
            Launch Tool <FaArrowRight size={11} />
          </span>
        )}
      </div>
    </div>
  );

  if (locked) return inner;
  return <Link to={tool.path} style={{ textDecoration: 'none' }}>{inner}</Link>;
}

function Dashboard({ user }) {
  useEffect(() => {
    if (document.getElementById('cai-styles')) return;
    const el = document.createElement('style');
    el.id = 'cai-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => {};
  }, []);

  if (!user) {
    return (
      <div className="cai-page">
        <StarCanvas />
        <div className="cai-noise" />

        <div className="cai-hero">
          <div className="cai-hero-glow cai-hero-glow-a" />
          <div className="cai-hero-glow cai-hero-glow-b" />
          <div className="cai-hero-glow cai-hero-glow-c" />
          <div className="cai-hero-inner">
            <div className="cai-badge"><span className="cai-badge-dot" /> AI-Powered Career Platform</div>
            <h1>
              Launch Your Future with<br />
              <span className="grad">AICareer Pro</span>
            </h1>
            <p>
              Personalized career pathways, AI-driven job applications, and expert tools
              powered by cutting-edge machine learning — all in one place.
            </p>
            <div className="cai-hero-btns">
              <Link to="/signup" className="cai-btn-primary">
                Get Started Free <FaArrowRight size={13} />
              </Link>
              <Link to="/login" className="cai-btn-outline">
                Already a member? Login
              </Link>
            </div>
          </div>
        </div>

        <div className="cai-stats">
          {STATS.map(s => (
            <div className="cai-stat" key={s.label}>
              <div className="cai-stat-num">{s.num}</div>
              <div className="cai-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="cai-divider" />
        <div className="cai-section">
          <div className="cai-section-label">What's inside</div>
          <h2 className="cai-section-title">Everything you need to land your dream job</h2>
          <p className="cai-section-sub">
            Create an account to unlock all 8 powerful career tools, completely free.
          </p>
          <div className="cai-grid">
            {TOOLS.map(tool => (
              <ToolCard key={tool.path} tool={tool} locked />
            ))}
          </div>
        </div>

        <div className="cai-footer">
          <p>© {new Date().getFullYear()} AICareer Pro — Built by Vaibhav Agarwal · <a href="/login">Login</a> · <a href="/signup">Sign Up</a></p>
        </div>
      </div>
    );
  }

  return (
    <div className="cai-page">
      <StarCanvas />
      <div className="cai-noise" />

      <div className="cai-welcome-hero">
        <div className="cai-welcome-inner">
          <div className="cai-badge" style={{ marginBottom: '1.25rem' }}>
            <span className="cai-badge-dot" /> Ready to launch
          </div>
          <h1>
            Welcome back,<br />
            <span>{user}!</span>
          </h1>
          <p>
            Your career journey continues. Pick up where you left off or you can try a new tool.
          </p>
          <div className="cai-welcome-btns">
            <Link to="/predict" className="cai-btn-primary">
              Start Career Assessment <FaArrowRight size={13} />
            </Link>
            <Link to="/resume" className="cai-btn-outline">
              Build My Resume
            </Link>
          </div>
        </div>
      </div>

      <div className="cai-divider" />

      <div className="cai-section">
        <div className="cai-section-label">Your toolkit</div>
        <h2 className="cai-section-title">Powerful Tools, One Platform</h2>
        <p className="cai-section-sub">
          Everything you need to navigate your career path — from prediction to application.
        </p>
        <div className="cai-grid">
          {TOOLS.map(tool => (
            <ToolCard key={tool.path} tool={tool} />
          ))}
        </div>
      </div>

      <div className="cai-footer">
        <p>© {new Date().getFullYear()} AICareer Pro Created by Vaibhav Agarwal</p>
      </div>
    </div>
  );
}
export default Dashboard;