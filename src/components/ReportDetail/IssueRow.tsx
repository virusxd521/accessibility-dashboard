import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faInfoCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import IssueDetail from './IssueDetail';
import type { Pa11yIssue } from '../../types';
import { useWcagExplanation } from '../../hooks/useWcagExplanation';
import './IssueRow.css';

interface IssueRowProps {
  issue: Pa11yIssue;
  expanded: boolean;
  onToggle: () => void;
}

const IssueRow: React.FC<IssueRowProps> = ({ issue, expanded, onToggle }) => {
  const { explanations, fetchExplanation } = useWcagExplanation();

  const handleExplanationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchExplanation(issue.code);
  };

  const explanationData = explanations[issue.code];

  return (
    <>
      <tr>
        <td>
          <div className="code-container">
            <span className="issue-code">{issue.code}</span>
            <button
              onClick={handleExplanationClick}
              className="explain-btn"
              title="Explain WCAG code"
            >
              <FontAwesomeIcon icon={faInfoCircle} />
            </button>
          </div>

          {explanationData && (
            <div className={`wcag-explanation ${explanationData.loading ? 'loading' : explanationData.error ? 'error' : 'success'}`}>
              {explanationData.loading && (
                <div className="explanation-loading">
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Loading explanation...</span>
                </div>
              )}
              {explanationData.error && (
                <div className="explanation-error">
                  Error: {explanationData.error}
                </div>
              )}
              {explanationData.text && (
                <div className="explanation-content">
                  {explanationData.text}
                </div>
              )}
            </div>
          )}
        </td>
        <td>{issue.message}</td>
        <td>
          <span className={`severity-badge ${
            issue.type === 'error' ? 'badge-error' :
              issue.type === 'warning' ? 'badge-warning' : 'badge-notice'
          }`}>
            {issue.type}
          </span>
        </td>
        <td>{issue.selector}</td>
        <td>
          <button onClick={onToggle} className="toggle-details">
            <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} />
            {expanded ? ' Hide' : ' Details'}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="issue-details-row active">
          <td colSpan={5}>
            <IssueDetail issue={issue} />
          </td>
        </tr>
      )}
    </>
  );
};

export default IssueRow;