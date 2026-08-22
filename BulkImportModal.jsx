import React, { useState } from 'react';
import { useEduTrack } from '../context/EduTrackContext';

export default function BulkImportModal({ isOpen, onClose }) {
  const { bulkImportStudents, students, getStudentSubjects } = useEduTrack();
  const [importText, setImportText] = useState('');
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleImport = () => {
    setFeedback(null);
    const text = importText.trim();
    if (!text) {
      setFeedback({ type: 'danger', message: 'Please paste CSV or JSON data to import.' });
      return;
    }

    try {
      // Check if JSON
      if (text.startsWith('[') || text.startsWith('{')) {
        const parsed = JSON.parse(text);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        const res = bulkImportStudents(list);
        if (res.success) {
          setFeedback({ type: 'success', message: `Successfully imported ${res.count} student records from JSON!` });
          setTimeout(() => { onClose(); }, 1500);
        } else {
          setFeedback({ type: 'warning', message: 'No new students imported (duplicates or invalid names).' });
        }
        return;
      }

      // Parse CSV
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      const studentsToImport = [];

      lines.forEach((line, index) => {
        // Skip header if present
        if (index === 0 && (line.toLowerCase().includes('name') || line.toLowerCase().includes('prn'))) return;
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 1 && parts[0]) {
          const name = parts[0];
          const prn = parts[1] || `125BTCM${1000 + Math.floor(Math.random() * 900)}`;
          const attendance = parseInt(parts[2], 10) || 0;
          studentsToImport.push({ name, prn, attendance });
        }
      });

      if (studentsToImport.length > 0) {
        const res = bulkImportStudents(studentsToImport);
        if (res.success) {
          setFeedback({ type: 'success', message: `Successfully imported ${res.count} student(s) from CSV!` });
          setTimeout(() => { onClose(); }, 1500);
        } else {
          setFeedback({ type: 'warning', message: 'All students in file were duplicates.' });
        }
      } else {
        setFeedback({ type: 'danger', message: 'Could not parse any valid student rows from CSV.' });
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: `Import error: ${err.message}` });
    }
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = "Student Name,University PRN,Estimated Attendance\n" +
      "Devanshu Rathod,125BTCM1011,82\n" +
      "Tanvi Shah,125BTCM1033,64\n" +
      "Karan Jaiswal,125BTCM1067,78\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eGurukul_Sample_Roster.csv';
    a.click();
  };

  const handleExportFullJSON = () => {
    const fullData = students.map(s => ({
      name: s.name,
      prn: s.prn,
      attendance: s.attendance,
      subjects: getStudentSubjects(s.name)
    }));
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eGurukul_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div
            className="modal-header text-white"
            style={{ background: 'linear-gradient(135deg, var(--et-primary) 0%, var(--et-primary-dark) 100%)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-spreadsheet-fill fs-5 text-warning"></i>
              <h5 className="modal-title fw-bold mb-0">Bulk Data Import &amp; Database Backup</h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4">
            {feedback && (
              <div className={`alert alert-${feedback.type} alert-dismissible mb-3`} role="alert">
                {feedback.message}
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label fw-bold small text-muted text-uppercase mb-0">
                Paste CSV or JSON Student Roster
              </label>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleDownloadSampleCSV}
                >
                  <i className="bi bi-download me-1"></i>Sample CSV
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={handleExportFullJSON}
                >
                  <i className="bi bi-cloud-arrow-down-fill me-1"></i>Backup Database (JSON)
                </button>
              </div>
            </div>

            <textarea
              className="form-control font-monospace mb-3"
              rows="7"
              placeholder={`Example CSV Format:\nStudent Name,PRN,Attendance\nAditya Verma,125BTCM1088,80\nNeha Joshi,125BTCM1092,55`}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />

            <div className="p-3 bg-light rounded border small text-muted">
              <i className="bi bi-info-circle-fill text-primary me-1"></i>
              <strong>Notice:</strong> When importing via CSV, all 11 SAKEC Sem-III course modules will be automatically initialized for each student with default lecture counts.
            </div>
          </div>

          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-sm btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-success fw-bold"
              onClick={handleImport}
            >
              <i className="bi bi-file-earmark-arrow-up-fill me-1"></i>Import Students
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
