import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useEduTrack } from '../context/EduTrackContext';
import { generateInterventionStrategy } from '../services/aiService';

export default function PipelinePage() {
  const {
    pipelineTasks,
    movePipelineStage,
    saveAiStrategy,
    getStudentSubjects
  } = useEduTrack();

  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAI, setLoadingAI] = useState({});
  const [editingNoteStudent, setEditingNoteStudent] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Request browser notification permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  // Compute live pipeline metrics
  const totalCases = pipelineTasks.length;
  const pendingCases = pipelineTasks.filter(t => t.stage === 'action_required').length;
  const activeCases = pipelineTasks.filter(t => t.stage === 'monitoring').length;
  const resolvedCases = pipelineTasks.filter(t => t.stage === 'resolved').length;
  const successRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;

  // Filter tasks
  const filteredTasks = pipelineTasks.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.prn && t.prn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStageChange = (name, newStage) => {
    movePipelineStage(name, newStage);
    if (newStage === 'resolved') {
      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("SDG 4 & 10 Milestone Achieved", {
          body: `Academic intervention completed for ${name}. Student secured.`,
          icon: "/favicon.ico"
        });
      }
    }
  };

  const handleGenerateAI = async (studentName, attendance) => {
    setLoadingAI(prev => ({ ...prev, [studentName]: true }));
    try {
      const subs = getStudentSubjects(studentName);
      const weakSubs = subs
        .filter(s => s.total > 0 && (s.attended / s.total) < 0.75)
        .map(s => s.name);

      const strategy = await generateInterventionStrategy(studentName, attendance, weakSubs);
      saveAiStrategy(studentName, strategy);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(prev => ({ ...prev, [studentName]: false }));
    }
  };

  const handleSaveNote = (studentName) => {
    movePipelineStage(studentName, undefined, noteText);
    setEditingNoteStudent(null);
    setNoteText('');
  };

  const exportToCSV = () => {
    const headers = "Student Name,University PRN,Attendance (%),Stage,AI Strategy,Counselor Notes\n";
    const csvRows = pipelineTasks.map(t => {
      const cleanStrat = (t.strategy || 'N/A').replace(/"/g, '""');
      const cleanNote = (t.note || '').replace(/"/g, '""');
      return `"${t.name}","${t.prn || 'N/A'}",${t.attendance},"${t.stage.toUpperCase()}","${cleanStrat}","${cleanNote}"`;
    }).join("\n");

    const blob = new Blob([headers + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eGurukul_Intervention_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="container mt-4 mb-5">
      {/* Page Title */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-2">
        <div>
          <h2 className="et-page-title mb-1">
            <i className="bi bi-kanban-fill text-warning me-2"></i>Academic Risk Pipeline &amp; Command Center
          </h2>
          <p className="et-page-sub mb-0">
            Interactive counseling workflow (SDG 10) to guide at-risk students through personalized recovery strategies.
          </p>
        </div>
      </div>

      {/* TOP CONTROL PANEL: METRICS & SEARCH & EXPORT */}
      <div className="metrics-card p-4 mb-4 shadow-sm">
        <div className="row align-items-center">
          <div className="col-md-3 mb-3 mb-md-0">
            <h6 className="text-info fw-bold text-uppercase mb-1" style={{ letterSpacing: '0.04em' }}>
              <i className="bi bi-graph-up-arrow me-1"></i>SDG 10 Resolution Rate
            </h6>
            <div className="d-flex justify-content-between small mb-1 fw-bold">
              <span>Secured Cases</span>
              <span>{successRate}%</span>
            </div>
            <div className="progress progress-slim">
              <div className="progress-bar bg-success" style={{ width: `${successRate}%` }}></div>
            </div>
          </div>

          <div className="col-md-5 mb-3 mb-md-0 text-center d-flex justify-content-evenly">
            <div>
              <h3 className="text-danger fw-bold mb-0">{pendingCases}</h3>
              <small className="text-muted fw-bold">Action Required</small>
            </div>
            <div>
              <h3 className="text-warning fw-bold mb-0">{activeCases}</h3>
              <small className="text-muted fw-bold">Active Counseling</small>
            </div>
            <div>
              <h3 className="text-success fw-bold mb-0">{resolvedCases}</h3>
              <small className="text-muted fw-bold">Resolved / Safe</small>
            </div>
          </div>

          <div className="col-md-4 text-end">
            <div className="input-group mb-2">
              <span className="input-group-text"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Filter student in pipeline..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-info w-100 fw-bold"
              onClick={exportToCSV}
            >
              <i className="bi bi-download me-1"></i>Download Pipeline CSV Report
            </button>
          </div>
        </div>
      </div>

      {/* KANBAN BOARD (3 COLUMNS) */}
      <div className="row kanban-board-container">
        {/* Column 1: Action Required */}
        <div className="col-md-4 mb-4">
          <div className="kanban-column">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-danger">
              <h6 className="fw-bold text-danger mb-0">
                <i className="bi bi-exclamation-octagon-fill me-2"></i>Action Required (&lt;75%)
              </h6>
              <span className="badge bg-danger">{filteredTasks.filter(t => t.stage === 'action_required').length}</span>
            </div>

            <div className="d-flex flex-column gap-3 flex-grow-1">
              {filteredTasks
                .filter(t => t.stage === 'action_required')
                .map(t => (
                  <KanbanCard
                    key={t.name}
                    task={t}
                    borderClass="border-danger-left"
                    loadingAI={loadingAI[t.name]}
                    onGenerateAI={() => handleGenerateAI(t.name, t.attendance)}
                    onMove={(stage) => handleStageChange(t.name, stage)}
                    onOpenNote={() => {
                      setEditingNoteStudent(t.name);
                      setNoteText(t.note || '');
                    }}
                  />
                ))}
              {filteredTasks.filter(t => t.stage === 'action_required').length === 0 && (
                <div className="text-center text-muted py-5 my-auto">
                  <i className="bi bi-check2-circle fs-2 text-success d-block mb-1"></i>
                  <small>No critical pending cases.</small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Active Monitoring */}
        <div className="col-md-4 mb-4">
          <div className="kanban-column">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-warning">
              <h6 className="fw-bold text-warning mb-0">
                <i className="bi bi-clock-history me-2"></i>Active Counseling (75-84%)
              </h6>
              <span className="badge bg-warning text-dark">{filteredTasks.filter(t => t.stage === 'monitoring').length}</span>
            </div>

            <div className="d-flex flex-column gap-3 flex-grow-1">
              {filteredTasks
                .filter(t => t.stage === 'monitoring')
                .map(t => (
                  <KanbanCard
                    key={t.name}
                    task={t}
                    borderClass="border-warning-left"
                    loadingAI={loadingAI[t.name]}
                    onGenerateAI={() => handleGenerateAI(t.name, t.attendance)}
                    onMove={(stage) => handleStageChange(t.name, stage)}
                    onOpenNote={() => {
                      setEditingNoteStudent(t.name);
                      setNoteText(t.note || '');
                    }}
                  />
                ))}
              {filteredTasks.filter(t => t.stage === 'monitoring').length === 0 && (
                <div className="text-center text-muted py-5 my-auto">
                  <small>No students in active monitoring.</small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Resolved */}
        <div className="col-md-4 mb-4">
          <div className="kanban-column">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-success">
              <h6 className="fw-bold text-success mb-0">
                <i className="bi bi-shield-check me-2"></i>Secured &amp; Resolved (&ge;85%)
              </h6>
              <span className="badge bg-success">{filteredTasks.filter(t => t.stage === 'resolved').length}</span>
            </div>

            <div className="d-flex flex-column gap-3 flex-grow-1">
              {filteredTasks
                .filter(t => t.stage === 'resolved')
                .map(t => (
                  <KanbanCard
                    key={t.name}
                    task={t}
                    borderClass="border-success-left"
                    loadingAI={loadingAI[t.name]}
                    onGenerateAI={() => handleGenerateAI(t.name, t.attendance)}
                    onMove={(stage) => handleStageChange(t.name, stage)}
                    onOpenNote={() => {
                      setEditingNoteStudent(t.name);
                      setNoteText(t.note || '');
                    }}
                  />
                ))}
              {filteredTasks.filter(t => t.stage === 'resolved').length === 0 && (
                <div className="text-center text-muted py-5 my-auto">
                  <small>No cases resolved yet.</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Counselor Note Modal */}
      {editingNoteStudent && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h6 className="modal-title fw-bold">Counselor Intervention Notes: {editingNoteStudent}</h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEditingNoteStudent(null)}></button>
              </div>
              <div className="modal-body p-3">
                <label className="form-label small text-muted text-uppercase fw-bold">Internal Academic Action Log</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Record parent discussions, medical leave justifications, or assigned remedial mentor..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setEditingNoteStudent(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-primary fw-bold"
                  onClick={() => handleSaveNote(editingNoteStudent)}
                >
                  Save Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanCard({ task, borderClass, loadingAI, onGenerateAI, onMove, onOpenNote }) {
  const isRisk = task.attendance < 75;

  return (
    <div className={`student-card p-3 ${borderClass}`}>
      <div className="d-flex justify-content-between align-items-start mb-1">
        <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '180px' }}>
          {task.name}
        </h6>
        <span className={`badge ${isRisk ? 'bg-danger' : 'bg-success'}`}>
          {task.attendance}%
        </span>
      </div>

      <div className="font-monospace text-muted small mb-2" style={{ fontSize: '0.72rem' }}>
        PRN: {task.prn || 'N/A'}
      </div>

      {/* AI Strategy Display or Generator Button */}
      {task.strategy ? (
        <div className="p-2 mb-2 rounded bg-light border border-info border-opacity-25 small">
          <div className="fw-bold text-info mb-1" style={{ fontSize: '0.72rem' }}>
            <i className="bi bi-robot me-1"></i>Llama 3.1 Strategy:
          </div>
          <span className="text-secondary" style={{ fontSize: '0.8rem' }}>{task.strategy}</span>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary w-100 mb-2 py-1"
          style={{ fontSize: '0.78rem' }}
          onClick={onGenerateAI}
          disabled={loadingAI}
        >
          {loadingAI ? (
            <span>
              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
              Generating Strategy...
            </span>
          ) : (
            <span>
              <i className="bi bi-magic me-1"></i>Generate AI Recovery Plan
            </span>
          )}
        </button>
      )}

      {/* Counselor Note Preview */}
      {task.note && (
        <div className="p-2 mb-2 rounded bg-light border small text-muted" style={{ fontSize: '0.75rem' }}>
          <i className="bi bi-journal-text me-1 text-primary"></i>
          <strong>Log:</strong> {task.note}
        </div>
      )}

      {/* Action Toolbar */}
      <div className="d-flex justify-content-between align-items-center pt-2 border-top gap-1">
        <button
          type="button"
          className="btn btn-sm btn-link text-decoration-none p-0 small text-muted"
          style={{ fontSize: '0.75rem' }}
          onClick={onOpenNote}
        >
          <i className="bi bi-pencil me-1"></i>{task.note ? 'Edit Log' : '+ Add Log'}
        </button>

        <div className="btn-group">
          {task.stage !== 'action_required' && (
            <button
              type="button"
              className="btn btn-xs btn-outline-danger py-0 px-2"
              title="Move back to High Risk"
              onClick={() => onMove('action_required')}
              style={{ fontSize: '0.72rem' }}
            >
              &larr; Risk
            </button>
          )}

          {task.stage !== 'monitoring' && (
            <button
              type="button"
              className="btn btn-xs btn-outline-warning py-0 px-2"
              title="Move to Active Counseling"
              onClick={() => onMove('monitoring')}
              style={{ fontSize: '0.72rem' }}
            >
              Monitor
            </button>
          )}

          {task.stage !== 'resolved' && (
            <button
              type="button"
              className="btn btn-xs btn-outline-success py-0 px-2 fw-bold"
              title="Mark Secured & Resolved (SDG 4 Target)"
              onClick={() => onMove('resolved')}
              style={{ fontSize: '0.72rem' }}
            >
              Resolve &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
