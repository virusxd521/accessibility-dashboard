import React, { useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { type Pa11yIssue, customColors } from '../../types';
import ReactMarkdown from 'react-markdown';
import './IssueDetail.css'; // Make sure to create this CSS file

interface IssueDetailProps {
  issue: Pa11yIssue;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ issue }) => {
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAiSuggestion = useCallback(async () => {
    const apiKey = import.meta.env.VITE_REACT_APP_OPENROUTER_API_KEY;
    const model = import.meta.env.VITE_REACT_APP_OPENROUTER_MODEL;

    if (!apiKey || !model) {
      setError('AI config missing in .env.');
      return;
    }

    setLoading(true);
    setError(null);

    const prompt = `
      Accessibility expert: Given the issue "${issue.message}" (code: ${issue.code}), context: "${issue.context}",
      provide a brief, actionable fix (2-3 sentences or clear bullets).
      Use Markdown formatting for better readability. Include code examples if relevant.
    `;

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = await res.json();
      setAiSuggestion(data.choices[0]?.message.content || 'No suggestion available.');

    } catch (e: any) {
      setError(e.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  }, [issue]);

  // Custom components for ReactMarkdown
  const markdownComponents = {
    p: ({ node, ...props }) => <p className="markdown-paragraph" {...props} />,
    h1: ({ node, ...props }) => <h1 className="markdown-heading" {...props} />,
    h2: ({ node, ...props }) => <h2 className="markdown-heading" {...props} />,
    h3: ({ node, ...props }) => <h3 className="markdown-heading" {...props} />,
    h4: ({ node, ...props }) => <h4 className="markdown-heading" {...props} />,
    ul: ({ node, ...props }) => <ul className="markdown-list" {...props} />,
    ol: ({ node, ...props }) => <ol className="markdown-list" {...props} />,
    li: ({ node, ...props }) => <li className="markdown-list-item" {...props} />,
    code: ({ node, inline, ...props }) =>
      inline ?
        <code className="markdown-inline-code" {...props} /> :
        <code className="markdown-block-code" {...props} />,
    pre: ({ node, ...props }) => <pre className="markdown-code-block" {...props} />,
    blockquote: ({ node, ...props }) => <blockquote className="markdown-blockquote" {...props} />,
    a: ({ node, ...props }) => <a className="markdown-link" {...props} />
  };

  return (
    <div className="issue-detail">
      <h4>Issue Details</h4>

      <section>
        <strong>Code:</strong>
        <span>{issue.code}</span>
      </section>

      <section>
        <strong>Context (HTML):</strong>
        <pre className="code-snippet">{issue.context}</pre>
      </section>

      <section>
        <strong>Selector:</strong>
        <span>{issue.selector}</span>
      </section>

      <section>
        <strong>Runner:</strong>
        <span>{issue.runner}</span>
      </section>

      {issue.runnerExtras && (
        <section>
          <strong>Runner Extras:</strong>
          <pre className="code-snippet">
            {JSON.stringify(issue.runnerExtras, null, 2)}
          </pre>
        </section>
      )}

      <section className="ai-suggestion-section">
        <div className="ai-suggestion-header">
          <FontAwesomeIcon icon={faLightbulb} className="ai-icon" />
          <h3>AI Suggested Fix</h3>
        </div>

        {loading ? (
          <div className="ai-loading">
            <FontAwesomeIcon icon={faSpinner} spin />
            <span>Generating accessibility fix suggestion...</span>
          </div>
        ) : error ? (
          <div className="ai-error">
            <p>Error: {error}</p>
          </div>
        ) : aiSuggestion ? (
          <div className="ai-content">
            <ReactMarkdown components={markdownComponents}>{aiSuggestion}</ReactMarkdown>
          </div>
        ) : (
          <button
            className="ai-suggestion-button"
            onClick={fetchAiSuggestion}
          >
            <FontAwesomeIcon icon={faLightbulb} /> Get AI Suggestion
          </button>
        )}
      </section>
    </div>
  );
};

export default IssueDetail;