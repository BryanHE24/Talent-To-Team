import React from 'react';

export default function ReportDetail({ mappedReport }) {
  const {
    candidate_recommendation,
    final_score,
    hr_summary,
    strengths = [],
    risks = [],
    category_scores = {},
    match_rationale,
  } = mappedReport;

  const catEntries = Object.entries(category_scores);

  return (
    <div>
      {/* ── AI Verdict Banner ── */}
      {hr_summary && (
        <div className="report-summary anim-fade-in">
          <span
            style={{
              fontSize: '0.5625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--tertiary)',
              display: 'block',
              marginBottom: '0.375rem',
            }}
          >
            ✦ AI Fit Report
          </span>
          {hr_summary}
        </div>
      )}

      {/* ── Recommendation + Score ── */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(192,193,255,0.06)',
            border: '1px solid rgba(192,193,255,0.15)',
            borderRadius: 'var(--radius-md)',
            flex: 1,
            minWidth: '140px',
          }}
        >
          <div
            style={{
              fontSize: '0.5625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--primary)',
              marginBottom: '0.25rem',
            }}
          >
            Recommendation
          </div>
          <div
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--on-surface)',
            }}
          >
            {candidate_recommendation || '—'}
          </div>
        </div>

        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(76,215,246,0.06)',
            border: '1px solid rgba(76,215,246,0.15)',
            borderRadius: 'var(--radius-md)',
            flex: 1,
            minWidth: '100px',
          }}
        >
          <div
            style={{
              fontSize: '0.5625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--tertiary)',
              marginBottom: '0.25rem',
            }}
          >
            Final Score
          </div>
          <div
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.5rem',
              fontWeight: 900,
              color: 'var(--tertiary)',
            }}
          >
            {final_score ?? '—'}
          </div>
        </div>
      </div>

      {/* ── Category Score Bars ── */}
      {catEntries.length > 0 && (
        <div
          style={{
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              fontSize: '0.5625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--outline)',
              marginBottom: '0.75rem',
            }}
          >
            Skill Breakdown
          </div>
          {catEntries.map(([key, val]) => (
            <div className="cat-row" key={key}>
              <div className="cat-label">{key.replace(/_/g, ' ')}</div>
              <div className="cat-bar-track">
                <div
                  className="cat-bar-fill"
                  style={{ '--bar-target': `${val}%`, width: `${val}%` }}
                />
              </div>
              <div className="cat-score">{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Strengths & Risks ── */}
      {(strengths.length > 0 || risks.length > 0) && (
        <div className="report-grid">
          {strengths.length > 0 && (
            <div className="report-section">
              <div className="report-section-label strength">✦ Key Strengths</div>
              <ul className="report-list">
                {strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {risks.length > 0 && (
            <div className="report-section">
              <div className="report-section-label risk" style={{ color: 'var(--error)' }}>⚠ Risk Factors</div>
              <ul className="report-list risk-list">
                {risks.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Deep Rationale ── */}
      {match_rationale && (
        <div
          style={{
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            fontSize: '0.8125rem',
            color: 'var(--on-surface-var)',
            lineHeight: '1.7',
            marginTop: '0.5rem',
          }}
        >
          <span
            style={{
              fontSize: '0.5625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--outline)',
              display: 'block',
              marginBottom: '0.5rem',
            }}
          >
            Deep Match Rationale
          </span>
          {match_rationale}
        </div>
      )}
    </div>
  );
}
