import React, { useState, useEffect, useRef } from 'react';

const API = 'http://127.0.0.1:8000';

const DEPTS    = ['Engineering', 'Product', 'Design', 'Data', 'Marketing', 'Sales', 'Operations', 'HR', 'Other'];
const EMP_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const STATUSES   = ['Open', 'Paused', 'Closed'];

const STEPS = ['Basics', 'Details', 'Settings'];

const INITIAL = {
  title: '', department: 'Engineering', location: '', employment_type: 'Full-time',
  salary_range: '', description: '', requirements: '', experience_required: '',
  priority: 'High', status: 'Open',
};

export default function CreateRoleModal({ open, onClose, onCreated }) {
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState(INITIAL);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills]       = useState([]);
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');
  const overlayRef                = useRef(null);

  // Reset when opened
  useEffect(() => {
    if (open) {
      setStep(0);
      setForm(INITIAL);
      setSkills([]);
      setSkillInput('');
      setSaving(false);
      setSuccess(false);
      setError('');
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function addSkill(raw) {
    const tag = raw.trim().replace(/,+$/, '');
    if (!tag) return;
    setSkills(s => [...new Set([...s, tag])]);
    setSkillInput('');
  }

  function removeSkill(tag) {
    setSkills(s => s.filter(t => t !== tag));
  }

  function handleSkillKey(e) {
    if (['Enter', ',', 'Tab'].includes(e.key)) {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === 'Backspace' && !skillInput && skills.length) {
      setSkills(s => s.slice(0, -1));
    }
  }

  // Validation per step
  function canAdvance() {
    if (step === 0) return form.title.trim().length > 0;
    if (step === 1) return form.description.trim().length > 0;
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      requirements: [...skills, ...form.requirements.split(',').map(s => s.trim()).filter(Boolean)].join(', '),
    };
    try {
      const res = await fetch(`${API}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || 'Failed to create role');
      setSuccess(true);
      setTimeout(() => {
        onCreated(json.role);
        onClose();
      }, 1600);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={`modal-drawer ${open ? 'modal-drawer--open' : ''}`}>

        {/* ── Header ── */}
        <div className="modal-header">
          <div>
            <div className="modal-title">
              <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '22px' }}>
                add_circle
              </span>
              New Role
            </div>
            <div className="modal-subtitle">
              {success ? 'Role created!' : `Step ${step + 1} of ${STEPS.length} — ${STEPS[step]}`}
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* ── Step Progress ── */}
        <div className="modal-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`modal-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
              <div className="modal-step-dot">
                {i < step
                  ? <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check</span>
                  : i + 1
                }
              </div>
              <span>{s}</span>
            </div>
          ))}
          <div
            className="modal-step-line"
            style={{ '--line-pct': `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* ── Body ── */}
        <div className="modal-body">
          {success ? (
            <SuccessState title={form.title} />
          ) : (
            <form onSubmit={handleSubmit} id="create-role-form">

              {/* ─── Step 0: Basics ─── */}
              {step === 0 && (
                <div className="modal-step-content anim-fade-up">
                  <ModalField label="Role Title *" icon="title">
                    <input
                      className="modal-input"
                      type="text"
                      value={form.title}
                      onChange={e => set('title', e.target.value)}
                      placeholder="e.g. Senior React Engineer"
                      required
                      autoFocus
                    />
                  </ModalField>

                  <div className="modal-row">
                    <ModalField label="Department" icon="domain">
                      <select className="modal-input modal-select" value={form.department} onChange={e => set('department', e.target.value)}>
                        {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </ModalField>
                    <ModalField label="Employment Type" icon="badge">
                      <select className="modal-input modal-select" value={form.employment_type} onChange={e => set('employment_type', e.target.value)}>
                        {EMP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </ModalField>
                  </div>

                  <div className="modal-row">
                    <ModalField label="Location" icon="location_on">
                      <input
                        className="modal-input"
                        type="text"
                        value={form.location}
                        onChange={e => set('location', e.target.value)}
                        placeholder="Remote / San Francisco"
                      />
                    </ModalField>
                    <ModalField label="Salary Range" icon="payments">
                      <input
                        className="modal-input"
                        type="text"
                        value={form.salary_range}
                        onChange={e => set('salary_range', e.target.value)}
                        placeholder="$120k – $160k"
                      />
                    </ModalField>
                  </div>
                </div>
              )}

              {/* ─── Step 1: Details ─── */}
              {step === 1 && (
                <div className="modal-step-content anim-fade-up">
                  <ModalField label="Role Description *" icon="description">
                    <textarea
                      className="modal-input"
                      rows="5"
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Describe what this role involves, the team, and the impact…"
                      required
                    />
                  </ModalField>

                  <ModalField label="Required Skills" icon="psychology_alt">
                    <div className="skill-tag-input">
                      <div className="skill-tags">
                        {skills.map(tag => (
                          <span key={tag} className="skill-tag">
                            {tag}
                            <button type="button" onClick={() => removeSkill(tag)} className="skill-tag-remove">
                              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                            </button>
                          </span>
                        ))}
                        <input
                          className="skill-tag-field"
                          value={skillInput}
                          onChange={e => setSkillInput(e.target.value)}
                          onKeyDown={handleSkillKey}
                          onBlur={() => addSkill(skillInput)}
                          placeholder={skills.length ? '' : 'Type skill, press Enter or comma…'}
                        />
                      </div>
                    </div>
                  </ModalField>

                  <ModalField label="Experience Required" icon="work_history">
                    <input
                      className="modal-input"
                      type="text"
                      value={form.experience_required}
                      onChange={e => set('experience_required', e.target.value)}
                      placeholder="3+ years, Senior level"
                    />
                  </ModalField>
                </div>
              )}

              {/* ─── Step 2: Settings ─── */}
              {step === 2 && (
                <div className="modal-step-content anim-fade-up">
                  <div className="modal-row">
                    <ModalField label="Priority" icon="flag">
                      <div className="priority-grid">
                        {PRIORITIES.map(p => (
                          <button
                            key={p}
                            type="button"
                            className={`priority-btn ${form.priority === p ? 'priority-btn--active' : ''}`}
                            onClick={() => set('priority', p)}
                          >
                            <span className="priority-dot" style={{ background: PRIORITY_COLOR[p] }} />
                            {p}
                          </button>
                        ))}
                      </div>
                    </ModalField>

                    <ModalField label="Status" icon="toggle_on">
                      <div className="status-grid">
                        {STATUSES.map(s => (
                          <button
                            key={s}
                            type="button"
                            className={`status-btn ${form.status === s ? 'status-btn--active' : ''}`}
                            style={form.status === s ? { borderColor: STATUS_COLOR[s], color: STATUS_COLOR[s] } : {}}
                            onClick={() => set('status', s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </ModalField>
                  </div>

                  {/* Preview card */}
                  <div className="role-preview-card">
                    <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--tertiary)', marginBottom: '0.375rem' }}>
                      Preview
                    </div>
                    <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.125rem', color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
                      {form.title || 'Untitled Role'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      {[form.department, form.employment_type, form.location].filter(Boolean).map(v => (
                        <span key={v} className="req-tag">{v}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-var)', lineHeight: 1.5 }}>
                      {form.description.slice(0, 120)}{form.description.length > 120 ? '…' : ''}
                    </div>
                    {skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.75rem' }}>
                        {skills.slice(0, 5).map(s => <span key={s} className="skill-tag" style={{ cursor: 'default' }}>{s}</span>)}
                        {skills.length > 5 && <span className="req-tag">+{skills.length - 5}</span>}
                      </div>
                    )}
                  </div>

                  {error && <div className="form-error" style={{ marginTop: '1rem' }}>{error}</div>}
                </div>
              )}
            </form>
          )}
        </div>

        {/* ── Footer ── */}
        {!success && (
          <div className="modal-footer">
            <button
              type="button"
              className="modal-btn-ghost"
              onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            >
              {step === 0 ? 'Cancel' : '← Back'}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="modal-btn-primary"
                disabled={!canAdvance()}
                onClick={() => setStep(s => s + 1)}
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                form="create-role-form"
                className="modal-btn-primary"
                disabled={saving}
                onClick={step === STEPS.length - 1 ? handleSubmit : undefined}
              >
                {saving ? (
                  <>
                    <div className="loading-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                    Creating…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>rocket_launch</span>
                    Publish Role
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Small helper components ── */
function ModalField({ label, icon, children }) {
  return (
    <div className="modal-field">
      <label className="modal-field-label">
        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--outline)' }}>{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function SuccessState({ title }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }} className="anim-scale-in">
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: 'rgba(76,215,246,0.1)', border: '2px solid var(--tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.25rem',
        boxShadow: '0 0 24px rgba(76,215,246,0.2)',
      }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--tertiary)', fontSize: '32px' }}>check_circle</span>
      </div>
      <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
        Role Published!
      </div>
      <div style={{ color: 'var(--outline)', fontSize: '0.875rem' }}>
        "<strong style={{ color: 'var(--primary)' }}>{title}</strong>" is now live on the Candidate Portal.
      </div>
    </div>
  );
}

const PRIORITY_COLOR = { Critical: '#ff6b6b', High: '#ff9f43', Medium: '#ffd43b', Low: '#69db7c' };
const STATUS_COLOR   = { Open: 'var(--tertiary)', Paused: '#ffd43b', Closed: 'var(--error)' };
