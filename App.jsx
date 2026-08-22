import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import EduBotWidget from './components/EduBotWidget';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import PipelinePage from './pages/PipelinePage';
import SubjectsPage from './pages/SubjectsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SdgPage from './pages/SdgPage';

export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/sdg" element={<SdgPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="py-3 mt-auto border-top text-center text-muted small" style={{ backgroundColor: 'var(--et-surface)' }}>
        <div className="container">
          <span>
            eGurukul • Shah &amp; Anchor Kutchhi Engineering College (SAKEC) • Sem III • Rishi and Aditya (Aditya Ghosh Roll no 14, Rishi Ghoricha Roll no 13) • UN SDG 4 &amp; 10
          </span>
        </div>
      </footer>

      {/* Floating AI Assistant */}
      <EduBotWidget />
    </div>
  );
}
