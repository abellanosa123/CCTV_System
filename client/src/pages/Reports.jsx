import React, { useState, useEffect } from 'react';
import { getReportData } from '../services/api';
import { toast } from 'react-toastify';
import { Download, FileText, FileSpreadsheet, BarChart3, Eye, FileSearch, FileOutput, X, Settings } from 'lucide-react';
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

  useEffect(() => {
    localStorage.setItem('cctv_signatories', JSON.stringify(signatories));
  }, [signatories]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
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

  const periodLabel = () => {
    if (startDate && endDate) return `${startDate} to ${endDate}`;
    if (startDate) return `From ${startDate}`;
    if (endDate) return `Up to ${endDate}`;
    return 'All Records';
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
    const doc = new jsPDF({ orientation: 'landscape' });

    await addSharedLetterHead(doc, 'OBSERVATION LOGS', `Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`);

    autoTable(doc, {
      startY: 55,
      head: [['Date', 'Time', 'Location', 'Incident Type', 'Details', 'Action Taken']],
      body: data.observations.map(o => [
        o.date || '—',
        o.time || '—',
        o.location || '—',
        o.incidentType || '—',
        (o.details || '').slice(0, 60),
        o.actionTaken || '—'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: 30 },
      alternateRowStyles: { fillColor: [240, 235, 255] },
      styles: { cellPadding: 3 }
    });

    doc.save('Observation_Logs_Report.pdf');
    toast.success('Observation PDF exported!');
  };

  const exportReviewsPDF = async () => {
    if (!data || !data.reviews.length) return toast.warn('No review data to export');
    const doc = new jsPDF({ orientation: 'landscape' });

    await addSharedLetterHead(doc, 'REVIEW LOGS', `Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`);

    autoTable(doc, {
      startY: 55,
      head: [['Date Requested', 'Time', 'Requestor', 'Phone', 'Location', 'Incident Date', 'Incident Time', 'Incident Type', 'Description', 'Status', 'Reviewed By', 'Outcome', 'Comments']],
      body: data.reviews.map(r => [
        r.dateRequested || '—',
        r.timeRequested || '—',
        r.name || '—',
        r.phoneNumber || '—',
        r.location || '—',
        r.incidentDate || '—',
        r.incidentTime || '—',
        r.incidentType || '—',
        (r.description || '').slice(0, 50),
        r.status === 'Pending' ? 'Not Released' : (r.status || 'Not Released'),
        r.reviewedBy || '—',
        r.outcome || '—',
        (r.comments || '').slice(0, 30)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold', fontSize: 7 },
      bodyStyles: { fontSize: 7, textColor: 30 },
      alternateRowStyles: { fillColor: [240, 235, 255] },
      styles: { cellPadding: 2 }
    });

    doc.save('Review_Logs_Report.pdf');
    toast.success('Review Logs PDF exported!');
  };

  const exportReleasesPDF = async () => {
    if (!data || !data.releases.length) return toast.warn('No release data to export');
    const doc = new jsPDF({ orientation: 'landscape' });

    await addSharedLetterHead(doc, 'RELEASE FOOTAGE LOGS', `Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`);

    autoTable(doc, {
      startY: 55,
      head: [['Release Date', 'Requested By', 'Phone', 'Location', 'Incident Date', 'Incident Time', 'Incident Type', 'Description', 'Reviewed By', 'Comments']],
      body: data.releases.map(r => [
        formatDateTime(r.releaseDate),
        r.requestedBy || r.name || '—',
        r.phoneNumber || '—',
        r.location || '—',
        r.incidentDate || '—',
        r.incidentTime || '—',
        r.incidentType || '—',
        (r.description || '').slice(0, 40),
        r.reviewedBy || '—',
        (r.comments || '').slice(0, 30)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 7 },
      bodyStyles: { fontSize: 7, textColor: 30 },
      alternateRowStyles: { fillColor: [230, 255, 245] },
      styles: { cellPadding: 2 }
    });

    doc.save('Release_Footage_Logs_Report.pdf');
    toast.success('Release Logs PDF exported!');
  };

  // ─── EXCEL EXPORTS ───────────────────────────────────────────────────────────

  const exportObservationsExcel = () => {
    if (!data || !data.observations.length) return toast.warn('No observation data to export');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.observations.map(o => ({
      'Date': o.date || '',
      'Time': o.time || '',
      'Location': o.location || '',
      'Incident Type': o.incidentType || '',
      'Details': o.details || '',
      'Action Taken': o.actionTaken || ''
    })));
    ws['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 22 }, { wch: 40 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Observation Logs');
    XLSX.writeFile(wb, 'Observation_Logs_Report.xlsx');
    toast.success('Observation Excel exported!');
  };

  const exportReviewsExcel = () => {
    if (!data || !data.reviews.length) return toast.warn('No review data to export');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data.reviews.map(r => ({
      'Date Requested': r.dateRequested || '',
      'Time Requested': r.timeRequested || '',
      'Requestor Name': r.name || '',
      'Phone Number': r.phoneNumber || '',
      'Location': r.location || '',
      'Incident Date': r.incidentDate || '',
      'Incident Time': r.incidentTime || '',
      'Incident Type': r.incidentType || '',
      'Description': r.description || '',
      'Status': r.status === 'Pending' ? 'Not Released' : (r.status || 'Not Released'),
      'Reviewed By': r.reviewedBy || '',
      'Outcome': r.outcome || '',
      'Comments': r.comments || ''
    })));
    ws['!cols'] = [14, 14, 22, 16, 20, 14, 14, 22, 40, 12, 18, 16, 30].map(wch => ({ wch }));
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
      'Incident Time': r.incidentTime || '',
      'Incident Type': r.incidentType || '',
      'Description': r.description || '',
      'Reviewed By': r.reviewedBy || '',
      'Comments': r.comments || ''
    })));
    ws['!cols'] = [14, 22, 16, 20, 14, 14, 22, 40, 18, 30].map(wch => ({ wch }));
    XLSX.utils.book_append_sheet(wb, ws, 'Release Logs');
    XLSX.writeFile(wb, 'Release_Footage_Logs_Report.xlsx');
    toast.success('Release Logs Excel exported!');
  };

  // ─── FULL COMBINED EXPORTS ───────────────────────────────────────────────────

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

    // Observations
    if (data.observations.length > 0) {
      doc.addPage();
      await addSharedLetterHead(doc, 'OBSERVATION LOGS', `Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`);
      autoTable(doc, {
        startY: 55,
        head: [['Date', 'Time', 'Location', 'Incident Type', 'Details', 'Action Taken']],
        body: data.observations.map(o => [o.date || '—', o.time || '—', o.location || '—', o.incidentType || '—', (o.details || '').slice(0, 60), o.actionTaken || '—']),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 7, textColor: 30 },
        alternateRowStyles: { fillColor: [240, 235, 255] }
      });
    }

    // Reviews
    if (data.reviews.length > 0) {
      doc.addPage();
      await addSharedLetterHead(doc, 'REVIEW LOGS', `Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`);
      autoTable(doc, {
        startY: 55,
        head: [['Date', 'Requestor', 'Location', 'Incident Date', 'Incident Type', 'Status', 'Reviewed By', 'Outcome']],
        body: data.reviews.map(r => [r.dateRequested || '—', r.name || '—', r.location || '—', r.incidentDate || '—', r.incidentType || '—', r.status === 'Pending' ? 'Not Released' : (r.status || 'Not Released'), r.reviewedBy || '—', r.outcome || '—']),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 7, textColor: 30 },
        alternateRowStyles: { fillColor: [240, 235, 255] }
      });
    }

    // Releases
    if (data.releases.length > 0) {
      doc.addPage();
      await addSharedLetterHead(doc, 'RELEASE FOOTAGE LOGS', `Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`);
      autoTable(doc, {
        startY: 55,
        head: [['Release Date', 'Requested By', 'Location', 'Incident Type', 'Description', 'Reviewed By']],
        body: data.releases.map(r => [formatDateTime(r.releaseDate), r.requestedBy || r.name || '—', r.location || '—', r.incidentType || '—', (r.description || '').slice(0, 40), r.reviewedBy || '—']),
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 7, textColor: 30 },
        alternateRowStyles: { fillColor: [230, 255, 245] }
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

    const reviewBody = data.reviews.map((r, i) => [
      i + 1,
      r.name || '—',
      r.dateRequested || '—',
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
      columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 2: { cellWidth: 20 }, 3: { cellWidth: 15 }, 6: { cellWidth: 22, halign: 'center' }, 7: { cellWidth: 22, halign: 'center' } }
    });

    // Second Page
    doc.addPage();
    await addReadyToSubmitLetterHead(doc, 'VIDEO FOOTAGE RELEASED', `For the month of ${monthYear}`);

    const releaseBody = data.releases.map(r => [
      r.requestedBy || r.name || '—',
      r.incidentDate || '—',
      r.incidentTime || '—',
      r.description || '—'
    ]);

    autoTable(doc, {
      startY: 80,
      head: [
        [
          { content: 'Requesting Party', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
          { content: 'Incident', colSpan: 2, styles: { halign: 'center' } },
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
      columnStyles: { 1: { cellWidth: 25 }, 2: { cellWidth: 20 } }
    });

    let currentY = doc.lastAutoTable.finalY + 15;

    // Top Incidents and Locations
    const incidents = {};
    const locations = {};
    data.reviews.forEach(r => {
      if (r.incidentType) incidents[r.incidentType] = (incidents[r.incidentType] || 0) + 1;
      if (r.location) locations[r.location] = (locations[r.location] || 0) + 1;
    });
    const sortedIncidents = Object.entries(incidents).sort((a, b) => b[1] - a[1]).slice(0, 9);
    const sortedLocations = Object.entries(locations).sort((a, b) => b[1] - a[1]).slice(0, 11);

    if (currentY > pageHeight - 80) { doc.addPage(); currentY = 20; }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TOP INCIDENT', 14, currentY);
    doc.text('TOP LOCATION', 80, currentY);

    doc.setFont('helvetica', 'normal');
    sortedIncidents.forEach((item, idx) => {
      doc.text(`${item[1]} ${item[0]}`, 14, currentY + 6 + (idx * 5));
    });
    sortedLocations.forEach((item, idx) => {
      doc.text(`${item[1]} ${item[0]}`, 80, currentY + 6 + (idx * 5));
    });

    const topsHeight = Math.max(sortedIncidents.length, sortedLocations.length) * 5 + 15;
    currentY += topsHeight;

    if (currentY > pageHeight - 40) { doc.addPage(); currentY = 20; }
    currentY += 20;

    // Signatories
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const cw = (pageWidth - 28) / 4;
    doc.text('Prepared by:', 14, currentY);
    doc.text('Checked by:', 14 + cw, currentY);
    doc.text('Noted:', 14 + cw * 2, currentY);
    doc.text('Approved:', 14 + cw * 3, currentY);

    currentY += 15;

    doc.setFont('helvetica', 'bold');
    doc.text(signatories.preparedBy.name, 14, currentY);
    doc.text(signatories.checkedBy.name, 14 + cw, currentY);
    doc.text(signatories.noted.name, 14 + cw * 2, currentY);
    doc.text(signatories.approved.name, 14 + cw * 3, currentY);

    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(signatories.preparedBy.title, 14, currentY);
    doc.text(signatories.checkedBy.title, 14 + cw, currentY);
    doc.text(signatories.noted.title, 14 + cw * 2, currentY);
    doc.text(signatories.approved.title, 14 + cw * 3, currentY);

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
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

    if (data.observations.length > 0) {
      const ws = XLSX.utils.json_to_sheet(data.observations.map(o => ({
        'Date': o.date || '', 'Time': o.time || '', 'Location': o.location || '',
        'Incident Type': o.incidentType || '', 'Details': o.details || '', 'Action Taken': o.actionTaken || ''
      })));
      ws['!cols'] = [14, 10, 20, 22, 40, 18].map(wch => ({ wch }));
      XLSX.utils.book_append_sheet(wb, ws, 'Observations');
    }

    if (data.reviews.length > 0) {
      const ws = XLSX.utils.json_to_sheet(data.reviews.map(r => ({
        'Date Requested': r.dateRequested || '', 'Time': r.timeRequested || '', 'Requestor': r.name || '',
        'Phone': r.phoneNumber || '', 'Location': r.location || '', 'Incident Date': r.incidentDate || '',
        'Incident Time': r.incidentTime || '', 'Incident Type': r.incidentType || '',
        'Description': r.description || '', 'Status': r.status || 'Pending',
        'Reviewed By': r.reviewedBy || '', 'Outcome': r.outcome || '', 'Comments': r.comments || ''
      })));
      ws['!cols'] = [14, 12, 22, 16, 20, 14, 14, 22, 40, 12, 18, 16, 30].map(wch => ({ wch }));
      XLSX.utils.book_append_sheet(wb, ws, 'Reviews');
    }

    if (data.releases.length > 0) {
      const ws = XLSX.utils.json_to_sheet(data.releases.map(r => ({
        'Release Date': formatDateTime(r.releaseDate), 'Requested By': r.requestedBy || r.name || '',
        'Phone': r.phoneNumber || '', 'Location': r.location || '', 'Incident Date': r.incidentDate || '',
        'Incident Time': r.incidentTime || '', 'Incident Type': r.incidentType || '',
        'Description': r.description || '', 'Reviewed By': r.reviewedBy || '',
        'Comments': r.comments || ''
      })));
      ws['!cols'] = [14, 22, 16, 20, 14, 14, 22, 40, 18, 30].map(wch => ({ wch }));
      XLSX.utils.book_append_sheet(wb, ws, 'Releases');
    }

    XLSX.writeFile(wb, 'CDRRMO_CCTV_Complete_Report.xlsx');
    toast.success('Complete Excel exported!');
  };

  return (
    <div>
      <div className="page-header">
        <h2>Reports</h2>
        <p>Generate and export detailed CCTV activity reports</p>
      </div>

      {/* Controls */}
      <div className="reports-controls">
        <div className="form-group" style={{ minWidth: 160 }}>
          <label className="form-label">Start Date</label>
          <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="form-group" style={{ minWidth: 160 }}>
          <label className="form-label">End Date</label>
          <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', paddingTop: 18 }}>
          <button className="btn btn-primary" onClick={fetchReport}>
            <BarChart3 size={16} /> Generate Report
          </button>
        </div>
      </div>

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
              <button className="btn btn-primary" onClick={exportReadyToSubmitPDF} disabled={!data} style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}>
                <FileText size={15} /> Ready-To-Submit PDF
              </button>
              <button className="btn btn-secondary" onClick={() => setShowSigModal(true)} title="Edit Signatories">
                <Settings size={15} /> Signatories
              </button>
              <button className="btn btn-export-pdf" onClick={exportAllPDF} disabled={!data}>
                <FileText size={15} /> Export All as PDF
              </button>
              <button className="btn btn-export-excel" onClick={exportAllExcel} disabled={!data}>
                <FileSpreadsheet size={15} /> Export All as Excel
              </button>
            </div>
          </div>

          {/* ── Per-Log Export Sections ── */}
          {/* Observation Logs */}
          <div className="report-log-section">
            <div className="report-log-header">
              <div className="report-log-title">
                <Eye size={18} className="report-log-icon obs" />
                <div>
                  <div className="report-log-name">Observation Logs</div>
                  <div className="report-log-count">{data.observations.length} records found</div>
                </div>
              </div>
              <div className="report-export-btns">
                <button className="btn btn-export-pdf" onClick={exportObservationsPDF} disabled={!data.observations.length}>
                  <FileText size={14} /> Export PDF
                </button>
                <button className="btn btn-export-excel" onClick={exportObservationsExcel} disabled={!data.observations.length}>
                  <FileSpreadsheet size={14} /> Export Excel
                </button>
              </div>
            </div>
            {data.observations.length > 0 ? (
              <div className="report-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Location</th>
                      <th>Incident Type</th>
                      <th>Details</th>
                      <th>Action Taken</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.observations.map((obs, i) => (
                      <tr key={i}>
                        <td>{obs.date}</td>
                        <td>{obs.time}</td>
                        <td>{obs.location}</td>
                        <td><span className="badge pending">{obs.incidentType}</span></td>
                        <td title={obs.details}>{obs.details?.slice(0, 60)}{obs.details?.length > 60 ? '...' : ''}</td>
                        <td><span className="badge reviewed">{obs.actionTaken || '—'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="report-empty">No observation logs for the selected period.</div>
            )}
          </div>

          {/* Review Logs */}
          <div className="report-log-section">
            <div className="report-log-header">
              <div className="report-log-title">
                <FileSearch size={18} className="report-log-icon rev" />
                <div>
                  <div className="report-log-name">Review Logs</div>
                  <div className="report-log-count">{data.reviews.length} records found</div>
                </div>
              </div>
              <div className="report-export-btns">
                <button className="btn btn-export-pdf" onClick={exportReviewsPDF} disabled={!data.reviews.length}>
                  <FileText size={14} /> Export PDF
                </button>
                <button className="btn btn-export-excel" onClick={exportReviewsExcel} disabled={!data.reviews.length}>
                  <FileSpreadsheet size={14} /> Export Excel
                </button>
              </div>
            </div>
            {data.reviews.length > 0 ? (
              <div className="report-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date Requested</th>
                      <th>Requestor</th>
                      <th>Location</th>
                      <th>Incident Date</th>
                      <th>Incident Type</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Reviewed By</th>
                      <th>Outcome</th>
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
                        <td>{rev.location}</td>
                        <td>
                          {rev.incidentDate}<br />
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTimeInfo(rev.incidentTime)}</span>
                        </td>
                        <td><span className="badge not-released">{rev.incidentType}</span></td>
                        <td title={rev.description}>{rev.description?.slice(0, 50)}{rev.description?.length > 50 ? '...' : ''}</td>
                        <td><span className={`badge ${rev.status && rev.status !== 'Pending' ? rev.status.toLowerCase().replace(' ', '-') : 'not-released'}`}>{rev.status === 'Pending' ? 'Not Released' : (rev.status || 'Not Released')}</span></td>
                        <td>{rev.reviewedBy || '—'}</td>
                        <td>{rev.outcome || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="report-empty">No review logs for the selected period.</div>
            )}
          </div>

          {/* Release Footage Logs */}
          <div className="report-log-section">
            <div className="report-log-header">
              <div className="report-log-title">
                <FileOutput size={18} className="report-log-icon rel" />
                <div>
                  <div className="report-log-name">Release Footage Logs</div>
                  <div className="report-log-count">{data.releases.length} records found</div>
                </div>
              </div>
              <div className="report-export-btns">
                <button className="btn btn-export-pdf" onClick={exportReleasesPDF} disabled={!data.releases.length}>
                  <FileText size={14} /> Export PDF
                </button>
                <button className="btn btn-export-excel" onClick={exportReleasesExcel} disabled={!data.releases.length}>
                  <FileSpreadsheet size={14} /> Export Excel
                </button>
              </div>
            </div>
            {data.releases.length > 0 ? (
              <div className="report-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Release Date</th>
                      <th>Requested By</th>
                      <th>Location</th>
                      <th>Incident Date</th>
                      <th>Incident Type</th>
                      <th>Description</th>
                      <th>Reviewed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.releases.map((rel, i) => (
                      <tr key={i}>
                        <td>{formatDateTime(rel.releaseDate)}</td>
                        <td>{rel.requestedBy || rel.name}</td>
                        <td>{rel.location}</td>
                        <td>
                          {rel.incidentDate || '—'}<br />
                          {rel.incidentTime && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTimeInfo(rel.incidentTime)}</span>}
                        </td>
                        <td><span className="badge released">{rel.incidentType}</span></td>
                        <td title={rel.description}>{rel.description?.slice(0, 50)}{rel.description?.length > 50 ? '...' : ''}</td>
                        <td>{rel.reviewedBy || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="report-empty">No release logs for the selected period.</div>
            )}
          </div>
        </>
      ) : null}

      {/* Signatories Configuration Modal */}
      {showSigModal && (
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
