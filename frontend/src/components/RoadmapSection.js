import React from 'react';
import { FaMap, FaExternalLinkAlt, FaGraduationCap } from 'react-icons/fa';
import { roadmapMapping } from '../data/roadmapMapping';

const RoadmapSection = ({ career, gapData }) => {
  const roadmapSlug = roadmapMapping[career] || 'full-stack';
  const roadmapUrl  = `https://roadmap.sh/${roadmapSlug}`;

  const skillGaps = gapData.labels
    .map((label, index) => ({ name: label, gap: gapData.ideal[index] - gapData.user[index] }))
    .filter(item => item.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 4);

  return (
    <div className="t-card" style={{ marginTop: '1.5rem' }}>
      <div className="t-card-title">
        <FaMap style={{ color: '#7c6bff' }} /> Your Personalized Learning Path
      </div>
      <p style={{ color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.65 }}>
        To become a <strong style={{ color: '#e8e8f0' }}>{career}</strong>, your priority should be mastering these specific areas:
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        {skillGaps.map((skill, idx) => (
          <div key={idx} className="t-roadmap-item">
            <span className="t-flex" style={{ gap: '.5rem' }}>
              <FaGraduationCap style={{ color: 'var(--muted)', flexShrink: 0 }} />
              {skill.name}
            </span>
            <span className="t-badge t-badge-danger">Priority: High</span>
          </div>
        ))}
      </div>

      <div className="t-text-center">
        <a
          href={roadmapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="t-btn t-btn-primary t-btn-lg"
          style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }}
        >
          View Full {career} Roadmap <FaExternalLinkAlt size={13} />
        </a>
        <p style={{ marginTop: '.6rem', fontSize: '.8rem', color: 'var(--muted)' }}>Curated by Roadmap.sh</p>
      </div>
    </div>
  );
};

export default RoadmapSection;