import React, { useState, useMemo, useCallback } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBug, faExclamationCircle, faChartPie, faTags, faList, faLink } from '@fortawesome/free-solid-svg-icons';
import IssueRow from './IssueRow';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import type { StoredReport, Pa11yBodyData } from '../../types';
import { customColors } from '../../types';
import './ReportDetail.css'; // Import the CSS file


interface ReportDetailProps {
  report: StoredReport;
  onBackToList: () => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ report, onBackToList }) => {
  const [expandedIssues, setExpandedIssues] = useState<Record<number, boolean>>({});

  const toggleIssueDetails = useCallback((index: number) => {
    setExpandedIssues(prev => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const pa11yDetails: Pa11yBodyData = report.reportData?.body || { documentTitle: '', documentUrl: '', issues: [] };

  const totalIssues = pa11yDetails.issues?.length || 0;
  const errorsCount = pa11yDetails.issues?.filter(issue => issue.type === 'error').length || 0;

  const { issueTypeChartData, principleChartData } = useMemo(() => {
    const issues = pa11yDetails.issues || [];

    const issueTypes = ['error', 'warning', 'notice'] as const;
    const typeCounts = issueTypes.map(type => issues.filter(issue => issue.type === type).length);
    const typeColors = [customColors.danger, customColors.warning, customColors.success];

    const principleMap = { 'Principle1': 'Perceivable', 'Principle2': 'Operable', 'Principle3': 'Understandable', 'Principle4': 'Robust' };
    const principleCounts = Object.keys(principleMap).map(principle =>
      issues.filter(issue => issue.code.includes(principle)).length
    );

    return {
      issueTypeChartData: {
        labels: issueTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1) + 's'),
        datasets: [{ data: typeCounts, backgroundColor: typeColors }]
      },
      principleChartData: {
        labels: Object.values(principleMap),
        datasets: [{ data: principleCounts, backgroundColor: customColors.secondary, borderRadius: 5 }]
      }
    };
  }, [pa11yDetails]);

  console.log(pa11yDetails, report)

  return (
    <div className="container">
      <button onClick={onBackToList} className="btn btn-primary">
        <FontAwesomeIcon icon={faArrowLeft}/> Back
      </button>

      <h2>{pa11yDetails.documentTitle || 'Untitled'}</h2>
      <a
        href={pa11yDetails.pageUrl || report.reportData.body.pageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="page-url"
      >
        <FontAwesomeIcon icon={faLink}/> {pa11yDetails.pageUrl || report.reportData.body.pageUrl}
      </a>
      <p>Last scanned: {new Date(report.timestamp).toLocaleString()}</p>

      <div className="dashboard-grid">
        <StatCard icon={faBug} title="Total Issues" value={totalIssues} color={customColors.primary} description={'Accessibility Problems'}/>
        <StatCard icon={faExclamationCircle} title="Errors" value={errorsCount} color={customColors.danger} description={'Critical Issues'}/>
        <ChartCard icon={faChartPie} title="Issue Types" Component={Doughnut} data={issueTypeChartData}/>
        <ChartCard icon={faTags} title="WCAG Principles" Component={Bar} data={principleChartData}/>
      </div>

      <div className="card issues-list">
        <div className="issues-header">
          <FontAwesomeIcon icon={faList} className="issues-icon"/>
          <h3>Accessibility Issues</h3>
        </div>
        <table className="issues-table">
          <thead>
          <tr>
            <th>Code</th>
            <th>Message</th>
            <th>Severity</th>
            <th>Element</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          {pa11yDetails.issues?.length ? pa11yDetails.issues.map((issue, idx) => (
            <IssueRow key={idx} issue={issue} expanded={!!expandedIssues[idx]}
                      onToggle={() => toggleIssueDetails(idx)}/>
          )) : <tr>
            <td colSpan={5}>No issues found.</td>
          </tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportDetail;
