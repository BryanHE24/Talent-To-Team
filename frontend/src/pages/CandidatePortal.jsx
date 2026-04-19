import React, { useState } from 'react';
import CVUploadForm from '../components/CVUploadForm';
import '../styles/candidate-portal.css';

const MOCK_ROLES = [
  { id: 1, title: 'AI Recruiter Engineer', description: 'Build A2A recruitment tools.', requirements: 'React, Python, LLMs' },
  { id: 2, title: 'Frontend React Developer', description: 'Craft stunning candidate portals.', requirements: 'React, CSS, Vite' },
  { id: 3, title: 'FastAPI Backend Engineer', description: 'Architect robust backend agents.', requirements: 'Python, FastAPI, Postgres' }
];

export default function CandidatePortal() {
  const [selectedRole, setSelectedRole] = useState('');

  return (
    <div className="portal-container">
      <header className="portal-header">
        <h1>HireFlow Opportunities</h1>
      </header>
      
      <main className="portal-content">
        <section className="roles-section">
          <h2>Open Roles</h2>
          <div className="roles-grid">
            {MOCK_ROLES.map(role => (
              <div key={role.id} className="role-card">
                <h3>{role.title}</h3>
                <p>{role.description}</p>
                <div className="requirements">
                  <strong>Reqs:</strong> {role.requirements}
                </div>
                <button 
                  className="btn-apply"
                  onClick={() => setSelectedRole(role.title)}>
                  Apply
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="form-section">
          <CVUploadForm prefilledRole={selectedRole} />
        </section>
      </main>
    </div>
  );
}
