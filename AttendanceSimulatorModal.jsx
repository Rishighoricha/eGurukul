import React, { useState, useEffect } from 'react';
import { useEduTrack } from '../context/EduTrackContext';

export default function AttendanceSimulatorModal({ studentName, isOpen, onClose }) {
  const { getStudentSubjects } = useEduTrack();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('ALL');
  const [targetPercentage, setTargetPercentage] = useState(75);
  const [extraLecturesToAttend, setExtraLecturesToAttend] = useState(5);

  useEffect(() => {
    if (studentName && isOpen) {
      const subs = getStudentSubjects(studentName);
      setSubjects(subs);
      setSelectedSubjectCode('ALL');
    }
  }, [studentName, isOpen]);

  if (!isOpen || !studentName) return null;

  // Calculate current metrics based on selection
  let currentTotal = 0;
  let currentAttended = 0;

  if (selectedSubjectCode === 'ALL') {
    subjects.forEach(s => {
      currentTotal += Number(s.total) || 0;
      currentAttended += Number(s.attended) || 0;
    });
  } else {
    const sub = subjects.find(s => s.code === selectedSubjectCode);
    if (sub) {
      currentTotal = Number(sub.total) || 0;
      currentAttended = Number(sub.attended) || 0;
    }
  }

  const currentPct = currentTotal > 0 ? ((currentAttended / currentTotal) * 100).toFixed(1) : 0;

  // Projection 1: If user attends next X consecutive lectures
  const projectedTotal = currentTotal + extraLecturesToAttend;
  const projectedAttended = currentAttended + extraLecturesToAttend;
  const projectedPct = projectedTotal > 0 ? ((projectedAttended / projectedTotal) * 100).toFixed(1) : 0;

  // Projection 2: Required consecutive lectures to reach target percentage T
  // (currentAttended + x) / (currentTotal + x) >= T / 100
  // 100 * currentAttended + 100x >= T * currentTotal + Tx
  // x * (100 - T) >= T * currentTotal - 100 * currentAttended
  const targetT = targetPercentage;
  let requiredLectures = 0;
  if (currentPct < targetT) {
    if (targetT < 100) {
      const needed = Math.ceil((targetT * currentTotal - 100 * currentAttended) / (100 - targetT));
      requiredLectures = Math.max(needed, 0);
    } else {
      requiredLectures = "Impossible (Already missed classes)";
    }
  }

  // Projection 3: Bunk / Miss Allowance (How many can be missed while staying >= 75%)
  // currentAttended / (currentTotal + y) >= 0.75
  // currentAttended >= 0.75 * currentTotal + 0.75 * y
  // y <= (currentAttended - 0.75 * currentTotal) / 0.75
  let missAllowance = 0;
  if (currentPct >= 75) {
    missAllowance = Math.max(0, Math.floor((currentAttended - 0.75 * currentTotal) / 0.75));
  }

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div
            className="modal-header text-white"
            style={{ background: 'linear-gradient(135deg, var(--et-info) 0%, var(--et-primary) 100%)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-calculator-fill fs-5 text-warning"></i>
              <div>
                <h5 className="modal-title fw-bold mb-0">Attendance "What-If" Simulator</h5>
                <small className="text-white-50">Predict recovery path for: <strong className="text-white">{studentName}</strong></small>
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
            {/* Scope Selection */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted text-uppercase">Simulation Scope</label>
                <select
                  className="form-select fw-bold"
                  value={selectedSubjectCode}
                  onChange={(e) => setSelectedSubjectCode(e.target.value)}
                >
                  <option value="ALL">Entire Sem-III Combined Load (11 Subjects)</option>
                  {subjects.map(sub => (
                    <option key={sub.code} value={sub.code}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted text-uppercase">Target Goal (%)</label>
                <div className="btn-group w-100">
                  {[75, 80, 85, 90].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`btn btn-sm ${targetPercentage === val ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setTargetPercentage(val)}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Baseline Card */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="p-3 bg-light rounded border text-center">
                  <small className="text-muted text-uppercase fw-bold d-block">Current Standing</small>
                  <h3 className={`fw-bold mb-0 ${currentPct < 75 ? 'text-danger' : 'text-success'}`}>
                    {currentPct}%
                  </h3>
                  <small className="text-muted">{currentAttended} / {currentTotal} lectures</small>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 bg-light rounded border text-center">
                  <small className="text-muted text-uppercase fw-bold d-block">Needed for {targetPercentage}%</small>
                  <h3 className="fw-bold text-primary mb-0">
                    {typeof requiredLectures === 'number' ? `+${requiredLectures}` : requiredLectures}
                  </h3>
                  <small className="text-muted">Consecutive lectures</small>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 bg-light rounded border text-center">
                  <small className="text-muted text-uppercase fw-bold d-block">Safe Bunk Margin (&ge;75%)</small>
                  <h3 className="fw-bold text-success mb-0">
                    {missAllowance > 0 ? `${missAllowance} lectures` : '0 (At/Below 75%)'}
                  </h3>
                  <small className="text-muted">Can miss without penalty</small>
                </div>
              </div>
            </div>

            {/* Interactive Slider */}
            <div className="p-3 bg-light rounded border mb-3">
              <label className="form-label fw-bold d-flex justify-content-between">
                <span>Interactive Projection: Attend next <strong>{extraLecturesToAttend}</strong> lectures</span>
                <span className="badge bg-primary fs-6">{projectedPct}%</span>
              </label>
              <input
                type="range"
                className="form-range"
                min="0"
                max="30"
                step="1"
                value={extraLecturesToAttend}
                onChange={(e) => setExtraLecturesToAttend(Number(e.target.value))}
              />
              <div className="d-flex justify-content-between text-muted small mt-1">
                <span>0 lectures</span>
                <span>+15 lectures</span>
                <span>+30 lectures</span>
              </div>
            </div>

            <div className="alert alert-info d-flex align-items-center mb-0" role="alert">
              <i className="bi bi-lightbulb-fill fs-5 me-2 text-info"></i>
              <div className="small">
                <strong>Strategic Advice:</strong> {currentPct < 75 ? (
                  `To clear defaulter status and reach ${targetPercentage}%, ${studentName} must maintain 100% attendance across the next ${requiredLectures} scheduled session(s).`
                ) : (
                  `Great job! ${studentName} is safely above 75%. To achieve distinction (85%+), continue regular attendance.`
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-sm btn-primary fw-bold" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
