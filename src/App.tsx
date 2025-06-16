import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUniversalAccess, faDownload, faCog, faSyncAlt } from '@fortawesome/free-solid-svg-icons';

import MessageBox from './components/MessageBox';
import ReportList from './components/ReportList';
import ReportDetail from './components/ReportDetail';

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

const N8N_API_URL = import.meta.env.VITE_REACT_APP_N8N_API_URL;

const App: React.FC = () => {
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<StoredReport | null>(null);
  const [messageBox, setMessageBox] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({ show: false, message: '', type: 'success' });

  const showMessageBox = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setMessageBox({ show: true, message, type });
    setTimeout(() => {
      setMessageBox(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!N8N_API_URL) {
      setError("N8N API URL not configured. Please set REACT_APP_N8N_API_URL in your .env file.");
      showMessageBox("N8N API URL not configured!", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(N8N_API_URL);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorText || 'No response body.'}`);
      }

      const responseText = await response.text();

      if (!responseText) {
        console.warn('Received empty response body from n8n. Assuming no reports.');
        setReports([]);
        showMessageBox('No reports available.', 'info');
        return;
      }

      let rawData: { data: StoredReport[] } | StoredReport[];
      try {
        rawData = JSON.parse(responseText);
      } catch (jsonParseError: any) {
        throw new SyntaxError(`Failed to parse JSON from n8n response. Raw response: "${responseText}". Error: ${jsonParseError.message}`);
      }

      const processedReports: StoredReport[] = Array.isArray(rawData) ? rawData : (rawData.data || []);

      setReports(processedReports.reverse());
      showMessageBox('Reports loaded successfully!', 'success');
    } catch (err: any) {
      console.error("Failed to fetch reports:", err);
      if (err instanceof SyntaxError && err.message.includes('Failed to parse JSON')) {
        setError(`Error parsing report data: ${err.message}. This usually means n8n returned invalid or empty data. Please check n8n's workflow execution for the 'Read Reports API' webhook.`);
      } else {
        setError(`Failed to load reports: ${err.message}. Please check the n8n API endpoint, ensure ngrok/n8n are running, and check browser console for network errors.`);
      }
      showMessageBox('Failed to load reports.', 'error');
    } finally {
      setLoading(false);
    }
  }, [N8N_API_URL, showMessageBox]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSelectReport = (report: StoredReport) => {
    setSelectedReport(report);
  };

  const handleBackToList = () => {
    setSelectedReport(null);
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: customColors.light }}>
      <MessageBox {...messageBox} />
      <header>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <FontAwesomeIcon icon={faUniversalAccess} />
              <h1>Accessibility Reports</h1>
            </div>
            <div className="controls">
              <button
                onClick={fetchReports}
                className="btn btn-primary"
              >
                <FontAwesomeIcon icon={faSyncAlt} /> Refresh Reports
              </button>
              <button
                onClick={() => showMessageBox('Export functionality would be implemented here!', 'info')}
                className="btn btn-outline"
              >
                <FontAwesomeIcon icon={faDownload} /> Export
              </button>
              <button
                onClick={() => showMessageBox('Settings functionality would be implemented here!', 'info')}
                className="btn btn-outline"
              >
                <FontAwesomeIcon icon={faCog} /> Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {selectedReport ? (
        <ReportDetail report={selectedReport} onBackToList={handleBackToList} />
      ) : (
        <ReportList reports={reports} loading={loading} error={error} fetchReports={fetchReports} onSelectReport={handleSelectReport} />
      )}

      <footer>
        <div className="container">
          <p>Accessibility Dashboard &copy; 2025 | Powered by Pa11y, n8n, and React</p>
          <p>For accessibility assistance, contact: access-team@example.com</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
    