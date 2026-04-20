import React, { useState, useEffect } from 'react';

export default function CVUploadForm({ prefilledRole }) {
  const [role, setRole]             = useState(prefilledRole || '');
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [cvText, setCvText]         = useState('');
  const [submitted, setSubmitted]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');

  useEffect(() => {
    if (prefilledRole) setRole(prefilledRole);
  }, [prefilledRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const cvPayload = cvText.trim() ||
      `Extracted CV simulated for ${name}. Professional deeply experienced in ${role} and modern scalable architectures. Over 5 years of active industry delivery across frontend and backend implementations.`;

    try {
      const res = await fetch('http://127.0.0.1:8000/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_type: 'APPLICATION_SUBMITTED',
          payload: { candidate_name: name, email, role, cv_text: cvPayload },
        }),
      });

      if (!res.ok) throw new Error('Backend engine returned an error. Please try again.');
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Success State ── */
  if (submitted) {
    return (
      <div className="upload-form-card success-card anim-scale-in">
        <span className="material-symbols-outlined success-icon">check_circle</span>
        <div className="success-title">Application Dispatched to A2A Engine</div>
        <div className="success-desc">
          The AI pipeline is now processing your profile. Results will appear in the HR Dashboard.
        </div>
        <button
          className="btn-secondary"
          onClick={() => { setSubmitted(false); setName(''); setEmail(''); setCvText(''); }}
          style={{ margin: '0 auto', padding: '0.625rem 1.5rem', borderRadius: 'var(--radius-md)' }}
        >
          Submit Another
        </button>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="upload-form-card anim-fade-up delay-2">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          marginBottom: '1.5rem',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ color: 'var(--primary)', fontSize: '22px' }}
        >
          upload_file
        </span>
        <div>
          <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: 'var(--on-surface)' }}>
            Submit Application
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--outline)' }}>
            Processed by the A2A Intelligence Pipeline
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Applying For</label>
          <input
            className="form-input"
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="Select a role above, or type here"
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jane Smith"
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label">Email Address</label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@domain.com"
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label">CV / Cover Letter (optional — paste or describe)</label>
          <textarea
            className="form-input"
            rows="4"
            value={cvText}
            onChange={e => setCvText(e.target.value)}
            placeholder="Paste your CV text or a brief summary here…"
            style={{ resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>

        {errorMsg && <div className="form-error">{errorMsg}</div>}

        <button className="submit-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div
                className="loading-spinner"
                style={{ width: '16px', height: '16px', borderWidth: '2px' }}
              />
              <div className="ai-thinking">
                AI Agents Processing
                <span className="thinking-dots">
                  <span /><span /><span />
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                rocket_launch
              </span>
              Launch A2A Pipeline
            </>
          )}
        </button>
      </form>
    </div>
  );
}
