import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faLink, faBug, faExclamationCircle, faSpinner, faSyncAlt } from '@fortawesome/free-solid-svg-icons';

interface Pa11yBodyData {
  documentTitle: string;
  documentUrl: string;
  issues: any[];
  pageUrl?: string;
}

interface RawReportData {
  body: Pa11yBodyData;
}

interface StoredReport {
  _id: string;
  timestamp: string;
  url: string;
  title: string;
  issuesCount: number;
  errorsCount: number;
  reportData: RawReportData;
}

const customColors = {
  primary: '#2c3e50',
  secondary: '#3498db',
  danger: '#e74c3c',
  warning: '#f39c12',
  success: '#2ecc71',
  light: '#ecf0f1',
  dark: '#34495e',
  info: '#3498db',
  gray: '#95a5a6',
};

interface ReportCardProps {
  report: StoredReport;
  onSelectReport: (report: StoredReport) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onSelectReport }) => {
  return (
    <div
      className="card"
      onClick={() => onSelectReport(report)}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-header">
        <FontAwesomeIcon icon={faFileAlt} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.title || report.url}</h3>
      </div>
      <div className="card-body">
        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <FontAwesomeIcon icon={faLink} style={{ color: customColors.secondary }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{report.url}</span>
        </p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: customColors.gray }}>
          <FontAwesomeIcon icon={faSyncAlt} style={{ color: customColors.gray }} />
          Last Scanned: {new Date(report.timestamp).toLocaleString()}
        </p>
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px', color: customColors.dark, fontWeight: '600', fontSize: '1.125rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FontAwesomeIcon icon={faBug} style={{ color: customColors.primary }} /> {report.issuesCount} Issues
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: customColors.danger }}>
            <FontAwesomeIcon icon={faExclamationCircle} /> {report.errorsCount} Errors
          </span>
        </div>
      </div>
    </div>
  );
};

interface ReportListProps {
  reports: StoredReport[];
  loading: boolean;
  error: string | null;
  fetchReports: () => void;
  onSelectReport: (report: StoredReport) => void;
}

const ReportList: React.FC<ReportListProps> = ({ reports, loading, error, fetchReports, onSelectReport }) => {
  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: customColors.light, color: customColors.dark }}>
        <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '3rem', color: customColors.secondary, marginBottom: '16px' }} />
        <p style={{ fontSize: '1.25rem' }}>Loading accessibility reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: customColors.danger, color: 'white', padding: '20px' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Error:</p>
        <p style={{ marginBottom: '16px', textAlign: 'center' }}>{error}</p>
        <button
          onClick={fetchReports}
          className="btn btn-primary"
        >
          <FontAwesomeIcon icon={faSyncAlt} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: customColors.primary, marginBottom: '24px' }}>Available Reports</h2>
      <div className="dashboard-grid">
        {reports.length === 0 ? (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: customColors.gray, fontSize: '1.125rem' }}>No reports available. Run a scan from GitHub Actions!</p>
        ) : (
          reports.map(report => (
            <ReportCard key={report._id} report={report} onSelectReport={onSelectReport} />
          ))
        )}
      </div>
    </div>
  );
};

export default ReportList;
