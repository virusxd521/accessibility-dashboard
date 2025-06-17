
export interface Pa11yIssue {
  code: string;
  type: 'error' | 'warning' | 'notice';
  message: string;
  context: string;
  selector: string;
  runner: string;
  runnerExtras?: {
    description?: string;
    impact?: string;
    help?: string;
    helpUrl?: string;
  };
}

export interface Pa11yBodyData {
  documentTitle: string;
  documentUrl: string;
  pageUrl?: string;
  issues: Pa11yIssue[];
}

export interface RawReportData {
  headers?: Record<string, any>;
  params?: Record<string, any>;
  query?: Record<string, any>;
  body: Pa11yBodyData;
  webhookUrl?: string;
  executionMode?: string;
}

export interface StoredReport {
  _id: string;
  timestamp: string;
  url: string;
  title: string;
  issuesCount: number;
  errorsCount: number;
  reportData: RawReportData;
}

export const customColors = {
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