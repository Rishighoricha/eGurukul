import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useEduTrack } from '../context/EduTrackContext';
import { DEFAULT_SUBJECTS } from '../data/defaultSubjects';
import { generateClassRosterPDF } from '../services/pdfService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AnalyticsPage() {
  const {
    students,
    totalCount,
    avgAttendance,
    getStudentSubjects,
    theme
  } = useEduTrack();

  const isDark = theme === 'dark';

  // Compute Class-Wide Subject Analytics across all students
  const subjectAggregates = DEFAULT_SUBJECTS.map(defSub => {
    let totalLecs = 0;
    let totalAtt = 0;
    let defaultersInSubject = 0;

    students.forEach(stu => {
      const subs = getStudentSubjects(stu.name);
      const matched = subs.find(s => s.code === defSub.code);
      if (matched) {
        totalLecs += Number(matched.total) || 0;
        totalAtt += Number(matched.attended) || 0;
        const pct = matched.total > 0 ? (matched.attended / matched.total) * 100 : 0;
        if (pct < 75) defaultersInSubject++;
      }
    });

    const classAverage = totalLecs > 0 ? Math.round((totalAtt / totalLecs) * 100) : 0;

    return {
      name: defSub.name,
      code: defSub.code,
      credits: defSub.credits,
      totalLectures: defSub.total,
      classAverage,
      defaultersInSubject
    };
  });

  // Sort by hardest subject (lowest average attendance)
  const sortedSubjects = [...subjectAggregates].sort((a, b) => a.classAverage - b.classAverage);

  // Distribution Brackets
  const criticalBracket = students.filter(s => s.attendance < 60).length;
  const riskBracket = students.filter(s => s.attendance >= 60 && s.attendance < 75).length;
  const monitoringBracket = students.filter(s => s.attendance >= 75 && s.attendance < 85).length;
  const distinctionBracket = students.filter(s => s.attendance >= 85).length;

  // Chart configuration for subject averages
  const barChartData = {
    labels: subjectAggregates.map(s => (s.name.length > 16 ? s.name.substring(0, 14) + '...' : s.name)),
    datasets: [
      {
        label: 'Class Average Attendance (%)',
        data: subjectAggregates.map(s => s.classAverage),
        backgroundColor: subjectAggregates.map(s => (s.classAverage < 75 ? '#dc2626' : '#2563eb')),
        borderRadius: 6
      }
    ]
  };

  const barChartOptions = {
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
        grid: { color: isDark ? '#1e293b' : '#f1f5f9' }
      },
      x: {
        ticks: { color: isDark ? '#cbd5e1' : '#475569', font: { size: 10 } },
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => subjectAggregates[items[0].dataIndex].name,
          label: (context) => ` Class Average: ${context.raw}%`
        }
      }
    }
  };

  return (
    <div className="container mt-4 mb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="et-page-title mb-1">
            <i className="bi bi-bar-chart-steps text-info me-2"></i>Class-Wide Analytics &amp; Subject Difficulty Index
          </h2>
          <p className="et-page-sub mb-0">
            Identify institutional bottlenecks, course difficulty trends, and cohort attendance distribution across Semester III.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => generateClassRosterPDF(students)}
          disabled={students.length === 0}
        >
          <i className="bi bi-file-earmark-pdf-fill me-1"></i>Export Full Class Report (PDF)
        </button>
      </div>

      {/* Cohort Distribution Cards */}
      <div className="row mb-4 g-3">
        <div className="col-md-3">
          <div className="et-stat-card border-danger border-start border-4">
            <div className="et-stat-icon et-icon-danger">
              <i className="bi bi-radioactive"></i>
            </div>
            <div>
              <div className="et-stat-label">Critical Deficit (&lt;60%)</div>
              <div className="et-stat-value text-danger">{criticalBracket}</div>
              <small className="text-muted">Urgent Parent Summons</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="et-stat-card border-warning border-start border-4">
            <div className="et-stat-icon et-icon-accent">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <div>
              <div className="et-stat-label">Warning Zone (60-74%)</div>
              <div className="et-stat-value text-warning">{riskBracket}</div>
              <small className="text-muted">Formal Notice Dispatched</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="et-stat-card border-primary border-start border-4">
            <div className="et-stat-icon et-icon-info">
              <i className="bi bi-shield-check"></i>
            </div>
            <div>
              <div className="et-stat-label">Compliant (75-84%)</div>
              <div className="et-stat-value text-info">{monitoringBracket}</div>
              <small className="text-muted">Satisfactory Standing</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="et-stat-card border-success border-start border-4">
            <div className="et-stat-icon et-icon-success">
              <i className="bi bi-trophy-fill"></i>
            </div>
            <div>
              <div className="et-stat-label">Distinction (85%+)</div>
              <div className="et-stat-value text-success">{distinctionBracket}</div>
              <small className="text-muted">Exemplary Attendance</small>
            </div>
          </div>
        </div>
      </div>

      {/* Class Average Bar Chart */}
      <div className="card shadow-sm mb-4">
        <div className="card-header py-3 d-flex justify-content-between align-items-center">
          <span className="fw-bold">
            <i className="bi bi-graph-up text-primary me-2"></i>Class-Wide Average Attendance per Course
          </span>
          <span className="badge bg-secondary">Cohort Average: {avgAttendance}%</span>
        </div>
        <div className="card-body" style={{ minHeight: '300px', position: 'relative' }}>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
      </div>

      {/* Subject Difficulty & Defaulter Impact Table */}
      <div className="card shadow-sm">
        <div className="card-header py-3">
          <span className="fw-bold">
            <i className="bi bi-sort-numeric-down text-danger me-2"></i>Subject Difficulty &amp; Defaulter Impact Ranking
          </span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Rank</th>
                  <th>Course Name</th>
                  <th>Code</th>
                  <th className="text-center">Credits</th>
                  <th className="text-center">Class Average</th>
                  <th className="text-center">Students Under 75%</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {sortedSubjects.map((sub, index) => {
                  const isHighRisk = sub.classAverage < 75;
                  return (
                    <tr key={sub.code}>
                      <td className="fw-bold text-muted">#{index + 1}</td>
                      <td className="fw-bold small">{sub.name}</td>
                      <td className="font-monospace text-muted small">{sub.code}</td>
                      <td className="text-center">{sub.credits}</td>
                      <td className="text-center">
                        <span className={`badge ${isHighRisk ? 'bg-danger' : 'bg-primary'} fs-6`}>
                          {sub.classAverage}%
                        </span>
                      </td>
                      <td className="text-center fw-bold">
                        {sub.defaultersInSubject > 0 ? (
                          <span className="text-danger">{sub.defaultersInSubject} student(s)</span>
                        ) : (
                          <span className="text-success">0 students</span>
                        )}
                      </td>
                      <td>
                        {isHighRisk ? (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                            High Subject Deficit
                          </span>
                        ) : (
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                            Normal Load
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
    </div>
  );
}
