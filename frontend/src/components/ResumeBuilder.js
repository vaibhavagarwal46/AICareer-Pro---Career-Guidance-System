import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { injectTheme } from './theme';

let _dragSourceId  = null;
let _setSectionsRef = null;
let _editMode = true;

const registerSetSections = fn => { _setSectionsRef = fn; };
const reorderSections = (fromId, toId) => {
  if (!_setSectionsRef || fromId === toId) return;
  _setSectionsRef(prev => {
    const arr = [...prev];
    const fi  = arr.findIndex(s => s.id === fromId);
    const ti  = arr.findIndex(s => s.id === toId);
    if (fi === -1 || ti === -1) return prev;
    const [moved] = arr.splice(fi, 1);
    arr.splice(ti, 0, moved);
    return arr;
  });
};

const DraggableSection = ({ sectionId, children }) => {
  const [over,   setOver]   = useState(false);
  const [hovered,setHovered]= useState(false);
  const [dragging,setDragging]=useState(false);

  const handleDragStart = e => {
    _dragSourceId = sectionId;
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', sectionId); } catch(_) {}
    setDragging(true);
  };

  const handleDragEnd = () => {
    _dragSourceId = null;
    setDragging(false);
    setOver(false);
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setOver(true);
  };

  const handleDragLeave = e => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOver(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setOver(false);
    const fromId = _dragSourceId || e.dataTransfer.getData('text/plain');
    if (fromId && fromId !== sectionId) {
      reorderSections(fromId, sectionId);
    }
    _dragSourceId = null;
  };

  if (!_editMode) return <>{children}</>;

  const showDropLine = over && _dragSourceId && _dragSourceId !== sectionId;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); }}
      style={{
        position:   'relative',
        opacity:    dragging ? 0.3 : 1,
        transition: 'opacity .15s',
        cursor:     dragging ? 'grabbing' : 'grab',
        outline:    showDropLine ? '2px dashed #7c6bff'
                  : hovered && !dragging ? '1.5px dashed rgba(124,107,255,.4)' : 'none',
        outlineOffset: 3,
        borderRadius:  4,
        background: showDropLine ? 'rgba(124,107,255,.05)' : 'transparent',
      }}
    >
      {showDropLine && (
        <div style={{
          position:'absolute', top:-3, left:0, right:0, height:3,
          background:'#7c6bff', borderRadius:2, zIndex:100,
          boxShadow:'0 0 8px #7c6bff',
        }}/>
      )}
      {hovered && !dragging && (
        <div style={{
          position:'absolute', top:5, right:5, zIndex:200,
          background:'rgba(124,107,255,.92)', color:'white',
          borderRadius:6, padding:'2px 8px', fontSize:10, fontWeight:700,
          display:'flex', alignItems:'center', gap:4,
          boxShadow:'0 2px 10px rgba(0,0,0,.35)',
          pointerEvents:'none', userSelect:'none',
          fontFamily:'system-ui,sans-serif', letterSpacing:'.3px',
        }}>
          ⠿ drag to reorder
        </div>
      )}
      {children}
    </div>
  );
};

const fmtDate  = d => { try{return new Date(d).toLocaleString('en-US',{month:'short',year:'numeric'})}catch{return d||''} };
const fmtRange = e => { const s=fmtDate(e.startDate); return e.isCurrent?`${s} – Present`:`${s}${e.endDate?` – ${fmtDate(e.endDate)}`:''}` };
const initials = n => (n||'YN').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase();

const EDU_LEVELS = [
  {key:'postGraduation',title:'Post Graduation'},
  {key:'graduation',    title:'Graduation'},
  {key:'twelfth',       title:'12th Grade (Intermediate)'},
  {key:'tenth',         title:'10th Grade (Matriculation)'},
];

const Photo = ({src,name,size=100,border='3px solid rgba(255,255,255,.35)',bg='#557',radius='50%'}) => (
  <div style={{width:size,height:size,borderRadius:radius,overflow:'hidden',background:bg,flexShrink:0,border,display:'flex',alignItems:'center',justifyContent:'center'}}>
    {src
      ? <img src={src} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
      : <span style={{color:'#fff',fontSize:size*.34,fontWeight:700}}>{initials(name)}</span>}
  </div>
);

const RS = (sections, map) =>
  sections.filter(s => s.enabled).map(s =>
    map[s.id] ? (
      <DraggableSection key={s.id} sectionId={s.id}>
        {map[s.id]()}
      </DraggableSection>
    ) : null
  );

const T_Mariana = ({data, sections}) => {
  const N = '#2c3e50';
  const leftSecs  = sections.filter(s => s.enabled && ['skills','education','languages','certifications','hobbies'].includes(s.id));
  const rightSecs = sections.filter(s => s.enabled && ['summary','experience','projects','references'].includes(s.id));

  const LL = ({c}) => <h4 style={{color:'#fff',fontSize:17,fontWeight:700,fontFamily:'Georgia,serif',margin:'18px 0 5px',borderBottom:'1px solid rgba(255,255,255,.2)',paddingBottom:3}}>{c}</h4>;
  const RL = ({c}) => <h3 style={{fontSize:21,fontWeight:700,fontFamily:'Georgia,serif',color:'#222',borderBottom:'1px solid #ccc',paddingBottom:5,marginTop:20,marginBottom:11}}>{c}</h3>;

  const lmap = {
    skills: () => (<div><LL c="Expertise"/>{data.skills.split(',').map((s,i)=><p key={i} style={{color:'rgba(255,255,255,.85)',fontSize:13,margin:'3px 0',display:'flex',alignItems:'center',gap:6}}><span style={{width:5,height:5,borderRadius:'50%',background:'rgba(255,255,255,.55)',flexShrink:0}}/>{s.trim()}</p>)}</div>),
    education: () => (<div><LL c="Education"/>{EDU_LEVELS.map(({key,title})=>data.education[key]?.school&&(<div key={key} style={{marginBottom:9}}><p style={{color:'rgba(255,255,255,.45)',fontSize:10.5,margin:'0 0 1px'}}>{data.education[key].passingYear}</p><p style={{color:'#fff',fontWeight:700,fontSize:12,margin:'0 0 1px'}}>{title}</p><p style={{color:'rgba(255,255,255,.7)',fontSize:12,margin:0}}>{data.education[key].school}</p></div>))}</div>),
    languages: () => data.languages?.length ? (<div><LL c="Language"/>{data.languages.map((l,i)=><p key={i} style={{color:'rgba(255,255,255,.85)',fontSize:13,margin:'3px 0'}}>{l.lang}</p>)}</div>) : null,
    certifications: () => data.certifications?.length ? (<div><LL c="Certifications"/>{data.certifications.map((c,i)=><p key={i} style={{color:'rgba(255,255,255,.85)',fontSize:12,margin:'3px 0'}}>{c.name}</p>)}</div>) : null,
    hobbies: () => data.hobbies ? (<div><LL c="Interests"/><p style={{color:'rgba(255,255,255,.8)',fontSize:13}}>{data.hobbies}</p></div>) : null,
  };
  const rmap = {
    summary: () => data.summary ? <p style={{fontSize:13,lineHeight:1.72,color:'#444',marginBottom:20,borderBottom:'1px solid #eee',paddingBottom:16}}>{data.summary}</p> : null,
    experience: () => (<div style={{marginBottom:10}}><RL c="Experience"/>{data.experience.map((exp,i)=>(<div key={exp.id} style={{display:'flex',gap:13,marginBottom:17}}><div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingTop:4}}><div style={{width:11,height:11,borderRadius:'50%',border:`2px solid ${N}`,background:'white',flexShrink:0}}/>{i<data.experience.length-1&&<div style={{width:1,flex:1,background:'#ddd',marginTop:4}}/>}</div><div style={{flex:1}}><p style={{fontSize:11,color:'#888',margin:'0 0 1px'}}>{fmtRange(exp)}</p><p style={{fontSize:11.5,color:'#555',margin:'0 0 3px'}}>{exp.company}{data.address?`, ${data.address}`:''}</p><p style={{fontSize:14,fontWeight:700,color:'#222',margin:'0 0 5px'}}>{exp.title}</p><p style={{fontSize:12.5,color:'#444',lineHeight:1.65,textAlign:'justify',margin:0}}>{exp.duties.split('\n').filter(d=>d.trim()).join(' ')}</p></div></div>))}</div>),
    projects: () => data.projects?.length ? (<div style={{marginBottom:10}}><RL c="Projects"/>{data.projects.map(p=>(<div key={p.id} style={{marginBottom:12}}><p style={{fontWeight:700,fontSize:14,margin:'0 0 3px'}}>{p.name}</p>{p.technologies&&<p style={{fontSize:11.5,color:'#888',margin:'0 0 3px',fontStyle:'italic'}}>{p.technologies}</p>}<p style={{fontSize:12.5,color:'#444',lineHeight:1.6}}>{p.description}</p></div>))}</div>) : null,
    references: () => data.references?.length ? (<div><RL c="Reference"/><div style={{display:'flex',gap:22,flexWrap:'wrap'}}>{data.references.map(r=>(<div key={r.id} style={{flex:1,minWidth:150}}><p style={{fontWeight:700,fontSize:15,margin:'0 0 2px'}}>{r.name}</p><p style={{fontSize:12,color:'#666',margin:'0 0 5px'}}>{r.company}{r.title?` / ${r.title}`:''}</p>{r.phone&&<p style={{fontSize:11.5,color:'#555',margin:'0 0 2px'}}>Phone: {r.phone}</p>}{r.email&&<p style={{fontSize:11.5,color:'#555',margin:0}}>Email: {r.email}</p>}</div>))}</div></div>) : null,
  };
  return (
    <div style={{display:'flex',fontFamily:'Arial,sans-serif',minHeight:'297mm',background:'white'}}>
      <div style={{width:'32%',background:N,padding:'28px 19px',color:'white'}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:15}}><Photo src={data.photo} name={data.name} size={108} bg='#4a6080'/></div>
        <h4 style={{color:'#fff',fontSize:17,fontWeight:700,fontFamily:'Georgia,serif',margin:'0 0 5px',borderBottom:'1px solid rgba(255,255,255,.2)',paddingBottom:3}}>Contact</h4>
        {data.phone&&<><p style={{color:'rgba(255,255,255,.5)',fontSize:10.5,margin:'6px 0 1px',fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Phone</p><p style={{color:'rgba(255,255,255,.85)',fontSize:12.5,margin:0}}>{data.phone}</p></>}
        {data.email&&<><p style={{color:'rgba(255,255,255,.5)',fontSize:10.5,margin:'6px 0 1px',fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Email</p><p style={{color:'rgba(255,255,255,.85)',fontSize:12.5,margin:0}}>{data.email}</p></>}
        {data.address&&<><p style={{color:'rgba(255,255,255,.5)',fontSize:10.5,margin:'6px 0 1px',fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Address</p><p style={{color:'rgba(255,255,255,.85)',fontSize:12.5,margin:0}}>{data.address}</p></>}
        {RS(leftSecs, lmap)}
      </div>
      <div style={{flex:1,padding:'32px 26px'}}>
        <h1 style={{fontSize:33,fontWeight:700,fontFamily:'Georgia,serif',margin:'0 0 4px',color:'#1a1a1a'}}>{data.name}</h1>
        {data.title&&<h2 style={{fontSize:14.5,fontWeight:400,letterSpacing:3,color:'#555',fontFamily:'Georgia,serif',margin:'0 0 17px',textTransform:'uppercase'}}>{data.title}</h2>}
        {RS(rightSecs, rmap)}
      </div>
    </div>
  );
};
const T_Sebastian = ({data, sections}) => {
  const SH = {fontSize:14,fontWeight:800,textTransform:'uppercase',letterSpacing:1.5,color:'#222',borderBottom:'1px solid #ddd',paddingBottom:5,marginBottom:12,marginTop:20};
  const map = {
    summary: () => (<section><h4 style={SH}>About Me</h4><p style={{fontSize:13,lineHeight:1.75,color:'#333',margin:0}}>{data.summary}</p></section>),
    education: () => (<section><h4 style={SH}>Education</h4>{EDU_LEVELS.map(({key,title})=>data.education[key]?.school&&(<div key={key} style={{marginBottom:13,borderBottom:'1px solid #f0f0f0',paddingBottom:13}}><p style={{fontSize:12,color:'#888',margin:'0 0 1px'}}>{data.education[key].school} | {data.education[key].passingYear}</p><p style={{fontSize:14,fontWeight:700,color:'#222',margin:'0 0 4px'}}>{title}</p></div>))}</section>),
    experience: () => (<section><h4 style={SH}>Work Experience</h4>{data.experience.map(exp=>(<div key={exp.id} style={{marginBottom:13,borderBottom:'1px solid #f0f0f0',paddingBottom:13}}><p style={{fontSize:12,color:'#888',margin:'0 0 1px'}}>{exp.company} | {fmtRange(exp)}</p><p style={{fontSize:14,fontWeight:700,color:'#222',margin:'0 0 4px'}}>{exp.title}</p><p style={{fontSize:13,color:'#555',lineHeight:1.65,margin:0}}>{exp.duties.split('\n').filter(d=>d.trim()).join(' ')}</p></div>))}</section>),
    skills: () => (<section><h4 style={SH}>Skills</h4><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2px 16px'}}>{data.skills.split(',').map((s,i)=><p key={i} style={{fontSize:12.5,color:'#333',margin:'2px 0',display:'flex',alignItems:'center',gap:5}}><span style={{fontSize:7}}>•</span>{s.trim()}</p>)}</div></section>),
    projects: () => data.projects?.length ? (<section><h4 style={SH}>Projects</h4>{data.projects.map(p=>(<div key={p.id} style={{marginBottom:11}}><p style={{fontSize:14,fontWeight:700,color:'#222',margin:'0 0 2px'}}>{p.name}</p><p style={{fontSize:13,color:'#555'}}>{p.description}</p></div>))}</section>) : null,
    certifications: () => data.certifications?.length ? (<section><h4 style={SH}>Certifications</h4>{data.certifications.map(c=>(<div key={c.id} style={{marginBottom:8}}><p style={{fontWeight:700,fontSize:13,margin:'0 0 1px'}}>{c.name}</p><p style={{fontSize:12,color:'#888',margin:0}}>{c.issuer} {c.year&&`· ${c.year}`}</p></div>))}</section>) : null,
    languages: () => data.languages?.length ? (<section><h4 style={SH}>Languages</h4><p style={{fontSize:13,color:'#333'}}>{data.languages.map(l=>`${l.lang} (${l.level})`).join(' · ')}</p></section>) : null,
    hobbies: () => data.hobbies ? (<section><h4 style={SH}>Interests</h4><p style={{fontSize:13,color:'#333'}}>{data.hobbies}</p></section>) : null,
    references: () => data.references?.length ? (<section><h4 style={SH}>References</h4><div style={{display:'flex',gap:22,flexWrap:'wrap'}}>{data.references.map(r=>(<div key={r.id}><p style={{fontWeight:700,fontSize:14,margin:'0 0 2px'}}>{r.name}</p><p style={{fontSize:12.5,color:'#666',margin:0}}>{r.title}{r.company&&`, ${r.company}`}</p></div>))}</div></section>) : null,
  };
  return (
    <div style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',color:'#111',background:'white',minHeight:'297mm'}}>
      <div style={{padding:'27px 30px 14px'}}>
        <h1 style={{fontSize:35,fontWeight:900,textTransform:'uppercase',letterSpacing:1,margin:'0 0 4px'}}>{data.name}</h1>
        {data.title&&<p style={{fontSize:15,color:'#555',fontWeight:400,margin:'0 0 13px'}}>{data.title}</p>}
        <div style={{display:'flex',gap:22,alignItems:'center',borderTop:'1px solid #ddd',borderBottom:'1px solid #ddd',padding:'7px 0',flexWrap:'wrap'}}>
          {data.phone&&<span style={{fontSize:12.5,color:'#444'}}>📞 {data.phone}</span>}
          {data.email&&<span style={{fontSize:12.5,color:'#444'}}>✉ {data.email}</span>}
          {data.address&&<span style={{fontSize:12.5,color:'#444'}}>📍 {data.address}</span>}
          {data.linkedin&&<span style={{fontSize:12.5,color:'#444'}}>🔗 {data.linkedin}</span>}
        </div>
        {RS(sections, map)}
      </div>
      <div style={{background:'#3a3a3a',height:11,marginTop:18}}/>
    </div>
  );
};

const T_TechPro = ({data, sections}) => {
  const D='#1a2332', C='#4fc3d0';
  const leftSecs  = sections.filter(s=>s.enabled&&['skills','languages','hobbies','certifications'].includes(s.id));
  const rightSecs = sections.filter(s=>s.enabled&&['summary','experience','education','projects','references'].includes(s.id));
  const LL=({c})=><h5 style={{color:'#fff',fontSize:12.5,fontWeight:700,textTransform:'uppercase',letterSpacing:1.8,margin:'18px 0 9px',paddingBottom:3,borderBottom:'1px solid rgba(255,255,255,.18)'}}>{c}</h5>;
  const RL=({c})=><h4 style={{fontSize:15.5,fontWeight:700,textTransform:'uppercase',letterSpacing:1.8,color:'#111',borderBottom:'2px solid #eee',paddingBottom:5,margin:'20px 0 13px'}}>{c}</h4>;
  const lmap={
    skills: () => (<div><LL c="Skills"/>{data.skills.split(',').map((s,i)=><p key={i} style={{color:'rgba(255,255,255,.85)',fontSize:12.5,margin:'4px 0',display:'flex',alignItems:'center',gap:7}}><span style={{width:8,height:8,borderRadius:'50%',border:'1.5px solid rgba(255,255,255,.45)',flexShrink:0}}/>{s.trim()}</p>)}</div>),
    languages: () => data.languages?.length ? (<div><LL c="Languages"/>{data.languages.map((l,i)=><p key={i} style={{color:'rgba(255,255,255,.85)',fontSize:12.5,margin:'4px 0',display:'flex',justifyContent:'space-between'}}><span style={{display:'flex',alignItems:'center',gap:7}}><span style={{width:8,height:8,borderRadius:'50%',border:'1.5px solid rgba(255,255,255,.45)',flexShrink:0}}/>{l.lang}</span><strong style={{color:C}}>{l.level}</strong></p>)}</div>) : null,
    hobbies: () => data.hobbies ? (<div><LL c="Hobbies"/>{data.hobbies.split(',').map((h,i)=><p key={i} style={{color:'rgba(255,255,255,.85)',fontSize:12.5,margin:'4px 0',display:'flex',alignItems:'center',gap:7}}><span style={{width:8,height:8,borderRadius:'50%',border:'1.5px solid rgba(255,255,255,.45)',flexShrink:0}}/>{h.trim()}</p>)}</div>) : null,
    certifications: () => data.certifications?.length ? (<div><LL c="Certifications"/>{data.certifications.map((c,i)=><p key={i} style={{color:'rgba(255,255,255,.85)',fontSize:12,margin:'4px 0'}}>{c.name}</p>)}</div>) : null,
  };
  const rmap={
    summary: () => (<section style={{marginBottom:15}}><RL c="Profile"/><p style={{fontSize:13,lineHeight:1.75,color:'#444',textAlign:'justify',margin:0}}>{data.summary}</p></section>),
    experience: () => (<section style={{marginBottom:15}}><RL c="Work Experience"/>{data.experience.map(exp=>(<div key={exp.id} style={{marginBottom:15}}><p style={{fontWeight:700,fontSize:14,margin:'0 0 2px'}}>{exp.title}</p><p style={{fontSize:12.5,color:'#666',margin:'0 0 5px'}}>{exp.company} — {fmtRange(exp)}</p><ul style={{margin:0,paddingLeft:19}}>{exp.duties.split('\n').filter(d=>d.trim()).map((d,i)=><li key={i} style={{fontSize:12.5,color:'#333',marginBottom:3,lineHeight:1.6}}>{d.trim()}</li>)}</ul></div>))}</section>),
    education: () => (<section style={{marginBottom:15}}><RL c="Education"/>{EDU_LEVELS.map(({key,title})=>data.education[key]?.school&&(<div key={key} style={{marginBottom:13}}><p style={{fontWeight:700,fontSize:14,margin:'0 0 2px'}}>{title}</p><p style={{fontSize:12,color:'#777',margin:'0 0 1px'}}>{data.education[key].passingYear}</p><p style={{fontSize:12.5,fontStyle:'italic',color:'#555',margin:0}}>{data.education[key].school}</p></div>))}</section>),
    projects: () => data.projects?.length ? (<section><RL c="Projects"/>{data.projects.map(p=>(<div key={p.id} style={{marginBottom:11}}><p style={{fontWeight:700,fontSize:14,margin:'0 0 2px'}}>{p.name}</p>{p.technologies&&<p style={{fontSize:12,color:'#888',margin:'0 0 3px'}}>{p.technologies}</p>}<p style={{fontSize:12.5,color:'#444',lineHeight:1.6}}>{p.description}</p></div>))}</section>) : null,
    references: () => data.references?.length ? (<section><RL c="References"/><div style={{display:'flex',gap:18,flexWrap:'wrap'}}>{data.references.map(r=>(<div key={r.id}><p style={{fontWeight:700,fontSize:14,margin:'0 0 2px'}}>{r.name}</p><p style={{fontSize:12,color:'#666',margin:0}}>{r.title}{r.company&&`, ${r.company}`}</p></div>))}</div></section>) : null,
  };
  return (
    <div style={{display:'flex',fontFamily:'Arial,sans-serif',minHeight:'297mm',background:'white'}}>
      <div style={{width:'33%',background:D,padding:'26px 17px',color:'white'}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:18}}>
          <Photo src={data.photo} name={data.name} size={115} bg='#2d4060'/>
          <h2 style={{color:'white',fontSize:21,fontWeight:700,margin:'13px 0 3px',textAlign:'center'}}>{data.name}</h2>
          {data.title&&<p style={{color:C,fontSize:12.5,textAlign:'center',margin:0}}>{data.title}</p>}
        </div>
        <LL c="Contact"/>
        {data.phone&&<p style={{color:'rgba(255,255,255,.85)',fontSize:12.5,margin:'4px 0'}}>📞 {data.phone}</p>}
        {data.email&&<p style={{color:'rgba(255,255,255,.85)',fontSize:12.5,margin:'4px 0',wordBreak:'break-all'}}>✉ {data.email}</p>}
        {data.address&&<p style={{color:'rgba(255,255,255,.85)',fontSize:12.5,margin:'4px 0'}}>📍 {data.address}</p>}
        {RS(leftSecs, lmap)}
      </div>
      <div style={{flex:1,padding:'26px 22px'}}>{RS(rightSecs, rmap)}</div>
    </div>
  );
};


const T_Joshua = ({data, sections}) => {
  const Y='#f5a623';
  const IB=({e})=><div style={{width:42,height:42,borderRadius:'50%',background:Y,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,flexShrink:0}}>{e}</div>;
  const GC=({title,emoji,content})=>(<div style={{flex:'1 1 45%',padding:'14px',background:'white',borderRadius:6,boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}><div style={{display:'flex',alignItems:'center',gap:11,marginBottom:11}}><IB e={emoji}/><h4 style={{fontSize:15.5,fontWeight:700,color:'#222',margin:0,lineHeight:1.3}}>{title}</h4></div>{content}</div>);
  return (
    <div style={{fontFamily:'Arial,sans-serif',background:'#f4f4f4',minHeight:'297mm'}}>
      <div style={{background:'white',position:'relative',padding:'26px 30px 0',overflow:'hidden',borderRadius:'0 0 20px 20px'}}>
        <div style={{position:'absolute',right:28,top:-38,width:250,height:250,borderRadius:'50%',background:Y,zIndex:0}}/>
        <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'flex-start',gap:22,paddingBottom:22}}>
          <div style={{flex:1}}>
            <h1 style={{fontSize:34,fontWeight:700,color:'#222',lineHeight:1.12,margin:'0 0 10px'}}>{data.name}</h1>
            <div style={{display:'inline-block',background:Y,padding:'3px 13px',borderRadius:2,marginBottom:11}}>
              <p style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:'uppercase',color:'#333',margin:0}}>{data.title||'Professional'}</p>
            </div>
            {data.summary&&<p style={{fontSize:12.5,color:'#666',lineHeight:1.6,marginTop:9,maxWidth:280}}>{data.summary.substring(0,160)}{data.summary.length>160?'...':''}</p>}
          </div>
          <div style={{position:'relative',zIndex:2,marginRight:14,marginTop:8}}><Photo src={data.photo} name={data.name} size={130} bg='#ccc' border='none' radius='50%'/></div>
        </div>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:11,padding:'14px 22px 0'}}>
        <GC title="Education & Experience" emoji="🎓" content={<div>{data.experience.slice(0,3).map((exp,i)=><p key={exp.id} style={{fontSize:12.5,color:'#333',margin:'0 0 4px'}}><strong>{i+1}.</strong> {exp.title} at {exp.company}</p>)}{EDU_LEVELS.map(({key,title})=>data.education[key]?.school&&<p key={key} style={{fontSize:12.5,color:'#333',margin:'0 0 3px',paddingLeft:8}}>• {data.education[key].school}</p>)}</div>}/>
        <GC title="Working Approach" emoji="💼" content={<p style={{fontSize:12.5,color:'#555',lineHeight:1.7}}>{data.summary}</p>}/>
        <GC title="Achievements" emoji="🏆" content={<div>{data.projects?.length ? data.projects.map(p=><p key={p.id} style={{fontSize:12.5,color:'#555',margin:'0 0 5px'}}>· {p.name}: {p.description?.substring(0,80)}</p>) : data.skills.split(',').slice(0,4).map((s,i)=><p key={i} style={{fontSize:12.5,color:'#555',margin:'0 0 3px'}}>· Expert in {s.trim()}</p>)}</div>}/>
        <GC title="Outside the Office" emoji="😊" content={<div><p style={{fontSize:12.5,color:'#555',lineHeight:1.7}}>{data.hobbies||'Enjoys traveling, reading, spending time with family.'}</p>{data.languages?.map(l=><p key={l.id||l.lang} style={{fontSize:12,color:'#888',fontStyle:'italic',margin:'3px 0'}}>{l.lang} · {l.level}</p>)}</div>}/>
      </div>
      <div style={{display:'flex',gap:22,padding:'14px 26px',marginTop:8,borderTop:'1px solid #ddd',background:'white',flexWrap:'wrap'}}>
        {data.email&&<span style={{fontSize:12,color:'#555'}}>✉ {data.email}</span>}
        {data.phone&&<span style={{fontSize:12,color:'#555'}}>📞 {data.phone}</span>}
        {data.linkedin&&<span style={{fontSize:12,color:'#555'}}>🔗 {data.linkedin}</span>}
      </div>
    </div>
  );
};

const T_Kai = ({data, sections}) => {
  const SH={fontSize:13,fontWeight:700,textTransform:'uppercase',letterSpacing:1.5,color:'#111',borderBottom:'2px solid #111',paddingBottom:5,marginBottom:9,marginTop:17};
  const leftSecs  = sections.filter(s=>s.enabled&&['summary','experience','projects'].includes(s.id));
  const rightSecs = sections.filter(s=>s.enabled&&['education','skills','hobbies','languages','certifications','references'].includes(s.id));
  const lmap={
    summary: () => (<section><h4 style={SH}>Profile</h4><p style={{fontSize:12.5,lineHeight:1.7,color:'#333'}}>{data.summary}</p></section>),
    experience: () => (<section><h4 style={SH}>Work Experience</h4>{data.experience.map(exp=>(<div key={exp.id} style={{marginBottom:13}}><p style={{fontSize:12,color:'#888',margin:'0 0 1px',textTransform:'uppercase',letterSpacing:.5}}>{exp.company}, {exp.title}</p><p style={{fontSize:11.5,color:'#999',margin:'0 0 4px'}}>{fmtRange(exp)}</p><p style={{fontSize:12.5,color:'#333',lineHeight:1.65}}>{exp.duties.split('\n').filter(d=>d.trim()).join(' ')}</p></div>))}</section>),
    projects: () => data.projects?.length ? (<section><h4 style={SH}>Projects</h4>{data.projects.map(p=>(<div key={p.id} style={{marginBottom:9}}><p style={{fontWeight:700,fontSize:13,margin:'0 0 2px'}}>{p.name}</p><p style={{fontSize:12.5,color:'#444'}}>{p.description}</p></div>))}</section>) : null,
  };
  const rmap={
    education: () => (<section><h4 style={SH}>Education</h4>{EDU_LEVELS.map(({key,title})=>data.education[key]?.school&&(<div key={key} style={{marginBottom:11}}><p style={{fontSize:11,color:'#888',textTransform:'uppercase',letterSpacing:.5,margin:'0 0 1px'}}>{data.education[key].school}</p><p style={{fontSize:11,color:'#888',margin:'0 0 1px'}}>{data.education[key].passingYear}</p><p style={{fontWeight:700,fontSize:13,margin:0}}>{title}</p></div>))}</section>),
    skills: () => (<section><h4 style={SH}>Skills</h4>{data.skills.split(',').map((s,i)=><p key={i} style={{fontSize:12.5,color:'#333',margin:'3px 0'}}>{s.trim()}</p>)}</section>),
    hobbies: () => data.hobbies ? (<section><h4 style={SH}>Hobbies</h4>{data.hobbies.split(',').map((h,i)=><p key={i} style={{fontSize:12.5,color:'#333',margin:'3px 0'}}>{h.trim()}</p>)}</section>) : null,
    languages: () => data.languages?.length ? (<section><h4 style={SH}>Languages</h4>{data.languages.map(l=><p key={l.id||l.lang} style={{fontSize:12.5,color:'#333',margin:'3px 0'}}>{l.lang} — {l.level}</p>)}</section>) : null,
    certifications: () => data.certifications?.length ? (<section><h4 style={SH}>Certifications</h4>{data.certifications.map(c=><p key={c.id} style={{fontSize:12.5,color:'#333',margin:'3px 0'}}>{c.name}</p>)}</section>) : null,
    references: () => data.references?.length ? (<section><h4 style={SH}>References</h4>{data.references.map(r=><div key={r.id} style={{marginBottom:7}}><p style={{fontWeight:700,fontSize:13,margin:0}}>{r.name}</p><p style={{fontSize:12,color:'#666',margin:0}}>{r.title}{r.company&&`, ${r.company}`}</p></div>)}</section>) : null,
  };
  const XP=()=>(<div style={{position:'absolute',right:0,top:0,width:155,height:88,overflow:'hidden',opacity:.65}}>{[[-20,0],[30,0],[80,0],[130,0],[-20,28],[30,28],[80,28],[130,28]].map(([x,y],i)=>(<div key={i} style={{position:'absolute',left:x,top:y,width:38,height:38,transform:'rotate(45deg)',border:'4px solid rgba(255,255,255,.32)'}}/>))}</div>);
  return (
    <div style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',background:'white',minHeight:'297mm'}}>
      <div style={{background:'#111',padding:'19px 22px',position:'relative',overflow:'hidden'}}>
        <XP/>
        <h1 style={{color:'white',fontSize:25,fontWeight:900,textTransform:'uppercase',letterSpacing:2,margin:'0 0 2px',position:'relative',zIndex:1}}>{data.name}</h1>
        {data.title&&<p style={{color:'rgba(255,255,255,.8)',fontSize:13,textTransform:'uppercase',letterSpacing:2,margin:0,position:'relative',zIndex:1}}>{data.title}</p>}
        <div style={{marginTop:13,position:'relative',zIndex:1,display:'flex',gap:18,flexWrap:'wrap'}}>
          {data.phone&&<span style={{color:'rgba(255,255,255,.85)',fontSize:12}}>PHONE: {data.phone}</span>}
          {data.linkedin&&<span style={{color:'rgba(255,255,255,.85)',fontSize:12}}>WEBSITE: {data.linkedin}</span>}
          {data.email&&<span style={{color:'rgba(255,255,255,.85)',fontSize:12}}>EMAIL: {data.email}</span>}
        </div>
      </div>
      <div style={{display:'flex'}}>
        <div style={{flex:1,padding:'7px 19px',borderRight:'1px solid #e8e8e8'}}>{RS(leftSecs,lmap)}</div>
        <div style={{width:'38%',padding:'7px 19px'}}>{RS(rightSecs,rmap)}</div>
      </div>
    </div>
  );
};

const T_Isabelle = ({data, sections}) => {
  const T='#2e6b7d';
  const SH={fontSize:10.5,fontWeight:700,textTransform:'uppercase',letterSpacing:1.5,color:T,margin:'13px 0 5px',paddingBottom:3,borderBottom:`1px solid ${T}`};
  const leftSecs  = sections.filter(s=>s.enabled&&['summary','experience','projects'].includes(s.id));
  const rightSecs = sections.filter(s=>s.enabled&&['education','certifications','skills','languages','hobbies','references'].includes(s.id));
  const lmap={
    summary: () => (<section><h4 style={SH}>Profile</h4><p style={{fontSize:12,lineHeight:1.65,color:'#444',margin:0}}>{data.summary}</p></section>),
    experience: () => (<section><h4 style={SH}>Professional Experience</h4>{data.experience.map(exp=>(<div key={exp.id} style={{marginBottom:11}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}><p style={{fontWeight:700,fontSize:12.5,margin:0,color:'#222'}}>{exp.title}</p><span style={{fontSize:10.5,color:'#888'}}>{fmtRange(exp)}</span></div><p style={{fontSize:11.5,color:'#666',margin:'1px 0 4px',fontStyle:'italic'}}>{exp.company}</p><ul style={{margin:0,paddingLeft:15}}>{exp.duties.split('\n').filter(d=>d.trim()).map((d,i)=><li key={i} style={{fontSize:11.5,color:'#444',marginBottom:2,lineHeight:1.55}}>{d.trim()}</li>)}</ul></div>))}</section>),
    projects: () => data.projects?.length ? (<section><h4 style={SH}>Projects</h4>{data.projects.map(p=>(<div key={p.id} style={{marginBottom:9}}><p style={{fontWeight:700,fontSize:12.5,margin:0}}>{p.name}</p><p style={{fontSize:11.5,color:'#555',marginTop:3}}>{p.description}</p></div>))}</section>) : null,
  };
  const rmap={
    education: () => (<section><h4 style={SH}>Education</h4>{EDU_LEVELS.map(({key,title})=>data.education[key]?.school&&(<div key={key} style={{marginBottom:7}}><p style={{fontWeight:700,fontSize:12,margin:'0 0 1px'}}>{data.education[key].school}</p><p style={{fontSize:11,color:'#666',margin:0}}>{title} · {data.education[key].passingYear}</p></div>))}</section>),
    certifications: () => data.certifications?.length ? (<section><h4 style={SH}>Certifications</h4>{data.certifications.map(c=>(<p key={c.id} style={{fontSize:12,color:'#333',margin:'0 0 4px'}}><strong>{c.name}</strong><br/><span style={{fontSize:11,color:'#888'}}>{c.issuer} {c.year&&`· ${c.year}`}</span></p>))}</section>) : null,
    skills: () => (<section><h4 style={SH}>Technical Skills</h4><div style={{display:'flex',flexWrap:'wrap',gap:4}}>{data.skills.split(',').map((s,i)=><span key={i} style={{fontSize:10.5,padding:'3px 8px',border:`1px solid ${T}`,borderRadius:3,color:T,background:`${T}11`}}>{s.trim()}</span>)}</div></section>),
    languages: () => data.languages?.length ? (<section><h4 style={SH}>Languages</h4>{data.languages.map(l=><p key={l.id||l.lang} style={{fontSize:12,color:'#333',margin:'2px 0'}}>{l.lang} — {l.level}</p>)}</section>) : null,
    hobbies: () => data.hobbies ? (<section><h4 style={SH}>Interests</h4><p style={{fontSize:12,color:'#555'}}>{data.hobbies}</p></section>) : null,
    references: () => data.references?.length ? (<section><h4 style={SH}>References</h4>{data.references.map(r=><div key={r.id} style={{marginBottom:5}}><p style={{fontWeight:700,fontSize:12,margin:0}}>{r.name}</p><p style={{fontSize:11,color:'#666',margin:0}}>{r.title}{r.company&&`, ${r.company}`}</p></div>)}</section>) : null,
  };
  return (
    <div style={{fontFamily:'Arial,sans-serif',background:'white',minHeight:'297mm'}}>
      <div style={{background:T,padding:'17px 21px'}}>
        <h1 style={{color:'white',fontSize:21,fontWeight:700,margin:'0 0 2px',textTransform:'uppercase',letterSpacing:2}}>{data.name}</h1>
        {data.title&&<p style={{color:'rgba(255,255,255,.8)',fontSize:12,margin:'0 0 7px',textTransform:'uppercase',letterSpacing:1.5}}>{data.title}</p>}
        <div style={{display:'flex',gap:15,flexWrap:'wrap'}}>
          {data.email&&<span style={{fontSize:11,color:'rgba(255,255,255,.8)'}}>✉ {data.email}</span>}
          {data.phone&&<span style={{fontSize:11,color:'rgba(255,255,255,.8)'}}>📞 {data.phone}</span>}
          {data.address&&<span style={{fontSize:11,color:'rgba(255,255,255,.8)'}}>📍 {data.address}</span>}
        </div>
      </div>
      <div style={{display:'flex'}}>
        <div style={{flex:'1 1 60%',padding:'9px 17px',borderRight:'1px solid #eee'}}>{RS(leftSecs,lmap)}</div>
        <div style={{flex:'1 1 38%',padding:'9px 17px'}}>{RS(rightSecs,rmap)}</div>
      </div>
    </div>
  );
};

const T_Lauren = ({data, sections}) => {
  const T='#1e4e5f', G='#c9a84c';
  const leftSecs  = sections.filter(s=>s.enabled&&['education','skills','languages','hobbies','certifications'].includes(s.id));
  const rightSecs = sections.filter(s=>s.enabled&&['summary','experience','projects','references'].includes(s.id));
  const SL={color:'rgba(255,255,255,.55)',fontSize:10,textTransform:'uppercase',letterSpacing:2,fontWeight:700,margin:'15px 0 7px',borderBottom:'1px solid rgba(255,255,255,.18)',paddingBottom:3};
  const SR={fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:1.5,color:T,borderBottom:`1px solid ${T}`,paddingBottom:3,margin:'17px 0 9px'};
  const SBar=({name,pct=75})=>(<div style={{marginBottom:6}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}><p style={{color:'rgba(255,255,255,.85)',fontSize:11.5,margin:0}}>{name}</p><p style={{color:G,fontSize:11,margin:0}}>{pct}%</p></div><div style={{height:4,background:'rgba(255,255,255,.15)',borderRadius:2}}><div style={{width:`${pct}%`,height:'100%',background:G,borderRadius:2}}/></div></div>);
  const lmap={
    education: () => (<div><p style={SL}>Education</p>{EDU_LEVELS.map(({key,title})=>data.education[key]?.school&&(<div key={key} style={{marginBottom:9}}><p style={{color:'rgba(255,255,255,.85)',fontSize:12,fontWeight:700,margin:'0 0 1px'}}>{data.education[key].school}</p><p style={{color:'rgba(255,255,255,.6)',fontSize:11,margin:'0 0 1px'}}>{title}</p><p style={{color:'rgba(255,255,255,.45)',fontSize:10.5,margin:0}}>{data.education[key].passingYear}</p></div>))}</div>),
    skills: () => (<div><p style={SL}>Relevant Skills</p>{data.skills.split(',').map((s,i)=><SBar key={i} name={s.trim()} pct={60+((i*17)%35)}/>)}</div>),
    languages: () => data.languages?.length ? (<div><p style={SL}>Languages</p>{data.languages.map(l=>(<div key={l.id||l.lang} style={{marginBottom:3}}><p style={{color:'rgba(255,255,255,.85)',fontSize:12,margin:0}}>{l.lang}</p></div>))}</div>) : null,
    hobbies: () => data.hobbies ? (<div><p style={SL}>Interests</p><p style={{color:'rgba(255,255,255,.7)',fontSize:12}}>{data.hobbies}</p></div>) : null,
    certifications: () => data.certifications?.length ? (<div><p style={SL}>Certifications</p>{data.certifications.map(c=><p key={c.id} style={{color:'rgba(255,255,255,.85)',fontSize:11.5,margin:'2px 0'}}>{c.name}</p>)}</div>) : null,
  };
  const rmap={
    summary: () => (<section><h4 style={SR}>Summary</h4><p style={{fontSize:12.5,lineHeight:1.7,color:'#444'}}>{data.summary}</p></section>),
    experience: () => (<section><h4 style={SR}>Professional Experience</h4>{data.experience.map(exp=>(<div key={exp.id} style={{marginBottom:13}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}><p style={{fontWeight:700,fontSize:13,color:'#222',margin:0}}>{exp.title}</p><span style={{fontSize:11,color:'#888'}}>{fmtRange(exp)}</span></div><p style={{fontSize:12,color:T,margin:'2px 0 5px'}}>{exp.company}</p><ul style={{margin:0,paddingLeft:15}}>{exp.duties.split('\n').filter(d=>d.trim()).map((d,i)=><li key={i} style={{fontSize:12,color:'#444',marginBottom:3,lineHeight:1.6}}>{d.trim()}</li>)}</ul></div>))}</section>),
    projects: () => data.projects?.length ? (<section><h4 style={SR}>Projects</h4>{data.projects.map(p=>(<div key={p.id} style={{marginBottom:9}}><p style={{fontWeight:700,fontSize:13,margin:'0 0 2px'}}>{p.name}</p><p style={{fontSize:12,color:'#555'}}>{p.description}</p></div>))}</section>) : null,
    references: () => data.references?.length ? (<section><h4 style={SR}>References</h4><div style={{display:'flex',gap:15,flexWrap:'wrap'}}>{data.references.map(r=>(<div key={r.id}><p style={{fontWeight:700,fontSize:13,margin:'0 0 2px'}}>{r.name}</p><p style={{fontSize:11.5,color:'#666',margin:0}}>{r.title}{r.company&&`, ${r.company}`}</p></div>))}</div></section>) : null,
  };
  return (
    <div style={{fontFamily:'Arial,sans-serif',background:'white',minHeight:'297mm'}}>
      <div style={{background:T,padding:'19px 22px',display:'flex',alignItems:'center',gap:17}}>
        <Photo src={data.photo} name={data.name} size={78} bg='#3a7080' border='3px solid rgba(255,255,255,.38)'/>
        <div>
          <h1 style={{color:'white',fontSize:23,fontWeight:700,textTransform:'uppercase',letterSpacing:2,margin:'0 0 3px'}}>{data.name}</h1>
          {data.title&&<p style={{color:G,fontSize:12,textTransform:'uppercase',letterSpacing:2,margin:'0 0 7px'}}>{data.title}</p>}
          <div style={{display:'flex',gap:13,flexWrap:'wrap'}}>
            {data.email&&<span style={{color:'rgba(255,255,255,.75)',fontSize:11}}>✉ {data.email}</span>}
            {data.phone&&<span style={{color:'rgba(255,255,255,.75)',fontSize:11}}>📞 {data.phone}</span>}
          </div>
        </div>
      </div>
      <div style={{display:'flex'}}>
        <div style={{width:'35%',background:'#f0f4f6',padding:'14px 17px'}}>{RS(leftSecs,lmap)}</div>
        <div style={{flex:1,padding:'11px 19px'}}>{RS(rightSecs,rmap)}</div>
      </div>
    </div>
  );
};

const T_John = ({data, sections}) => {
  const B='#1565c0', LB='#1e88e5';
  const leftSecs  = sections.filter(s=>s.enabled&&['skills','languages','certifications','hobbies'].includes(s.id));
  const rightSecs = sections.filter(s=>s.enabled&&['summary','experience','education','projects','references'].includes(s.id));
  const SL={color:'white',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1.5,margin:'15px 0 7px',paddingBottom:3,borderBottom:'1px solid rgba(255,255,255,.28)'};
  const SR={fontSize:13,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:B,margin:'15px 0 9px',paddingBottom:3,borderBottom:`2px solid ${B}`};
  const lmap={
    skills: () => (<div><p style={SL}>Skills</p>{data.skills.split(',').map((s,i)=><p key={i} style={{color:'rgba(255,255,255,.85)',fontSize:12,margin:'3px 0',display:'flex',alignItems:'center',gap:6}}><span style={{width:5,height:5,borderRadius:'50%',background:'rgba(255,255,255,.45)',flexShrink:0}}/>{s.trim()}</p>)}</div>),
    languages: () => data.languages?.length ? (<div><p style={SL}>Language</p>{data.languages.map(l=>(<div key={l.id||l.lang} style={{marginBottom:7}}><p style={{color:'rgba(255,255,255,.85)',fontSize:12,margin:'0 0 2px',fontWeight:700}}>{l.lang}</p><p style={{color:'rgba(255,255,255,.55)',fontSize:11,margin:0}}>{l.level}</p></div>))}</div>) : null,
    certifications: () => data.certifications?.length ? (<div><p style={SL}>Certifications</p>{data.certifications.map(c=><p key={c.id} style={{color:'rgba(255,255,255,.85)',fontSize:11.5,margin:'3px 0'}}>{c.name}</p>)}</div>) : null,
    hobbies: () => data.hobbies ? (<div><p style={SL}>Hobbies</p><p style={{color:'rgba(255,255,255,.8)',fontSize:12}}>{data.hobbies}</p></div>) : null,
  };
  const rmap={
    summary: () => (<section><h4 style={SR}>About Me</h4><p style={{fontSize:12.5,lineHeight:1.7,color:'#444'}}>{data.summary}</p></section>),
    experience: () => (<section><h4 style={SR}>Experience</h4>{data.experience.map(exp=>(<div key={exp.id} style={{marginBottom:13,background:'#f8f8f8',borderRadius:6,padding:'9px 11px',borderLeft:`3px solid ${B}`}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}><p style={{fontWeight:700,fontSize:13,color:'#222',margin:'0 0 1px'}}>{exp.company}</p><span style={{fontSize:11,color:'#888'}}>{fmtRange(exp)}</span></div><p style={{fontSize:12,color:LB,margin:'0 0 4px'}}>{exp.title}</p><p style={{fontSize:12,color:'#444',lineHeight:1.6}}>{exp.duties.split('\n').filter(d=>d.trim()).join(' ')}</p></div>))}</section>),
    education: () => (<section><h4 style={SR}>Education</h4>{EDU_LEVELS.map(({key,title})=>data.education[key]?.school&&(<div key={key} style={{marginBottom:9,background:'#f8f8f8',borderRadius:6,padding:'7px 11px'}}><div style={{display:'flex',justifyContent:'space-between'}}><p style={{fontWeight:700,fontSize:13,color:'#222',margin:0}}>{title}</p><span style={{fontSize:11,color:'#888'}}>{data.education[key].passingYear}</span></div><p style={{fontSize:12,color:'#888',margin:'2px 0 0',fontStyle:'italic'}}>{data.education[key].school}</p></div>))}</section>),
    projects: () => data.projects?.length ? (<section><h4 style={SR}>Projects</h4>{data.projects.map(p=>(<div key={p.id} style={{marginBottom:9,background:'#f8f8f8',borderRadius:6,padding:'7px 11px'}}><p style={{fontWeight:700,fontSize:13,color:'#222',margin:'0 0 2px'}}>{p.name}</p>{p.technologies&&<p style={{fontSize:11.5,color:LB,margin:'0 0 3px'}}>{p.technologies}</p>}<p style={{fontSize:12,color:'#555'}}>{p.description}</p></div>))}</section>) : null,
    references: () => data.references?.length ? (<section><h4 style={SR}>References</h4><div style={{display:'flex',gap:13,flexWrap:'wrap'}}>{data.references.map(r=>(<div key={r.id} style={{background:'#f8f8f8',padding:'7px 11px',borderRadius:6}}><p style={{fontWeight:700,fontSize:13,margin:0}}>{r.name}</p><p style={{fontSize:11.5,color:'#666',margin:0}}>{r.title}{r.company&&`, ${r.company}`}</p></div>))}</div></section>) : null,
  };
  return (
    <div style={{fontFamily:'Arial,sans-serif',background:'white',minHeight:'297mm'}}>
      <div style={{background:`linear-gradient(135deg,${B} 60%,${LB} 100%)`,position:'relative',overflow:'hidden',minHeight:95}}>
        <div style={{position:'absolute',bottom:-18,right:0,width:'55%',height:115,background:'linear-gradient(135deg,transparent 40%,rgba(255,255,255,.13) 100%)',transform:'skewX(-8deg)'}}/>
        <div style={{display:'flex',alignItems:'center',gap:19,padding:'19px 22px',position:'relative',zIndex:1}}>
          <Photo src={data.photo} name={data.name} size={87} bg='rgba(255,255,255,.28)' border='3px solid rgba(255,255,255,.48)'/>
          <div>
            <h1 style={{color:'white',fontSize:25,fontWeight:700,margin:'0 0 2px',letterSpacing:1}}>{data.name}</h1>
            {data.title&&<p style={{color:'rgba(255,255,255,.85)',fontSize:13,margin:'0 0 7px',textTransform:'uppercase',letterSpacing:1.5}}>{data.title}</p>}
          </div>
        </div>
      </div>
      <div style={{display:'flex'}}>
        <div style={{width:'30%',background:'#1e3a5f',padding:'15px',minHeight:450}}>
          <p style={SL}>Contact</p>
          {data.phone&&<p style={{color:'rgba(255,255,255,.85)',fontSize:12,margin:'3px 0'}}>📞 {data.phone}</p>}
          {data.email&&<p style={{color:'rgba(255,255,255,.85)',fontSize:12,margin:'3px 0',wordBreak:'break-all'}}>✉ {data.email}</p>}
          {data.address&&<p style={{color:'rgba(255,255,255,.85)',fontSize:12,margin:'3px 0'}}>📍 {data.address}</p>}
          {RS(leftSecs,lmap)}
        </div>
        <div style={{flex:1,padding:'11px 19px'}}>{RS(rightSecs,rmap)}</div>
      </div>
    </div>
  );
};

const T_Sarah = ({data, sections}) => {
  const G='#4a7c59';
  const leftSecs  = sections.filter(s=>s.enabled&&['experience','projects'].includes(s.id));
  const rightSecs = sections.filter(s=>s.enabled&&['education','certifications','skills','languages','hobbies','references'].includes(s.id));
  const SH={fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1.5,color:G,borderBottom:`1px solid ${G}`,paddingBottom:3,margin:'15px 0 9px'};
  const SB=({name,pct})=>(<div style={{marginBottom:5}}><p style={{fontSize:11.5,margin:'0 0 2px',color:'#333'}}>{name}</p><div style={{height:5,background:'#e8e8e8',borderRadius:3}}><div style={{width:`${pct}%`,height:'100%',background:G,borderRadius:3}}/></div></div>);
  const lmap={
    experience: () => (<section><h4 style={SH}>Professional Experience</h4>{data.experience.map(exp=>(<div key={exp.id} style={{marginBottom:13}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',borderBottom:'1px dashed #ddd',paddingBottom:3}}><p style={{fontWeight:700,fontSize:12.5,margin:0,color:'#222'}}>{exp.title}</p><span style={{fontSize:10.5,color:'#888'}}>{fmtRange(exp)}</span></div><p style={{fontSize:11.5,color:G,margin:'2px 0 4px'}}>{exp.company}</p><ul style={{margin:0,paddingLeft:14}}>{exp.duties.split('\n').filter(d=>d.trim()).map((d,i)=><li key={i} style={{fontSize:11.5,color:'#444',marginBottom:2,lineHeight:1.55}}>{d.trim()}</li>)}</ul></div>))}</section>),
    projects: () => data.projects?.length ? (<section><h4 style={SH}>Projects</h4>{data.projects.map(p=>(<div key={p.id} style={{marginBottom:9}}><p style={{fontWeight:700,fontSize:12.5,margin:'0 0 1px'}}>{p.name}</p><p style={{fontSize:11.5,color:'#555',lineHeight:1.55}}>{p.description}</p></div>))}</section>) : null,
  };
  const rmap={
    education: () => (<section><h4 style={SH}>Education</h4>{EDU_LEVELS.map(({key,title})=>data.education[key]?.school&&(<div key={key} style={{marginBottom:9}}><p style={{fontWeight:700,fontSize:12,margin:'0 0 1px'}}>{data.education[key].school}</p><p style={{fontSize:11,color:'#666',margin:'0 0 1px'}}>{title}</p><p style={{fontSize:11,color:'#999',margin:0}}>{data.education[key].passingYear}</p></div>))}</section>),
    certifications: () => data.certifications?.length ? (<section><h4 style={SH}>Certifications</h4>{data.certifications.map(c=><p key={c.id} style={{fontSize:12,color:'#333',margin:'0 0 3px'}}><strong>{c.name}</strong> — {c.issuer}</p>)}</section>) : null,
    skills: () => (<section><h4 style={SH}>Key Skills</h4>{data.skills.split(',').map((s,i)=><SB key={i} name={s.trim()} pct={60+((i*13)%38)}/>)}</section>),
    languages: () => data.languages?.length ? (<section><h4 style={SH}>Languages</h4>{data.languages.map(l=><p key={l.id||l.lang} style={{fontSize:12,color:'#333',margin:'2px 0'}}>{l.lang} — {l.level}</p>)}</section>) : null,
    hobbies: () => data.hobbies ? (<section><h4 style={SH}>Interests</h4><p style={{fontSize:12,color:'#555'}}>{data.hobbies}</p></section>) : null,
    references: () => data.references?.length ? (<section><h4 style={SH}>References</h4>{data.references.map(r=><div key={r.id} style={{marginBottom:5}}><p style={{fontWeight:700,fontSize:12.5,margin:0}}>{r.name}</p><p style={{fontSize:11.5,color:'#666',margin:0}}>{r.company}</p></div>)}</section>) : null,
  };
  return (
    <div style={{fontFamily:'Georgia,serif',background:'white',minHeight:'297mm',padding:'19px 22px'}}>
      <div style={{textAlign:'center',borderBottom:`2px solid ${G}`,paddingBottom:11,marginBottom:3}}>
        <h1 style={{fontSize:27,fontWeight:700,color:'#222',margin:'0 0 4px',letterSpacing:1}}>{data.name}</h1>
        {data.title&&<p style={{fontSize:14,color:G,margin:'0 0 7px',fontStyle:'italic'}}>{data.title}</p>}
        <div style={{display:'flex',justifyContent:'center',gap:15,flexWrap:'wrap',fontSize:12,color:'#666'}}>
          {data.phone&&<span>{data.phone}</span>}{data.email&&<span>{data.email}</span>}{data.address&&<span>{data.address}</span>}
        </div>
      </div>
      {data.summary&&<p style={{fontSize:13,lineHeight:1.7,color:'#444',textAlign:'center',padding:'9px 18px',fontStyle:'italic'}}>{data.summary}</p>}
      <div style={{display:'flex',gap:22,marginTop:7}}>
        <div style={{flex:'1 1 58%',borderRight:`1px solid #e0e0e0`,paddingRight:19}}>{RS(leftSecs,lmap)}</div>
        <div style={{flex:'1 1 38%'}}>{RS(rightSecs,rmap)}</div>
      </div>
    </div>
  );
};

const T_Keith = ({data, sections}) => {
  const SH={fontSize:14,fontWeight:700,color:'#222',borderBottom:'1px solid #e0e0e0',paddingBottom:5,marginBottom:11,marginTop:19};
  const map={
    summary: () => (<section><h4 style={SH}>Profile</h4><p style={{fontSize:13,lineHeight:1.8,color:'#333'}}>{data.summary}</p></section>),
    skills: () => (<section><h4 style={SH}>Top Skills</h4><div style={{display:'flex',flexWrap:'wrap',gap:8}}>{data.skills.split(',').map((s,i)=><span key={i} style={{border:'1px solid #c0c0c0',padding:'4px 13px',borderRadius:20,fontSize:12.5,color:'#333',background:'#f9f9f9'}}>{s.trim()}</span>)}</div></section>),
    experience: () => (<section><h4 style={SH}>Work Experience</h4>{data.experience.map(exp=>(<div key={exp.id} style={{marginBottom:17}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}><div><p style={{fontSize:13,color:'#888',margin:'0 0 1px'}}>{exp.company}</p><p style={{fontWeight:700,fontSize:14,color:'#222',margin:0}}>{exp.title}</p></div><span style={{fontSize:11.5,color:'#999',whiteSpace:'nowrap',marginLeft:11}}>{fmtRange(exp)}</span></div><p style={{fontSize:13,color:'#555',lineHeight:1.75,margin:0}}>{exp.duties.split('\n').filter(d=>d.trim()).join(' ')}</p></div>))}</section>),
    education: () => (<section><h4 style={SH}>Education</h4>{EDU_LEVELS.map(({key,title})=>data.education[key]?.school&&(<div key={key} style={{marginBottom:9}}><p style={{fontSize:13,color:'#888',margin:'0 0 1px'}}>{data.education[key].school}</p><p style={{fontWeight:700,fontSize:13.5,color:'#222',margin:'0 0 1px'}}>{title}</p><p style={{fontSize:12,color:'#999',margin:0}}>{data.education[key].passingYear}</p></div>))}</section>),
    projects: () => data.projects?.length ? (<section><h4 style={SH}>Projects</h4>{data.projects.map(p=>(<div key={p.id} style={{marginBottom:13}}><p style={{fontWeight:700,fontSize:14,color:'#222',margin:'0 0 2px'}}>{p.name}</p><p style={{fontSize:13,color:'#555',lineHeight:1.7}}>{p.description}</p></div>))}</section>) : null,
    certifications: () => data.certifications?.length ? (<section><h4 style={SH}>Certifications</h4>{data.certifications.map(c=>(<div key={c.id} style={{marginBottom:7}}><p style={{fontWeight:700,fontSize:13,color:'#222',margin:'0 0 1px'}}>{c.name}</p><p style={{fontSize:12,color:'#888',margin:0}}>{c.issuer} {c.year&&`· ${c.year}`}</p></div>))}</section>) : null,
    languages: () => data.languages?.length ? (<section><h4 style={SH}>Languages</h4><div style={{display:'flex',gap:13,flexWrap:'wrap'}}>{data.languages.map(l=>(<div key={l.id||l.lang} style={{background:'#f4f4f4',padding:'5px 13px',borderRadius:6}}><p style={{fontWeight:700,fontSize:13,color:'#222',margin:'0 0 1px'}}>{l.lang}</p><p style={{fontSize:11.5,color:'#888',margin:0}}>{l.level}</p></div>))}</div></section>) : null,
    hobbies: () => data.hobbies ? (<section><h4 style={SH}>Interests</h4><p style={{fontSize:13,color:'#555'}}>{data.hobbies}</p></section>) : null,
    references: () => data.references?.length ? (<section><h4 style={SH}>References</h4><div style={{display:'flex',gap:15,flexWrap:'wrap'}}>{data.references.map(r=>(<div key={r.id} style={{background:'#f9f9f9',padding:'9px 13px',borderRadius:8,border:'1px solid #e8e8e8'}}><p style={{fontWeight:700,fontSize:13,margin:'0 0 2px'}}>{r.name}</p><p style={{fontSize:12,color:'#666',margin:0}}>{r.title}{r.company&&`, ${r.company}`}</p>{r.email&&<p style={{fontSize:11.5,color:'#888',margin:'2px 0 0'}}>{r.email}</p>}</div>))}</div></section>) : null,
  };
  return (
    <div style={{fontFamily:'"Segoe UI",Arial,sans-serif',background:'white',minHeight:'297mm'}}>
      <div style={{background:'#fff',borderBottom:'3px solid #e0e0e0',padding:'19px 26px'}}>
        <h1 style={{fontSize:23,fontWeight:700,color:'#222',margin:'0 0 3px'}}>{data.name}</h1>
        <p style={{fontSize:13,color:'#777',margin:'0 0 7px'}}>{[data.address,data.phone,data.email].filter(Boolean).join(' · ')}</p>
        {data.title&&<p style={{fontSize:13.5,color:'#444',lineHeight:1.6,margin:'0 0 5px',fontStyle:'italic',borderLeft:'3px solid #1565c0',paddingLeft:9}}>{data.title}</p>}
        {data.linkedin&&<p style={{fontSize:12,color:'#1565c0',margin:0}}>{data.linkedin}</p>}
      </div>
      <div style={{padding:'0 26px 19px'}}>{RS(sections,map)}</div>
    </div>
  );
};

const TEMPLATE_MAP = {
  mariana:T_Mariana, sebastian:T_Sebastian, techpro:T_TechPro,
  joshua:T_Joshua, kai:T_Kai, isabelle:T_Isabelle, lauren:T_Lauren,
  john:T_John, sarah:T_Sarah, keith:T_Keith,
};
const TEMPLATES = [
  {id:'mariana',  name:'Mariana',  icon:'🌊'},
  {id:'sebastian',name:'Sebastian',icon:'⬛'},
  {id:'techpro',  name:'TechPro',  icon:'💻'},
  {id:'joshua',   name:'Joshua',   icon:'🟡'},
  {id:'kai',      name:'Kai',      icon:'✖'},
  {id:'isabelle', name:'Isabelle', icon:'🟦'},
  {id:'lauren',   name:'Lauren',   icon:'📊'},
  {id:'john',     name:'John',     icon:'🌀'},
  {id:'sarah',    name:'Sarah',    icon:'🌿'},
  {id:'keith',    name:'Keith',    icon:'💼'},
];
const ALL_SECTIONS = [
  {id:'summary',        enabled:true,  label:'Professional Summary'},
  {id:'experience',     enabled:true,  label:'Work Experience'},
  {id:'education',      enabled:true,  label:'Education'},
  {id:'skills',         enabled:true,  label:'Skills'},
  {id:'projects',       enabled:false, label:'Projects'},
  {id:'certifications', enabled:false, label:'Certifications'},
  {id:'languages',      enabled:false, label:'Languages'},
  {id:'hobbies',        enabled:false, label:'Hobbies & Interests'},
  {id:'references',     enabled:false, label:'References'},
];

const ExpItem = ({index,exp,onChange,onRemove}) => (
  <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.09)',borderRadius:13,padding:'1rem',marginBottom:'.8rem'}}>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem',marginBottom:'.65rem'}}>
      <input className="t-input" placeholder="Job Title" name="title" value={exp.title} onChange={e=>onChange(index,e,'experience')}/>
      <input className="t-input" placeholder="Company Name" name="company" value={exp.company} onChange={e=>onChange(index,e,'experience')}/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.65rem',marginBottom:'.65rem'}}>
      <div><label className="t-label">Start Date</label><input className="t-input" type="date" name="startDate" value={exp.startDate} onChange={e=>onChange(index,e,'experience')}/></div>
      <div>
        <label className="t-label">End Date</label>
        <input className="t-input" type="date" name="endDate" value={exp.endDate} disabled={exp.isCurrent} onChange={e=>onChange(index,e,'experience')} style={{opacity:exp.isCurrent?.4:1}}/>
        <label style={{display:'flex',alignItems:'center',gap:'.4rem',marginTop:'.4rem',cursor:'pointer'}}>
          <input type="checkbox" checked={exp.isCurrent||false} style={{accentColor:'#7c6bff',width:13,height:13}} onChange={e=>onChange(index,{target:{name:'isCurrent',value:e.target.checked}},'experience')}/>
          <span style={{fontSize:'.7rem',color:'rgba(200,200,220,.45)'}}>Currently work here</span>
        </label>
      </div>
    </div>
    <textarea className="t-textarea" rows={4} placeholder="Duties / Achievements (one per line)" name="duties" value={exp.duties} onChange={e=>onChange(index,e,'experience')} style={{marginBottom:'.65rem'}}/>
    <button onClick={()=>onRemove(index)} style={{width:'100%',padding:'.43rem',borderRadius:8,border:'1px solid rgba(239,68,68,.3)',background:'rgba(239,68,68,.07)',color:'#f87171',fontSize:'.72rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>🗑 Remove</button>
  </div>
);

const SecMgr = ({sections,setSections}) => {
  const di=useRef(null), dov=useRef(null);
  const toggle = id => setSections(p=>p.map(s=>s.id===id?{...s,enabled:!s.enabled}:s));
  const onDS=i=>{di.current=i;};
  const onDE=i=>{dov.current=i;};
  const onDEnd=()=>{
    if(di.current===null||dov.current===null||di.current===dov.current)return;
    const a=[...sections]; const[m]=a.splice(di.current,1); a.splice(dov.current,0,m);
    setSections(a); di.current=null; dov.current=null;
  };
  return (
    <div>
      <p style={{fontSize:'.71rem',color:'rgba(200,200,220,.38)',margin:'0 0 .75rem',lineHeight:1.5}}>You can select which section you want to add/remove from the resume</p>
      {sections.map((s,i)=>(
        <div key={s.id} draggable onDragStart={()=>onDS(i)} onDragEnter={()=>onDE(i)} onDragEnd={onDEnd} onDragOver={e=>e.preventDefault()}
          style={{display:'flex',alignItems:'center',gap:'.55rem',padding:'.48rem .68rem',marginBottom:'.32rem',
            background:s.enabled?'rgba(124,107,255,.1)':'rgba(255,255,255,.03)',
            border:`1px solid ${s.enabled?'rgba(124,107,255,.35)':'rgba(255,255,255,.07)'}`,
            borderRadius:10,cursor:'grab',userSelect:'none',transition:'all .2s'}}>
          <span style={{color:'rgba(200,200,220,.28)',fontSize:'.83rem'}}>⠿</span>
          <span style={{fontSize:'.95rem'}}>{s.icon}</span>
          <span style={{flex:1,fontSize:'.75rem',fontWeight:600,color:s.enabled?'rgba(220,215,255,.85)':'rgba(180,180,200,.38)'}}>{s.label}</span>
          <button onClick={()=>toggle(s.id)} style={{padding:'.16rem .58rem',borderRadius:20,fontSize:'.62rem',fontWeight:700,cursor:'pointer',fontFamily:'inherit',
            border:s.enabled?'1px solid rgba(0,229,200,.38)':'1px solid rgba(255,255,255,.13)',
            background:s.enabled?'rgba(0,229,200,.11)':'rgba(255,255,255,.04)',
            color:s.enabled?'#00e5c8':'rgba(200,200,220,.38)'}}>
            {s.enabled?'ON':'OFF'}
          </button>
        </div>
      ))}
      <p style={{fontSize:'.71rem',color:'rgba(200,200,220,.38)',margin:'0 0 .75rem',lineHeight:1.5}}>You can drag and reorder the sections here or directly in preview panel</p>
    </div>
  );
};

function ResumeBuilder({user}) {
  const [data,setData] = useState({
    name:'Your Name', title:'Your Professional Title',
    email:'your.email@example.com', phone:'123-456-7890',
    address:'City, State', linkedin:'linkedin.com/in/yourprofile',
    website:'', photo:'',
    summary:'Highly motivated professional with experience delivering results-driven solutions. Passionate about leveraging skills to create meaningful impact and drive organizational success.',
    skills:'Communication, Leadership, Problem Solving, Project Management, Microsoft Office',
    experience:[{id:1,title:'Senior Manager',company:'Company Name',startDate:'2021-01-01',endDate:'',isCurrent:true,
      duties:'- Led cross-functional teams to deliver major product features.\n- Improved efficiency by 40% through process optimization.\n- Managed stakeholder relationships and project timelines.'}],
    education:{
      tenth:{school:'',percentage:'',passingYear:''},
      twelfth:{school:'',percentage:'',passingYear:''},
      graduation:{school:'State University',percentage:'8.5 CGPA',passingYear:'2020'},
      postGraduation:{school:'',percentage:'',passingYear:''},
    },
    projects:[],certifications:[],languages:[],hobbies:'',references:[],
  });
  const [tpl,setTpl]           = useState('mariana');
  const [sections,setSections] = useState(ALL_SECTIONS);
  const [ready,setReady]       = useState(false);
  const [dl,setDl]             = useState(false);
  const [tab,setTab]           = useState('personal');
  const [isEditMode,setIsEditMode] = useState(true);
  const ref = useRef();

  registerSetSections(setSections);
  _editMode = isEditMode;

  useEffect(()=>{ injectTheme(); if(ref.current) setReady(true); if(user) setData(p=>({...p,name:user})); },[user]);

  const hs = e => setData(d=>({...d,[e.target.name]:e.target.value}));
  const hPhoto = e => {
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>setData(d=>({...d,photo:ev.target.result})); r.readAsDataURL(f);
  };
  const hStr = (idx,e,type) => {
    const {name,value}=e.target;
    setData(p=>{
      const m={
        experience:     ()=>{ const l=[...p.experience]; l[idx]={...l[idx],[name]:value}; return{...p,experience:l}; },
        education:      ()=>({...p,education:{...p.education,[idx]:{...p.education[idx],[name]:value}}}),
        projects:       ()=>{ const l=[...p.projects]; l[idx]={...l[idx],[name]:value}; return{...p,projects:l}; },
        certifications: ()=>{ const l=[...p.certifications]; l[idx]={...l[idx],[name]:value}; return{...p,certifications:l}; },
        languages:      ()=>{ const l=[...p.languages]; l[idx]={...l[idx],[name]:value}; return{...p,languages:l}; },
        references:     ()=>{ const l=[...p.references]; l[idx]={...l[idx],[name]:value}; return{...p,references:l}; },
      };
      return m[type]?m[type]():p;
    });
  };
  const add = (k,b) => setData(p=>({...p,[k]:[...p[k],{id:Date.now(),...b}]}));
  const rm  = (k,i) => setData(p=>{ const l=[...p[k]]; l.splice(i,1); return{...p,[k]:l}; });

  const dlPdf = () => {
    if(!ref.current) return;
    const prev = isEditMode;
    _editMode = false;
    setIsEditMode(false);
    setDl(true);
    setTimeout(()=>{
      html2canvas(ref.current,{scale:2,logging:false,useCORS:true}).then(canvas=>{
        const img=canvas.toDataURL('image/png');
        const pdf=new jsPDF('p','mm','a4');
        const pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight();
        const ih=canvas.height*pw/canvas.width;
        let hl=ih,pos=0;
        pdf.addImage(img,'PNG',0,pos,pw,ih); hl-=ph;
        while(hl>=0){ pos=hl-ih; pdf.addPage(); pdf.addImage(img,'PNG',0,pos,pw,ih); hl-=ph; }
        pdf.save(`${data.name.replace(/ /g,'_')}_${tpl}.pdf`);
        setDl(false); setIsEditMode(prev); _editMode=prev;
      });
    },120);
  };

  const cur = TEMPLATES.find(t=>t.id===tpl);
  const actSec = sections.filter(s=>s.enabled).map(s=>s.id);
  const TABS=[{id:'personal',l:'👤 Info'},{id:'sections',l:'🗂 Sections'},{id:'content',l:'📋 Content'}];
  const Tpl = TEMPLATE_MAP[tpl] || T_Mariana;

  return (
    <div className="t-page">
      <div className="t-glow t-glow-a"/><div className="t-glow t-glow-b"/>
      <div className="t-inner" style={{maxWidth:1400}}>

        <div className="t-header">
          <div>
            <h1 className="t-title">Resume <span>Builder</span></h1>
            <p className="t-subtitle">Choose the template and start building your resume</p>
          </div>
          <div style={{display:'flex',gap:'.75rem',alignItems:'flex-start',flexShrink:0}}>
            <Link to="/dashboard" className="t-back">← Dashboard</Link>
            <button className="t-btn t-btn-accent2 t-btn-lg" style={{width:'11rem', height:'2.5rem',gap:'.25rem'}} onClick={dlPdf} disabled={!ready||dl}>
              {dl?<><span className="t-spinner"/> Generating…</>:<>Download PDF</>}
            </button>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'minmax(300px,490px) 1fr',gap:'1.5rem',alignItems:'start'}}>

          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>

            <div className="t-card">
              <div className="t-card-title">Choose Template</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'.4rem'}}>
                {TEMPLATES.map(t=>(
                  <button key={t.id} onClick={()=>setTpl(t.id)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'.5rem .3rem',borderRadius:10,cursor:'pointer',textAlign:'center',
                    border:`1px solid ${tpl===t.id?'rgba(124,107,255,.6)':'rgba(255,255,255,.08)'}`,
                    background:tpl===t.id?'rgba(124,107,255,.18)':'rgba(255,255,255,.04)',transition:'all .2s',fontFamily:'inherit'}}
                    onMouseEnter={e=>{ if(tpl!==t.id) e.currentTarget.style.borderColor='rgba(255,255,255,.22)'; }}
                    onMouseLeave={e=>{ if(tpl!==t.id) e.currentTarget.style.borderColor='rgba(255,255,255,.08)'; }}>
                    <span style={{fontSize:'1.15rem'}}>{t.icon}</span>
                    <span style={{fontSize:'.62rem',fontWeight:700,color:tpl===t.id?'#c4b5fd':'rgba(232,232,240,.52)',lineHeight:1.2,marginTop:1}}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{display:'flex',gap:'.32rem',background:'rgba(255,255,255,.04)',borderRadius:12,padding:'.28rem'}}>
              {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'.46rem',borderRadius:9,cursor:'pointer',fontFamily:'inherit',fontSize:'.72rem',fontWeight:600,transition:'all .2s',
                border:tab===t.id?'1px solid rgba(124,107,255,.4)':'1px solid transparent',
                background:tab===t.id?'rgba(124,107,255,.2)':'transparent',
                color:tab===t.id?'#c4b5fd':'rgba(200,200,220,.42)'}}>{t.l}</button>)}
            </div>

            {tab==='personal'&&(<>
              <div className="t-card">
                <div className="t-card-title">Profile Photo <span style={{fontSize:'.64rem',fontWeight:400,color:'rgba(200,200,220,.3)',marginLeft:5}}>Sidebar templates: Mariana, TechPro, Lauren, John, Joshua</span></div>
                <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                  <div style={{width:70,height:70,borderRadius:'50%',overflow:'hidden',background:'rgba(255,255,255,.1)',border:'2px solid rgba(255,255,255,.14)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {data.photo?<img src={data.photo} alt="P" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'1.75rem'}}>👤</span>}
                  </div>
                  <div style={{flex:1}}>
                    <label style={{display:'block',cursor:'pointer'}}>
                      <input type="file" accept="image/*" onChange={hPhoto} style={{display:'none'}}/>
                      <div style={{padding:'.5rem 1rem',borderRadius:8,border:'1px solid rgba(124,107,255,.4)',background:'rgba(124,107,255,.12)',color:'#c4b5fd',fontSize:'.77rem',fontWeight:600,textAlign:'center',cursor:'pointer'}}> Upload Photo</div>
                    </label>
                    {data.photo&&<button onClick={()=>setData(d=>({...d,photo:''}))} style={{width:'100%',marginTop:'.38rem',padding:'.38rem',borderRadius:8,border:'1px solid rgba(239,68,68,.3)',background:'rgba(239,68,68,.07)',color:'#f87171',fontSize:'.71rem',cursor:'pointer',fontFamily:'inherit'}}> Remove Photo</button>}
                    <p style={{fontSize:'.63rem',color:'rgba(200,200,220,.3)',margin:'.45rem 0 0',lineHeight:1.4}}>JPG, PNG or WebP. Square images work best.</p>
                  </div>
                </div>
              </div>
              <div className="t-card">
                <div className="t-card-title">Personal Details</div>
                <div style={{display:'flex',flexDirection:'column',gap:'.68rem'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.68rem'}}>
                    <div><label className="t-label">Full Name</label><input className="t-input" name="name" placeholder="Full Name" value={data.name} onChange={hs}/></div>
                    <div><label className="t-label">Job Title / Role</label><input className="t-input" name="title" placeholder="e.g. Marketing Manager" value={data.title} onChange={hs}/></div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.68rem'}}>
                    <div><label className="t-label">Email</label><input className="t-input" type="email" name="email" placeholder="email@example.com" value={data.email} onChange={hs}/></div>
                    <div><label className="t-label">Phone</label><input className="t-input" name="phone" placeholder="123-456-7890" value={data.phone} onChange={hs}/></div>
                  </div>
                  <div><label className="t-label">Address / City</label><input className="t-input" name="address" placeholder="City, State, Country" value={data.address} onChange={hs}/></div>
                  <div><label className="t-label">LinkedIn URL</label><input className="t-input" name="linkedin" placeholder="linkedin.com/in/username" value={data.linkedin} onChange={hs}/></div>
                  <div><label className="t-label">Website / Portfolio</label><input className="t-input" name="website" placeholder="yourwebsite.com" value={data.website} onChange={hs}/></div>
                </div>
              </div>
              <div className="t-card">
                <div className="t-card-title">Summary & Skills</div>
                <div style={{display:'flex',flexDirection:'column',gap:'.68rem'}}>
                  <div><label className="t-label">Professional Summary</label><textarea className="t-textarea" rows={5} name="summary" placeholder="Concise overview of your professional background…" value={data.summary} onChange={hs}/></div>
                  <div><label className="t-label">Skills <span style={{opacity:.4,fontWeight:400}}>(comma-separated)</span></label><textarea className="t-textarea" rows={2} name="skills" placeholder="Python, React, Leadership…" value={data.skills} onChange={hs}/></div>
                  <div><label className="t-label">Hobbies & Interests</label><input className="t-input" name="hobbies" placeholder="Reading, Traveling, Photography…" value={data.hobbies} onChange={hs}/></div>
                </div>
              </div>
            </>)}
            {tab==='sections'&&(<div className="t-card"><div className="t-card-title">Manage Sections</div><SecMgr sections={sections} setSections={setSections}/></div>)}
            {tab==='content'&&(<>

              <div className="t-card">
                <div className="t-card-title">Work Experience</div>
                {data.experience.map((exp,i)=><ExpItem key={exp.id} index={i} exp={exp} onChange={hStr} onRemove={i=>rm('experience',i)}/>)}
                <button className="t-btn t-btn-outline t-w100" style={{marginTop:'.4rem'}} onClick={()=>add('experience',{title:'',company:'',startDate:'',endDate:'',isCurrent:false,duties:''})}>+ Add Experience</button>
              </div>

              <div className="t-card">
                <div className="t-card-title">Education</div>
                {EDU_LEVELS.map(({key,title})=>(
                  <div key={key} style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:'1rem',marginBottom:'.6rem'}}>
                    <p style={{margin:'0 0 .6rem',fontSize:'.69rem',fontWeight:700,color:'rgba(0,229,200,.6)',letterSpacing:'.08em',textTransform:'uppercase'}}>{title}</p>
                    <input className="t-input" placeholder="School / University" name="school" value={data.education[key].school} onChange={e=>hStr(key,e,'education')} style={{marginBottom:'.52rem'}}/>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.52rem'}}>
                      <input className="t-input" placeholder="Percentage / CGPA" name="percentage" value={data.education[key].percentage} onChange={e=>hStr(key,e,'education')}/>
                      <input className="t-input" placeholder="Passing Year" name="passingYear" value={data.education[key].passingYear} onChange={e=>hStr(key,e,'education')}/>
                    </div>
                  </div>
                ))}
              </div>

              <div className="t-card">
                <div className="t-card-title" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>Projects
                  {!actSec.includes('projects')&&<span style={{fontSize:'.61rem',color:'rgba(251,191,36,.7)',background:'rgba(251,191,36,.1)',border:'1px solid rgba(251,191,36,.25)',padding:'.11rem .42rem',borderRadius:99}}>Enable in Sections tab</span>}
                </div>
                {data.projects.map((p,i)=>(
                  <div key={p.id} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:12,padding:'1rem',marginBottom:'.6rem'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.58rem',marginBottom:'.58rem'}}>
                      <input className="t-input" placeholder="Project Name" name="name" value={p.name} onChange={e=>hStr(i,e,'projects')}/>
                      <input className="t-input" placeholder="Technologies" name="technologies" value={p.technologies} onChange={e=>hStr(i,e,'projects')}/>
                    </div>
                    <textarea className="t-textarea" rows={3} placeholder="Project description…" name="description" value={p.description} onChange={e=>hStr(i,e,'projects')} style={{marginBottom:'.58rem'}}/>
                    <input className="t-input" placeholder="Project link (optional)" name="link" value={p.link||''} onChange={e=>hStr(i,e,'projects')} style={{marginBottom:'.58rem'}}/>
                    <button onClick={()=>rm('projects',i)} style={{width:'100%',padding:'.4rem',borderRadius:8,border:'1px solid rgba(239,68,68,.3)',background:'rgba(239,68,68,.07)',color:'#f87171',fontSize:'.71rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>🗑 Remove</button>
                  </div>
                ))}
                <button className="t-btn t-btn-outline t-w100" style={{marginTop:'.28rem'}} onClick={()=>add('projects',{name:'',description:'',technologies:'',link:''})}>+ Add Project</button>
              </div>

              <div className="t-card">
                <div className="t-card-title" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>Certifications
                  {!actSec.includes('certifications')&&<span style={{fontSize:'.61rem',color:'rgba(251,191,36,.7)',background:'rgba(251,191,36,.1)',border:'1px solid rgba(251,191,36,.25)',padding:'.11rem .42rem',borderRadius:99}}>Enable in Sections tab</span>}
                </div>
                {data.certifications.map((c,i)=>(
                  <div key={c.id} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:12,padding:'1rem',marginBottom:'.6rem'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.58rem',marginBottom:'.58rem'}}>
                      <input className="t-input" placeholder="Certification Name" name="name" value={c.name} onChange={e=>hStr(i,e,'certifications')}/>
                      <input className="t-input" placeholder="Issuing Organization" name="issuer" value={c.issuer} onChange={e=>hStr(i,e,'certifications')}/>
                    </div>
                    <input className="t-input" placeholder="Year" name="year" value={c.year} onChange={e=>hStr(i,e,'certifications')} style={{marginBottom:'.58rem'}}/>
                    <button onClick={()=>rm('certifications',i)} style={{width:'100%',padding:'.4rem',borderRadius:8,border:'1px solid rgba(239,68,68,.3)',background:'rgba(239,68,68,.07)',color:'#f87171',fontSize:'.71rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>🗑 Remove</button>
                  </div>
                ))}
                <button className="t-btn t-btn-outline t-w100" style={{marginTop:'.28rem'}} onClick={()=>add('certifications',{name:'',issuer:'',year:''})}>+ Add Certification</button>
              </div>

              <div className="t-card">
                <div className="t-card-title" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>Languages
                  {!actSec.includes('languages')&&<span style={{fontSize:'.61rem',color:'rgba(251,191,36,.7)',background:'rgba(251,191,36,.1)',border:'1px solid rgba(251,191,36,.25)',padding:'.11rem .42rem',borderRadius:99}}>Enable in Sections tab</span>}
                </div>
                {data.languages.map((l,i)=>(
                  <div key={l.id||i} style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'.58rem',marginBottom:'.5rem',alignItems:'center'}}>
                    <input className="t-input" placeholder="Language" name="lang" value={l.lang} onChange={e=>hStr(i,e,'languages')}/>
                    <select className="t-input" name="level" value={l.level} onChange={e=>hStr(i,e,'languages')} style={{cursor:'pointer'}}>
                      {['Native','Proficient','Intermediate','Beginner'].map(lv=><option key={lv}>{lv}</option>)}
                    </select>
                    <button onClick={()=>rm('languages',i)} style={{padding:'.4rem .63rem',borderRadius:8,border:'1px solid rgba(239,68,68,.3)',background:'rgba(239,68,68,.07)',color:'#f87171',cursor:'pointer',fontFamily:'inherit'}}>✕</button>
                  </div>
                ))}
                <button className="t-btn t-btn-outline t-w100" style={{marginTop:'.28rem'}} onClick={()=>add('languages',{lang:'',level:'Proficient'})}>+ Add Language</button>
              </div>
              <div className="t-card">
                <div className="t-card-title" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>References
                  {!actSec.includes('references')&&<span style={{fontSize:'.61rem',color:'rgba(251,191,36,.7)',background:'rgba(251,191,36,.1)',border:'1px solid rgba(251,191,36,.25)',padding:'.11rem .42rem',borderRadius:99}}>Enable in Sections tab</span>}
                </div>
                {data.references.map((r,i)=>(
                  <div key={r.id} style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:12,padding:'1rem',marginBottom:'.6rem'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.58rem',marginBottom:'.58rem'}}>
                      <input className="t-input" placeholder="Full Name" name="name" value={r.name} onChange={e=>hStr(i,e,'references')}/>
                      <input className="t-input" placeholder="Job Title" name="title" value={r.title} onChange={e=>hStr(i,e,'references')}/>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.58rem',marginBottom:'.58rem'}}>
                      <input className="t-input" placeholder="Company" name="company" value={r.company} onChange={e=>hStr(i,e,'references')}/>
                      <input className="t-input" placeholder="Phone" name="phone" value={r.phone} onChange={e=>hStr(i,e,'references')}/>
                    </div>
                    <input className="t-input" placeholder="Email" name="email" value={r.email} onChange={e=>hStr(i,e,'references')} style={{marginBottom:'.58rem'}}/>
                    <button onClick={()=>rm('references',i)} style={{width:'100%',padding:'.4rem',borderRadius:8,border:'1px solid rgba(239,68,68,.3)',background:'rgba(239,68,68,.07)',color:'#f87171',fontSize:'.71rem',fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>🗑 Remove</button>
                  </div>
                ))}
                <button className="t-btn t-btn-outline t-w100" style={{marginTop:'.28rem'}} onClick={()=>add('references',{name:'',title:'',company:'',phone:'',email:''})}>+ Add Reference</button>
              </div>
            </>)}
          </div>

          <div style={{position:'sticky',top:'1.5rem'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.82rem'}}>
              <div>
                <div className="t-section-label">Live Preview — You can turn on the edit mode if you want to reorder the sections</div>
                <p style={{color:'rgba(200,200,220,.32)',fontSize:'.72rem',margin:'.12rem 0 0'}}>
                  Hover a section → purple badge appears → drag up/down/left/right
                </p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'.7rem'}}>
                <button onClick={()=>{ setIsEditMode(v=>{ _editMode=!v; return !v; }); }} style={{padding:'.3rem .75rem',borderRadius:20,cursor:'pointer',fontFamily:'inherit',fontSize:'.68rem',fontWeight:700,
                  border:`1px solid ${isEditMode?'rgba(0,229,200,.45)':'rgba(255,255,255,.15)'}`,
                  background:isEditMode?'rgba(0,229,200,.1)':'rgba(255,255,255,.05)',
                  color:isEditMode?'#00e5c8':'rgba(200,200,220,.45)'}}>
                  {isEditMode?'✏️ Edit Mode':'👁 View Mode'}
                </button>
                <div style={{display:'flex',alignItems:'center',gap:'.45rem',padding:'.32rem .75rem',borderRadius:20,background:'rgba(124,107,255,.13)',border:'1px solid rgba(124,107,255,.32)'}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#00e5c8',display:'inline-block'}}/>
                  <span style={{fontSize:'.72rem',color:'#c4b5fd',fontWeight:600}}>{cur?.icon} {cur?.name}</span>
                </div>
              </div>
            </div>

            <div style={{borderRadius:16,overflow:'hidden',border:'1px solid rgba(255,255,255,.1)',boxShadow:'0 30px 80px rgba(0,0,0,.6)',maxHeight:'84vh',overflowY:'auto'}}>
              <div style={{background:'rgba(10,10,14,.97)',padding:'.55rem 1rem',display:'flex',alignItems:'center',gap:'.45rem',borderBottom:'1px solid rgba(255,255,255,.06)',position:'sticky',top:0,zIndex:500}}>
                <span style={{width:9,height:9,borderRadius:'50%',background:'#ff5f57',flexShrink:0}}/>
                <span style={{width:9,height:9,borderRadius:'50%',background:'#febc2e',flexShrink:0}}/>
                <span style={{width:9,height:9,borderRadius:'50%',background:'#28c840',flexShrink:0}}/>
                <span style={{flex:1,textAlign:'center',fontSize:'.58rem',color:'rgba(255,255,255,.16)',fontFamily:'monospace'}}>
                  {data.name.replace(/ /g,'_')}_{tpl}.pdf
                </span>
                {isEditMode&&<span style={{fontSize:'.6rem',color:'rgba(124,107,255,.8)',background:'rgba(124,107,255,.13)',border:'1px solid rgba(124,107,255,.3)',borderRadius:10,padding:'1px 7px',fontWeight:700,letterSpacing:'.3px'}}>✏ DRAG ACTIVE</span>}
              </div>
              <div ref={ref} style={{width:'100%',minHeight:'297mm',background:'white',color:'#000'}}>
                <Tpl data={data} sections={sections}/>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
export default ResumeBuilder;