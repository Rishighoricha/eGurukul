import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useEduTrack } from '../context/EduTrackContext';

export default function Navbar() {
  const { theme, toggleTheme, riskCount } = useEduTrack();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark et-navbar shadow-sm sticky-top">
      <div className="container-fluid">
        <Link to="/" className="et-brand navbar-brand mb-0 h1">
          <span className="et-brand-mark">
            <i className="bi bi-mortarboard-fill"></i>
          </span>
          <span>
            eGurukul
            <span className="et-brand-sub">SAKEC &middot; Sem III &middot; Rishi and Aditya (Aditya Ghosh Roll no 14, Rishi Ghoricha Roll no 13)</span>
          </span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="navbar-nav me-auto ms-lg-3 flex-row flex-wrap gap-1">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-speedometer2 me-1"></i>Dashboard
            </NavLink>
            <NavLink to="/students" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-people-fill me-1"></i>Students
              {riskCount > 0 && (
                <span className="badge bg-danger ms-1 px-1 py-0 rounded-pill" style={{ fontSize: '0.65rem' }}>
                  {riskCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/pipeline" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-kanban-fill me-1"></i>Pipeline
            </NavLink>
            <NavLink to="/subjects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-journal-bookmark-fill me-1"></i>Subjects
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-bar-chart-steps me-1"></i>Analytics
            </NavLink>
            <NavLink to="/sdg" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-globe-asia-australia me-1"></i>SDG Goals
            </NavLink>
          </div>

          <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
            <button
              type="button"
              id="etThemeToggle"
              className="et-theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              onClick={toggleTheme}
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
