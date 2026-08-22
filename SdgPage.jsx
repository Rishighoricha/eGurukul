import React from 'react';
import { useEduTrack } from '../context/EduTrackContext';

export default function SdgPage() {
  const { totalCount, safeCount, riskCount, pipelineTasks } = useEduTrack();

  const resolvedInPipeline = pipelineTasks.filter(t => t.stage === 'resolved').length;
  const resolutionRate = pipelineTasks.length > 0 ? Math.round((resolvedInPipeline / pipelineTasks.length) * 100) : 100;

  return (
    <div className="container mt-4 mb-5">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12 text-center">
          <h2 className="et-page-title">Sustainable Development Goals (SDG) Alignment</h2>
          <p className="et-page-sub">
            How eGurukul transforms routine academic monitoring at SAKEC into measurable contributions toward global UN sustainability benchmarks.
          </p>
          <hr className="w-25 mx-auto" />
        </div>
      </div>

      <div className="row g-4">
        {/* SDG 4 Card */}
        <div className="col-lg-6">
          <div className="card h-100 border-top border-warning border-4 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="bg-warning text-white rounded p-3 fw-bold fs-3 me-3 d-flex align-items-center justify-content-center"
                  style={{ width: '64px', height: '64px' }}
                >
                  SDG 4
                </div>
                <div>
                  <h4 className="card-title fw-bold mb-0">Quality Education</h4>
                  <small className="text-muted">Ensure inclusive and equitable quality education and promote lifelong learning</small>
                </div>
              </div>

              <div className="p-3 bg-light rounded border mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-bold text-uppercase text-secondary">Class On-Track Benchmark</span>
                  <span className="fw-bold text-success">{safeCount} / {totalCount} Students Safe</span>
                </div>
                <div className="progress progress-slim">
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${totalCount > 0 ? (safeCount / totalCount) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <p className="card-text text-secondary">
                Sustainable Development Goal 4 focuses on eliminating disparities in education and ensuring that all learners acquire essential competencies. Within our institutional framework:
              </p>

              <ul className="list-unstyled text-secondary small">
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-warning me-2"></i>
                  <strong>Continuous Proactive Monitoring:</strong> Live calculation across 10 SAKEC Semester III course loads prevents undetected dropout tendencies.
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-warning me-2"></i>
                  <strong>Early Academic Intervention:</strong> Immediate risk alerts identify attendance dips before students reach irreversible exam debarment thresholds.
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-warning me-2"></i>
                  <strong>Remedial Recommendation Engine:</strong> AI-powered GurukulBot advisor specifies exact lecture attendance targets required for academic recovery.
                </li>
              </ul>

              <div className="mt-4 pt-3 border-top">
                <a
                  href="https://sdgs.un.org/goals/goal4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-warning text-dark fw-bold"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i>Explore Official UN SDG 4 Guidelines
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SDG 10 Card */}
        <div className="col-lg-6">
          <div className="card h-100 border-top border-danger border-4 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="bg-danger text-white rounded p-3 fw-bold fs-3 me-3 d-flex align-items-center justify-content-center"
                  style={{ width: '64px', height: '64px' }}
                >
                  SDG 10
                </div>
                <div>
                  <h4 className="card-title fw-bold mb-0">Reduced Inequalities</h4>
                  <small className="text-muted">Reduce inequality within and among institutions and communities</small>
                </div>
              </div>

              <div className="p-3 bg-light rounded border mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-bold text-uppercase text-secondary">Pipeline Counseling Resolution Rate</span>
                  <span className="fw-bold text-danger">{resolutionRate}% Resolved</span>
                </div>
                <div className="progress progress-slim">
                  <div
                    className="progress-bar bg-danger"
                    style={{ width: `${resolutionRate}%` }}
                  ></div>
                </div>
              </div>

              <p className="card-text text-secondary">
                Sustainable Development Goal 10 seeks to empower vulnerable demographics and leave no one behind. In academic settings, socio-economic factors frequently manifest as attendance deficits:
              </p>

              <ul className="list-unstyled text-secondary small">
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-danger me-2"></i>
                  <strong>Bridging Communication Gaps:</strong> Instant WhatsApp and official jsPDF 7-Day parent notices ensure equitable transparency for guardians.
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-danger me-2"></i>
                  <strong>Personalized Mentor Counseling:</strong> Llama 3.1 AI generated intervention strategies tailor recovery paths to individual student weaknesses.
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-danger me-2"></i>
                  <strong>Equitable Retention Tracking:</strong> The Kanban Pipeline actively tracks student progression from High Risk to Secured.
                </li>
              </ul>

              <div className="mt-4 pt-3 border-top">
                <a
                  href="https://sdgs.un.org/goals/goal10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-danger fw-bold"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i>Explore Official UN SDG 10 Guidelines
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SYSTEM ARCHITECTURE & INTEGRATION BOX */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h5 className="fw-bold text-primary mb-3">
                <i className="bi bi-diagram-3-fill me-2"></i>eGurukul System Architecture &amp; Methodology
              </h5>
              <p className="text-secondary mb-3">
                eGurukul has been architected as a modern, reactive single-page application built on <strong>Vite</strong>, <strong>React 18</strong>, <strong>React Router</strong>, and <strong>Context API</strong>. State is synced bidirectionally with local persistent storage to guarantee zero data loss and lightning-fast responsiveness.
              </p>
              <div className="row g-3 text-center">
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded border">
                    <i className="bi bi-cpu-fill text-primary fs-4 d-block mb-1"></i>
                    <strong className="small d-block">React 18 &amp; Vite</strong>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Reactive UI &amp; Fast HMR</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded border">
                    <i className="bi bi-robot text-info fs-4 d-block mb-1"></i>
                    <strong className="small d-block">NVIDIA Llama 3.1</strong>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Personalized Mentoring</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded border">
                    <i className="bi bi-file-earmark-pdf-fill text-danger fs-4 d-block mb-1"></i>
                    <strong className="small d-block">Client-Side jsPDF</strong>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Instant Warning Notices</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="p-3 bg-light rounded border">
                    <i className="bi bi-pie-chart-fill text-success fs-4 d-block mb-1"></i>
                    <strong className="small d-block">Chart.js Visuals</strong>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Dynamic Cohort Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
