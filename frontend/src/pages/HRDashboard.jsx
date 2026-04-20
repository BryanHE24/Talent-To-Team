import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import AppShell from '../layouts/AppShell';
import ApplicantCard from '../components/ApplicantCard';
import CreateRoleModal from '../components/CreateRoleModal';
import RolesPanel from '../components/RolesPanel';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const KPI_CONFIG = [
  { label: 'Total Pipeline',  key: 'total',     icon: 'group',             color: 'var(--primary)',   glow: '#c0c1ff' },
  { label: 'AI Processed',    key: 'processed',  icon: 'auto_fix_high',    color: 'var(--tertiary)',  glow: '#4cd7f6' },
  { label: 'High Potential',  key: 'highFit',    icon: 'workspace_premium', color: '#a259ff',         glow: '#a259ff' },
  { label: 'Avg Match Score', key: 'avgScore',   icon: 'analytics',         color: 'var(--primary)',  glow: '#c0c1ff' },
];

const FILTERS = ['All', 'New', 'Reviewed', 'Shortlisted'];

const TABS = [
  { id: 'pipeline', label: 'Talent Pipeline', icon: 'group' },
  { id: 'roles',    label: 'Open Roles',      icon: 'work'  },
];

export default function HRDashboard() {
  const [applications, setApplications] = useState([]);
  const [roles, setRoles]               = useState([]);
  const [metaSummary, setMetaSummary]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [filter, setFilter]             = useState('All');
  const [activeTab, setActiveTab]       = useState('pipeline');
  const [session, setSession]           = useState(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [backendError, setBackendError] = useState('');

  /* ── Auth ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  /* ── Fetch applications + meta ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    setBackendError('');
    try {
      const appRes  = await fetch(`${API}/applications`);
      if (!appRes.ok) throw new Error(`${appRes.status}`);
      const appJson = await appRes.json();
      setApplications(appJson.applications || []);

      const metaRes = await fetch(`${API}/meta-summary`);
      if (metaRes.ok) setMetaSummary(await metaRes.json());
    } catch (err) {
      setBackendError('Backend offline — start uvicorn to see live data.');
    }
    setLoading(false);
  }, []);

  /* ── Delete Application ── */
  const handleDeleteApplication = async (appId) => {
    if (!window.confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/applications/${appId}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications(prev => prev.filter(a => a.id !== appId));
      } else {
        alert("Failed to delete candidate.");
      }
    } catch (e) {
      alert("Error deleting candidate.");
    }
  };


  /* ── Fetch roles ── */
  const loadRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      const res  = await fetch(`${API}/roles`);
      const json = await res.json();
      setRoles(json.roles || []);
    } catch {
      // silent — error shown in banner already
    }
    setRolesLoading(false);
  }, []);

  useEffect(() => { loadData(); loadRoles(); }, [loadData, loadRoles]);

  /* ── Score helper ── */
  function getScore(app) {
    const r = Array.isArray(app.reports) ? app.reports[0] : app.reports;
    return r?.report_json?.final_score ?? r?.final_score ?? 0;
  }

  /* ── KPI Metrics ── */
  const total     = applications.length;
  const processed = applications.filter(a => (Array.isArray(a.reports) ? a.reports.length : 0) > 0).length;
  const highFit   = applications.filter(a => getScore(a) >= 75).length;
  const scores    = applications.map(getScore).filter(Boolean);
  const avgScore  = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const kpiValues = { total, processed, highFit, avgScore };

  /* ── Filtered pipeline list ── */
  const filtered = filter === 'All'
    ? applications
    : applications.filter(a => a.status?.toLowerCase() === filter.toLowerCase());

  /* ── Login guard ── */
  if (!loading && !session) {
    return <LoginScreen onSuccess={() => window.location.reload()} />;
  }

  return (
    <>
      <AppShell
        activePath="/hr"
        user={session?.user}
        onLogout={() => supabase.auth.signOut()}
        onNewRole={() => setModalOpen(true)}
      >
        {/* ── Backend offline banner ── */}
        {backendError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.875rem 1.25rem',
            background: 'rgba(255,180,171,0.08)',
            border: '1px solid rgba(255,180,171,0.2)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem', color: 'var(--error)',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>wifi_off</span>
            <span style={{ flex: 1 }}>{backendError}</span>
            <button onClick={() => { loadData(); loadRoles(); }} style={{
              padding: '0.25rem 0.75rem', background: 'rgba(255,180,171,0.15)',
              border: '1px solid rgba(255,180,171,0.3)', borderRadius: 'var(--radius-sm)',
              color: 'var(--error)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
            }}>
              Retry
            </button>
          </div>
        )}

        {/* ── KPI Bento ── */}
        <div className="kpi-grid" style={{ marginBottom: '2rem' }}>
          {KPI_CONFIG.map((k, i) => (
            <div key={k.key} className={`kpi-card anim-scale-in delay-${i + 1}`}>
              <div className="kpi-card-glow" style={{ background: k.glow }} />
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value" style={{ color: k.color }}>
                {loading ? '—' : kpiValues[k.key]}
              </div>
              <div className="kpi-bar-track">
                <div
                  className="kpi-bar-fill"
                  style={{
                    background: k.color,
                    width: `${Math.min((kpiValues[k.key] / (k.key === 'avgScore' ? 100 : Math.max(total, 1))) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Tab Bar ── */}
        <div className="dashboard-tabs" style={{ marginBottom: '1.5rem' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`dashboard-tab ${activeTab === tab.id ? 'dashboard-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{tab.icon}</span>
              {tab.label}
              {tab.id === 'roles' && roles.filter(r => !r.description?.includes('Status: Closed')).length > 0 && (
                <span className="tab-badge">
                  {roles.filter(r => !r.description?.includes('Status: Closed')).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        {activeTab === 'pipeline' && (
          <div className="dashboard-grid">
            {/* Left: Pipeline */}
            <div>
              <div className="section-header">
                <h2 className="section-title">Talent Pipeline</h2>
                <div className="filter-pills">
                  {FILTERS.map(f => (
                    <button
                      key={f}
                      className={`pill ${filter === f ? 'pill-active' : 'pill-muted'}`}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="loading-text">
                  <div className="loading-spinner" />
                  Loading talent matrix…
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty-state anim-fade-up">
                  <div className="material-symbols-outlined empty-icon">inbox</div>
                  <div className="empty-title">No candidates yet</div>
                  <div className="empty-desc">Submit a CV from the Candidate Portal to begin.</div>
                </div>
              ) : (
                filtered.map((app, i) => (
                  <ApplicantCard 
                    key={app.id} 
                    app={app} 
                    index={i} 
                    onDelete={() => handleDeleteApplication(app.id)} 
                  />
                ))
              )}
            </div>

            {/* Right: AI Meta Panel */}
            <div>
              <div className="section-header">
                <h2 className="section-title">AI Insights</h2>
              </div>

              <div className="meta-panel anim-slide-right delay-2">
                <div className="meta-ai-header">
                  <div className="meta-ai-icon">
                    <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)', fontSize: '28px' }}>psychology</span>
                    <span className="meta-ai-pulse anim-ping" />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--on-surface)' }}>
                      Meta Agent Summary
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
                      Live A2A Intelligence
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div>
                    <div className="skeleton" style={{ height: '80px', marginBottom: '0.75rem' }} />
                    <div className="skeleton" style={{ height: '50px', marginBottom: '0.75rem' }} />
                    <div className="skeleton" style={{ height: '50px' }} />
                  </div>
                ) : metaSummary ? (
                  <>
                    {metaSummary.recommendation && (
                      <div className="meta-insight-quote">{metaSummary.recommendation}</div>
                    )}
                    <div className="meta-stat">
                      <span className="meta-stat-label">Avg Score</span>
                      <span className="meta-stat-value" style={{ color: 'var(--tertiary)' }}>
                        {metaSummary.average_score ?? '—'}
                      </span>
                    </div>
                    {metaSummary.top_candidates?.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--outline)', marginBottom: '0.5rem' }}>
                          Top Candidates
                        </div>
                        {metaSummary.top_candidates.slice(0, 3).map((c, i) => (
                          <div key={i} className="meta-top-candidate">
                            <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{c.name || c}</div>
                            {c.score && (
                              <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--tertiary)' }}>{c.score}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {metaSummary.insights?.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--outline)', marginBottom: '0.5rem' }}>
                          Agent Observations
                        </div>
                        {metaSummary.insights.slice(0, 4).map((item, i) => (
                          <div key={i} className="meta-insight-item">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--primary)', flexShrink: 0 }}>chevron_right</span>
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state" style={{ border: 'none', paddingTop: '1rem', paddingBottom: '1rem' }}>
                    <div className="empty-title">No insights yet</div>
                    <div className="empty-desc">Submit a candidate to activate the A2A meta-agent.</div>
                  </div>
                )}
              </div>

              {total > 0 && (
                <div className="meta-panel anim-slide-right delay-4" style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--outline)', marginBottom: '0.75rem' }}>
                    Application Activity
                  </div>
                  <div className="heatmap-grid">
                    {[...Array(25)].map((_, i) => {
                      const intensity = Math.random();
                      return (
                        <div
                          key={i}
                          className="heatmap-cell"
                          style={{ background: `rgba(76,215,246,${0.05 + intensity * 0.4})`, animationDelay: `${i * 0.02}s` }}
                        />
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--outline)', textAlign: 'center' }}>
                    {total} application{total !== 1 ? 's' : ''} in pipeline
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Roles Tab ── */}
        {activeTab === 'roles' && (
          <RolesPanel
            roles={roles}
            loading={rolesLoading}
            onNewRole={() => setModalOpen(true)}
            onRolesChanged={loadRoles}
          />
        )}
      </AppShell>

      {/* ── Create Role Modal (outside AppShell so it layers above everything) ── */}
      <CreateRoleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(newRole) => {
          setRoles(prev => [{ ...newRole, applicant_count: 0 }, ...prev]);
          setActiveTab('roles');
        }}
      />
    </>
  );
}

/* ── Inline Login Screen ── */
function LoginScreen({ onSuccess }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <div className="login-screen">
      <div className="login-glow" />
      <div className="login-card anim-scale-in">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '52px', height: '52px',
            background: 'var(--indigo-dim)', border: '1px solid var(--indigo-border)',
            borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem',
          }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--indigo)', fontSize: '28px' }}>admin_panel_settings</span>
          </div>
          <div className="login-title">Hire<span>Flow</span></div>
          <div className="login-subtitle">HR Command Center — Restricted Access</div>
        </div>

        <form onSubmit={handleLogin}>
          <label className="login-label">HR Email</label>
          <input className="login-input" type="email" placeholder="hr@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <label className="login-label">Password</label>
          <input className="login-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <div className="form-error">{error}</div>}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <><div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />Authenticating…</>
            ) : (
              <><span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock_open</span>Access Dashboard</>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.625rem', color: 'var(--outline)', marginTop: '1.5rem', letterSpacing: '0.1em' }}>
          ENTERPRISE · GDPR COMPLIANT · A2A SECURED
        </div>
      </div>
    </div>
  );
}
