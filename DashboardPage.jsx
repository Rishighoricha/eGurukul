import React from 'react';
import { Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useEduTrack } from '../context/EduTrackContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const {
    totalCount,
    safeCount,
    riskCount,
    mediumRiskCount,
    onTrackCount,
    avgAttendance,
    criticalStudents,
    defaulterStudents,
    theme
  } = useEduTrack();

  const isDark = theme === 'dark';

  // Chart Configuration
  const chartData = {
    labels: ['High Risk (<75%)', 'Medium Risk (75-84%)', 'On Track (85%+)'],
    datasets: [
      {
        data: [riskCount, mediumRiskCount, onTrackCount],
        backgroundColor: ['#dc2626', '#f59e0b', '#10b981'],
        borderColor: isDark ? '#16223a' : '#ffffff',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: { family: 'Inter', size: 12, weight: 600 },
          padding: 18
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const val = context.raw || 0;
            const pct = totalCount > 0 ? Math.round((val / totalCount) * 100) : 0;
            return ` ${context.label}: ${val} students (${pct}%)`;
          }
        }
      }
    },
    cutout: '65%'
  };

  return (
    <div className="container mt-4 mb-5">
      {/* FEATURE 1: LIVE CRITICAL ALERTS TICKER (<60%) */}
      {criticalStudents.length > 0 && (
        <div className="mb-4">
          <div className="alert alert-danger d-flex align-items-center shadow-sm border-danger border-start border-4" role="alert">
            <div className="me-3 fs-3 text-danger">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="alert-heading fw-bold mb-1">
                  CRITICAL DROPOUT RISK ALERT (Under 60% Attendance)
                </h6>
                <span className="badge bg-danger">{criticalStudents.length} Critical Case(s)</span>
              </div>
              <p className="mb-0 small">
                Attention required! The following students require immediate intervention:{' '}
                <strong>
                  {criticalStudents.map(s => `${s.name} (${s.attendance}%)`).join(', ')}
                </strong>
                . Immediate parent counseling and formal warning letters recommended.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 2: QUICK ACTION TOOLBAR */}
      <div className="card border-0 mb-4">
        <div className="card-body py-3">
          <div className="row align-items-center">
            <div className="col-md-5 mb-2 mb-md-0">
              <span className="fw-bold text-secondary small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i>Quick Actions Toolbar
              </span>
            </div>
            <div className="col-md-7 text-md-end d-flex flex-wrap gap-2 justify-content-md-end">
              <Link to="/students" className="btn btn-sm btn-success fw-bold">
                <i className="bi bi-person-plus-fill me-1"></i>Add / Manage Students
              </Link>
              <Link to="/pipeline" className="btn btn-sm btn-warning fw-bold text-white">
                <i className="bi bi-kanban-fill me-1"></i>Pipeline Board
              </Link>
              <Link to="/subjects" className="btn btn-sm btn-primary fw-bold">
                <i className="bi bi-bar-chart-fill me-1"></i>Sem III Breakdown
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* TOP KPI METRIC CARDS */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="et-stat-card">
            <div className="et-stat-icon et-icon-primary">
              <i className="bi bi-people-fill"></i>
            </div>
            <div>
              <div className="et-stat-label">Total Students</div>
              <div className="et-stat-value" id="statTotal">{totalCount}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="et-stat-card">
            <div className="et-stat-icon et-icon-success">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div>
              <div className="et-stat-label">On Track (&ge;75%)</div>
              <div className="et-stat-value text-success" id="statSafe">{safeCount}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="et-stat-card">
            <div className="et-stat-icon et-icon-danger">
              <i className="bi bi-exclamation-octagon-fill"></i>
            </div>
            <div>
              <div className="et-stat-label">Defaulters (&lt;75%)</div>
              <div className="et-stat-value text-danger" id="statRisk">{riskCount}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="et-stat-card">
            <div className="et-stat-icon et-icon-info">
              <i className="bi bi-graph-up"></i>
            </div>
            <div>
              <div className="et-stat-label">Avg Attendance</div>
              <div className="et-stat-value text-info" id="statAvg">{avgAttendance}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT ROW */}
      <div className="row align-items-start">
        {/* Risk Analysis Doughnut Chart */}
        <div className="col-lg-7 mb-4">
          <div className="card h-100">
            <div className="card-header fw-bold py-3 d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-pie-chart-fill me-1 text-primary"></i>Risk Analysis Overview (SDG 4 &amp; 10)
              </span>
              <span className="badge bg-secondary">Live Chart</span>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              {totalCount > 0 ? (
                <div style={{ position: 'relative', height: '320px', width: '100%' }}>
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
                  <p className="mb-0">No student records found. Add students to display chart.</p>
                </div>
              )}
              <p className="text-muted small mt-3 text-center mb-0">
                {totalCount > 0
                  ? `Analyzing data across ${totalCount} active student enrollment(s).`
                  : "Go to 'Manage Students' to populate data."}
              </p>
            </div>
          </div>
        </div>

        {/* SYSTEM GUIDE & SDG OVERVIEW CARD */}
        <div className="col-lg-5 mb-4">
          <div className="card h-100" style={{ borderColor: 'var(--et-primary)' }}>
            <div
              className="card-header fw-bold py-3"
              style={{ background: 'linear-gradient(135deg, var(--et-primary) 0%, var(--et-primary-dark) 100%)', color: '#fff', borderBottom: 'none' }}
            >
              <i className="bi bi-lightning-charge-fill me-1 text-warning"></i>System Guide &amp; Institutional Overview
            </div>
            <div className="card-body">
              <h6 className="fw-bold mb-2">Welcome to eGurukul</h6>
              <p className="small text-muted mb-3">
                An institutional tracking intelligence platform built for SAKEC Semester III to prevent academic dropout by bridging local course monitoring with UN Sustainable Development Goals.
              </p>
              <hr className="my-2" />
              <div className="small">
                <p className="fw-bold mb-2 text-primary">Core Modules &amp; Capabilities</p>
                <ul className="ps-3 mb-3">
                  <li className="mb-1">
                    <strong>Manage Students:</strong> Register University PRN records, update 10 Sem-III courses via modal, and generate official 7-day warning notices.
                  </li>
                  <li className="mb-1">
                    <strong>Pipeline Center:</strong> Interactive Kanban counseling workflow with Llama 3.1 AI personalized strategy generation.
                  </li>
                  <li className="mb-1">
                    <strong>Subject Tracker:</strong> Monitor credit distributions across all 10 SAKEC Sem-III courses.
                  </li>
                  <li>
                    <strong>SDG Alignment:</strong> Direct contributions to UN SDG 4 (Quality Education) and SDG 10 (Reduced Inequalities).
                  </li>
                </ul>
                <div className="p-2 bg-light rounded border border-primary border-opacity-25">
                  <i className="bi bi-robot me-1 text-primary"></i>
                  <strong>Tip:</strong> Need instant help? Open the <strong>GurukulBot</strong> assistant at the bottom right corner of any page.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK DEFAULTERS SUMMARY LIST */}
      {defaulterStudents.length > 0 && (
        <div className="card mt-2">
          <div className="card-header py-3 d-flex justify-content-between align-items-center">
            <span className="fw-bold text-danger">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>Immediate Attention: Defaulter Roster ({defaulterStudents.length})
            </span>
            <Link to="/students" className="btn btn-sm btn-outline-danger">
              Take Action on Roster <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Student Name</th>
                    <th>PRN</th>
                    <th>Attendance</th>
                    <th>Deficit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {defaulterStudents.map((s, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold">{s.name}</td>
                      <td className="font-monospace text-secondary">{s.prn || 'N/A'}</td>
                      <td>
                        <span className="badge bg-danger fs-6">{s.attendance}%</span>
                      </td>
                      <td className="text-danger fw-bold">-{75 - s.attendance}% to threshold</td>
                      <td>
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                          {s.attendance < 60 ? 'Critical Referral' : 'Parent Warning Needed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
