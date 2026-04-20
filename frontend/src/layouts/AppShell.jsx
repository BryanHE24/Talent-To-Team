import React from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: 'group',      label: 'Talent Pipeline', path: '/hr',  tabId: 'pipeline' },
  { icon: 'work',       label: 'Open Roles',      path: '/hr',  tabId: 'roles'    },
  { icon: 'analytics',  label: 'Analytics',       path: '/hr',  tabId: 'pipeline' },
  { icon: 'psychology', label: 'Insights',        path: '/hr',  tabId: 'pipeline' },
  { icon: 'settings',   label: 'Settings',        path: '/hr',  tabId: 'pipeline' },
];

export default function AppShell({ children, activePath, onLogout, user, onNewRole }) {
  const navigate  = useNavigate();

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'HR';

  return (
    <div className="app-shell">
      {/* ── Nav Drawer ── */}
      <aside className="nav-drawer anim-slide-left">
        <div className="nav-drawer-logo">HIREFLOW</div>

        <div className="nav-drawer-user">
          <div className="nav-user-avatar">{initials}</div>
          <div>
            <div className="nav-user-name">{user?.email?.split('@')[0] || 'HR Admin'}</div>
            <div className="nav-user-tier">Premium Tier</div>
          </div>
        </div>

        <ul className="nav-list">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <button
                className={`nav-item ${activePath === item.path && item.label === 'Talent Pipeline' ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Sidebar CTA */}
        {onNewRole && (
          <button className="nav-new-role-btn" onClick={onNewRole}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_circle</span>
            New Role
          </button>
        )}

        <div className="nav-footer">PREMIUM TIER • A2A ENGINE</div>
      </aside>

      {/* ── Main Canvas ── */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-search">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              placeholder="Search candidates, roles, or commands..."
            />
          </div>
          <div className="top-bar-right">
            {/* "+ New Role" CTA in top bar */}
            {onNewRole && (
              <button className="topbar-new-role-btn" onClick={onNewRole}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                New Role
              </button>
            )}
            <div>
              <div className="top-bar-title">Command Center</div>
              <div className="top-bar-subtitle">System Operational</div>
            </div>
            {onLogout && (
              <button className="icon-btn magnetic-btn" onClick={onLogout} title="Logout">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <div className="page-canvas anim-fade-up">
          {children}
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="bottom-nav">
        {['dashboard', 'person_search', 'work', 'account_circle'].map((icon, i) => (
          <span
            key={icon}
            className="material-symbols-outlined"
            style={{
              color: i === 0 ? 'var(--tertiary)' : '#555',
              fontSize: '22px', cursor: 'pointer',
              filter: i === 0 ? 'drop-shadow(0 0 6px rgba(76,215,246,0.6))' : 'none',
              transition: 'transform 0.2s',
            }}
          >
            {icon}
          </span>
        ))}
      </nav>

      {/* ── FAB — triggers New Role ── */}
      <button className="fab" onClick={onNewRole} title="Create new role">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}
