import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface StatCardProps {
  icon: any;
  title: string;
  value: number | string;
  color?: string;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color = '#34495e', description }) => {
  return (
    <div className="card stat-card">
      <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FontAwesomeIcon icon={icon} />
        <span>{title}</span>
      </div>
      <div className="card-body">
        <div className="stat-number" style={{ color, fontSize: '2rem', fontWeight: 'bold' }}>
          {value}
        </div>
        {description && (
          <p className="stat-label">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;