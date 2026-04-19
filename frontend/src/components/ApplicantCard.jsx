import React, { useState } from 'react';
import ReportDetail from './ReportDetail';
import { mapReportData } from '../utils/reportMapper';

export default function ApplicantCard({ app }) {
  const [expanded, setExpanded] = useState(false);

  const roleTitle = app.roles?.title || 'Unknown Role';
  
  // Intercept reports conditionally assuming standard DB relational payload bindings
  const rawReport = Array.isArray(app.reports) ? app.reports[0] : app.reports;
  const mappedReport = mapReportData(rawReport);
  
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
      <div 
        onClick={() => setExpanded(!expanded)} 
        style={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between', 
          padding: '1.25rem', 
          cursor: 'pointer', 
          background: expanded ? '#fff' : '#F9FAFB',
          borderBottom: expanded ? '1px solid #E5E7EB' : 'none',
          transition: 'background 0.2s'
        }}
      >
        <div style={{ flex: 1.5 }}>
          <strong style={{ display: 'block', fontSize: '1.1rem' }}>{app.candidate_name}</strong>
          <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>{roleTitle}</span>
        </div>
        <div style={{ flex: 1, textTransform: 'capitalize' }}>
          <span style={{ padding: '0.25rem 0.5rem', background: app.status === 'new' ? '#DBEAFE' : '#E0E7FF', color: '#1E40AF', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 500 }}>
            {app.status}
          </span>
        </div>
        <div style={{ flex: 1, fontWeight: 'bold' }}>
          Score: {mappedReport.final_score}
        </div>
        <div style={{ color: '#6B7280', userSelect: 'none' }}>
          {expanded ? '▲ Collapse' : '▼ Expand'}
        </div>
      </div>
      
      {expanded && (
        <div style={{ padding: '0.5rem 1.5rem 1.5rem 1.5rem', background: '#fff' }}>
          <ReportDetail mappedReport={mappedReport} />
        </div>
      )}
    </div>
  );
}
