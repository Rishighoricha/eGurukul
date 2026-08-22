import React, { useState } from 'react';
import { useEduTrack } from '../context/EduTrackContext';
import { generateStudentWarningPDF, generateClassRosterPDF, generateGenericWarningPDF } from '../services/pdfService';
import SubjectModal from '../components/SubjectModal';

import ParentAlertModal from '../components/ParentAlertModal';
import BulkImportModal from '../components/BulkImportModal';

export default function StudentsPage() {
  const {
    students,
    totalCount,
    safeCount,
    riskCount,
    addStudent,
    deleteStudent,
    clearAllData,
    resetToSampleData,
    getStudentSubjects
  } = useEduTrack();

  const [nameInput, setNameInput] = useState('');
  const [prnInput, setPrnInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [formFeedback, setFormFeedback] = useState(null);

  // Modal States
  const [editingStudent, setEditingStudent] = useState(null);

  const [alertingStudent, setAlertingStudent] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setFormFeedback(null);
    const res = addStudent(nameInput, prnInput);
    if (res.success) {
      setFormFeedback({ type: 'success', text: res.message });
      setNameInput('');
      setPrnInput('');
      setTimeout(() => setFormFeedback(null), 3000);
    } else {
      setFormFeedback({ type: 'danger', text: res.message });
    }
  };

  const handleBulkAlert = () => {
    const riskStudents = students.filter(s => s.attendance < 75);
    if (riskStudents.length === 0) {
      alert("No high-risk defaulters (<75%) found in the system!");
      return;
    }
    const studentNames = riskStudents.map(s => s.name).join(', ');
    alert(`Automated Alert Dispatched:\n\nSimulated WhatsApp parent notices dispatched for ${riskStudents.length} defaulters:\n${studentNames}\n\nParent counseling logs recorded under SDG 10.`);
  };

  // Filter students
  const filteredStudents = students.filter(stu => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = stu.name.toLowerCase().includes(query) || (stu.prn && stu.prn.toLowerCase().includes(query));
    const matchesFilter =
      currentFilter === 'all' ||
      (currentFilter === 'safe' && stu.attendance >= 75) ||
      (currentFilter === 'risk' && stu.attendance < 75);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mt-4 mb-5">
      {/* Top Banner with Quick Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="et-page-title mb-1">
            <i className="bi bi-people-fill text-primary me-2"></i>Student Master Roster
          </h2>
          <p className="et-page-sub mb-0">
            Register students, edit 10-course lecture attendance, generate official warning letters, and dispatch parent notices.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => setIsBulkModalOpen(true)}
          >
            <i className="bi bi-file-earmark-spreadsheet-fill me-1"></i>Import / Export CSV
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => generateClassRosterPDF(students)}
            disabled={students.length === 0}
          >
            <i className="bi bi-printer-fill me-1"></i>Master Roster PDF
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => generateGenericWarningPDF()}
            title="Download a blank printable warning letter — fill in student details by hand"
          >
            <i className="bi bi-file-earmark-pdf-fill me-1"></i>Blank Warning Form (PDF)
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-info"
            onClick={resetToSampleData}
            title="Reload SAKEC Sem-III Sample Roster"
          >
            <i className="bi bi-arrow-clockwise me-1"></i>Reset Demo Data
          </button>
        </div>
      </div>

      <div className="row">
        {/* ADD NEW STUDENT FORM */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm sticky-top" style={{ top: '80px', zIndex: 10 }}>
            <div className="card-header fw-bold py-3 bg-success text-white">
              <i className="bi bi-person-plus-fill me-2"></i>Register New Student
            </div>
            <div className="card-body">
              {formFeedback && (
                <div className={`alert alert-${formFeedback.type} py-2 small`} role="alert">
                  {formFeedback.text}
                </div>
              )}

              <form onSubmit={handleAddSubmit}>
                <div className="mb-3">
                  <label htmlFor="studentName" className="form-label fw-bold small text-muted text-uppercase">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    id="studentName"
                    className="form-control"
                    placeholder="e.g. Aditya Sharma"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="studentPRN" className="form-label fw-bold small text-muted text-uppercase">
                    University PRN
                  </label>
                  <input
                    type="text"
                    id="studentPRN"
                    className="form-control font-monospace"
                    placeholder="e.g. 125BTCM1006"
                    value={prnInput}
                    onChange={(e) => setPrnInput(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-success w-100 fw-bold">
                  <i className="bi bi-plus-circle-fill me-1"></i>Add Student to SAKEC Roster
                </button>
              </form>

              <div className="mt-3 p-2 bg-light rounded border small text-muted">
                <i className="bi bi-info-circle-fill text-primary me-1"></i>
                Overall attendance starts at 0% and is automatically calculated when you enter subject-wise lectures.
              </div>
            </div>
          </div>
        </div>

        {/* STUDENT ROSTER TABLE */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header py-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold fs-6">
                  <i className="bi bi-table me-2 text-primary"></i>Enrolled Students Directory
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    if (window.confirm("WARNING: This will erase all students, subject logs, and counseling records. Continue?")) {
                      clearAllData();
                    }
                  }}
                  disabled={students.length === 0}
                >
                  <i className="bi bi-trash3 me-1"></i>Clear All Data
                </button>
              </div>

              {/* QUICK STATS COUNTERS */}
              <div className="row text-center mb-3 g-2">
                <div className="col-4">
                  <div className="p-2 bg-light rounded border border-primary border-opacity-25">
                    <span className="text-muted small d-block fw-bold">TOTAL</span>
                    <h5 className="fw-bold mb-0 text-primary">{totalCount}</h5>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 bg-light rounded border border-success border-opacity-25">
                    <span className="text-muted small d-block fw-bold">SAFE (&ge;75%)</span>
                    <h5 className="fw-bold mb-0 text-success">{safeCount}</h5>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 bg-light rounded border border-danger border-opacity-25">
                    <span className="text-muted small d-block fw-bold">RISK (&lt;75%)</span>
                    <h5 className="fw-bold mb-0 text-danger">{riskCount}</h5>
                  </div>
                </div>
              </div>

              {/* SEARCH & FILTER BAR */}
              <div className="input-group mb-2">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search student by full name or PRN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="btn-group w-100">
                <button
                  type="button"
                  className={`btn btn-sm ${currentFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setCurrentFilter('all')}
                >
                  All ({totalCount})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${currentFilter === 'safe' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setCurrentFilter('safe')}
                >
                  On Track &ge;75% ({safeCount})
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${currentFilter === 'risk' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => setCurrentFilter('risk')}
                >
                  High Risk &lt;75% ({riskCount})
                </button>
              </div>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Student Name</th>
                      <th>PRN</th>
                      <th>Overall %</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-5">
                          <i className="bi bi-people fs-2 d-block mb-1 text-secondary"></i>
                          {students.length === 0
                            ? "No students registered yet. Add a student or click 'Reset Demo Data'."
                            : "No students match your filter search."}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((stu) => {
                        const isRisk = stu.attendance < 75;
                        return (
                          <tr key={stu.name}>
                            <td>
                              <div className="fw-bold">{stu.name}</div>
                              {stu.attendance < 60 && (
                                <span className="badge bg-danger-subtle text-danger border border-danger-subtle" style={{ fontSize: '0.65rem' }}>
                                  Critical &lt;60%
                                </span>
                              )}
                            </td>
                            <td className="font-monospace text-secondary small">{stu.prn || 'N/A'}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <span className={`fw-bold fs-6 ${isRisk ? 'text-danger' : 'text-success'}`}>
                                  {stu.attendance}%
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${isRisk ? 'bg-danger' : 'bg-success'}`}>
                                {isRisk ? 'High Risk' : 'On Track'}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center justify-content-end gap-1">
                                {/* Official Warning PDF */}
                                {isRisk && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    title="Generate Official 7-Day Warning PDF"
                                    onClick={() => {
                                      const subs = getStudentSubjects(stu.name);
                                      generateStudentWarningPDF(stu.name, stu.prn, stu.attendance, subs);
                                    }}
                                  >
                                    <i className="bi bi-file-earmark-pdf-fill"></i>
                                  </button>
                                )}

                                {/* WhatsApp Alert */}
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-success"
                                  title="Dispatch WhatsApp / Email Parent Alert"
                                  onClick={() => setAlertingStudent(stu)}
                                >
                                  <i className="bi bi-whatsapp"></i>
                                </button>



                                {/* Subject Attendance Modal */}
                                <button
                                  type="button"
                                  className="btn btn-sm btn-primary"
                                  title="Edit 10 Sem-III Subject Lectures"
                                  onClick={() => setEditingStudent(stu.name)}
                                >
                                  <i className="bi bi-pencil-square"></i>
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  title="Delete Student"
                                  onClick={() => {
                                    if (window.confirm(`Delete record for ${stu.name}?`)) {
                                      deleteStudent(stu.name);
                                    }
                                  }}
                                >
                                  <i className="bi bi-trash3"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bulk Action Footer */}
            <div className="card-footer py-3 d-flex justify-content-between align-items-center bg-light">
              <span className="small text-muted">
                Showing <strong>{filteredStudents.length}</strong> of <strong>{totalCount}</strong> students
              </span>
              <button
                type="button"
                className="btn btn-sm btn-warning fw-bold text-white"
                onClick={handleBulkAlert}
                disabled={riskCount === 0}
              >
                <i className="bi bi-megaphone-fill me-1"></i>Dispatch Bulk Alerts to {riskCount} Defaulters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SubjectModal
        studentName={editingStudent}
        isOpen={Boolean(editingStudent)}
        onClose={() => setEditingStudent(null)}
      />



      <ParentAlertModal
        student={alertingStudent}
        isOpen={Boolean(alertingStudent)}
        onClose={() => setAlertingStudent(null)}
      />

      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />
    </div>
  );
}
