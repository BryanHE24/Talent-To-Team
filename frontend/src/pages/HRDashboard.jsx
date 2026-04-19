import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ApplicantCard from '../components/ApplicantCard';

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
        <div>
          <h2 style={{ marginBottom: '1rem', color: '#1F2937' }}>Applicant Roster</h2>
          {applications.map((app) => (
            <ApplicantCard key={app.id} app={app} />
          ))}
          {applications.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280', border: '1px dashed #D1D5DB', borderRadius: '8px' }}>
              No applications found in the database.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
