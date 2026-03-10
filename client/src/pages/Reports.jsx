import React, { useState, useEffect } from 'react';
import { getReportData } from '../services/api';
import { toast } from 'react-toastify';
import { Download, FileText, FileSpreadsheet, BarChart3, Eye, FileSearch, FileOutput } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // ─── PDF EXPORTS ────────────────────────────────────────────────────────────

  const exportObservationsPDF = () => {
    if (!data || !data.observations.length) return toast.warn('No observation data to export');
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(26, 21, 48);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(192, 132, 252);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CDRRMO CCTV Unit — Observation Logs', pageWidth / 2, 14, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(167, 139, 204);
    doc.text(`Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 22, { align: 'center' });

    autoTable(doc, {
      startY: 36,
      head: [['Date', 'Time', 'Location', 'Incident Type', 'Action Taken', 'Details']],
      body: data.observations.map(o => [
        o.date || '—',
        o.time || '—',
        o.location || '—',
        o.incidentType || '—',
        o.actionTaken || '—',
        (o.details || '').slice(0, 60)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [30, 20, 50] },
      alternateRowStyles: { fillColor: [240, 235, 255] },
      styles: { cellPadding: 3 }
    });

    doc.save('Observation_Logs_Report.pdf');
    toast.success('Observation PDF exported!');
  };

  const exportReviewsPDF = () => {
    if (!data || !data.reviews.length) return toast.warn('No review data to export');
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(26, 21, 48);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(192, 132, 252);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CDRRMO CCTV Unit — Review Logs', pageWidth / 2, 14, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(167, 139, 204);
    doc.text(`Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 22, { align: 'center' });

    autoTable(doc, {
      startY: 36,
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
        (r.description || '').slice(0, 40),
        r.status || 'Pending',
        r.reviewedBy || '—',
        r.outcome || '—',
        (r.comments || '').slice(0, 30)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold', fontSize: 7 },
      bodyStyles: { fontSize: 7, textColor: [30, 20, 50] },
      alternateRowStyles: { fillColor: [240, 235, 255] },
      styles: { cellPadding: 2 }
    });

    doc.save('Review_Logs_Report.pdf');
    toast.success('Review Logs PDF exported!');
  };

  const exportReleasesPDF = () => {
    if (!data || !data.releases.length) return toast.warn('No release data to export');
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(26, 21, 48);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(192, 132, 252);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CDRRMO CCTV Unit — Release Footage Logs', pageWidth / 2, 14, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(167, 139, 204);
    doc.text(`Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 22, { align: 'center' });

    autoTable(doc, {
      startY: 36,
      head: [['Release Date', 'Requested By', 'Phone', 'Location', 'Incident Date', 'Incident Time', 'Incident Type', 'Description', 'Reviewed By', 'Outcome', 'Comments']],
      body: data.releases.map(r => [
        r.releaseDate || '—',
        r.requestedBy || r.name || '—',
        r.phoneNumber || '—',
        r.location || '—',
        r.incidentDate || '—',
        r.incidentTime || '—',
        r.incidentType || '—',
        (r.description || '').slice(0, 40),
        r.reviewedBy || '—',
        r.outcome || '—',
        (r.comments || '').slice(0, 30)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 7 },
      bodyStyles: { fontSize: 7, textColor: [30, 20, 50] },
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
      'Action Taken': o.actionTaken || '',
      'Details': o.details || ''
    })));
    ws['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 20 }, { wch: 22 }, { wch: 18 }, { wch: 40 }];
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
      'Status': r.status || 'Pending',
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
      'Release Date': r.releaseDate || '',
      'Requested By': r.requestedBy || r.name || '',
      'Phone Number': r.phoneNumber || '',
      'Location': r.location || '',
      'Incident Date': r.incidentDate || '',
      'Incident Time': r.incidentTime || '',
      'Incident Type': r.incidentType || '',
      'Description': r.description || '',
      'Reviewed By': r.reviewedBy || '',
      'Outcome': r.outcome || '',
      'Comments': r.comments || ''
    })));
    ws['!cols'] = [14, 22, 16, 20, 14, 14, 22, 40, 18, 16, 30].map(wch => ({ wch }));
    XLSX.utils.book_append_sheet(wb, ws, 'Release Logs');
    XLSX.writeFile(wb, 'Release_Footage_Logs_Report.xlsx');
    toast.success('Release Logs Excel exported!');
  };

  // ─── FULL COMBINED EXPORTS ───────────────────────────────────────────────────

  const exportAllPDF = () => {
    if (!data) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();

    const addHeader = (title) => {
      doc.setFillColor(26, 21, 48);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(192, 132, 252);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text(`CDRRMO CCTV Unit — ${title}`, pageWidth / 2, 14, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(167, 139, 204);
      doc.text(`Period: ${periodLabel()}   |   Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 22, { align: 'center' });
    };

    // Summary page
    addHeader('Complete Report');
    doc.setTextColor(30, 20, 50);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, 44);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Total Observations: ${data.summary.totalObservations}`, 14, 54);
    doc.text(`Total Reviews: ${data.summary.totalReviews}`, 14, 62);
    doc.text(`Total Releases: ${data.summary.totalReleases}`, 14, 70);
    doc.text(`Total Records: ${data.summary.totalRecords}`, 14, 78);

    // Observations
    if (data.observations.length > 0) {
      doc.addPage();
      addHeader('Observation Logs');
      autoTable(doc, {
        startY: 36,
        head: [['Date', 'Time', 'Location', 'Incident Type', 'Action Taken', 'Details']],
        body: data.observations.map(o => [o.date || '—', o.time || '—', o.location || '—', o.incidentType || '—', o.actionTaken || '—', (o.details || '').slice(0, 60)]),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [240, 235, 255] }
      });
    }

    // Reviews
    if (data.reviews.length > 0) {
      doc.addPage();
      addHeader('Review Logs');
      autoTable(doc, {
        startY: 36,
        head: [['Date', 'Requestor', 'Location', 'Incident Date', 'Incident Type', 'Status', 'Reviewed By', 'Outcome']],
        body: data.reviews.map(r => [r.dateRequested || '—', r.name || '—', r.location || '—', r.incidentDate || '—', r.incidentType || '—', r.status || 'Pending', r.reviewedBy || '—', r.outcome || '—']),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [240, 235, 255] }
      });
    }

    // Releases
    if (data.releases.length > 0) {
      doc.addPage();
      addHeader('Release Footage Logs');
      autoTable(doc, {
        startY: 36,
        head: [['Release Date', 'Requested By', 'Location', 'Incident Type', 'Description', 'Reviewed By', 'Outcome']],
        body: data.releases.map(r => [r.releaseDate || '—', r.requestedBy || r.name || '—', r.location || '—', r.incidentType || '—', (r.description || '').slice(0, 40), r.reviewedBy || '—', r.outcome || '—']),
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        alternateRowStyles: { fillColor: [230, 255, 245] }
      });
    }

    doc.save('CDRRMO_CCTV_Complete_Report.pdf');
    toast.success('Complete PDF exported!');
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
        'Incident Type': o.incidentType || '', 'Action Taken': o.actionTaken || '', 'Details': o.details || ''
      })));
      ws['!cols'] = [14, 10, 20, 22, 18, 40].map(wch => ({ wch }));
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
        'Release Date': r.releaseDate || '', 'Requested By': r.requestedBy || r.name || '',
        'Phone': r.phoneNumber || '', 'Location': r.location || '', 'Incident Date': r.incidentDate || '',
        'Incident Time': r.incidentTime || '', 'Incident Type': r.incidentType || '',
        'Description': r.description || '', 'Reviewed By': r.reviewedBy || '',
        'Outcome': r.outcome || '', 'Comments': r.comments || ''
      })));
      ws['!cols'] = [14, 22, 16, 20, 14, 14, 22, 40, 18, 16, 30].map(wch => ({ wch }));
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
            <div className="report-export-btns">
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
                      <th>Action Taken</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.observations.map((obs, i) => (
                      <tr key={i}>
                        <td>{obs.date}</td>
                        <td>{obs.time}</td>
                        <td>{obs.location}</td>
                        <td><span className="badge pending">{obs.incidentType}</span></td>
                        <td><span className="badge reviewed">{obs.actionTaken || '—'}</span></td>
                        <td title={obs.details}>{obs.details?.slice(0, 60)}{obs.details?.length > 60 ? '...' : ''}</td>
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
                        <td>{rev.dateRequested}</td>
                        <td>{rev.name}</td>
                        <td>{rev.location}</td>
                        <td>{rev.incidentDate}</td>
                        <td><span className="badge pending">{rev.incidentType}</span></td>
                        <td title={rev.description}>{rev.description?.slice(0, 50)}{rev.description?.length > 50 ? '...' : ''}</td>
                        <td><span className={`badge ${rev.status?.toLowerCase() || 'pending'}`}>{rev.status || 'Pending'}</span></td>
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
                      <th>Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.releases.map((rel, i) => (
                      <tr key={i}>
                        <td>{rel.releaseDate}</td>
                        <td>{rel.requestedBy || rel.name}</td>
                        <td>{rel.location}</td>
                        <td>{rel.incidentDate || '—'}</td>
                        <td><span className="badge released">{rel.incidentType}</span></td>
                        <td title={rel.description}>{rel.description?.slice(0, 50)}{rel.description?.length > 50 ? '...' : ''}</td>
                        <td>{rel.reviewedBy || '—'}</td>
                        <td>{rel.outcome || '—'}</td>
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
    </div>
  );
}
