import React, { useEffect } from 'react';
import { injectTheme } from './theme';
import './ResumeTemplates.css';

const DEFAULT_SECTIONS = [
  { id: 'summary',        enabled: true  },
  { id: 'experience',     enabled: true  },
  { id: 'education',      enabled: true  },
  { id: 'skills',         enabled: true  },
  { id: 'projects',       enabled: false },
  { id: 'certifications', enabled: false },
  { id: 'languages',      enabled: false },
  { id: 'hobbies',        enabled: false },
  { id: 'references',     enabled: false },
];

const initials = (name) => name.split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();

const PhotoCircle = ({ src, name, size = 90, bg = '#1a56db' }) => (
  <div style={{ width:size, height:size, borderRadius:'50%', overflow:'hidden', background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'3px solid rgba(255,255,255,.3)' }}>
    {src
      ? <img src={src} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      : <span style={{ color:'white', fontSize:size*0.32, fontWeight:700 }}>{initials(name||'YN')}</span>}
  </div>
);

const formatDate  = (d) => { 
  try { 
    return new Date(d).toLocaleString('en-US', { month:'short', year:'numeric' }); 
  }
  catch { 
    return d||''; 
  } 
};
const formatRange = (exp) => { 
  const s = formatDate(exp.startDate); 
  return exp.isCurrent
    ? `${s} – Present`
    : `${s}${exp.endDate ? ` – ${formatDate(exp.endDate)}` : ''}`;
};


const EDUCATION_LEVELS = [
  { key:'postGraduation', title:'Post Graduation'           },
  { key:'graduation',     title:'Graduation'                },
  { key:'twelfth',        title:'12th Grade (Intermediate)' },
  { key:'tenth',          title:'10th Grade (Matriculation)'},
];

const renderSections = (data, sections, renderers) =>
  sections.filter(s=>s.enabled).map(s => {
    const fn = renderers[s.id];
    return fn ? <React.Fragment key={s.id}>{fn()}</React.Fragment> : null;
  });
const ModernPreview = ({ data, sections }) => {
  const ACC = '#1a56db';
  const acc = { borderBottom:`2px solid ${ACC}`, paddingBottom:'5px', marginBottom:'12px', color:ACC, fontSize:'15px', fontWeight:'bold' };
  const renderers = {
    summary:    () => <section style={{marginBottom:'18px'}}><h4 style={acc}>Profile Summary</h4><p style={{fontSize:'13px'}}>{data.summary}</p></section>,
    experience: () => <section style={{marginBottom:'18px'}}><h4 style={acc}>Work Experience</h4>{(data.experience||[]).map(exp=>(<div key={exp.id} style={{marginBottom:'14px'}}><p style={{margin:0,fontWeight:'bold',fontSize:'14px'}}>{exp.title} — {exp.company}</p><p style={{margin:'0 0 5px',fontSize:'11px',color:'#666'}}>{exp.years||formatRange(exp)}</p><ul style={{margin:0,paddingLeft:'20px'}}>{(exp.duty_list||exp.duties?.split('\n').filter(d=>d.trim())||[]).map((d,i)=><li key={i} style={{fontSize:'13px'}}>{typeof d==='string'?d.trim():d}</li>)}</ul></div>))}</section>,
    education:  () => <section style={{marginBottom:'18px'}}><h4 style={acc}>Education</h4>{EDUCATION_LEVELS.map(({key,title})=>data.education?.[key]?.school&&(<div key={key} style={{marginBottom:'10px'}}><p style={{margin:0,fontWeight:'bold',fontSize:'13px'}}>{data.education[key].school}</p><p style={{margin:0,fontSize:'12px',color:'#666'}}>{title} | {data.education[key].percentage} | {data.education[key].passingYear}</p></div>))}</section>,
    skills:     () => <section><h4 style={acc}>Key Skills</h4><p style={{fontSize:'13px'}}>{data.skills}</p></section>,
    projects:   () => (data.projects||[]).length ? <section style={{marginBottom:'18px'}}><h4 style={acc}>Projects</h4>{data.projects.map(p=><div key={p.id} style={{marginBottom:'8px'}}><p style={{margin:0,fontWeight:'bold',fontSize:'13px'}}>{p.name}</p><p style={{fontSize:'12.5px'}}>{p.description}</p></div>)}</section> : null,
    certifications: () => (data.certifications||[]).length ? <section style={{marginBottom:'18px'}}><h4 style={acc}>Certifications</h4>{data.certifications.map(c=><p key={c.id} style={{margin:'0 0 4px',fontSize:'12.5px'}}><strong>{c.name}</strong> — {c.issuer} {c.year&&`(${c.year})`}</p>)}</section> : null,
    languages:  () => (data.languages||[]).length ? <section style={{marginBottom:'18px'}}><h4 style={acc}>Languages</h4><p style={{fontSize:'13px'}}>{data.languages.map(l=>`${l.lang} (${l.level})`).join(' · ')}</p></section> : null,
    hobbies:    () => data.hobbies ? <section style={{marginBottom:'18px'}}><h4 style={acc}>Hobbies</h4><p style={{fontSize:'13px'}}>{data.hobbies}</p></section> : null,
    references: () => (data.references||[]).length ? <section><h4 style={acc}>References</h4><div style={{display:'flex',gap:'2rem',flexWrap:'wrap'}}>{data.references.map(r=><div key={r.id}><strong style={{fontSize:'13px'}}>{r.name}</strong><p style={{margin:0,fontSize:'12px',color:'#555'}}>{r.title}{r.company&&`, ${r.company}`}</p></div>)}</div></section> : null,
  };
  return (
    <div className="resume-template modern-template p-4" style={{ background:'white', color:'#000', minHeight:'600px' }}>
      <h1 style={{color:ACC,margin:0}}>{data.name}</h1>
      {data.title && <h3 style={{color:'#555',borderBottom:`1px solid ${ACC}`,paddingBottom:'5px',marginBottom:'10px'}}>{data.title}</h3>}
      <p style={{fontSize:'12px',color:'#555',marginBottom:'18px'}}>{[data.phone,data.email,data.linkedin].filter(Boolean).join(' | ')}</p>
      {renderSections(data, sections, renderers)}
    </div>
  );
};

const ClassicPreview = ({ data, sections }) => {
  const sh = { fontSize:'14px', borderBottom:'1px solid #333', paddingBottom:'3px', marginBottom:'8px', marginTop:'15px', fontWeight:'bold', color:'#333', textTransform:'uppercase' };
  const renderers = {
    summary:    () => <section><h4 style={sh}>Professional Summary</h4><p style={{fontSize:'12.5px'}}>{data.summary}</p></section>,
    experience: () => <section><h4 style={sh}>Work Experience</h4>{(data.experience||[]).map(exp=>(<div key={exp.id} style={{marginBottom:'10px'}}><p style={{margin:0,fontWeight:'bold',fontSize:'13px'}}>{exp.title} — {exp.company}</p><p style={{margin:'0 0 4px',fontSize:'11px',color:'#666'}}>{exp.years||formatRange(exp)}</p><ul style={{margin:0,paddingLeft:'18px'}}>{(exp.duty_list||exp.duties?.split('\n').filter(d=>d.trim())||[]).map((d,i)=><li key={i} style={{fontSize:'12.5px'}}>{typeof d==='string'?d.trim():d}</li>)}</ul></div>))}</section>,
    education:  () => <section><h4 style={sh}>Education</h4>{EDUCATION_LEVELS.map(({key,title})=>data.education?.[key]?.school&&(<div key={key} style={{marginBottom:'6px'}}><p style={{margin:0,fontWeight:'bold',fontSize:'13px'}}>{data.education[key].school}</p><p style={{margin:0,fontSize:'12px',color:'#555'}}>{title} | {data.education[key].percentage} | {data.education[key].passingYear}</p></div>))}</section>,
    skills:     () => <section><h4 style={sh}>Key Skills</h4><p style={{fontSize:'12.5px'}}>{data.skills}</p></section>,
    languages:  () => (data.languages||[]).length ? <section><h4 style={sh}>Languages</h4><p style={{fontSize:'12.5px'}}>{data.languages.map(l=>`${l.lang} (${l.level})`).join(' · ')}</p></section> : null,
    hobbies:    () => data.hobbies ? <section><h4 style={sh}>Hobbies</h4><p style={{fontSize:'12.5px'}}>{data.hobbies}</p></section> : null,
    references: () => (data.references||[]).length ? <section><h4 style={sh}>References</h4><div style={{display:'flex',gap:'2rem',flexWrap:'wrap'}}>{data.references.map(r=><div key={r.id}><strong>{r.name}</strong><p style={{margin:0,fontSize:'11.5px',color:'#555'}}>{r.title}{r.company&&`, ${r.company}`}</p></div>)}</div></section> : null,
  };
  return (
    <div className="resume-template classic-template p-4" style={{ background:'white', color:'#000', minHeight:'600px' }}>
      <h1 style={{textAlign:'center',margin:0,fontSize:'24px'}}>{data.name}</h1>
      {data.title && <p style={{textAlign:'center',color:'#555',fontSize:'14px',margin:'3px 0'}}>{data.title}</p>}
      <p style={{textAlign:'center',color:'#666',fontSize:'12px',borderBottom:'1px solid #dee2e6',paddingBottom:'8px',marginBottom:'10px'}}>{[data.phone,data.email].filter(Boolean).join(' · ')}</p>
      {renderSections(data, sections, renderers)}
    </div>
  );
};

const ProfessionalPreview = ({ data, sections }) => {
  const ACC = '#1a56db';
  return (
    <div className="resume-template professional-template" style={{ display:'flex', background:'white', color:'#000', minHeight:'600px' }}>
      <div style={{ width:'35%', background:'#f4f4f4', padding:'1.5rem 1.25rem', borderRight:'1px solid #e0e0e0' }}>
        <h4 style={{ color:ACC, marginBottom:'4px' }}>{data.name}</h4>
        {data.title && <p style={{ color:'#555', fontSize:'.85rem', marginBottom:'1rem' }}>{data.title}</p>}
        <h5 style={{ fontSize:'.78rem', textTransform:'uppercase', color:'#777', borderBottom:'1px solid #ccc', paddingBottom:'4px', marginBottom:'8px' }}>Contact</h5>
        {data.email    && <p style={{ fontSize:'.8rem', marginBottom:'4px' }}>✉ {data.email}</p>}
        {data.phone    && <p style={{ fontSize:'.8rem', marginBottom:'4px' }}>📞 {data.phone}</p>}
        {data.linkedin && <p style={{ fontSize:'.8rem' }}>{data.linkedin}</p>}
        <h5 style={{ fontSize:'.78rem', textTransform:'uppercase', color:'#777', borderBottom:'1px solid #ccc', paddingBottom:'4px', margin:'1.25rem 0 8px' }}>Skills</h5>
        <p style={{ fontSize:'.8rem' }}>{data.skills}</p>
        {(data.education?.graduation?.school || data.education?.postGraduation?.school) && <>
          <h5 style={{ fontSize:'.78rem', textTransform:'uppercase', color:'#777', borderBottom:'1px solid #ccc', paddingBottom:'4px', margin:'1.25rem 0 8px' }}>Education</h5>
          {EDUCATION_LEVELS.map(({key,title})=>data.education?.[key]?.school&&<div key={key} style={{marginBottom:'8px'}}><p style={{margin:0,fontWeight:'bold',fontSize:'.8rem'}}>{data.education[key].school}</p><p style={{margin:0,fontSize:'.75rem',color:'#666'}}>{title} · {data.education[key].passingYear}</p></div>)}
        </>}
      </div>
      <div style={{ width:'65%', padding:'1.5rem' }}>
        {data.summary && <><h5 style={{ color:ACC, textTransform:'uppercase', borderBottom:`1px solid ${ACC}`, paddingBottom:'4px', marginBottom:'10px', fontSize:'.85rem' }}>Summary</h5><p style={{fontSize:'13px'}}>{data.summary}</p></>}
        <h5 style={{ color:ACC, textTransform:'uppercase', borderBottom:`1px solid ${ACC}`, paddingBottom:'4px', margin:'1.25rem 0 10px', fontSize:'.85rem' }}>Experience</h5>
        {(data.experience||[]).map(exp=>(<div key={exp.id} style={{marginBottom:'12px'}}><h6 style={{marginBottom:'2px'}}>{exp.title}</h6><p style={{color:'#777',fontSize:'.8rem',marginBottom:'4px'}}>{exp.company} | {exp.years||formatRange(exp)}</p><ul style={{margin:0,paddingLeft:'18px'}}>{(exp.duty_list||exp.duties?.split('\n').filter(d=>d.trim())||[]).map((d,i)=><li key={i} style={{fontSize:'12px'}}>{typeof d==='string'?d.trim():d}</li>)}</ul></div>))}
      </div>
    </div>
  );
};
const ResumePreview = ({ data, templateId, sections: propSections }) => {
  useEffect(() => { injectTheme(); }, []);

  const sections = propSections || DEFAULT_SECTIONS;

  if (!data || !data.name) {
    return (
      <div style={{ padding:'1.25rem 1.5rem', borderRadius:'12px', background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.25)', color:'rgba(251,191,36,.9)', fontSize:'.85rem', fontWeight:500, display:'flex', alignItems:'center', gap:'.6rem' }}>
        Please fill out the resume data form to see a preview.
      </div>
    );
  }

  const templateComponents = {
    modern:       ModernPreview,
    classic:      ClassicPreview,
    professional: ProfessionalPreview,
  };

  const Template = templateComponents[templateId];

  if (!Template) {
    return (
      <div style={{ padding:'1.25rem 1.5rem', borderRadius:'12px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.25)', color:'rgba(239,68,68,.9)', fontSize:'.85rem', fontWeight:500 }}>
        Template "{templateId}" not found.
      </div>
    );
  }

  return (
    <div style={{ borderRadius:'16px', overflow:'hidden', border:'1px solid rgba(255,255,255,.1)', boxShadow:'0 25px 70px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.04)' }}>
      <div style={{ background:'rgba(10,10,14,.96)', padding:'.65rem 1rem', display:'flex', alignItems:'center', gap:'.5rem', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
        <span style={{ width:10, height:10, borderRadius:'50%', background:'#ff5f57', display:'inline-block', flexShrink:0 }} />
        <span style={{ width:10, height:10, borderRadius:'50%', background:'#febc2e', display:'inline-block', flexShrink:0 }} />
        <span style={{ width:10, height:10, borderRadius:'50%', background:'#28c840', display:'inline-block', flexShrink:0 }} />
        <span style={{ flex:1, textAlign:'center', fontSize:'.62rem', color:'rgba(255,255,255,.2)', fontFamily:'monospace', letterSpacing:'.04em' }}>
          resume_{templateId}_preview.pdf
        </span>
        <span style={{ fontSize:'.62rem', padding:'.2rem .6rem', borderRadius:'99px', background:'rgba(0,229,200,.1)', border:'1px solid rgba(0,229,200,.2)', color:'#00e5c8', fontFamily:'monospace', letterSpacing:'.04em', flexShrink:0 }}>
          LIVE
        </span>
      </div>
      <div style={{ background:'white', maxHeight:'75vh', overflowY:'auto' }}>
        <Template data={data} sections={sections} />
      </div>
    </div>
  );
};
export default ResumePreview;