import React, { useState } from 'react';

const API = 'http://127.0.0.1:8000';

const STATUS_MAP = {
  open:   { label: 'Open',   color: 'var(--tertiary)',  bg: 'rgba(76,215,246,0.1)' },
  paused: { label: 'Paused', color: '#ffd43b',          bg: 'rgba(255,212,59,0.1)' },
  closed: { label: 'Closed', color: 'var(--error)',     bg: 'rgba(255,107,107,0.08)' },
};

function extractStatus(role) {
  const desc = role.description || '';
  if (desc.includes('Status: Closed') || desc.toLowerCase().includes('[archived]')) return 'closed';
  if (desc.includes('Status: Paused')) return 'paused';
  return 'open';
}

function extractMeta(role, key) {
  const match = new RegExp(`${key}: ([^|\\n]+)`).exec(role.description || '');
  return match ? match[1].trim() : '';
}

export default function RolesPanel({ roles, loading, onNewRole, onRolesChanged }) {
  const [archiving, setArchiving] = useState(null); // role id being archived

  async function handleArchive(roleId) {
    setArchiving(roleId);
    try {
      await fetch(`${API}/roles/${roleId}`, { method: 'DELETE' });
      onRolesChanged();
    } catch {
      // silent fail
    } finally {
      setArchiving(null);
    }
  }

  const activeRoles  = roles.filter(r => extractStatus(r) !== 'closed');
  const closedRoles  = roles.filter(r => extractStatus(r) === 'closed');

  return (
    <section className="roles-panel anim-fade-up">
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Open Roles</h2>
          <span className="status-badge" style={{ background: 'rgba(76,215,246,0.1)', color: 'var(--tertiary)', border: '1px solid rgba(76,215,246,0.2)' }}>
            {activeRoles.length} active
          </span>
        </div>
        <button className="btn-create-role" onClick={onNewRole}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          New Role
        </button>
      </div>

      {/* ── Loading shimmer ── */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && roles.length === 0 && (
        <div className="empty-state">
          <span className="material-symbols-outlined empty-icon">work_outline</span>
          <div className="empty-title">No roles yet</div>
          <div className="empty-desc">Click "+ New Role" to publish your first opening.</div>
          <button className="btn-create-role" style={{ margin: '1rem auto 0' }} onClick={onNewRole}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
            Create First Role
          </button>
        </div>
      )}

      {/* ── Role Cards ── */}
      {!loading && activeRoles.map((role, i) => (
        <RoleCard
          key={role.id}
          role={role}
          index={i}
          onArchive={() => handleArchive(role.id)}
          archiving={archiving === role.id}
        />
      ))}

      {/* ── Closed / Archived ── */}
      {!loading && closedRoles.length > 0 && (
        <details className="closed-roles-section">
          <summary className="closed-roles-toggle">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>expand_more</span>
            {closedRoles.length} closed role{closedRoles.length !== 1 ? 's' : ''}
          </summary>
          {closedRoles.map((role, i) => (
            <RoleCard
              key={role.id}
              role={role}
              index={i}
              onArchive={() => handleArchive(role.id)}
              archiving={archiving === role.id}
              muted
            />
          ))}
        </details>
      )}
    </section>
  );
}

/* ── Individual Role Card ── */
function RoleCard({ role, index, onArchive, archiving, muted }) {
  const status    = extractStatus(role);
  const statusCfg = STATUS_MAP[status] || STATUS_MAP.open;
  const dept      = extractMeta(role, 'Dept');
  const location  = extractMeta(role, 'Location');
  const type      = extractMeta(role, 'Type');
  const priority  = extractMeta(role, 'Priority');
  const salary    = extractMeta(role, 'Salary');
  const count     = role.applicant_count ?? 0;

  // Skill extract from requirements field
  const skills = (role.requirements || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 4);

  return (
    <div
      className={`role-card anim-scale-in delay-${(index % 4) + 1} ${muted ? 'role-card--muted' : ''}`}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1rem', color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
            {role.title}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {[dept, type, location].filter(Boolean).map(tag => (
              <span key={tag} className="req-tag">{tag}</span>
            ))}
            {salary && (
              <span className="req-tag" style={{ color: '#69db7c', borderColor: 'rgba(105,219,124,0.3)' }}>{salary}</span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {/* Status badge */}
          <span
            className="status-badge"
            style={{
              background: statusCfg.bg,
              color: statusCfg.color,
              border: `1px solid ${statusCfg.color}33`,
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusCfg.color, flexShrink: 0 }} />
            {statusCfg.label}
          </span>

          {/* Archive btn */}
          <button
            className="role-card-action"
            onClick={onArchive}
            disabled={archiving || status === 'closed'}
            title="Archive role"
          >
            {archiving
              ? <div className="loading-spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />
              : <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>archive</span>
            }
          </button>
        </div>
      </div>

      {/* Description snippet */}
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: 'var(--on-surface-var)', lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {(role.description || '').split('---')[0].trim()}
      </p>

      {/* Footer: skills + applicant count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {skills.map(s => (
            <span key={s} className="skill-tag" style={{ cursor: 'default', fontSize: '0.6875rem' }}>{s}</span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: count > 0 ? 'var(--primary)' : 'var(--outline)', fontWeight: 600 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>group</span>
          {count} applicant{count !== 1 ? 's' : ''}
          {priority && (
            <span
              className="status-badge"
              style={{ marginLeft: '0.375rem', background: 'transparent', border: `1px solid ${PRIORITY_COLORS[priority?.toLowerCase()] || '#555'}44`, color: PRIORITY_COLORS[priority?.toLowerCase()] || 'var(--outline)', fontSize: '0.5625rem', letterSpacing: '0.1em' }}
            >
              {priority}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const PRIORITY_COLORS = { critical: '#ff6b6b', high: '#ff9f43', medium: '#ffd43b', low: '#69db7c' };
