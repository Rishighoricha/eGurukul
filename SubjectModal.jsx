import React, { useState, useEffect } from 'react';
import { useEduTrack } from '../context/EduTrackContext';

export default function SubjectModal({ studentName, isOpen, onClose }) {
  const { getStudentSubjects, saveStudentSubjects } = useEduTrack();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (studentName && isOpen) {
      const subs = getStudentSubjects(studentName);
      setSubjects(JSON.parse(JSON.stringify(subs)));
    }
  }, [studentName, isOpen]);

  if (!isOpen || !studentName) return null;

  const handleAttendedChange = (index, value) => {
    const parsed = parseInt(value, 10);
    const updated = [...subjects];
    const max = updated[index].total;
    const cleanVal = isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), max);
    updated[index] = { ...updated[index], attended: cleanVal };
    setSubjects(updated);
  };

  // Calculate live summary
  let totalLecs = 0;
  let totalAtt = 0;
  subjects.forEach(s => {
    totalLecs += Number(s.total) || 0;
    totalAtt += Number(s.attended) || 0;
  });
  const overallPct = totalLecs > 0 ? Math.round((totalAtt / totalLecs) * 100) : 0;

  const handleSave = () => {
    saveStudentSubjects(studentName, subjects);
    onClose();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div
            className="modal-header text-white"
            style={{ background: 'linear-gradient(135deg, var(--et-primary) 0%, var(--et-primary-dark) 100%)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-journal-check fs-5 text-warning"></i>
              <div>
                <h5 className="modal-title fw-bold mb-0">Update Semester III Attendance</h5>
                <small className="text-white-50">Student: <strong className="text-white">{studentName}</strong></small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4">
            {/* Live Progress Bar */}
            <div className="p-3 bg-light rounded border mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-bold text-uppercase text-secondary">
                  Recalculated Overall Attendance
                </span>
                <span className={`badge ${overallPct >= 75 ? 'bg-success' : 'bg-danger'} fs-6`}>
                  {overallPct}% {overallPct >= 75 ? '(Safe Zone)' : '(Defaulter Risk)'}
                </span>
              </div>
              <div className="progress progress-slim">
                <div
                  className={`progress-bar ${overallPct >= 75 ? 'bg-success' : 'bg-danger'}`}
                  style={{ width: `${overallPct}%` }}
                ></div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Course Name</th>
                    <th>Code</th>
                    <th className="text-center">Total</th>
                    <th className="text-center" style={{ width: '130px' }}>Attended</th>
                    <th className="text-end">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub, index) => {
                    const pct = sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 0;
                    const isRisk = pct < 75;

                    return (
                      <tr key={index}>
                        <td>
                          <div className="fw-bold small">{sub.name}</div>
                          <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                            Credits: {sub.credits || 3}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.72rem' }}>
                            {sub.code}
                          </span>
                        </td>
                        <td className="text-center text-muted fw-bold">{sub.total}</td>
                        <td className="text-center">
                          <input
                            type="number"
                            className="form-control form-control-sm text-center fw-bold"
                            value={sub.attended}
                            min="0"
                            max={sub.total}
                            onChange={(e) => handleAttendedChange(index, e.target.value)}
                          />
                        </td>
                        <td className="text-end">
                          <span className={`fw-bold ${isRisk ? 'text-danger' : 'text-success'}`}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-sm btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-sm btn-success fw-bold" onClick={handleSave}>
              <i className="bi bi-check-circle-fill me-1"></i>Save &amp; Recalculate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
