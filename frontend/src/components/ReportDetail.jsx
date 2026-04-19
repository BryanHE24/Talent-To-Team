import React from 'react';

export default function ReportDetail({ mappedReport }) {
  const { 
    candidate_recommendation, 
    final_score, 
    hr_summary, 
    strengths, 
    risks, 
    category_scores, 
    match_rationale 
  } = mappedReport;

  const hasCategoryScores = Object.keys(category_scores).length > 0;

  return (
    <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '4px', margin: '1rem 0', border: '1px solid #E2E8F0' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#334155' }}>HR Report Detail</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <strong>Recommendation:</strong> {candidate_recommendation} <br/>
          <strong>Final Score:</strong> {final_score}
        </div>
        {hasCategoryScores && (
          <div>
            <strong>Category Scores:</strong>
            <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
              {Object.entries(category_scores).map(([key, val]) => (
                <li key={key}>{key.replace('_', ' ')}: {val}/100</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <strong>HR Summary:</strong>
        <p style={{ margin: '0.25rem 0', lineHeight: '1.5' }}>{hr_summary}</p>
      </div>

      {(strengths.length > 0 || risks.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {strengths.length > 0 && (
            <div>
              <strong>Strengths:</strong>
              <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem', color: '#166534' }}>
                {strengths.map((str, idx) => <li key={idx}>{str}</li>)}
              </ul>
            </div>
          )}
          {risks.length > 0 && (
            <div>
              <strong>Risks:</strong>
              <ul style={{ margin: '0.25rem 0', paddingLeft: '1.5rem', color: '#991B1B' }}>
                {risks.map((risk, idx) => <li key={idx}>{risk}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {match_rationale && (
        <div style={{ padding: '1rem', background: '#fff', border: '1px solid #E2E8F0', borderRadius: '4px', marginTop: '1rem' }}>
          <strong>Deep Match Rationale:</strong>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', lineHeight: '1.5' }}>{match_rationale}</p>
        </div>
      )}
    </div>
  );
}
