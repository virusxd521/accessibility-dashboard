import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faLightbulb } from '@fortawesome/free-solid-svg-icons';

interface Pa11yIssue {
  code: string;
  type: 'error' | 'warning' | 'notice';
  message: string;
  context: string;
  selector: string;
  runner: string;
  runnerExtras?: Record<string, any>;
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

interface IssueDetailProps {
  issue: Pa11yIssue;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ issue }) => {
  const [llmSuggestion, setLlmSuggestion] = useState<string>('');
  const [llmLoading, setLlmLoading] = useState<boolean>(false);
  const [llmError, setLlmError] = useState<string | null>(null);

  // Environment variables for OpenRouter API
  const OPENROUTER_API_KEY = import.meta.env.VITE_REACT_APP_OPENROUTER_API_KEY;
  const OPENROUTER_MODEL = import.meta.env.VITE_REACT_APP_OPENROUTER_MODEL;

  const getLlmSuggestion = useCallback(async () => {
    if (!OPENROUTER_API_KEY || !OPENROUTER_MODEL) {
      setLlmError("API key or model not configured. Please check .env file.");
      return;
    }

    setLlmLoading(true);
    setLlmError(null);
    setLlmSuggestion(''); // Clear previous suggestion

    const prompt = `
      You are an accessibility expert providing a concise and actionable suggestion for an accessibility issue.
      Given the following Pa11y accessibility issue, provide a suggested fix. Focus on practical code changes or clear instructions.
      Keep the suggestion brief (2-4 sentences or clear bullet points) and easy to understand for a developer.

      Issue Code: ${issue.code}
      Message: ${issue.message}
      Context (HTML snippet): ${issue.context}
      Selector: ${issue.selector}
      Severity: ${issue.type}

      Provide your suggestion in Markdown format.
      `;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            { "role": "user", "content": prompt }
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const suggestion = data.choices[0]?.message?.content || "No suggestion found.";
      setLlmSuggestion(suggestion);

    } catch (error: any) {
      console.error("Error fetching LLM suggestion:", error);
      setLlmError(error.message || "Failed to get suggestion.");
      setLlmSuggestion('Error: Could not fetch suggestion.');
    } finally {
      setLlmLoading(false);
    }
  }, [issue, OPENROUTER_API_KEY, OPENROUTER_MODEL]);

  return (
    <div className="issue-details-content"> {/* Use this class for the content div */}
      <div className="detail-row">
        <div className="detail-label">Issue Code:</div>
        <div className="detail-content">{escapeHtml(issue.code)}</div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Context:</div>
        <div className="detail-content">
          <pre className="code-snippet">{escapeHtml(issue.context)}</pre>
        </div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Selector:</div>
        <div className="detail-content">{escapeHtml(issue.selector)}</div>
      </div>
      <div className="detail-row">
        <div className="detail-label">Runner:</div>
        <div className="detail-content">{escapeHtml(issue.runner)}</div>
      </div>
      {issue.runnerExtras && Object.keys(issue.runnerExtras).length > 0 && (
        <div className="detail-row">
          <div className="detail-label">Runner Extras:</div>
          <div className="detail-content">
            <pre className="code-snippet">{escapeHtml(JSON.stringify(issue.runnerExtras, null, 2))}</pre>
          </div>
        </div>
      )}
      {/* LLM Suggestion Section */}
      <div className="detail-row" style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
        <div className="detail-label">AI Suggestion:</div>
        <div className="detail-content">
          {llmSuggestion ? (
            <pre className="code-snippet" style={{ backgroundColor: customColors.light, color: customColors.dark, border: `1px solid ${customColors.gray}` }}>
              {llmSuggestion}
            </pre>
          ) : llmLoading ? (
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: customColors.secondary }}>
              <FontAwesomeIcon icon={faSpinner} spin /> Getting suggestion...
            </p>
          ) : llmError ? (
            <p style={{ color: customColors.danger }}>
              Error: {llmError}
            </p>
          ) : (
            <button
              onClick={getLlmSuggestion}
              className="btn btn-primary"
              style={{ padding: '8px 15px', borderRadius: '5px', fontSize: '0.9rem', backgroundColor: customColors.info }}
            >
              <FontAwesomeIcon icon={faLightbulb} /> Get AI Suggestion
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
