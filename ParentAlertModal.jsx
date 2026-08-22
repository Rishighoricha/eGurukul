import React, { useState } from 'react';

export default function ParentAlertModal({ student, isOpen, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !student) return null;

  const todayStr = new Date().toLocaleDateString('en-GB');

  const alertMessage = 
`*SHAH & ANCHOR KUTCHHI ENGINEERING COLLEGE (SAKEC)*
*OFFICIAL ATTENDANCE DEFICIT ALERT*

Dear Parent / Guardian,
This is an urgent academic intimation regarding your ward:
• *Student Name:* ${student.name}
• *University PRN:* ${student.prn || 'N/A'}
• *Current Sem-III Attendance:* ${student.attendance}% (Threshold: 75%)
• *Date:* ${todayStr}

Your ward is currently falling below the statutory 75% attendance criteria. Continued deficit may result in debarment from the Semester End Examinations under University Ordinance 6086.

Please attend an urgent counseling session with the Class Teacher within 7 days.
_Generated via eGurukul Smart Academic Intelligence System (Rishi and Aditya - Aditya Ghosh Roll No. 14 & Rishi Ghoricha Roll No. 13)_`;

  const handleCopy = () => {
    navigator.clipboard.writeText(alertMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppSend = () => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(alertMessage);
    const url = cleanPhone 
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div
            className="modal-header text-white"
            style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-whatsapp fs-4"></i>
              <div>
                <h5 className="modal-title fw-bold mb-0">Parent Communication Dispatch</h5>
                <small className="text-white-50">Recipient: <strong className="text-white">{student.name}</strong></small>
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
            <div className="mb-3">
              <label className="form-label fw-bold small text-muted text-uppercase">
                Parent / Guardian Phone Number (Optional)
              </label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-telephone-fill"></i></span>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="e.g. 919876543210 (with country code)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <small className="text-muted">Leaving empty opens WhatsApp with share sheet selector.</small>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small text-muted text-uppercase">
                Formatted Notice Preview
              </label>
              <textarea
                className="form-control font-monospace"
                rows="8"
                value={alertMessage}
                readOnly
                style={{ fontSize: '0.8rem', backgroundColor: 'var(--et-surface-alt)' }}
              />
            </div>

            <div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary w-100 py-2 fw-semibold"
                onClick={handleCopy}
              >
                <i className={`bi ${copied ? 'bi-check2-all text-success' : 'bi-clipboard'} me-1`}></i>
                {copied ? 'Copied to Clipboard!' : 'Copy Notice Text'}
              </button>
            </div>
          </div>

          <div className="modal-footer bg-light d-flex justify-content-between">
            <button type="button" className="btn btn-sm btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-sm btn-success fw-bold px-4 py-2"
              style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
              onClick={handleWhatsAppSend}
            >
              <i className="bi bi-whatsapp me-1"></i>Dispatch via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
