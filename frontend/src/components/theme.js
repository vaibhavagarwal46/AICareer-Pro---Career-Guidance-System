export const BASE_THEME = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
:root{
  --bg:#050816;--surface:rgba(255,255,255,.04);--border:rgba(255,255,255,.08);
  --accent:#7c6bff;--accent2:#00e5c8;--text:#e8e8f0;--muted:rgba(232,232,240,.45);
  --danger:#ff6b6b;--warning:#ff9a3c;--success:#00e5c8;
}
body{background:var(--bg)!important;color:var(--text)!important;font-family:'DM Sans',sans-serif!important}

/* Page wrapper */
.t-page{min-height:100vh;background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;
  padding:3rem 1.5rem 5rem;position:relative;overflow-x:hidden}

/* Glow */
.t-glow{position:fixed;border-radius:50%;filter:blur(130px);pointer-events:none;z-index:0}
.t-glow-a{width:500px;height:500px;top:-100px;left:-120px;
  background:radial-gradient(circle,rgba(124,107,255,.18) 0%,transparent 70%)}
.t-glow-b{width:400px;height:400px;bottom:0;right:-80px;
  background:radial-gradient(circle,rgba(0,229,200,.14) 0%,transparent 70%)}
.t-inner{position:relative;z-index:1;max-width:1100px;margin:0 auto}

/* Page header */
.t-header{display:flex;justify-content:space-between;align-items:flex-start;
  flex-wrap:wrap;gap:1rem;margin-bottom:2.5rem;animation:tFade .5s ease both}
.t-title{font-family:'Syne',sans-serif;font-size:clamp(1.6rem,4vw,2.4rem);
  font-weight:800;color:#fff;letter-spacing:-.03em;margin:0}
.t-title span{background:linear-gradient(135deg,#a89fff,#00e5c8);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent}
.t-subtitle{color:var(--muted);font-size:.95rem;margin:.4rem 0 0}

/* Back button */
.t-back{display:inline-flex;align-items:center;gap:.45rem;
  background:rgba(255,255,255,.06);border:1px solid var(--border);
  color:var(--muted);padding:.55rem 1.1rem;border-radius:99px;
  font-size:.85rem;font-family:'DM Sans',sans-serif;cursor:pointer;
  text-decoration:none;transition:all .2s;white-space:nowrap}
.t-back:hover{background:rgba(255,255,255,.1);color:#fff;text-decoration:none}

/* Card */
.t-card{background:var(--surface);border:1px solid var(--border);
  border-radius:20px;backdrop-filter:blur(16px);padding:2rem;
  margin-bottom:1.5rem;animation:tFade .5s ease both;transition:border-color .2s}
.t-card:hover{border-color:rgba(124,107,255,.25)}
.t-card-title{font-family:'Syne',sans-serif;font-size:1.15rem;font-weight:700;
  color:#fff;margin-bottom:1.25rem;display:flex;align-items:center;gap:.5rem}
.t-card-title svg,.t-card-title .ti{color:var(--accent)}

/* Section label */
.t-section-label{font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--accent);font-weight:600;margin-bottom:.5rem}

/* Form elements */
.t-label{display:block;font-size:.82rem;font-weight:600;
  color:rgba(232,232,240,.65);margin-bottom:.45rem;letter-spacing:.02em}
.t-input,.t-select,.t-textarea{
  width:100%;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);border-radius:12px;
  padding:.72rem 1rem;color:#e8e8f0;
  font-family:'DM Sans',sans-serif;font-size:.93rem;
  outline:none;transition:border-color .2s,box-shadow .2s,background .2s;
  -webkit-appearance:none;appearance:none}
.t-input::placeholder,.t-textarea::placeholder{color:rgba(232,232,240,.28)}
.t-input:focus,.t-select:focus,.t-textarea:focus{
  border-color:rgba(124,107,255,.55);
  box-shadow:0 0 0 3px rgba(124,107,255,.12);
  background:rgba(255,255,255,.08)}
.t-input:disabled,.t-input[readonly]{opacity:.5;cursor:not-allowed}
.t-select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='rgba(232,232,240,.5)' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 1rem center;padding-right:2.5rem}
.t-select option{background:#0d1225;color:#e8e8f0}
.t-textarea{resize:vertical;min-height:100px;line-height:1.6}
.t-range{width:100%;accent-color:var(--accent);cursor:pointer}

/* Form group */
.t-group{margin-bottom:1.1rem}

/* Grid */
.t-grid-2{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
.t-grid-3{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem}
.t-grid-4{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem}
@media(max-width:600px){.t-grid-2,.t-grid-3,.t-grid-4{grid-template-columns:1fr}}

/* Buttons */
.t-btn{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;
  font-family:'DM Sans',sans-serif;font-weight:600;border:none;cursor:pointer;
  border-radius:12px;transition:all .2s;font-size:.93rem;padding:.72rem 1.4rem}
.t-btn:disabled{opacity:.55;cursor:not-allowed;transform:none!important}
.t-btn-primary{background:linear-gradient(135deg,#7c6bff,#00e5c8);color:#fff;
  box-shadow:0 0 25px rgba(124,107,255,.3);width:100%}
.t-btn-primary:hover:not(:disabled){transform:translateY(-2px);
  box-shadow:0 0 45px rgba(124,107,255,.45)}
.t-btn-outline{background:rgba(255,255,255,.05);border:1px solid var(--border);color:var(--muted)}
.t-btn-outline:hover:not(:disabled){background:rgba(255,255,255,.1);color:#fff}
.t-btn-accent2{background:linear-gradient(135deg,#00e5c8,#00b89e);color:#fff;
  box-shadow:0 0 25px rgba(0,229,200,.25)}
.t-btn-accent2:hover:not(:disabled){transform:translateY(-2px)}
.t-btn-danger{background:rgba(255,107,107,.15);border:1px solid rgba(255,107,107,.3);color:#ff6b6b}
.t-btn-sm{padding:.45rem .9rem;font-size:.82rem;border-radius:9px}
.t-btn-lg{padding:.9rem 2rem;font-size:1rem}
.t-btn-icon{width:46px;height:46px;border-radius:50%;padding:0}

/* Alerts */
.t-alert{border-radius:14px;padding:1rem 1.25rem;margin-bottom:1.25rem;
  display:flex;align-items:flex-start;gap:.7rem;font-size:.9rem;border:1px solid}
.t-alert-success{background:rgba(0,229,200,.08);border-color:rgba(0,229,200,.3);color:#00e5c8}
.t-alert-danger{background:rgba(255,107,107,.08);border-color:rgba(255,107,107,.3);color:#ff8a8a}
.t-alert-warning{background:rgba(255,154,60,.08);border-color:rgba(255,154,60,.3);color:#ff9a3c}
.t-alert-info{background:rgba(124,107,255,.08);border-color:rgba(124,107,255,.3);color:#a89fff}

/* Badge */
.t-badge{display:inline-flex;align-items:center;gap:.3rem;
  padding:.28rem .7rem;border-radius:99px;font-size:.75rem;font-weight:600;letter-spacing:.04em}
.t-badge-accent{background:rgba(124,107,255,.15);border:1px solid rgba(124,107,255,.3);color:#a89fff}
.t-badge-success{background:rgba(0,229,200,.12);border:1px solid rgba(0,229,200,.3);color:#00e5c8}
.t-badge-danger{background:rgba(255,107,107,.12);border:1px solid rgba(255,107,107,.3);color:#ff8a8a}
.t-badge-warning{background:rgba(255,154,60,.12);border:1px solid rgba(255,154,60,.3);color:#ff9a3c}

/* Divider */
.t-divider{height:1px;background:var(--border);margin:1.5rem 0}

/* Spinner */
.t-spinner{width:18px;height:18px;border:2px solid rgba(255,255,255,.2);
  border-top-color:#fff;border-radius:50%;animation:tSpin .7s linear infinite;display:inline-block}
.t-spinner-lg{width:36px;height:36px;border-width:3px}
.t-spinner-accent{border-color:rgba(124,107,255,.2);border-top-color:#7c6bff}

/* Progress bar */
.t-progress-wrap{height:8px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;margin-bottom:1.5rem}
.t-progress-bar{height:100%;border-radius:99px;background:linear-gradient(90deg,#7c6bff,#00e5c8);
  transition:width .4s ease}

/* Result card */
.t-result{border:1px solid rgba(0,229,200,.3);background:rgba(0,229,200,.05);
  border-radius:20px;padding:2rem;text-align:center;animation:tFade .5s ease both}
.t-result-big{font-family:'Syne',sans-serif;font-size:clamp(2rem,6vw,4rem);
  font-weight:800;background:linear-gradient(135deg,#a89fff,#00e5c8);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.1}
.t-result-score{font-family:'Syne',sans-serif;font-size:4rem;font-weight:800;
  background:linear-gradient(135deg,#00e5c8,#a89fff);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent}

/* Score bar */
.t-score-bar{height:16px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;margin:1rem 0}
.t-score-fill{height:100%;border-radius:99px;transition:width .8s ease;
  background:linear-gradient(90deg,#7c6bff,#00e5c8)}

/* Interview field card */
.t-field-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;
  padding:1.5rem 1rem;text-align:center;cursor:pointer;
  transition:all .25s;display:flex;flex-direction:column;align-items:center;gap:.7rem}
.t-field-card:hover{transform:translateY(-5px);border-color:rgba(124,107,255,.4);
  box-shadow:0 16px 40px rgba(0,0,0,.3)}
.t-field-icon{width:52px;height:52px;border-radius:14px;
  background:linear-gradient(135deg,#7c6bff,#5b4dd4);
  display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.3rem}
.t-field-name{font-size:.88rem;font-weight:600;color:#e8e8f0;line-height:1.3}

/* Job card */
.t-job-card{background:var(--surface);border:1px solid var(--border);
  border-left:3px solid var(--accent2)!important;border-radius:16px;
  padding:1.25rem 1.5rem;margin-bottom:.85rem;
  display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;
  transition:all .25s;animation:tFade .4s ease both}
.t-job-card:hover{transform:translateY(-3px);
  box-shadow:0 12px 35px rgba(0,229,200,.1);border-color:rgba(0,229,200,.35)!important}
.t-job-title{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;
  color:#fff;margin-bottom:.35rem}
.t-job-card:hover .t-job-title{color:var(--accent2)}
.t-job-meta{font-size:.83rem;color:var(--muted);display:flex;align-items:center;gap:.35rem;margin-bottom:.25rem}

/* Ideal answer block */
.t-ideal{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);
  border-radius:16px;padding:1.5rem;margin-top:1rem}
.t-ideal p{color:rgba(232,232,240,.7);font-style:italic;line-height:1.7;margin:0}

/* Listening pulse */
.t-listening{animation:tPulse 1.5s ease-in-out infinite}
@keyframes tPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,107,107,.4)}50%{box-shadow:0 0 0 8px rgba(255,107,107,0)}}

/* Roadmap list */
.t-roadmap-item{display:flex;justify-content:space-between;align-items:center;
  padding:.85rem 1rem;border-bottom:1px solid var(--border);color:var(--muted);font-size:.9rem}
.t-roadmap-item:last-child{border-bottom:none}
.t-roadmap-item:hover{color:var(--text);background:rgba(255,255,255,.02)}

/* Steps row */
.t-steps{display:flex;gap:.5rem;margin-bottom:2rem;flex-wrap:wrap}
.t-step{display:flex;align-items:center;gap:.4rem;font-size:.8rem;color:var(--muted);
  padding:.35rem .8rem;border-radius:99px;border:1px solid var(--border)}
.t-step.active{background:rgba(124,107,255,.15);border-color:rgba(124,107,255,.4);color:#a89fff}
.t-step.done{background:rgba(0,229,200,.08);border-color:rgba(0,229,200,.3);color:#00e5c8}

/* Education row */
.t-edu-row{background:rgba(255,255,255,.03);border:1px solid var(--border);
  border-radius:14px;padding:1rem;margin-bottom:.75rem;
  display:grid;grid-template-columns:auto 1fr 1fr 1fr;gap:.75rem;align-items:center}
@media(max-width:640px){.t-edu-row{grid-template-columns:1fr}}
.t-edu-level{font-weight:700;color:#e8e8f0;font-size:.88rem;white-space:nowrap}

/* Skill row */
.t-skill-row{display:grid;grid-template-columns:1fr 1fr auto;gap:.75rem;
  align-items:center;margin-bottom:.75rem}
@media(max-width:500px){.t-skill-row{grid-template-columns:1fr}}
.t-skill-pct{font-weight:700;color:var(--accent);min-width:2.5rem;text-align:center;font-size:.9rem}

/* Project block */
.t-proj-block{background:rgba(255,255,255,.03);border:1px solid var(--border);
  border-radius:16px;padding:1.5rem;margin-bottom:1rem}

/* Popular pills */
.t-pill{display:inline-flex;padding:.45rem 1rem;border-radius:99px;
  background:rgba(255,255,255,.05);border:1px solid var(--border);
  color:var(--muted);font-size:.83rem;cursor:pointer;transition:all .2s;
  text-decoration:none}
.t-pill:hover{background:rgba(124,107,255,.12);border-color:rgba(124,107,255,.35);
  color:#a89fff;text-decoration:none}

/* Cover letter output */
.t-letter-output{background:rgba(255,255,255,.03);border:1px solid var(--border);
  border-radius:16px;padding:1.5rem;min-height:280px;
  white-space:pre-wrap;font-family:'DM Sans',sans-serif;
  font-size:.9rem;color:var(--muted);line-height:1.8}

/* Modal overlay */
.t-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);
  z-index:999;display:flex;align-items:center;justify-content:center;padding:1rem}
.t-modal{background:#0d1225;border:1px solid var(--border);border-radius:24px;
  overflow:hidden;width:100%;max-width:90vw;max-height:92vh;
  display:flex;flex-direction:column}
.t-modal-header{display:flex;justify-content:space-between;align-items:center;
  padding:1.25rem 1.75rem;border-bottom:1px solid var(--border)}
.t-modal-header h3{font-family:'Syne',sans-serif;font-weight:700;color:#fff;margin:0;font-size:1.1rem}
.t-modal-close{background:rgba(255,255,255,.08);border:none;color:var(--muted);
  width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;
  transition:all .2s;display:flex;align-items:center;justify-content:center}
.t-modal-close:hover{background:rgba(255,107,107,.2);color:#ff6b6b}

/* Loading center */
.t-loading-center{display:flex;flex-direction:column;align-items:center;
  justify-content:center;gap:1rem;min-height:200px;color:var(--muted)}

/* Flex helpers */
.t-flex{display:flex;align-items:center;gap:.75rem}
.t-flex-between{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.75rem}
.t-flex-center{display:flex;justify-content:center;align-items:center;gap:.75rem;flex-wrap:wrap}
.t-mt{margin-top:1rem}.t-mt2{margin-top:1.5rem}.t-mt3{margin-top:2rem}
.t-mb{margin-bottom:1rem}.t-mb2{margin-bottom:1.5rem}
.t-text-center{text-align:center}
.t-w100{width:100%}

@keyframes tFade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes tSpin{to{transform:rotate(360deg)}}
`;

export function injectTheme(id = 'cai-theme') {
  if (typeof document === 'undefined') return;
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id;
  el.textContent = BASE_THEME;
  document.head.appendChild(el);
}
