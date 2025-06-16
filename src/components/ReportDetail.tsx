import React, { useState, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faLink, faBug, faExclamationCircle, faChartPie, faTags, faList, faChevronDown, faChevronUp, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import IssueDetail from './IssueDetail';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface Pa11yBodyData {
  documentTitle: string;
  documentUrl: string;
  issues: Pa11yIssue[];
  pageUrl?: string;
}

interface RawReportData {
  headers: Record<string, any>;
  params: Record<string, any>;
  query: Record<string, any>;
  body: Pa11yBodyData;
  webhookUrl: string;
  executionMode: string;
}

interface Pa11yIssue {
  code: string;
  type: 'error' | 'warning' | 'notice';
  message: string;
  context: string;
  selector: string;
  runner: string;
  runnerExtras?: Record<string, any>;
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

const escapeHtml = (unsafe: string): string => {
  if (typeof unsafe !== 'string') {
    return '';
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

interface ReportDetailProps {
  report: StoredReport;
  onBackToList: () => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ report, onBackToList }) => {
  const [expandedIssues, setExpandedIssues] = useState<{ [key: number]: boolean }>({});

  const toggleIssueDetails = (index: number) => {
    setExpandedIssues(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const pa11yDetails: Pa11yBodyData = report.reportData?.body || { documentTitle: '', documentUrl: '', issues: [] };

  const totalIssues = pa11yDetails.issues?.length || 0;
  const errors = pa11yDetails.issues?.filter(issue => issue.type === 'error').length || 0;

  const { issueTypeChartData, principleChartData } = useMemo(() => {
    const issues = pa11yDetails.issues || [];

    const issueTypeCounts: { [key: string]: number } = issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const issueTypeLabels: string[] = [];
    const issueTypeData: number[] = [];
    const issueTypeColors: string[] = [];

    if (issueTypeCounts.error) {
      issueTypeLabels.push('Errors');
      issueTypeData.push(issueTypeCounts.error);
      issueTypeColors.push(customColors.danger);
    }
    if (issueTypeCounts.warning) {
      issueTypeLabels.push('Warnings');
      issueTypeData.push(issueTypeCounts.warning);
      issueTypeColors.push(customColors.warning);
    }
    if (issueTypeCounts.notice) {
      issueTypeLabels.push('Notices');
      issueTypeData.push(issueTypeCounts.notice);
      issueTypeColors.push(customColors.success);
    }

    const principleCounts = {
      'Principle1': { label: 'Perceivable', count: 0 },
      'Principle2': { label: 'Operable', count: 0 },
      'Principle3': { label: 'Understandable', count: 0 },
      'Principle4': { label: 'Robust', count: 0 },
    };

    issues.forEach(issue => {
      const code = String(issue.code || '');
      if (code.includes('Principle1')) principleCounts['Principle1'].count++;
      else if (code.includes('Principle2')) principleCounts['Principle2'].count++;
      else if (code.includes('Principle3')) principleCounts['Principle3'].count++;
      else if (code.includes('Principle4')) principleCounts['Principle4'].count++;
    });

    const principleLabels = Object.values(principleCounts).map(p => p.label);
    const principleData = Object.values(principleCounts).map(p => p.count);

    return {
      issueTypeChartData: {
        labels: issueTypeLabels,
        datasets: [{
          data: issueTypeData,
          backgroundColor: issueTypeColors,
          borderWidth: 0
        }]
      },
      principleChartData: {
        labels: principleLabels,
        datasets: [{
          label: 'Issues by Principle',
          data: principleData,
          backgroundColor: customColors.secondary,
          borderRadius: 5
        }]
      }
    };
  }, [pa11yDetails]);

  const issueTypeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: ({ label, raw }: { label: string; raw: number }) => `${label}: ${raw}`
        }
      }
    },
    cutout: '70%'
  };

  const principleChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        title: { display: true, text: 'Number of Issues' }
      },
      x: {
        title: { display: true, text: 'WCAG Principle' }
      }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="container">
      <div className="button-and-info-container">
        <button
          onClick={onBackToList}
          className="btn btn-primary"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Reports
        </button>
        <div className="page-info" style={{ flex: 1, margin: 0, boxShadow: 'none', padding: '0' }}>
          <h2 className="page-title">
            <FontAwesomeIcon icon={faFileAlt} /> {escapeHtml(pa11yDetails.documentTitle || pa11yDetails.pageUrl || 'Untitled')}
          </h2>
          <a href={pa11yDetails.pageUrl || pa11yDetails.documentUrl || '#'} target="_blank" rel="noopener noreferrer" className="page-url">
            <FontAwesomeIcon icon={faLink} /> {escapeHtml(pa11yDetails.pageUrl || pa11yDetails.documentUrl || 'N/A')}
          </a>
          <p style={{ color: customColors.gray }}>Last scanned: {new Date(report.timestamp).toLocaleString()}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faBug} /> Total Issues
          </div>
          <div className="card-body">
            <div className="stat-number" style={{ color: customColors.primary }}>{totalIssues}</div>
            <div className="stat-label">Accessibility Problems</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faExclamationCircle} /> Errors
          </div>
          <div className="card-body">
            <div className="stat-number" style={{ color: customColors.danger }}>{errors}</div>
            <div className="stat-label">Critical Issues</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faChartPie} /> Issue Types
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Doughnut data={issueTypeChartData} options={issueTypeChartOptions} />
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="card-header">
            <FontAwesomeIcon icon={faTags} /> WCAG Principles
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Bar data={principleChartData} options={principleChartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="card issues-list">
        <div className="card-header">
          <FontAwesomeIcon icon={faList} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Accessibility Issues</h3>
        </div>
        <div className="card-body">
          <div style={{ overflowX: 'auto' }}>
            <table className="issues-table">
              <thead>
              <tr style={{ backgroundColor: customColors.light }}>
                <th>Code</th>
                <th>Message</th>
                <th>Severity</th>
                <th>Element</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {pa11yDetails.issues?.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: customColors.gray }}>No accessibility issues found for this page.</td>
                </tr>
              ) : (
                pa11yDetails.issues?.map((issue, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td>{escapeHtml(issue.code)}</td>
                      <td>{escapeHtml(issue.message)}</td>
                      <td>
                          <span className={`severity-badge ${
                            issue.type === 'error' ? 'badge-error' :
                              issue.type === 'warning' ? 'badge-warning' :
                                'badge-notice'
                          }`}>
                            {issue.type}
                          </span>
                      </td>
                      <td>{escapeHtml(issue.selector)}</td>
                      <td>
                        <button
                          onClick={() => toggleIssueDetails(index)}
                          className="toggle-details"
                        >
                          <FontAwesomeIcon icon={expandedIssues[index] ? faChevronUp : faChevronDown} />
                          {expandedIssues[index] ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                    {expandedIssues[index] && (
                      <tr className="issue-details-row active">
                        <td colSpan={5}>
                          <IssueDetail issue={issue} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
