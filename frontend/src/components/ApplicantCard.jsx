import React, { useState } from 'react';
import ReportDetail from './ReportDetail';
import { mapReportData } from '../utils/reportMapper';

const PIPELINE_STAGES = [
  { icon: 'description',   label: 'CV Analyzer',   sub: 'Extraction'   },
  { icon: 'auto_awesome',  label: 'Summarizer',    sub: 'Insights Core' },
  { icon: 'dataset_linked',label: 'Job Matcher',   sub: 'Context Delta' },
  { icon: 'summarize',     label: 'Report Agent',  sub: 'AI Report'    },
];

function scoreColor(score) {
  if (score >= 80) return 'var(--tertiary)';
  if (score >= 60) return 'var(--primary)';
  return 'var(--error)';
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function ApplicantCard({ app, index = 0 }) {
  const [expanded, setExpanded] = useState(false);

  const roleTitle  = app.roles?.title || 'Unknown Role';
  const rawReport  = Array.isArray(app.reports) ? app.reports[0] : app.reports;
  const mapped     = mapReportData(rawReport);
  const score      = mapped.final_score || 0;
  const filled     = Math.round((score / 100) * 5);

  return (
    <>
      {/* ── Card Row ── */}
      <div
        className={`candidate-card anim-fade-up delay-${Math.min(index + 1, 6)} ${expanded ? 'expanded' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar */}
        <div className="candidate-avatar">
          {getInitials(app.candidate_name)}
        </div>

        {/* Identity */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <span className="candidate-name">{app.candidate_name}</span>
            <span className="candidate-role-badge">{roleTitle}</span>
          </div>
          <span className="candidate-status-badge">{app.status || 'new'}</span>
        </div>

        {/* Score */}
        <div className="candidate-score">
          <div className="score-label">Match Score</div>
          <div className="score-value" style={{ color: scoreColor(score) }}>
            {score > 0 ? score : '—'}
          </div>
          <div className="score-dots">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`score-dot ${i < filled ? 'filled' : 'empty'}`}
                style={i < filled ? { background: scoreColor(score) } : {}}
              />
            ))}
          </div>
        </div>

        {/* Chevron */}
        <span className="material-symbols-outlined expand-chevron">
          expand_more
        </span>
      </div>

      {/* ── Expanded Drawer ── */}
      {expanded && (
        <div className="report-drawer">
          {/* A2A Pipeline Visualization */}
          <div className="pipeline-strip">
            {PIPELINE_STAGES.map((stage, i) => (
              <React.Fragment key={stage.label}>
                <div className="pipeline-agent">
                  <div className={`pipeline-icon-wrap ${i === 0 ? 'active' : ''}`}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        color: i < 2 ? 'var(--tertiary)' : i < 3 ? 'var(--primary)' : 'var(--outline)',
                        fontSize: '20px',
                      }}
                    >
                      {stage.icon}
                    </span>
                    {i === 0 && (
                      <span
                        style={{
                          position: 'absolute', inset: '-4px',
                          background: 'rgba(76,215,246,0.15)',
                          borderRadius: 'var(--radius-md)',
                          animation: 'pulseGlow 3s ease-in-out infinite',
                        }}
                      />
                    )}
                  </div>
                  <div className="pipeline-label">{stage.label}</div>
                  <div style={{ fontSize: '0.5rem', color: 'var(--outline)', textAlign: 'center' }}>{stage.sub}</div>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div className="pipeline-connector">
                    <div className="pipeline-dot" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Report Detail */}
          <ReportDetail mappedReport={mapped} />
        </div>
      )}
    </>
  );
}
