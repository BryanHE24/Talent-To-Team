import React, { useState, useEffect } from 'react';

export default function CVUploadForm({ prefilledRole }) {
  const [role, setRole] = useState(prefilledRole || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (prefilledRole) {
      setRole(prefilledRole);
    }
  }, [prefilledRole]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="submission-success">
        <h3>Application submitted (mock)</h3>
        <p>Thank you for applying to HireFlow.</p>
        <button onClick={() => setSubmitted(false)} className="btn-secondary">
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="upload-form-container">
      <h2>Submit Your Application</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>Selected Role</label>
          <input 
            type="text" 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            placeholder="Select a role or type here"
            required
          />
        </div>
        <div className="form-group">
          <label>Candidate Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>CV Upload</label>
          <input 
            type="file" 
            accept=".pdf,.doc,.docx"
            required 
          />
        </div>
        <button type="submit" className="btn-primary">Submit Application</button>
      </form>
    </div>
  );
}
