import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend
} from 'chart.js';
import { useEduTrack } from '../context/EduTrackContext';
import { generateStudentWarningPDF } from '../services/pdfService';
import SubjectModal from '../components/SubjectModal';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, ChartLegend);

export default function SubjectsPage() {
  const {
    students,
    lastSelectedStudent,
    setSelectedStudent,
    getStudentSubjects,
    theme
  } = useEduTrack();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  const isDark = theme === 'dark';

  // Determine active student
  const activeStudentName =
    lastSelectedStudent && students.some(s => s.name === lastSelectedStudent)
      ? lastSelectedStudent
      : students[0]?.name || '';

  const activeStudent = students.find(s => s.name === activeStudentName) || null;
  const subjects = activeStudentName ? getStudentSubjects(activeStudentName) : [];

  // Compute metrics
  let totalLecs = 0;
  let totalAtt = 0;
  let riskSubjectsCount = 0;
  const labels = [];
  const percentages = [];
  const barColors = [];

  subjects.forEach(sub => {
    const pct = sub.total > 0 ? Number(((sub.attended / sub.total) * 100).toFixed(1)) : 0;
    totalLecs += Number(sub.total) || 0;
    totalAtt += Number(sub.attended) || 0;

    labels.push(sub.name);
    percentages.push(pct);

    if (pct < 75) {
      riskSubjectsCount++;
      barColors.push('#dc2626');
    } else {
      barColors.push('#10b981');
    }
  });

  const overallPct = totalLecs > 0 ? Math.round((totalAtt / totalLecs) * 100) : 0;
  const isOverallRisk = overallPct < 75;

  // Chart config
  const chartData = {
    labels: labels.map(l => (l.length > 18 ? l.substring(0, 16) + '...' : l)),
    datasets: [
      {
        label: 'Subject Attendance (%)',
        data: percentages,
        backgroundColor: barColors,
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          callback: (val) => `${val}%`
        },
        grid: {
          color: isDark ? '#1e293b' : '#f1f5f9'
        }
      },
      x: {
        ticks: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: { size: 10 }
        },
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => labels[items[0].dataIndex],
          label: (context) => ` Attendance: ${context.raw}%`
        }
      }
    }
  };

  if (students.length === 0) {
    return (
      <div className="container mt-5 text-center py-5">
        <i className="bi bi-person-x-fill text-muted fs-1 mb-3 d-block"></i>
        <h4 className="fw-bold">No Students Registered</h4>
        <p className="text-muted">Please add student records on the Students page to view course breakdowns.</p>
        <Link to="/students" className="btn btn-primary">
          <i className="bi bi-people-fill me-1"></i>Go to Manage Students
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12 text-center">
          <h2 className="et-page-title">Semester III Subject-Wise Performance Breakdown</h2>
          <p className="et-page-sub">
            Monitor course-level load across all 10 SAKEC Sem-III subjects and predict recovery trajectories.
          </p>
          <hr className="w-25 mx-auto" />
        </div>
      </div>

      {/* Student Selector */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <label htmlFor="studentSelector" className="form-label fw-bold text-primary mb-1">
              <i className="bi bi-person-check-fill me-1"></i>Select Student to Inspect
            </label>
            <select
              id="studentSelector"
              className="form-select fw-bold"
              value={activeStudentName}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              {students.map(s => (
                <option key={s.name} value={s.name}>
                  {s.name} (PRN: {s.prn || 'N/A'}) - {s.attendance}%
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Student Standing & Chart */}
      <div className="row mb-4">
        {/* Academic Standing Card */}
        <div className="col-lg-5 mb-4 mb-lg-0">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column justify-content-between p-4">
              <div>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="fw-bold text-primary mb-0">{activeStudent?.name}</h5>
                    <span className="font-monospace text-muted small">PRN: {activeStudent?.prn || 'N/A'}</span>
                  </div>
                  <span className={`badge ${isOverallRisk ? 'bg-danger' : 'bg-success'} fs-6`}>
                    {overallPct}% Overall
                  </span>
                </div>

                <div className="p-3 bg-light rounded border mb-3">
                  <div className="row text-center">
                    <div className="col-4 border-end">
                      <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: '0.68rem' }}>
                        Total Lectures
                      </small>
                      <h5 className="fw-bold mb-0 text-primary">{totalLecs}</h5>
                    </div>
                    <div className="col-4 border-end">
                      <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: '0.68rem' }}>
                        Attended
                      </small>
                      <h5 className="fw-bold mb-0 text-success">{totalAtt}</h5>
                    </div>
                    <div className="col-4">
                      <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: '0.68rem' }}>
                        Risk Subjects
                      </small>
                      <h5 className={`fw-bold mb-0 ${riskSubjectsCount > 0 ? 'text-danger' : 'text-success'}`}>
                        {riskSubjectsCount}
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="small text-muted mb-3">
                  {isOverallRisk ? (
                    <div className="alert alert-danger py-2 small mb-0">
                      <i className="bi bi-exclamation-octagon-fill me-1"></i>
                      <strong>Action Mandated:</strong> Student is under the university 75% threshold. Issue parent warning notice and schedule remedial counseling.
                    </div>
                  ) : (
                    <div className="alert alert-success py-2 small mb-0">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      <strong>Good Standing:</strong> Meets university requirements across overall Semester III courses.
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex flex-column gap-2 mt-3">
                <button
                    type="button"
                    className="btn btn-sm btn-primary w-100 fw-bold"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <i className="bi bi-pencil-square me-1"></i>Edit Lectures
                  </button>

                {isOverallRisk && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger fw-bold"
                    onClick={() => generateStudentWarningPDF(activeStudent?.name, activeStudent?.prn, overallPct, subjects)}
                  >
                    <i className="bi bi-file-earmark-pdf-fill me-1"></i>Download SAKEC 7-Day Warning Letter (PDF)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Distribution Chart */}
        <div className="col-lg-7">
          <div className="card h-100 shadow-sm">
            <div className="card-header fw-bold py-3 d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-bar-chart-line-fill me-1 text-primary"></i>Course-Wise Percentage Distribution
              </span>
              <span className="badge bg-secondary">75% Benchmark</span>
            </div>
            <div className="card-body" style={{ minHeight: '260px', position: 'relative' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* SAKEC Sem III Full Course Roster & AI Recovery Recommendations Table */}
      <div className="card shadow-sm">
        <div className="card-header fw-bold py-3 d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-journal-text me-1 text-primary"></i>Sem III Course Roster &amp; AI Recovery Analyzer
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => setIsEditModalOpen(true)}
          >
            <i className="bi bi-pencil me-1"></i>Update Lecture Attendance
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Course Name</th>
                  <th>Code</th>
                  <th className="text-center">Credits</th>
                  <th className="text-center">Total</th>
                  <th className="text-center">Attended</th>
                  <th className="text-center">Percentage</th>
                  <th>AI Recovery Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, idx) => {
                  const pct = sub.total > 0 ? Number(((sub.attended / sub.total) * 100).toFixed(1)) : 0;
                  const isRisk = pct < 75;
                  const neededTo75 = Math.ceil(0.75 * sub.total) - sub.attended;

                  return (
                    <tr key={idx}>
                      <td className="fw-bold small">{sub.name}</td>
                      <td>
                        <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.72rem' }}>
                          {sub.code}
                        </span>
                      </td>
                      <td className="text-center text-muted">{sub.credits || 3}</td>
                      <td className="text-center">{sub.total}</td>
                      <td className="text-center fw-bold text-primary">{sub.attended}</td>
                      <td className="text-center">
                        <span className={`badge ${isRisk ? 'bg-danger' : 'bg-success'}`}>
                          {pct}%
                        </span>
                      </td>
                      <td>
                        {isRisk ? (
                          <span className="text-danger small fw-bold">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                            Deficit! Attend next {Math.max(neededTo75, 1)} lecture(s) continuously.
                          </span>
                        ) : (
                          <span className="text-success small fw-bold">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Safe zone (Above mandatory 75%)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SubjectModal
        studentName={activeStudentName}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />


    </div>
  );
}
