import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function HRDashboard() {
  const [applications, setApplications] = useState([]);
  const [metaSummary, setMetaSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      // Meta-Agent pipeline
      try {
        const res = await fetch("http://127.0.0.1:8000/meta-summary");
        if(res.ok) {
          const json = await res.json();
          if(json.status === "success") {
            setMetaSummary(json.meta);
          }
        }
      } catch (err) {
        console.error("Meta-summary fetch failed", err);
      }

      // Query applications along with their joined roles and reports
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          candidate_name,
          status,
          roles ( title ),
          reports ( id, report_json )
        `);
        
      if (!error && data) {
        setApplications(data);
      }
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>HireFlow HR Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </header>

      {metaSummary && (
        <div className="meta-summary" style={{ background: '#E0F2FE', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #BAE6FD' }}>
          <h2 style={{ top: 0, marginTop: 0, color: '#0369A1' }}>AI Meta-Summary</h2>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <strong>Top Candidates:</strong>
              <ul style={{ margin: '0.5rem 0' }}>
                {metaSummary.top_candidates?.map((c, i) => (
                  <li key={i}>{c.name} - Score: {c.score}</li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <strong>Average Score:</strong> {metaSummary.average_score} <br/><br/>
              <strong>Recommendation:</strong> {metaSummary.hiring_recommendation}
            </div>
          </div>
          <div>
            <strong>Insights:</strong>
            <ul style={{ margin: '0.5rem 0' }}>
              {metaSummary.insights?.map((insight, i) => <li key={i}>{insight}</li>)}
            </ul>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading applicants...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc', backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '1rem' }}>Candidate Name</th>
                <th style={{ padding: '1rem' }}>Applied Role</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Final Score</th>
                <th style={{ padding: '1rem' }}>Report ID</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const roleTitle = app.roles?.title || 'Unknown Role';
                // reports can be an object or array depending on Postgres setup
                const report = Array.isArray(app.reports) ? app.reports[0] : app.reports;
                const finalScore = report?.report_json?.final_score || 'N/A';
                const reportId = report?.id || 'Pending';

                return (
                  <tr key={app.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>{app.candidate_name}</td>
                    <td style={{ padding: '1rem' }}>{roleTitle}</td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{app.status}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{finalScore}</td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#666', fontFamily: 'monospace' }}>{reportId}</td>
                  </tr>
                );
              })}
              {applications.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    No applications found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
