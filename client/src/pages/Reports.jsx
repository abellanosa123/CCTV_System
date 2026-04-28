import React, { useState, useEffect } from 'react';
import { getReportData } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Download, FileText, FileSpreadsheet, BarChart3, Eye, FileSearch, FileOutput, X, Settings, ShieldAlert } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import cccLogo from '../assets/ccc-logo.png';
import cdrrmoLogo from '../assets/cdrrmo-logo-transparent.png';
import malaybalayLogo from '../assets/MalaybalaySeal.png';
import cctvUnitLogo from '../assets/CCTVUnit_logo_cropped.png';
import emailIcon from '../assets/mail.png';
import phoneIcon from '../assets/telephone.png';
import facebookIcon from '../assets/facebook.png';
import locationIcon from '../assets/placeholder.png';

export default function Reports() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [signatories, setSignatories] = useState(() => {
    const saved = localStorage.getItem('cctv_signatories');
    if (saved) return JSON.parse(saved);
    return {
      preparedBy: { name: 'MICHELLE R. SALES', title: 'CCTV In-Charge' },
      checkedBy: { name: 'RITCHEL B. AGNE, RN, EMT', title: 'CCC Section Head' },
      noted: { name: 'ARIAN JOHNSON B. CAGA-ANAN', title: 'Operations and Warning Division Head' },
      approved: { name: 'ALAN J. COMISO', title: 'CGDH-I (CDRRMO)' }
    };
  });
  const [showSigModal, setShowSigModal] = useState(false);

  // Collapse states for log sections
  const [collapsedObs, setCollapsedObs] = useState(true);
  const [collapsedRev, setCollapsedRev] = useState(true);
  const [collapsedRel, setCollapsedRel] = useState(true);
  const [collapsedBreakdown, setCollapsedBreakdown] = useState(true);
  const [collapsedObsBreakdown, setCollapsedObsBreakdown] = useState(true);

  // Local date filters for specific PDF exports
  const [obsStart, setObsStart] = useState('');
  const [obsEnd, setObsEnd] = useState('');
  const [revStart, setRevStart] = useState('');
  const [revEnd, setRevEnd] = useState('');
  const [relStart, setRelStart] = useState('');
  const [relEnd, setRelEnd] = useState('');

  // Local date filters for breakdowns
  const [obsBrkStart, setObsBrkStart] = useState('');
  const [obsBrkEnd, setObsBrkEnd] = useState('');
  const [revBrkStart, setRevBrkStart] = useState('');
  const [revBrkEnd, setRevBrkEnd] = useState('');

  useEffect(() => {
    localStorage.setItem('cctv_signatories', JSON.stringify(signatories));
  }, [signatories]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;
      const res = await getReportData(params);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to generate report');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const periodLabel = (s = startDate, e = endDate) => {
    const label = (s && e) ? `${s} to ${e}` : (s ? `From ${s}` : (e ? `Up to ${e}` : 'All Records'));
    const timeLabel = (startTime && endTime) ? ` (${formatTimeInfo(startTime)} - ${formatTimeInfo(endTime)})` : '';
    return label + timeLabel;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr || !dateStr.includes('T')) return dateStr || '—';
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const formatTimeInfo = (t) => {
    if (!t) return '';
    try {
      let [h, m] = t.split(':');
      h = parseInt(h, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m} ${ampm}`;
    } catch { return t; }
  };

  // ─── PDF EXPORTS ────────────────────────────────────────────────────────────

  const getLogosB64 = async () => {
    const loadB64 = async (src) => {
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (e) { return null; }
    };
    return Promise.all([
      loadB64(cccLogo),
      loadB64(cdrrmoLogo),
      loadB64(malaybalayLogo),
      loadB64(cctvUnitLogo),
      loadB64(emailIcon),
      loadB64(phoneIcon),
      loadB64(facebookIcon),
      loadB64(locationIcon)
    ]);
  };

  const addSharedLetterHead = async (doc, titleText, subtitleText) => {
    const [cccB64, cdrrmoB64, malaybalayB64, cctvUnitB64] = await getLogosB64();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Dark purple banner with outer border line style
    doc.setDrawColor(80, 50, 110);
    doc.setFillColor(36, 17, 65);
    doc.roundedRect(8, 6, pageWidth - 16, 26, 2, 2, 'FD');

    // Top subtitle
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 200, 215);
    doc.text('C I T Y   G O V E R N M E N T   O F   M A L A Y B A L A Y', pageWidth / 2, 12, { align: 'center' });

    // Main Title
    doc.setFontSize(16);
    doc.setTextColor(255, 120, 255); // Vibrant pinkish-purple
    doc.text('CITY DISASTER RISK REDUCTION & MANAGEMENT OFFICE', pageWidth / 2, 19, { align: 'center' });

    // Pill bg
    doc.setDrawColor(0, 150, 200);
    doc.setFillColor(15, 30, 45);
    const pillWidth = 90;
    doc.roundedRect((pageWidth / 2) - (pillWidth / 2), 22, pillWidth, 9, 3, 3, 'FD');

    // Pill text
    doc.setFontSize(8);
    doc.setTextColor(15, 235, 220); // Cyan
    doc.text('C O M M U N I C A T I O N   C O M M A N D   C E N T R A L', pageWidth / 2, 26, { align: 'center' });
    doc.setFontSize(6);
    doc.text('C C T V   U N I T', pageWidth / 2, 29, { align: 'center' });

    // Logos: Left side CCC, Right side CCTV Unit
    if (cccB64) {
      doc.addImage(cccB64, 'PNG', 12, 6, 21, 26);
    } else {
      doc.setDrawColor(80, 50, 110); doc.setFillColor(20, 10, 35); doc.circle(22, 19, 10, 'FD');
    }

    if (cctvUnitB64) {
      doc.addImage(cctvUnitB64, 'PNG', pageWidth - 32, 8, 22, 22);
    } else {
      doc.setDrawColor(80, 50, 110); doc.setFillColor(20, 10, 35); doc.circle(pageWidth - 22, 19, 10, 'FD');
    }

    // Reset text color to black for the rest of the document
    doc.setTextColor(0, 0, 0);

    // Title and Subtitle Below Letterhead
    if (titleText) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(titleText, pageWidth / 2, 42, { align: 'center' });
    }
    if (subtitleText) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(subtitleText, pageWidth / 2, 47, { align: 'center' });
    }
  };

  const addReadyToSubmitLetterHead = async (doc, titleText, subtitleText) => {
    const [cccB64, cdrrmoB64, malaybalayB64, cctvUnitB64, emailB64, phoneB64, facebookB64, locationB64] = await getLogosB64();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Logos in the header
    doc.setTextColor(0, 0, 0);
    // Left logo: Malaybalay Seal
    if (malaybalayB64) {
      doc.addImage(malaybalayB64, 'PNG', 12, 7, 30, 30);
    }
    // Right logo: CDRRMO Seal
    if (cdrrmoB64) {
      doc.addImage(cdrrmoB64, 'PNG', 43, 7, 30, 30);
    }

    // Main header text "CDRRMO"
    // Make CDRRMO extra bold by adding a small stroke around the text
    doc.setTextColor(70, 75, 80); // dark grayish navy
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(44);
    doc.setDrawColor(70, 75, 80);
    doc.setLineWidth(0.4);
    doc.text('CDRRMO', 75, 23, { renderingMode: 'fillThenStroke' });

    // Reset rendering mode for regular text
    doc.setTextColor(15, 95, 165); // blue to match bar
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('CITY DISASTER RISK REDUCTION', 76, 30, { renderingMode: 'fill' });
    doc.text('AND MANAGEMENT OFFICE', 76, 34, { renderingMode: 'fill' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    // Calculate block left position based on the longest string to format it as a left-aligned block on the right edge
    const maxTextWidth = doc.getTextWidth('CDRRMO Building, Barangay 9, Malaybalay City, Bukidnon');
    const blockLeftX = pageWidth - 14 - maxTextWidth - 6;

    // Contact Info (aligned as a left-justified block on the right side of the page)
    const drawContactLine = (y, iconType, text) => {
      const cx = blockLeftX;
      const cy = y - 1;

      // Solid blue circle background
      doc.setFillColor(31, 102, 178);
      doc.setDrawColor(31, 102, 178);
      doc.circle(cx, cy, 2.5, 'F');

      let iconB64 = null;
      if (iconType === 'email') iconB64 = emailB64;
      else if (iconType === 'phone') iconB64 = phoneB64;
      else if (iconType === 'facebook') iconB64 = facebookB64;
      else if (iconType === 'location') iconB64 = locationB64;

      if (iconB64) {
        doc.addImage(iconB64, 'PNG', cx - 1.5, cy - 1.5, 3, 3);
      }

      // Draw the text
      doc.setTextColor(50, 60, 70);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(text, cx + 4, y, { align: 'left' });
    };

    drawContactLine(13, 'email', 'malaybalaycitydrrmo@gmail.com');
    drawContactLine(19, 'phone', '(088) 813-3611');
    drawContactLine(25, 'facebook', 'CDRRMO-Malaybalay');
    drawContactLine(31, 'location', 'CDRRMO Building, Barangay 9, Malaybalay City, Bukidnon');

    const barY = 41;
    const barH = 12;
    const mainBlueW = pageWidth - 70; // Width before slant

    // Main blue bar rectangle
    doc.setFillColor(15, 95, 165); // Matching vivid blue
    doc.rect(0, barY, mainBlueW, barH, 'F');
    // Slanted right-edge effect (top corner sticks out further right)
    doc.triangle(mainBlueW, barY, mainBlueW + 15, barY, mainBlueW, barY + barH, 'F');

    // Gap, then dark slate/grey slanted block
    doc.setFillColor(35, 50, 65);
    const darkStartX = mainBlueW + 3; // 3px gap to match the photo

    // Draw the slanted left edge of the dark block
    // Point 1: Bottom-Left (darkStartX, barY+barH)
    // Point 2: Top-Left (darkStartX+15, barY)
    // Point 3: Bottom-Right to square it out before the rect: (darkStartX+15, barY+barH)
    doc.triangle(darkStartX, barY + barH, darkStartX + 15, barY, darkStartX + 15, barY + barH, 'F');

    // Fill the rest of the dark block to the right edge of the page
    doc.rect(darkStartX + 15, barY, pageWidth, barH, 'F');

    // Text inside blue bar
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('CCC', 14, barY + 9);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    // It's all caps but slightly smaller for SECTION
    doc.text('COMMUNICATION COMMAND CENTRAL', 38, barY + 5);
    doc.setFontSize(7);
    doc.text('SECTION', 38, barY + 10);

    // Reset color to pure black text
    doc.setTextColor(0, 0, 0);

    // Document Title and Subtitle Below Letterhead
    if (titleText) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(titleText, pageWidth / 2, barY + 22, { align: 'center' });
    }
    if (subtitleText) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(subtitleText, pageWidth / 2, barY + 28, { align: 'center' });
    }
  };

  const exportObservationsPDF = async () => {
    if (!data || !data.observations.length) return toast.warn('No observation data to export');

    // Use local filters or fallback to global ones
    const start = obsStart || startDate;
    const end = obsEnd || endDate;

    const filteredObs = data.observations.filter(o => {
      if (!start && !end) return true;
      if (!o.date) return false;
      if (start && o.date < start) return false;
      if (end && o.date > end) return false;
      return true;
    });

    if (!filteredObs.length) return toast.warn('No records found for the selected local period');

    const doc = new jsPDF({ orientation: 'landscape' });
    await addSharedLetterHead(doc, 'OBSERVATION LOGS', `Period: ${periodLabel(start, end)}   |   Generated: ${new Date().toLocaleString()}`);

    autoTable(doc, {
      startY: 55,
      head: [['#', 'Date', 'Time', 'Camera', 'Street', 'Purok', 'Barangay', 'Type', 'Details', 'Action Taken', 'Dispatch To', 'Dispatch Time', 'Observed By']],
      body: [...filteredObs].reverse().map((o, index) => [
        index + 1,
        o.date || '—',
        formatTimeInfo(o.time) || '—',
        o.camera || '—',
        o.street || '—',
        o.purok || '—',
        o.barangay || o.location || '—',
        o.incidentType || '—',
        o.details || '—',
        o.actionTaken || '—',
        o.dispatchTo || '—',
        formatTimeInfo(o.dispatchTime) || '—',
        o.observedBy || '—'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 9, textColor: 30 },
      alternateRowStyles: { fillColor: [240, 235, 255] },
      styles: { cellPadding: 2 }
    });

    doc.save(`Observation_Logs_${start || 'All'}_${end || 'All'}.pdf`);
    toast.success('Observation PDF exported!');
  };

  const exportReviewsPDF = async () => {
    if (!data || !data.reviews.length) return toast.warn('No review data to export');

    // Use local filters or fallback to global ones
    const start = revStart || startDate;
    const end = revEnd || endDate;

    const filteredRev = data.reviews.filter(r => {
      if (!start && !end) return true;
      if (!r.dateRequested) return false;
      if (start && r.dateRequested < start) return false;
      if (end && r.dateRequested > end) return false;
      return true;
    });

    if (!filteredRev.length) return toast.warn('No records found for the selected local period');

    const doc = new jsPDF({ orientation: 'landscape' });
    await addSharedLetterHead(doc, 'REVIEW LOGS', `Period: ${periodLabel(start, end)}   |   Generated: ${new Date().toLocaleString()}`);

    autoTable(doc, {
      startY: 55,
      head: [['#', 'Date & Time', 'Requestor', 'Barangay', 'Incident Date & Time', 'Type', 'Description', 'Status', 'Operator', 'Result', 'Captured', 'Outcome']],
      body: [...filteredRev].reverse().map((r, index) => [
        index + 1,
        r.dateRequested ? `${r.dateRequested}\n${formatTimeInfo(r.timeRequested)}` : '—',
        r.name || '—',
        r.barangay || r.location || '—',
        r.incidentDate ? `${r.incidentDate}\n${formatTimeInfo(r.incidentTime)}` : '—',
        r.incidentType || '—',
        r.description || '—',
        r.status === 'Pending' ? 'Not Released' : (r.status || 'Not Released'),
        r.reviewedBy || '—',
        r.result || '—',
        r.caughtOnCam || '—',
        r.outcome || '—'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 8.5 },
      bodyStyles: { fontSize: 8, textColor: 30 },
      alternateRowStyles: { fillColor: [240, 235, 255] },
      styles: { cellPadding: 1.5 }
    });

    doc.save(`Review_Logs_${start || 'All'}_${end || 'All'}.pdf`);
    toast.success('Review Logs PDF exported!');
  };

  const exportReleasesPDF = async () => {
    if (!data || !data.releases.length) return toast.warn('No release data to export');

    // Use local filters or fallback to global ones
    const start = relStart || startDate;
    const end = relEnd || endDate;

    const filteredRel = data.releases.filter(r => {
      if (!start && !end) return true;
      if (!r.releaseDate) return false;
      const rDate = r.releaseDate.split('T')[0];
      if (start && rDate < start) return false;
      if (end && rDate > end) return false;
      return true;
    });

    if (!filteredRel.length) return toast.warn('No records found for the selected local period');

    const doc = new jsPDF({ orientation: 'landscape' });
    await addSharedLetterHead(doc, 'RELEASE FOOTAGE LOGS', `Period: ${periodLabel(start, end)}   |   Generated: ${new Date().toLocaleString()}`);

    autoTable(doc, {
      startY: 55,
      head: [['#', 'Release Date', 'Requestor', 'Barangay', 'Incident Date & Time', 'Type', 'Description', 'Captured', 'Reviewed By', 'Released By']],
      body: [...filteredRel].reverse().map((r, index) => [
        index + 1,
        formatDateTime(r.releaseDate),
        r.requestedBy || r.name || '—',
        r.barangay || r.location || '—',
        r.incidentDate ? `${r.incidentDate} ${formatTimeInfo(r.incidentTime)}` : '—',
        r.incidentType || '—',
        r.description || '—',
        r.caughtOnCam || '—',
        r.reviewedBy || '—',
        r.releaserName || '—'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8.5 },
      bodyStyles: { fontSize: 8, textColor: 30 },
      alternateRowStyles: { fillColor: [230, 255, 245] },
      styles: { cellPadding: 1.5 }
    });

    doc.save(`Release_Logs_${start || 'All'}_${end || 'All'}.pdf`);
    toast.success('Release Logs PDF exported!');
  };

  // ─── EXCEL EXPORTS ───────────────────────────────────────────────────────────

  const exportObservationsExcel = () => {
    if (!data || !data.observations.length) return toast.warn('No observation data to export');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.observations.map(o => ({
      'Date': o.date || '',
      'Time': formatTimeInfo(o.time) || '',
      'Camera': o.camera || '',
      'Street': o.street || '',
      'Purok': o.purok || '',
      'Barangay': o.barangay || o.location || '',
      'Incident Type': o.incidentType || '',
      'Details': o.details || '',
      'Action Taken': o.actionTaken || '',
      'Dispatch To': o.dispatchTo || '',
      'Dispatch Time': formatTimeInfo(o.dispatchTime) || ''
    })));
    ws['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 22 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Observation Logs');
    XLSX.writeFile(wb, 'Observation_Logs_Report.xlsx');
    toast.success('Observation Excel exported!');
  };

  const exportReviewsExcel = () => {
    if (!data || !data.reviews.length) return toast.warn('No review data to export');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.reviews.map(r => ({
      'Date Requested': r.dateRequested || '',
      'Time Requested': formatTimeInfo(r.timeRequested) || '',
      'Requestor Name': r.name || '',
      'Phone Number': r.phoneNumber || '',
      'Camera': r.camera || '',
      'Street': r.street || '',
      'Purok': r.purok || '',
      'Barangay': r.barangay || r.location || '',
      'Incident Date': r.incidentDate || '',
      'Incident Time': formatTimeInfo(r.incidentTime) || '',
      'Incident Type': r.incidentType || '',
      'Description': r.description || '',
      'Status': r.status === 'Pending' ? 'Not Released' : (r.status || 'Not Released'),
      'Operator': r.reviewedBy || '',
      'Captured': r.caughtOnCam || '',
      'Outcome': r.outcome || '',
      'Comments': r.comments || ''
    })));
    ws['!cols'] = [14, 14, 22, 16, 15, 20, 15, 20, 14, 14, 22, 40, 12, 18, 16, 30].map(wch => ({ wch }));
    XLSX.utils.book_append_sheet(wb, ws, 'Review Logs');
    XLSX.writeFile(wb, 'Review_Logs_Report.xlsx');
    toast.success('Review Logs Excel exported!');
  };

  const exportReleasesExcel = () => {
    if (!data || !data.releases.length) return toast.warn('No release data to export');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.releases.map(r => ({
      'Release Date': formatDateTime(r.releaseDate),
      'Requested By': r.requestedBy || r.name || '',
      'Phone Number': r.phoneNumber || '',
      'Location': r.location || '',
      'Incident Date': r.incidentDate || '',
      'Incident Time': formatTimeInfo(r.incidentTime) || '',
      'Incident Type': r.incidentType || '',
      'Description': r.description || '',
      'Captured': r.caughtOnCam || '',
      'Reviewed By': r.reviewedBy || '',
      'Operator': r.releaserName || '',
      'Comments': r.comments || ''
    })));
    ws['!cols'] = [14, 22, 16, 20, 14, 14, 22, 40, 18, 30].map(wch => ({ wch }));
    XLSX.utils.book_append_sheet(wb, ws, 'Release Logs');
    XLSX.writeFile(wb, 'Release_Footage_Logs_Report.xlsx');
    toast.success('Release Logs Excel exported!');
  };

  // ─── FULL COMBINED EXPORTS ───────────────────────────────────────────────────

  const formatDateAsMMDDYY = (dateStr) => {
    if (!dateStr || dateStr === '—') return '—';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const yy = parts[0].slice(-2);
      return `${parts[1]}/${parts[2]}/${yy}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      const yy = String(d.getFullYear()).slice(-2);
      return `${mo}/${da}/${yy}`;
    }
    return dateStr;
  };

  const exportAllPDF = async () => {
    if (!data) return;
    const doc = new jsPDF({ orientation: 'landscape' });

    // Summary page
    await addSharedLetterHead(doc, 'COMPLETE REPORT SUMMARY', `Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`);

    doc.setTextColor(30, 20, 50);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Overview', 14, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Total Observations: ${data.summary.totalObservations}`, 14, 70);
    doc.text(`Total Reviews: ${data.summary.totalReviews}`, 14, 78);
    doc.text(`Total Releases: ${data.summary.totalReleases}`, 14, 86);
    doc.text(`Total Records: ${data.summary.totalRecords}`, 14, 94);

    // Reviewer Breakdown on summary page (Left Column below Summary)
    if (data.summary.reviewerBreakdown && data.summary.reviewerBreakdown.length > 0) {
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Reviewer Activity Breakdown', 14, 110);

      autoTable(doc, {
        startY: 115,
        head: [['Reviewer Name', 'Obs.', 'Rev.', 'Rel.', 'Total']],
        body: data.summary.reviewerBreakdown.map(b => [
          b.name,
          b.observations || 0,
          b.reviews || 0,
          b.releases || 0,
          b.total || 0
        ]),
        theme: 'striped',
        headStyles: { fillColor: [80, 50, 110], textColor: 255 },
        styles: { cellPadding: 3, fontSize: 10 },
        margin: { left: 14 },
        tableWidth: 155
      });
    }

    // Observation Breakdown on summary page (Right Column leveled with Summary)
    if (data.summary.observationBreakdown && data.summary.observationBreakdown.length > 0) {
      // Go back to the first page in case the Reviewer Breakdown added a new page
      doc.setPage(1);

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Observations Incident Breakdown', 180, 60);

      autoTable(doc, {
        startY: 65,
        head: [['Incident Type', 'Count']],
        body: data.summary.observationBreakdown.map(b => [b.type, b.count]),
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246], textColor: 255 },
        styles: { cellPadding: 3, fontSize: 11 },
        margin: { left: 180 },
        tableWidth: 100
      });
    }

    // Observations
    if (data.observations.length > 0) {
      doc.addPage();
      await addSharedLetterHead(doc, 'OBSERVATION LOGS', `Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`);
      autoTable(doc, {
        startY: 55,
        head: [['#', 'Date', 'Time', 'Camera', 'Street', 'Purok', 'Barangay', 'Type', 'Details', 'Action Taken', 'Dispatch To', 'Disp. Time', 'Observed By']],
        body: [...data.observations].reverse().map((o, index) => [
          index + 1,
          o.date ? formatDateAsMMDDYY(o.date) : '—',
          formatTimeInfo(o.time) || '—',
          o.camera || '—',
          o.street || '—',
          o.purok || '—',
          o.barangay || o.location || '—',
          o.incidentType || '—',
          o.details || '—',
          o.actionTaken || '—',
          o.dispatchTo || '—',
          formatTimeInfo(o.dispatchTime) || '—',
          o.observedBy || '—'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9, textColor: 30 },
        alternateRowStyles: { fillColor: [240, 235, 255] },
        styles: { cellPadding: 2 }
      });
    }

    // Reviews
    if (data.reviews.length > 0) {
      doc.addPage();
      await addSharedLetterHead(doc, 'REVIEW LOGS', `Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`);
      autoTable(doc, {
        startY: 55,
        head: [['#', 'Date & Time', 'Requestor', 'Barangay', 'Incident Date & Time', 'Type', 'Description', 'Status', 'Operator', 'Result', 'Captured', 'Outcome']],
        body: [...data.reviews].reverse().map((r, index) => [
          index + 1,
          r.dateRequested ? `${formatDateAsMMDDYY(r.dateRequested)}\n${formatTimeInfo(r.timeRequested)}` : '—',
          r.name || '—',
          r.barangay || r.location || '—',
          r.incidentDate ? `${formatDateAsMMDDYY(r.incidentDate)}\n${formatTimeInfo(r.incidentTime)}` : '—',
          r.incidentType || '—',
          r.description || '—',
          r.status === 'Pending' ? 'Not Released' : (r.status || 'Not Released'),
          r.reviewedBy || '—',
          r.result || '—',
          r.caughtOnCam === 'Captured' ? 'Yes' : 'No',
          r.outcome || '—'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: 30 },
        alternateRowStyles: { fillColor: [240, 235, 255] },
        styles: { cellPadding: 1.5 }
      });
    }

    // Releases - Detailed Page
    if (data.releases.length > 0) {
      doc.addPage();
      await addSharedLetterHead(doc, 'RELEASE FOOTAGE LOGS', `Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`);
      autoTable(doc, {
        startY: 55,
        head: [['#', 'Release Date', 'Requestor', 'Barangay', 'Incident Date & Time', 'Type', 'Description', 'Captured', 'Reviewed By', 'Released By']],
        body: [...data.releases].reverse().map((r, index) => [
          index + 1,
          r.releaseDate ? formatDateAsMMDDYY(r.releaseDate) : '—',
          r.requestedBy || r.name || '—',
          r.barangay || r.location || '—',
          r.incidentDate ? `${formatDateAsMMDDYY(r.incidentDate)} ${formatTimeInfo(r.incidentTime)}` : '—',
          r.incidentType || '—',
          r.description || '—',
          r.caughtOnCam || '—',
          r.reviewedBy || '—',
          r.releaserName || '—'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: 30 },
        alternateRowStyles: { fillColor: [230, 255, 245] },
        styles: { cellPadding: 1.5 }
      });
    }

    doc.save('CDRRMO_CCTV_Complete_Report.pdf');
    toast.success('Complete PDF exported!');
  };

  const exportReadyToSubmitPDF = async () => {
    if (!data) return toast.warn('No data to export');

    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const monthYear = startDate && endDate
      ? `${new Date(startDate).toLocaleString('default', { month: 'long', year: 'numeric' })}`
      : 'the selected period';

    // First Page
    await addReadyToSubmitLetterHead(doc, 'FOOTAGE REVIEW PER REQUEST', `For the month of ${monthYear}`);

    const formatDateToMMDDYYYY = (dateStr) => {
      if (!dateStr || dateStr === '—') return '—';
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
      }
      return dateStr;
    };

    const reviewBody = [...data.reviews].sort((a, b) => {
      const dateA = a.dateRequested || '';
      const dateB = b.dateRequested || '';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      const timeA = a.timeRequested || '';
      const timeB = b.timeRequested || '';
      return timeA.localeCompare(timeB);
    }).map((r, i) => [
      i + 1,
      r.name || '—',
      formatDateToMMDDYYYY(r.dateRequested),
      r.timeRequested || '—',
      r.incidentType || '—',
      r.description || '—',
      r.caughtOnCam === 'Captured' ? '/' : '',
      r.caughtOnCam === 'Uncaptured' ? '/' : ''
    ]);

    autoTable(doc, {
      startY: 80,
      head: [
        [
          { content: '#', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'Requesting Party', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'Date/Time', colSpan: 2, styles: { halign: 'center' } },
          { content: 'Incident Type', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'Details', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'Caught on Cam', colSpan: 2, styles: { halign: 'center' } }
        ],
        [
          { content: 'Date', styles: { halign: 'center' } },
          { content: 'Time', styles: { halign: 'center' } },
          { content: 'Captured', styles: { halign: 'center' } },
          { content: 'Uncaptured', styles: { halign: 'center' } }
        ]
      ],
      body: reviewBody,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold', fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1 },
      bodyStyles: { fontSize: 8, textColor: 0, lineColor: [0, 0, 0], lineWidth: 0.1 },
      styles: { cellPadding: 2, font: 'helvetica' },
      columnStyles: { 0: { cellWidth: 12, halign: 'center' }, 1: { cellWidth: 50 }, 2: { cellWidth: 20 }, 3: { cellWidth: 13 }, 4: { cellWidth: 22 }, 6: { cellWidth: 20, halign: 'center' }, 7: { cellWidth: 22, halign: 'center' } }
    });

    // Second Page
    doc.addPage();
    await addReadyToSubmitLetterHead(doc, 'VIDEO FOOTAGE RELEASED', `For the month of ${monthYear}`);

    const releaseBody = [...data.releases].sort((a, b) => {
      const dateA = a.releaseDate || '';
      const dateB = b.releaseDate || '';
      return dateA.localeCompare(dateB);
    }).map((r, i) => {
      let rTime = '—';
      if (r.releaseDate && r.releaseDate.includes('T')) {
        const d = new Date(r.releaseDate);
        if (!isNaN(d.getTime())) {
          rTime = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        }
      }
      return [
        i + 1,
        r.requestedBy || r.name || '—',
        formatDateToMMDDYYYY(r.releaseDate),
        rTime,
        r.description || '—'
      ];
    });

    autoTable(doc, {
      startY: 80,
      head: [
        [
          { content: '#', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'Requesting Party', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'Release', colSpan: 2, styles: { halign: 'center' } },
          { content: 'Details', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } }
        ],
        [
          { content: 'Date', styles: { halign: 'center' } },
          { content: 'Time', styles: { halign: 'center' } }
        ]
      ],
      body: releaseBody,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold', fontSize: 8, lineColor: [0, 0, 0], lineWidth: 0.1 },
      bodyStyles: { fontSize: 8, textColor: 0, lineColor: [0, 0, 0], lineWidth: 0.1 },
      styles: { cellPadding: 2, font: 'helvetica' },
      columnStyles: { 0: { cellWidth: 12, halign: 'center' }, 1: { cellWidth: 50 }, 2: { cellWidth: 23 }, 3: { cellWidth: 20 } }
    });

    let currentY = doc.lastAutoTable.finalY + 15;

    // Top Incidents, Locations, and Cameras
    const incidents = {};
    const locations = {};
    data.reviews.forEach(r => {
      if (r.incidentType) incidents[r.incidentType] = (incidents[r.incidentType] || 0) + 1;
      const loc = r.barangay || r.location;
      if (loc) locations[loc] = (locations[loc] || 0) + 1;
    });
    const sortedIncidents = Object.entries(incidents).sort((a, b) => b[1] - a[1]).slice(0, 9);
    const sortedLocations = Object.entries(locations).sort((a, b) => b[1] - a[1]).slice(0, 11);

    const getRanked = (sortedList) => {
      let rank = 1;
      let lastValue = sortedList.length > 0 ? sortedList[0][1] : null;
      return sortedList.map((item, index) => {
        let showRank = false;
        if (index === 0 || item[1] !== lastValue) {
          showRank = true;
        }
        if (item[1] !== lastValue) {
          rank++;
          lastValue = item[1];
        }
        return { name: item[0], rank, showRank };
      });
    };

    const rankedIncidents = getRanked(sortedIncidents);
    const rankedLocations = getRanked(sortedLocations);

    if (currentY > pageHeight - 80) { doc.addPage(); currentY = 20; }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TOP INCIDENT', 90, currentY);
    doc.text('TOP LOCATION', 166, currentY);

    doc.setFont('helvetica', 'normal');
    rankedIncidents.forEach((item, idx) => {
      const prefix = item.showRank ? `${item.rank} ` : '   ';
      doc.text(`${prefix}${item.name}`, 90, currentY + 6 + (idx * 5));
    });
    rankedLocations.forEach((item, idx) => {
      const prefix = item.showRank ? `${item.rank} ` : '   ';
      doc.text(`${prefix}${item.name}`, 166, currentY + 6 + (idx * 5));
    });

    const topsHeight = Math.max(sortedIncidents.length, sortedLocations.length) * 5 + 15;
    currentY += topsHeight;

    if (currentY > pageHeight - 40) { doc.addPage(); currentY = 20; }
    currentY += 20;

    // Signatories
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const cw = (pageWidth - 28) / 4;
    doc.text('Prepared by:', 20, currentY);
    doc.text('Checked by:', 20 + cw, currentY);
    doc.text('Noted:', 20 + cw * 2, currentY);
    doc.text('Approved:', 20 + cw * 3, currentY);

    currentY += 15;

    doc.setFont('helvetica', 'bold');
    doc.text(signatories.preparedBy.name, 20, currentY);
    doc.text(signatories.checkedBy.name, 20 + cw, currentY);
    doc.text(signatories.noted.name, 20 + cw * 2, currentY);
    doc.text(signatories.approved.name, 20 + cw * 3, currentY);

    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(signatories.preparedBy.title, 20, currentY);
    doc.text(signatories.checkedBy.title, 20 + cw, currentY);
    doc.text(signatories.noted.title, 20 + cw * 2, currentY);
    doc.text(signatories.approved.title, 20 + cw * 3, currentY);

    doc.save('Ready_To_Submit_Report.pdf');
    toast.success('Ready-to-Submit PDF exported!');
  };

  const exportAllExcel = () => {
    if (!data) return;
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['CDRRMO CCTV Unit — Complete Report'],
      ['Generated', new Date().toLocaleString()],
      ['Period', periodLabel()],
      [],
      ['Metric', 'Count'],
      ['Total Observations', data.summary.totalObservations],
      ['Total Reviews', data.summary.totalReviews],
      ['Total Releases', data.summary.totalReleases],
      ['Total Records', data.summary.totalRecords]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    if (data.summary.reviewerBreakdown && data.summary.reviewerBreakdown.length > 0) {
      const ws = XLSX.utils.json_to_sheet(data.summary.reviewerBreakdown.map(b => ({
        'Reviewer Name': b.name,
        'Reviews': b.reviews || 0,
        'Releases': b.releases || 0,
        'Total Activities': b.total || 0
      })));
      ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Reviewer Breakdown');
    }

    if (data.observations.length > 0) {
      const ws = XLSX.utils.json_to_sheet(data.observations.map(o => ({
        'Date': o.date || '',
        'Time': o.time || '',
        'Camera': o.camera || '',
        'Street': o.street || '',
        'Purok': o.purok || '',
        'Barangay': o.barangay || o.location || '',
        'Incident Type': o.incidentType || '',
        'Details': o.details || '',
        'Action Taken': o.actionTaken || ''
      })));
      ws['!cols'] = [14, 10, 15, 20, 15, 20, 22, 40, 18].map(wch => ({ wch }));
      XLSX.utils.book_append_sheet(wb, ws, 'Observations');
    }

    if (data.reviews.length > 0) {
      const ws = XLSX.utils.json_to_sheet(data.reviews.map(r => ({
        'Date Requested': r.dateRequested || '',
        'Time Requested': r.timeRequested || '',
        'Requestor Name': r.name || '',
        'Phone Number': r.phoneNumber || '',
        'Camera': r.camera || '',
        'Street': r.street || '',
        'Purok': r.purok || '',
        'Barangay': r.barangay || r.location || '',
        'Incident Date': r.incidentDate || '',
        'Incident Time': r.incidentTime || '',
        'Incident Type': r.incidentType || '',
        'Description': r.description || '',
        'Status': r.status === 'Pending' ? 'Not Released' : (r.status || 'Not Released'),
        'Reviewed By': r.reviewedBy || '',
        'Result': r.result || '',
        'Captured': r.caughtOnCam || '',
        'Outcome': r.outcome || '',
        'Comments': r.comments || ''
      })));
      ws['!cols'] = [14, 14, 22, 16, 15, 20, 15, 20, 14, 14, 22, 40, 12, 18, 16, 30].map(wch => ({ wch }));
      XLSX.utils.book_append_sheet(wb, ws, 'Reviews');
    }

    if (data.releases.length > 0) {
      const ws = XLSX.utils.json_to_sheet(data.releases.map(r => ({
        'Release Date': formatDateTime(r.releaseDate),
        'Requested By': r.requestedBy || r.name || '',
        'Phone Number': r.phoneNumber || '',
        'Camera': r.camera || '',
        'Street': r.street || '',
        'Purok': r.purok || '',
        'Barangay': r.barangay || r.location || '',
        'Incident Date': r.incidentDate || '',
        'Incident Time': r.incidentTime || '',
        'Incident Type': r.incidentType || '',
        'Description': r.description || '',
        'Captured': r.caughtOnCam || '',
        'Released By': r.releaserName || r.reviewedBy || '',
        'Comments': r.comments || ''
      })));
      ws['!cols'] = [16, 22, 16, 15, 20, 15, 20, 14, 14, 22, 40, 18, 30].map(wch => ({ wch }));
      XLSX.utils.book_append_sheet(wb, ws, 'Releases');
    }

    XLSX.writeFile(wb, 'CDRRMO_CCTV_Complete_Report.xlsx');
    toast.success('Complete Excel exported!');
  };

  const exportBreakdownPDF = async (type) => {
    if (!data) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    let title = '';
    let tableData = [];
    let headers = [];
    let start = '';
    let end = '';

    if (type === 'observation') {
      title = 'OBSERVATION INCIDENT BREAKDOWN';
      start = obsBrkStart;
      end = obsBrkEnd;
      const filtered = data.observations.filter(o =>
        (!start || o.date >= start) && (!end || o.date <= end)
      );
      const map = {};
      filtered.forEach(o => { if (o.incidentType) map[o.incidentType] = (map[o.incidentType] || 0) + 1; });
      tableData = Object.entries(map).map(([t, c]) => [t, c]).sort((a, b) => b[1] - a[1]);
      headers = [['Incident Type', 'Total Count']];
    } else {
      title = 'REVIEWER ACTIVITY BREAKDOWN';
      start = revBrkStart;
      end = revBrkEnd;
      const fObs = data.observations.filter(o => (!start || o.date >= start) && (!end || o.date <= end));
      const fRev = data.reviews.filter(r => (!start || r.dateRequested >= start) && (!end || r.dateRequested <= end));
      const fRel = data.releases.filter(r => (!start || r.releaseDate >= start) && (!end || r.releaseDate <= end));
      const map = {};
      fObs.forEach(o => { if (o.observedBy) { if (!map[o.observedBy]) map[o.observedBy] = { o: 0, rv: 0, rl: 0 }; map[o.observedBy].o++; } });
      fRev.forEach(r => { if (r.reviewedBy) { if (!map[r.reviewedBy]) map[r.reviewedBy] = { o: 0, rv: 0, rl: 0 }; map[r.reviewedBy].rv++; } });
      fRel.forEach(r => {
        const name = r.releaserName || r.reviewedBy;
        if (name) { if (!map[name]) map[name] = { o: 0, rv: 0, rl: 0 }; map[name].rl++; }
      });
      tableData = Object.entries(map).map(([name, counts]) => [
        name, counts.o, counts.rv, counts.rl, counts.o + counts.rv + counts.rl
      ]).sort((a, b) => b[4] - a[4]);
      headers = [['Reviewer Name', 'Observations', 'Reviews', 'Releases', 'Total']];
    }

    const period = (start || end) ? `Period: ${start || 'Start'} to ${end || 'End'}` : `Period: ${periodLabel()}`;
    await addSharedLetterHead(doc, title, `${period}   |   Generated: ${new Date().toLocaleString()}`);

    autoTable(doc, {
      startY: 55,
      head: headers,
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246], textColor: 255 },
      styles: { cellPadding: 4, fontSize: 11 }
    });

    doc.save(`${title.replace(/ /g, '_')}.pdf`);
    toast.success(`${type === 'observation' ? 'Observation' : 'Reviewer'} Breakdown PDF exported!`);
  };

  const exportBreakdownExcel = (type) => {
    if (!data) return;
    const wb = XLSX.utils.book_new();
    let fileName = '';
    let sheetData = [];
    let start = '';
    let end = '';

    if (type === 'observation') {
      fileName = 'Observation_Incident_Breakdown.xlsx';
      start = obsBrkStart;
      end = obsBrkEnd;
      const filtered = data.observations.filter(o =>
        (!start || o.date >= start) && (!end || o.date <= end)
      );
      const map = {};
      filtered.forEach(o => { if (o.incidentType) map[o.incidentType] = (map[o.incidentType] || 0) + 1; });
      sheetData = Object.entries(map).map(([t, c]) => ({ 'Incident Type': t, 'Total Count': c })).sort((a, b) => b['Total Count'] - a['Total Count']);
    } else {
      fileName = 'Reviewer_Activity_Breakdown.xlsx';
      start = revBrkStart;
      end = revBrkEnd;
      const fObs = data.observations.filter(o => (!start || o.date >= start) && (!end || o.date <= end));
      const fRev = data.reviews.filter(r => (!start || r.dateRequested >= start) && (!end || r.dateRequested <= end));
      const fRel = data.releases.filter(r => (!start || r.releaseDate >= start) && (!end || r.releaseDate <= end));
      const map = {};
      fObs.forEach(o => { if (o.observedBy) { if (!map[o.observedBy]) map[o.observedBy] = { o: 0, rv: 0, rl: 0 }; map[o.observedBy].o++; } });
      fRev.forEach(r => { if (r.reviewedBy) { if (!map[r.reviewedBy]) map[r.reviewedBy] = { o: 0, rv: 0, rl: 0 }; map[r.reviewedBy].rv++; } });
      fRel.forEach(r => {
        const name = r.releaserName || r.reviewedBy;
        if (name) { if (!map[name]) map[name] = { o: 0, rv: 0, rl: 0 }; map[name].rl++; }
      });
      sheetData = Object.entries(map).map(([name, counts]) => ({
        'Reviewer Name': name,
        'Observations': counts.o,
        'Reviews': counts.rv,
        'Releases': counts.rl,
        'Total Activities': counts.o + counts.rv + counts.rl
      })).sort((a, b) => b['Total Activities'] - a['Total Activities']);
    }

    const ws = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, 'Breakdown');
    XLSX.writeFile(wb, fileName);
    toast.success(`${type === 'observation' ? 'Observation' : 'Reviewer'} Breakdown Excel exported!`);
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export detailed CCTV activity reports">
        <div className="reports-controls" style={{ marginBottom: 0, gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px', color: '#A78BFA' }}>Start Range</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="date" className="form-input" style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="time" className="form-input" style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '11px', color: '#A78BFA' }}>End Range</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="date" className="form-input" style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <input type="time" className="form-input" style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={fetchReport} style={{ padding: '8px 16px', fontSize: '13px', height: '36px' }}>
            <BarChart3 size={16} /> Generate Report
          </button>
        </div>
      </PageHeader>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="report-summary">
            <div className="report-card">
              <div className="report-card-value" style={{ color: '#8b5cf6' }}>{data.summary.totalObservations}</div>
              <div className="report-card-label">Total Observations</div>
            </div>
            <div className="report-card">
              <div className="report-card-value" style={{ color: '#a855f7' }}>{data.summary.totalReviews}</div>
              <div className="report-card-label">Total Reviews</div>
            </div>
            <div className="report-card">
              <div className="report-card-value" style={{ color: '#10b981' }}>{data.summary.totalReleases}</div>
              <div className="report-card-label">Total Releases</div>
            </div>
            <div className="report-card">
              <div className="report-card-value" style={{ color: '#f59e0b' }}>{data.summary.totalRecords}</div>
              <div className="report-card-label">Total Records</div>
            </div>
          </div>



          {/* ── Combined Export Section ── */}
          <div className="report-export-section">
            <div className="report-export-header">
              <Download size={16} />
              <span>Complete Report — All Logs</span>
            </div>
            <div className="report-export-btns" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {isAdmin && (
                <>
                  <button className="btn btn-primary" onClick={exportReadyToSubmitPDF} disabled={!data} style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}>
                    <FileText size={15} /> Ready-To-Submit PDF
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowSigModal(true)} title="Edit Signatories">
                    <Settings size={15} /> Signatories
                  </button>
                </>
              )}
              <button className="btn btn-export-pdf" onClick={exportAllPDF} disabled={!data}>
                <FileText size={15} /> Export All as PDF
              </button>
              <button className="btn btn-export-excel" onClick={exportAllExcel} disabled={!data}>
                <FileSpreadsheet size={15} /> Export All as Excel
              </button>
            </div>
          </div>

          {/* ── Per-Log Export Sections ── */}
          {/* Observation Incident Breakdown Section */}
          {data.summary.observationBreakdown && data.summary.observationBreakdown.length > 0 && (
            <div className={`report-log-section ${collapsedObsBreakdown ? 'collapsed' : 'expanded'}`} style={{ marginTop: '30px', borderTop: '2px solid var(--accent-purple-light)' }}>
              <div className="report-log-header">
                <div className="report-log-title" onClick={() => setCollapsedObsBreakdown(!collapsedObsBreakdown)} style={{ cursor: 'pointer', flex: 1 }}>
                  <ShieldAlert size={20} className="report-log-icon obs" style={{ color: '#f59e0b' }} />
                  <div>
                    <div className="report-log-name" style={{ fontSize: '16px' }}>Observation Incident Breakdown</div>
                    <div className="report-log-count">Total observations categorized by incident type</div>
                  </div>
                </div>
                <div className="report-item-actions">
                  <div className="local-filter-group">
                    <input type="date" className="filter-input-sm" value={obsBrkStart} onChange={e => setObsBrkStart(e.target.value)} title="Start Date" />
                    <span className="filter-sep">to</span>
                    <input type="date" className="filter-input-sm" value={obsBrkEnd} onChange={e => setObsBrkEnd(e.target.value)} title="End Date" />
                  </div>
                  <button className="btn btn-export-pdf" onClick={() => exportBreakdownPDF('observation')} disabled={!data.summary.observationBreakdown.length}>
                    <FileText size={14} /> Export PDF
                  </button>
                  <button className="btn btn-export-excel" onClick={() => exportBreakdownExcel('observation')} disabled={!data.summary.observationBreakdown.length}>
                    <FileSpreadsheet size={14} /> Export Excel
                  </button>
                </div>
              </div>
              {!collapsedObsBreakdown && (
                <div className="report-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Incident Type</th>
                        <th>Total Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.summary.observationBreakdown.map((b, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px' }}>{b.type}</td>
                          <td style={{ fontSize: '13px' }}>{b.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Reviewer Activity Breakdown Section - Moved to Bottom */}
          {data.summary.reviewerBreakdown && data.summary.reviewerBreakdown.length > 0 && (
            <div className={`report-log-section ${collapsedBreakdown ? 'collapsed' : 'expanded'}`} style={{ marginTop: '30px', borderTop: '2px solid var(--accent-purple-light)' }}>
              <div className="report-log-header">
                <div className="report-log-title" onClick={() => setCollapsedBreakdown(!collapsedBreakdown)} style={{ cursor: 'pointer', flex: 1 }}>
                  <BarChart3 size={20} className="report-log-icon rev" />
                  <div>
                    <div className="report-log-name" style={{ fontSize: '16px' }}>Reviewer Activity Breakdown</div>
                    <div className="report-log-count">Consolidated staff performance metrics</div>
                  </div>
                </div>
                <div className="report-item-actions">
                  <div className="local-filter-group">
                    <input type="date" className="filter-input-sm" value={revBrkStart} onChange={e => setRevBrkStart(e.target.value)} title="Start Date" />
                    <span className="filter-sep">to</span>
                    <input type="date" className="filter-input-sm" value={revBrkEnd} onChange={e => setRevBrkEnd(e.target.value)} title="End Date" />
                  </div>
                  <button className="btn btn-export-pdf" onClick={() => exportBreakdownPDF('reviewer')} disabled={!data.summary.reviewerBreakdown.length}>
                    <FileText size={14} /> Export PDF
                  </button>
                  <button className="btn btn-export-excel" onClick={() => exportBreakdownExcel('reviewer')} disabled={!data.summary.reviewerBreakdown.length}>
                    <FileSpreadsheet size={14} /> Export Excel
                  </button>
                </div>
              </div>
              {!collapsedBreakdown && (
                <div className="report-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Reviewer Name</th>
                        <th>Observations Logged</th>
                        <th>Reviews Managed</th>
                        <th>Releases Managed</th>
                        <th>Total Activities</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.summary.reviewerBreakdown.map((b, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '13px' }}>{b.name}</td>
                          <td style={{ fontSize: '13px' }}>{b.observations || 0}</td>
                          <td style={{ fontSize: '13px' }}>{b.reviews || 0}</td>
                          <td style={{ fontSize: '13px' }}>{b.releases || 0}</td>
                          <td style={{ fontWeight: '700', color: 'var(--accent-blue)', fontSize: '14px' }}>{b.total || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {/* Observation Logs */}
          <div className={`report-log-section ${collapsedObs ? 'collapsed' : 'expanded'}`}>
            <div className="report-log-header">
              <div className="report-log-title" onClick={() => setCollapsedObs(!collapsedObs)} style={{ cursor: 'pointer', flex: 1 }}>
                <Eye size={18} className="report-log-icon obs" />
                <div>
                  <div className="report-log-name">Observation Logs</div>
                  <div className="report-log-count">{data.observations.length} records found {collapsedObs ? '(Click to view)' : '(Click to hide)'}</div>
                </div>
              </div>
              <div className="report-item-actions">
                <div className="local-filter-group">
                  <input type="date" className="filter-input-sm" value={obsStart} onChange={e => setObsStart(e.target.value)} title="Start Date for Export" />
                  <span className="filter-sep">to</span>
                  <input type="date" className="filter-input-sm" value={obsEnd} onChange={e => setObsEnd(e.target.value)} title="End Date for Export" />
                </div>
                <button className="btn btn-export-pdf" onClick={exportObservationsPDF} disabled={!data.observations.length}>
                  <FileText size={14} /> Export PDF
                </button>
                <button className="btn btn-export-excel" onClick={exportObservationsExcel} disabled={!data.observations.length}>
                  <FileSpreadsheet size={14} /> Export Excel
                </button>
              </div>
            </div>
            {!collapsedObs && (
              <div className="report-log-content">
                {data.observations.length > 0 ? (
                  <div className="report-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Camera</th>
                          <th>Street</th>
                          <th>Purok</th>
                          <th>Brgy</th>
                          <th>Type</th>
                          <th>Details</th>
                          <th>Action Taken</th>
                          <th>Dispatch To</th>
                          <th>Disp. Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.observations.map((obs, i) => (
                          <tr key={i}>
                            <td>{obs.date}</td>
                            <td>{obs.time}</td>
                            <td>{obs.camera || '—'}</td>
                            <td>{obs.street || '—'}</td>
                            <td>{obs.purok || '—'}</td>
                            <td>{obs.barangay || obs.location || '—'}</td>
                            <td><span className="badge pending">{obs.incidentType}</span></td>
                            <td className="cell-long" title={obs.details}>{obs.details}</td>
                            <td className="cell-long" title={obs.actionTaken}>{obs.actionTaken || '—'}</td>
                            <td className="cell-long" title={obs.dispatchTo}>{obs.dispatchTo || '—'}</td>
                            <td>{formatTimeInfo(obs.dispatchTime)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="report-empty" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No records for the selected period.</div>
                )}
              </div>
            )}
          </div>

          {/* Review Logs */}
          <div className={`report-log-section ${collapsedRev ? 'collapsed' : 'expanded'}`}>
            <div className="report-log-header">
              <div className="report-log-title" onClick={() => setCollapsedRev(!collapsedRev)} style={{ cursor: 'pointer', flex: 1 }}>
                <FileSearch size={18} className="report-log-icon rev" />
                <div>
                  <div className="report-log-name">Review Logs</div>
                  <div className="report-log-count">{data.reviews.length} records found {collapsedRev ? '(Click to view)' : '(Click to hide)'}</div>
                </div>
              </div>
              <div className="report-item-actions">
                <div className="local-filter-group">
                  <input type="date" className="filter-input-sm" value={revStart} onChange={e => setRevStart(e.target.value)} title="Start Date for Export" />
                  <span className="filter-sep">to</span>
                  <input type="date" className="filter-input-sm" value={revEnd} onChange={e => setRevEnd(e.target.value)} title="End Date for Export" />
                </div>
                <button className="btn btn-export-pdf" onClick={exportReviewsPDF} disabled={!data.reviews.length}>
                  <FileText size={14} /> Export PDF
                </button>
                <button className="btn btn-export-excel" onClick={exportReviewsExcel} disabled={!data.reviews.length}>
                  <FileSpreadsheet size={14} /> Export Excel
                </button>
              </div>
            </div>
            {!collapsedRev && (
              <div className="report-log-content">
                {data.reviews.length > 0 ? (
                  <div className="report-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Req.</th>
                          <th>Requestor</th>
                          <th>Phone</th>
                          <th>Cam</th>
                          <th>Street</th>
                          <th>Purok</th>
                          <th>Brgy</th>
                          <th>Inc. Date</th>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Captured</th>
                          <th>Status</th>
                          <th>Operator</th>
                          <th>Result</th>
                          <th>Outcome</th>
                          <th>Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.reviews.map((rev, i) => (
                          <tr key={i}>
                            <td>
                              {rev.dateRequested}<br />
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTimeInfo(rev.timeRequested)}</span>
                            </td>
                            <td>{rev.name}</td>
                            <td>{rev.phoneNumber || '—'}</td>
                            <td>{rev.camera || '—'}</td>
                            <td>{rev.street || '—'}</td>
                            <td>{rev.purok || '—'}</td>
                            <td>{rev.barangay || rev.location || '—'}</td>
                            <td>
                              {rev.incidentDate}<br />
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTimeInfo(rev.incidentTime)}</span>
                            </td>
                            <td><span className="badge not-released">{rev.incidentType}</span></td>
                            <td className="cell-long" title={rev.description}>{rev.description}</td>
                            <td>{rev.caughtOnCam || '—'}</td>
                            <td>
                              <span className={`badge ${rev.status && rev.status !== 'Pending' ? rev.status.toLowerCase().replace(' ', '-') : 'not-released'}`}>
                                {rev.status === 'Pending' ? 'Not Released' : (rev.status || 'Not Released')}
                              </span>
                            </td>
                            <td>{rev.reviewedBy || '—'}</td>
                            <td>{rev.result || '—'}</td>
                            <td>{rev.outcome || '—'}</td>
                            <td className="cell-long" title={rev.comments}>{rev.comments || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="report-empty" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No records for the selected period.</div>
                )}
              </div>
            )}
          </div>

          {/* Release Footage Logs */}
          <div className={`report-log-section ${collapsedRel ? 'collapsed' : 'expanded'}`}>
            <div className="report-log-header">
              <div className="report-log-title" onClick={() => setCollapsedRel(!collapsedRel)} style={{ cursor: 'pointer', flex: 1 }}>
                <FileOutput size={18} className="report-log-icon rel" />
                <div>
                  <div className="report-log-name">Release Footage Logs</div>
                  <div className="report-log-count">{data.releases.length} records found {collapsedRel ? '(Click to view)' : '(Click to hide)'}</div>
                </div>
              </div>
              <div className="report-item-actions">
                <div className="local-filter-group">
                  <input type="date" className="filter-input-sm" value={relStart} onChange={e => setRelStart(e.target.value)} title="Start Date for Export" />
                  <span className="filter-sep">to</span>
                  <input type="date" className="filter-input-sm" value={relEnd} onChange={e => setRelEnd(e.target.value)} title="End Date for Export" />
                </div>
                <button className="btn btn-export-pdf" onClick={exportReleasesPDF} disabled={!data.releases.length}>
                  <FileText size={14} /> Export PDF
                </button>
                <button className="btn btn-export-excel" onClick={exportReleasesExcel} disabled={!data.releases.length}>
                  <FileSpreadsheet size={14} /> Export Excel
                </button>
              </div>
            </div>
            {!collapsedRel && (
              <div className="report-log-content">
                {data.releases.length > 0 ? (
                  <div className="report-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Rel.</th>
                          <th>Requestor</th>
                          <th>Phone</th>
                          <th>Cam</th>
                          <th>Street</th>
                          <th>Purok</th>
                          <th>Brgy</th>
                          <th>Inc. Date</th>
                          <th>Type</th>
                          <th>Description</th>
                          <th>Captured</th>
                          <th>Operator</th>
                          <th>Result</th>
                          <th>Outcome</th>
                          <th>Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.releases.map((rel, i) => (
                          <tr key={i}>
                            <td>{formatDateTime(rel.releaseDate)}</td>
                            <td>{rel.requestedBy || rel.name}</td>
                            <td>{rel.phoneNumber || '—'}</td>
                            <td>{rel.camera || '—'}</td>
                            <td>{rel.street || '—'}</td>
                            <td>{rel.purok || '—'}</td>
                            <td>{rel.barangay || rel.location || '—'}</td>
                            <td>
                              {rel.incidentDate || '—'}<br />
                              {rel.incidentTime && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTimeInfo(rel.incidentTime)}</span>}
                            </td>
                            <td><span className="badge released">{rel.incidentType}</span></td>
                            <td className="cell-long" title={rel.description}>{rel.description}</td>
                            <td>{rel.caughtOnCam || '—'}</td>
                            <td>{rel.releaserName || rel.reviewedBy || '—'}</td>
                            <td>{rel.result || '—'}</td>
                            <td>{rel.outcome || '—'}</td>
                            <td className="cell-long" title={rel.comments}>{rel.comments || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="report-empty" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No records for the selected period.</div>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Signatories Configuration Modal (Admin Only) */}
      {isAdmin && showSigModal && (
        <div className="modal-overlay" onClick={() => setShowSigModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h3>Edit Report Signatories</h3>
              <button className="modal-close" onClick={() => setShowSigModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
              {Object.keys(signatories).map(key => (
                <div key={key} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <h4 style={{ textTransform: 'capitalize', marginBottom: '12px', color: 'var(--primary)', fontSize: '14px' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Name</label>
                    <input
                      className="form-input"
                      value={signatories[key].name}
                      onChange={e => setSignatories({ ...signatories, [key]: { ...signatories[key], name: e.target.value } })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '11px' }}>Title/Position</label>
                    <input
                      className="form-input"
                      value={signatories[key].title}
                      onChange={e => setSignatories({ ...signatories, [key]: { ...signatories[key], title: e.target.value } })}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowSigModal(false)}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
