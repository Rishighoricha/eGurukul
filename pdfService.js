import { jsPDF } from 'jspdf';

/**
 * Generate official SAKEC Defaulter Warning Letter for a student
 */
export function generateStudentWarningPDF(studentName, prn = 'N/A', attendance = 0, subjectDetails = []) {
  const doc = new jsPDF();
  const currentDate = new Date();

  const submitDate = new Date();
  submitDate.setDate(submitDate.getDate() + 7);
  const formattedSubmitDate = submitDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Header Banner
  doc.setFillColor(28, 58, 94); // --et-primary
  doc.rect(0, 0, 210, 12, 'F');

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(28, 58, 94);
  doc.text("SHAH & ANCHOR KUTCHHI ENGINEERING COLLEGE", 105, 24, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 110, 125);
  doc.text("Department of Computer Engineering | Semester III Academic Monitoring", 105, 30, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(192, 57, 43); // danger
  doc.text("OFFICIAL ATTENDANCE DEFAULTER & PARENT INTIMATION NOTICE", 105, 38, { align: "center" });

  doc.setDrawColor(200, 205, 215);
  doc.setLineWidth(0.5);
  doc.line(15, 42, 195, 42);

  // Meta info
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 70, 85);
  doc.text(`Notice Date: ${currentDate.toLocaleDateString('en-GB')}`, 18, 49);
  doc.text(`Reference: SAKEC/COMP/SEM-III/DEF/${currentDate.getFullYear()}`, 130, 49);

  // Recipient Box
  doc.setFillColor(245, 247, 250);
  doc.rect(15, 54, 180, 28, 'F');
  doc.setDrawColor(220, 225, 235);
  doc.rect(15, 54, 180, 28, 'S');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(28, 58, 94);
  doc.text("TO: THE PARENT / GUARDIAN OF", 20, 61);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 40, 55);
  doc.text(`Student Name: ${studentName}`, 20, 68);
  doc.text(`University PRN: ${prn || 'N/A'}`, 20, 75);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(192, 57, 43);
  doc.text(`Current Attendance  (CRITICAL DEFICIT): ${attendance}%`, 120, 68);
  doc.setTextColor(100, 110, 125);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Mandatory Threshold: 75.00%`, 120, 75);

  // Body Text
  doc.setFontSize(10);
  doc.setTextColor(35, 45, 60);
  doc.setFont("helvetica", "normal");

  const noticeBody =
    `This is to formally inform you that as per the official academic records of Shah & Anchor Kutchhi Engineering College (SAKEC), your ward has secured only ${attendance}% attendance in Semester III, which is significantly below the statutory minimum requirement of 75% prescribed by Mumbai University.\n\n` +
    `Under Ordinance 6086 (O.6086) of the University, any candidate failing to achieve 75% aggregate attendance is liable to be debarred from appearing in the Semester End Examinations and internal term-work evaluations.\n\n` +
    `You are hereby instructed to treat this intimation with utmost urgency and submit the signed counter-acknowledgment to the Class Teacher within seven (7) days.`;

  doc.text(noticeBody, 18, 90, { maxWidth: 174, lineHeightFactor: 1.45 });

  // Critical Action Callout
  doc.setFillColor(255, 241, 242);
  doc.rect(15, 136, 180, 20, 'F');
  doc.setDrawColor(244, 63, 94);
  doc.setLineWidth(0.8);
  doc.rect(15, 136, 180, 20, 'S');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(190, 18, 60);
  doc.text("MANDATORY COMPLIANCE DEADLINE", 20, 143);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Please countersign and submit this form before ${formattedSubmitDate}. Failure to do so will prompt a direct case referral to the College Disciplinary Committee.`, 20, 150, { maxWidth: 170 });

  // Subject Table if available
  if (subjectDetails && subjectDetails.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(28, 58, 94);
    doc.text("Semester III Course Load Breakdown:", 18, 166);

    let startY = 172;
    doc.setFillColor(235, 240, 248);
    doc.rect(15, startY, 180, 7, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(40, 50, 65);
    doc.text("Subject Code & Name", 18, startY + 5);
    doc.text("Total Lectures", 115, startY + 5);
    doc.text("Attended", 145, startY + 5);
    doc.text("Percentage", 175, startY + 5);

    startY += 8;
    subjectDetails.slice(0, 6).forEach((sub, idx) => {
      const pct = sub.total > 0 ? ((sub.attended / sub.total) * 100).toFixed(0) : 0;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(60, 70, 80);
      doc.text(`${sub.code} - ${sub.name.substring(0, 38)}`, 18, startY);
      doc.text(`${sub.total}`, 122, startY);
      doc.text(`${sub.attended}`, 150, startY);

      if (pct < 75) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(190, 18, 60);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(22, 101, 52);
      }
      doc.text(`${pct}%`, 180, startY);

      startY += 5.5;
    });
  }

  // Signatures
  const signY = 240;
  doc.setDrawColor(180, 190, 205);
  doc.setLineWidth(0.4);

  doc.line(20, signY, 75, signY);
  doc.line(135, signY, 190, signY);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 50, 65);
  doc.text("Parent / Guardian Signature", 20, signY + 6);
  doc.text("Class Teacher / Mentor", 135, signY + 6);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 130, 145);
  doc.text("Date: ________________", 20, signY + 12);
  doc.text("Department of Computer Engg.", 135, signY + 12);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(140, 150, 165);
  doc.text("eGurukul Smart Academic Intelligence System • SAKEC Sem III • Rishi and Aditya (Aditya Ghosh Roll no 14, Rishi Ghoricha Roll no 13) • UN SDG 4 & 10", 105, 287, { align: "center" });

  // Save / open
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, '_blank');
}

/**
 * Generate Class Master Attendance Report
 */
export function generateClassRosterPDF(students) {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('en-GB');

  doc.setFillColor(28, 58, 94);
  doc.rect(0, 0, 210, 12, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(28, 58, 94);
  doc.text("SHAH & ANCHOR KUTCHHI ENGINEERING COLLEGE", 105, 22, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(100, 110, 125);
  doc.text(`Semester III Master Attendance Roster • Generated on ${dateStr}`, 105, 29, { align: "center" });

  doc.setDrawColor(200, 205, 215);
  doc.line(15, 34, 195, 34);

  let y = 44;
  doc.setFillColor(240, 244, 250);
  doc.rect(15, y - 5, 180, 8, 'F');

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 45, 65);
  doc.text("#", 18, y);
  doc.text("Student Name", 28, y);
  doc.text("University PRN", 95, y);
  doc.text("Overall %", 145, y);
  doc.text("Status", 175, y);

  y += 7;
  students.forEach((stu, index) => {
    if (y > 270) {
      doc.addPage();
      y = 25;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(40, 50, 60);

    doc.text(`${index + 1}`, 18, y);
    doc.text(stu.name, 28, y);
    doc.text(stu.prn || 'N/A', 95, y);
    doc.text(`${stu.attendance}%`, 150, y);

    if (stu.attendance < 75) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(190, 18, 60); es
      doc.text("High Risk", 175, y);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(22, 101, 52);
      doc.text("On Track", 175, y);
    }

    y += 6;
  });

  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, '_blank');
}

/**
 * Generate a GENERIC / BLANK Warning Letter Template
 * All student-specific fields are replaced with underlined blank spaces
 * so the mentor can print one form and fill it in by hand for any student.
 */
export function generateGenericWarningPDF() {
  const doc = new jsPDF();

  const submitDate = new Date();
  submitDate.setDate(submitDate.getDate() + 7);
  const formattedSubmitDate = submitDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Helper: draws a label followed by an underlined blank space
  function blankLine(label, x, y, lineLen) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 50, 65);
    doc.text(label, x, y);
    const w = doc.getTextWidth(label);
    doc.setDrawColor(60, 70, 85);
    doc.setLineWidth(0.4);
    doc.line(x + w + 2, y + 0.5, x + w + 2 + lineLen, y + 0.5);
  }

  // ── Header Banner ─────────────────────────────────────────────
  doc.setFillColor(28, 58, 94);
  doc.rect(0, 0, 210, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(28, 58, 94);
  doc.text('SHAH & ANCHOR KUTCHHI ENGINEERING COLLEGE', 105, 24, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 110, 125);
  doc.text('Department of Computer Engineering | Semester III Academic Monitoring', 105, 30, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(192, 57, 43);
  doc.text('OFFICIAL ATTENDANCE DEFAULTER & PARENT INTIMATION NOTICE', 105, 38, { align: 'center' });

  doc.setDrawColor(200, 205, 215);
  doc.setLineWidth(0.5);
  doc.line(15, 42, 195, 42);

  // ── Meta info ─────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 70, 85);
  blankLine('Notice Date:', 18, 49, 45);
  blankLine('Reference: SAKEC/COMP/SEM-III/DEF/', 110, 49, 28);

  // ── Recipient Box ─────────────────────────────────────────────
  doc.setFillColor(245, 247, 250);
  doc.rect(15, 54, 180, 32, 'F');
  doc.setDrawColor(220, 225, 235);
  doc.rect(15, 54, 180, 32, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(28, 58, 94);
  doc.text('TO: THE PARENT / GUARDIAN OF', 20, 62);

  blankLine('Student Name:', 20, 70, 68);
  blankLine('University PRN:', 20, 77, 45);

  // Attendance blank (red)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(192, 57, 43);
  doc.text('Current Attendance:', 120, 70);
  const aw = doc.getTextWidth('Current Attendance:');
  doc.setDrawColor(192, 57, 43);
  doc.setLineWidth(0.4);
  doc.line(120 + aw + 2, 70.5, 120 + aw + 22, 70.5);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(192, 57, 43);
  doc.text('', 120 + aw + 24, 70);

  doc.setTextColor(100, 110, 125);
  doc.setFontSize(8.5);
  doc.text('Mandatory Threshold: 75.00%', 120, 77);

  // ── Body Text ─────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setTextColor(35, 45, 60);
  doc.setFont('helvetica', 'normal');

  const noticeBody =
    'This is to formally inform you that as per the official academic records of Shah & Anchor ' +
    'Kutchhi Engineering College (SAKEC), your ward has secured only _____ % attendance in ' +
    'Semester III, which is significantly below the statutory minimum requirement of 75% ' +
    'prescribed by Mumbai University.\n\n' +
    'Under Ordinance 6086 (O.6086) of the University, any candidate failing to achieve 75% ' +
    'aggregate attendance is liable to be debarred from appearing in the Semester End ' +
    'Examinations and internal term-work evaluations.\n\n' +
    'You are hereby instructed to treat this intimation with utmost urgency and submit the ' +
    'signed counter-acknowledgment to the Class Teacher within seven (7) days.';

  doc.text(noticeBody, 18, 96, { maxWidth: 174, lineHeightFactor: 1.45 });

  // ── Compliance Deadline Box ───────────────────────────────────
  doc.setFillColor(255, 241, 242);
  doc.rect(15, 144, 180, 20, 'F');
  doc.setDrawColor(244, 63, 94);
  doc.setLineWidth(0.8);
  doc.rect(15, 144, 180, 20, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(190, 18, 60);
  doc.text('MANDATORY COMPLIANCE DEADLINE', 20, 151);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    'Please countersign and submit this form before ' + formattedSubmitDate +
    '. Failure to do so will prompt a direct case referral to the College Disciplinary Committee.',
    20, 158, { maxWidth: 170 }
  );

  // ── Subject Table (blank rows for manual fill) ────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(28, 58, 94);
  doc.text('Semester III Course Load Breakdown:', 18, 174);

  let startY = 180;
  // Header row
  doc.setFillColor(235, 240, 248);
  doc.rect(15, startY, 180, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(40, 50, 65);
  doc.text('Subject Code & Name', 18, startY + 5);
  doc.text('Total Lectures', 115, startY + 5);
  doc.text('Attended', 145, startY + 5);
  doc.text('Percentage', 175, startY + 5);

  startY += 9;
  // 6 blank rows with underlines
  for (let i = 0; i < 6; i++) {
    doc.setDrawColor(160, 170, 185);
    doc.setLineWidth(0.3);
    doc.line(18, startY + 0.5, 108, startY + 0.5); // subject
    doc.line(115, startY + 0.5, 135, startY + 0.5); // total
    doc.line(145, startY + 0.5, 162, startY + 0.5); // attended
    doc.line(175, startY + 0.5, 192, startY + 0.5); // percentage
    startY += 6.5;
  }

  // ── Signatures ────────────────────────────────────────────────
  const signY = 240;
  doc.setDrawColor(180, 190, 205);
  doc.setLineWidth(0.4);
  doc.line(20, signY, 75, signY);
  doc.line(135, signY, 190, signY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 50, 65);
  doc.text('Parent / Guardian Signature', 20, signY + 6);
  doc.text('Class Teacher / Mentor', 135, signY + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 130, 145);
  doc.text('Date: ________________', 20, signY + 12);
  doc.text('Department of Computer Engg.', 135, signY + 12);

  // ── Footer ────────────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setTextColor(140, 150, 165);
  doc.text(
    'eGurukul Smart Academic Intelligence System • SAKEC Sem III • Rishi and Aditya (Aditya Ghosh Roll no 14, Rishi Ghoricha Roll no 13) • UN SDG 4 & 10',
    105, 287, { align: 'center' }
  );

  // ── Open ──────────────────────────────────────────────────────
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, '_blank');
}
