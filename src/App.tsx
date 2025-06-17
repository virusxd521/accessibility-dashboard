
import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUniversalAccess, faDownload, faCog, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom';

import MessageBox from './components/MessageBox';
import ReportList from './components/ReportList';
import ReportDetail from './components/ReportDetail';
import { customColors } from './types';
import type { StoredReport } from './types';


const N8N_API_URL = import.meta.env.VITE_REACT_APP_N8N_API_URL;

const ReportDetailWrapper: React.FC<{ reports: StoredReport[], isLoading: boolean }> = ({ reports, isLoading }) => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const selectedReport = reports.find(report => report._id === reportId);

  if (isLoading && !selectedReport) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px 0' }}>
        <div className="loading-spinner"></div>
        <p>Loading report details...</p>
      </div>
    );
  }

  if (!isLoading && !selectedReport) {
    return <Navigate to="/" replace />;
  }

  const handleBackToList = () => {
    navigate('/');
  };

  return selectedReport ? (
    <ReportDetail report={selectedReport} onBackToList={handleBackToList} />
  ) : null;
};

const AppContent: React.FC = () => {
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [messageBox, setMessageBox] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

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
      const response = await fetch(N8N_API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}. Response: ${responseText || 'No response body.'}`);
      }

      if (!responseText) {
        setReports([]);
        showMessageBox('No reports available.', 'info');
        setLoading(false);
        return;
      }

      let rawData: { data: StoredReport[] } | StoredReport[];
      try {
        rawData = JSON.parse(responseText);
      } catch (jsonParseError: any) {
        throw new SyntaxError(`Failed to parse JSON from n8n response. Raw response: "${responseText.substring(0, 100)}...". Error: ${jsonParseError.message}`);
      }

      const processedReports: StoredReport[] = Array.isArray(rawData) ? rawData : (rawData.data || []);

      setReports(processedReports.reverse());
      showMessageBox('Reports loaded successfully!', 'success');
    } catch (err: any) {
      console.error("Failed to fetch reports:", err);
      if (err instanceof SyntaxError && err.message.includes('Failed to parse JSON')) {
        setError(`Error parsing report data: ${err.message}. This usually means n8n returned invalid or empty data. Please check n8n's workflow execution for the 'Read Reports API' webhook.`);
      } else {
        setError(`Failed to load reports: ${err.message}. Please check the n8n API endpoint, ensure it's running, and check browser console for network errors.`);
      }
      showMessageBox('Failed to load reports.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showMessageBox]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSelectReport = (report: StoredReport) => {
    navigate(`/report/${report._id}`);
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

      <Routes>
        <Route path="/" element={
          <ReportList
            reports={reports}
            loading={loading}
            error={error}
            fetchReports={fetchReports}
            onSelectReport={handleSelectReport}
          />
        } />
        <Route path="/report/:reportId" element={
          <ReportDetailWrapper reports={reports} isLoading={loading} />
        } />
      </Routes>

      <footer style={{
        backgroundColor: customColors.dark,
        color: 'white',
        padding: '15px 0',
        marginTop: 'auto',
        textAlign: 'center',
        borderTop: `4px solid ${customColors.primary}`
      }}>
        <div className="container">
          <p>Accessibility Dashboard &copy; {new Date().getFullYear()} | Powered by Pa11y and n8n</p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;