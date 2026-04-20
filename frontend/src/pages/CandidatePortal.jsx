import React, { useState, useEffect } from 'react';
import CVUploadForm from '../components/CVUploadForm';
import '../styles/dashboard.css';
import '../styles/animations.css';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const STATIC_ROLES = [
  {
    id: 'static-1',
    title: 'AI Recruiter Engineer',
    dept: 'AI Engineering',
    description: 'Build the next generation of autonomous A2A recruitment tooling using LLMs and agent orchestration.',
    reqs: ['React', 'Python', 'LLMs', 'FastAPI'],
    badge: 'Featured',
  },
  {
    id: 'static-2',
    title: 'Frontend React Developer',
    dept: 'Frontend',
    description: 'Craft premium candidate-facing portals with glassmorphic UI, micro-animations, and fluid data states.',
    reqs: ['React', 'CSS', 'Vite', 'Motion Design'],
    badge: null,
  },
  {
    id: 'static-3',
    title: 'FastAPI Backend Engineer',
    dept: 'Backend',
    description: 'Architect robust, agent-native backends that scale. Own the data layer from Supabase to OpenAI.',
    reqs: ['Python', 'FastAPI', 'Postgres', 'Supabase'],
    badge: null,
  },
];

const FEATURES = [
  { icon: 'psychology',           text: 'AI-powered fit scoring' },
  { icon: 'bolt',                 text: 'Instant A2A processing' },
  { icon: 'lock',                 text: 'GDPR-compliant data handling' },
  { icon: 'notifications_active', text: 'Real-time status updates' },
];

function extractDept(role) {
  const match = /Dept: ([^|\\n]+)/.exec(role.description || '');
  return match ? match[1].trim() : '';
}

function extractStatus(role) {
  const desc = role.description || '';
  if (desc.includes('Status: Closed')) return 'closed';
  if (desc.includes('Status: Paused')) return 'paused';
  return 'open';
}

function extractSkills(role) {
  return (role.requirements || '').split(',').map(s => s.trim()).filter(Boolean);
}

export default function CandidatePortal() {
  const [selectedRole, setSelectedRole]   = useState('');
  const [liveRoles, setLiveRoles]         = useState([]);
  const [rolesLoading, setRolesLoading]   = useState(true);

  /* ── Fetch live roles from backend ── */
  useEffect(() => {
    async function loadRoles() {
      setRolesLoading(true);
      try {
        const res  = await fetch(`${API}/roles`);
        const json = await res.json();
        // Only show open/paused roles to candidates
        const open = (json.roles || []).filter(r => extractStatus(r) !== 'closed');
        setLiveRoles(open);
      } catch {
        // Fallback to empty — static roles always show
      }
      setRolesLoading(false);
    }
    loadRoles();
  }, []);

  const scrollToForm = (roleTitle) => {
    setSelectedRole(roleTitle);
    setTimeout(() => {
      document.getElementById('apply-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  /* ── Merge: live roles first, then static (filtered to avoid duplication) ── */
  const liveRoleTitles = new Set(liveRoles.map(r => r.title.toLowerCase()));
  const staticFallbacks = STATIC_ROLES.filter(r => !liveRoleTitles.has(r.title.toLowerCase()));
  const allRoles = [
    ...liveRoles.map(r => ({
      id: r.id,
      title: r.title,
      dept: extractDept(r) || 'Role',
      description: (r.description || '').split('---')[0].trim(),
      reqs: extractSkills(r),
      badge: 'New',
      isLive: true,
    })),
    ...staticFallbacks,
  ];

  return (
    <div className="portal-page">
      {/* ── Hero ── */}
      <section className="portal-hero">
        <div className="portal-hero-glow" />
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(192,193,255,0.06), transparent 70%)',
          borderRadius: '50%',
          animation: 'ambientFloat 10s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '12%',
          width: '220px', height: '220px',
          background: 'radial-gradient(circle, rgba(76,215,246,0.06), transparent 70%)',
          borderRadius: '50%',
          animation: 'ambientFloat 14s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '700px', padding: '4rem 2rem' }}>
          <div className="portal-hero-badge anim-fade-in">
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>bolt</span>
            A2A Intelligence Engine · {allRoles.length} Roles Open
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
            <button className="btn-secondary" onClick={() => document.getElementById('roles-section')?.scrollIntoView({ behavior: 'smooth' })}>
              View All Roles
            </button>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="portal-body">
        {/* Roles section */}
        <div id="roles-section" className="portal-section-header anim-fade-up">
          <h2 className="portal-section-title">Open Positions</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--outline)' }}>
            {rolesLoading ? 'Loading…' : `${allRoles.length} role${allRoles.length !== 1 ? 's' : ''} available`}
          </span>
        </div>

        {/* Loading shimmer */}
        {rolesLoading && (
          <div className="roles-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius-xl)' }} />
            ))}
          </div>
        )}

        {!rolesLoading && (
          <div className="roles-grid">
            {allRoles.map((role, i) => (
              <div
                key={role.id}
                className={`role-card anim-fade-up delay-${(i % 3) + 1} ${selectedRole === role.title ? 'selected' : ''}`}
                onClick={() => scrollToForm(role.title)}
              >
                {role.badge && (
                  <span style={{
                    position: 'absolute', top: '1rem', right: '1rem',
                    fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', padding: '0.25rem 0.5rem',
                    background: role.badge === 'New' ? 'rgba(76,215,246,0.15)' : 'rgba(192,193,255,0.15)',
                    color: role.badge === 'New' ? 'var(--tertiary)' : 'var(--primary)',
                    border: `1px solid ${role.badge === 'New' ? 'rgba(76,215,246,0.3)' : 'rgba(192,193,255,0.3)'}`,
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    {role.badge}
                  </span>
                )}
                <div className="role-dept" style={{ position: 'relative' }}>{role.dept}</div>
                <h3 className="role-title" style={{ position: 'relative' }}>{role.title}</h3>
                <p className="role-desc" style={{ position: 'relative' }}>{role.description}</p>
                <div className="role-reqs" style={{ position: 'relative' }}>
                  {(role.reqs || []).slice(0, 5).map(r => <span key={r} className="req-tag">{r}</span>)}
                </div>
                <div className="role-apply-btn" style={{ position: 'relative' }}>
                  {selectedRole === role.title ? '✓ Selected — scroll down to apply' : 'Select & Apply →'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Apply section */}
        <div id="apply-section" className="upload-section">
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
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--tertiary)' }}>
                    {f.icon}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
          <CVUploadForm prefilledRole={selectedRole} availableRoles={allRoles.map(r => r.title)} />
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--glass-border)',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--outline)',
        fontSize: '0.75rem',
      }}>
        <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, color: '#333', letterSpacing: '-0.03em' }}>
          HIREFLOW
        </div>
        <div>© 2026 · Powered by A2A Agent Orchestration</div>
        <a href="/hr" style={{ color: 'var(--indigo)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
          HR Dashboard
        </a>
      </footer>
    </div>
  );
}
