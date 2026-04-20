import React, { useState } from 'react';
import CVUploadForm from '../components/CVUploadForm';
import '../styles/dashboard.css';
import '../styles/animations.css';

const OPEN_ROLES = [
  {
    id: 1,
    dept: 'AI Engineering',
    title: 'AI Recruiter Engineer',
    description: 'Build the next generation of autonomous A2A recruitment tooling using LLMs and agent orchestration.',
    reqs: ['React', 'Python', 'LLMs', 'FastAPI'],
  },
  {
    id: 2,
    dept: 'Frontend',
    title: 'Frontend React Developer',
    description: 'Craft premium candidate-facing portals with glassmorphic UI, micro-animations, and fluid data states.',
    reqs: ['React', 'CSS', 'Vite', 'Motion Design'],
  },
  {
    id: 3,
    dept: 'Backend',
    title: 'FastAPI Backend Engineer',
    description: 'Architect robust, agent-native backends that scale. Own the data layer from Supabase to OpenAI.',
    reqs: ['Python', 'FastAPI', 'Postgres', 'Supabase'],
  },
];

const FEATURES = [
  { icon: 'psychology',        text: 'AI-powered fit scoring' },
  { icon: 'bolt',              text: 'Instant A2A processing' },
  { icon: 'lock',              text: 'GDPR-compliant data handling' },
  { icon: 'notifications_active', text: 'Real-time status updates' },
];

export default function CandidatePortal() {
  const [selectedRole, setSelectedRole] = useState('');

  const scrollToForm = (roleTitle) => {
    setSelectedRole(roleTitle);
    setTimeout(() => {
      document.getElementById('apply-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="portal-page">
      {/* ── Hero ── */}
      <section className="portal-hero">
        <div className="portal-hero-glow" />
        {/* Ambient orbs */}
        <div
          style={{
            position: 'absolute', top: '20%', left: '10%',
            width: '300px', height: '300px',
            background: 'radial-gradient(circle, rgba(192,193,255,0.06), transparent 70%)',
            borderRadius: '50%',
            animation: 'ambientFloat 10s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: '10%', right: '12%',
            width: '220px', height: '220px',
            background: 'radial-gradient(circle, rgba(76,215,246,0.06), transparent 70%)',
            borderRadius: '50%',
            animation: 'ambientFloat 14s ease-in-out infinite reverse',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '700px', padding: '4rem 2rem' }}>
          <div className="portal-hero-badge anim-fade-in">
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>bolt</span>
            A2A Intelligence Engine · Live
          </div>
          <h1 className="portal-hero-title anim-fade-up delay-1">
            Where Talent Meets<br />Intelligence
          </h1>
          <p className="portal-hero-desc anim-fade-up delay-2">
            HireFlow uses a multi-agent AI pipeline to match your skills with the right role — instantly, fairly, and transparently.
          </p>
          <div className="portal-hero-btns anim-fade-up delay-3">
            <button className="btn-primary" onClick={() => scrollToForm('')}>
              Apply Now
            </button>
            <button className="btn-secondary">View All Roles</button>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="portal-body">
        {/* Roles */}
        <div className="portal-section-header anim-fade-up">
          <h2 className="portal-section-title">Open Positions</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--outline)' }}>
            {OPEN_ROLES.length} roles available
          </span>
        </div>

        <div className="roles-grid">
          {OPEN_ROLES.map((role, i) => (
            <div
              key={role.id}
              className={`role-card anim-fade-up delay-${i + 1} ${selectedRole === role.title ? 'selected' : ''}`}
              onClick={() => scrollToForm(role.title)}
            >
              <div className="role-dept">{role.dept}</div>
              <h3 className="role-title">{role.title}</h3>
              <p className="role-desc">{role.description}</p>
              <div className="role-reqs">
                {role.reqs.map(r => <span key={r} className="req-tag">{r}</span>)}
              </div>
              <div className="role-apply-btn">
                {selectedRole === role.title ? '✓ Selected — scroll down to apply' : 'Select & Apply →'}
              </div>
            </div>
          ))}
        </div>

        {/* Upload section */}
        <div id="apply-section" className="upload-section">
          {/* Pitch copy */}
          <div className="upload-pitch anim-fade-up">
            <h3>
              Your career,<br />supercharged by<br />
              <span style={{ color: 'var(--primary)' }}>AI agents.</span>
            </h3>
            <p>
              Submit your profile below and our four-stage A2A agent pipeline — CV Analyzer, Summarizer, Job Matcher, and Report Agent — will evaluate your fit in seconds, not weeks.
            </p>
            <ul className="upload-features">
              {FEATURES.map(f => (
                <li key={f.text}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '18px', color: 'var(--tertiary)' }}
                  >
                    {f.icon}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Form card */}
          <CVUploadForm prefilledRole={selectedRole} />
        </div>
      </div>

      {/* ── Footer strip ── */}
      <footer
        style={{
          borderTop: '1px solid var(--glass-border)',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--outline)',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, color: '#333', letterSpacing: '-0.03em' }}>
          HIREFLOW
        </div>
        <div>© 2026 · Powered by A2A Agent Orchestration</div>
        <a
          href="/hr"
          style={{
            color: 'var(--indigo)',
            textDecoration: 'none',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          HR Dashboard
        </a>
      </footer>
    </div>
  );
}
