import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useChartKey } from '../../hooks/useChartKey';
import { customColors } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
);

interface ChartCardProps {
  icon: any;
  title: string;
  Component: React.ElementType;
  data: any;
  options?: any;
}

const ChartCard: React.FC<ChartCardProps> = ({
                                               icon,
                                               title,
                                               Component,
                                               data,
                                               options = { responsive: true, maintainAspectRatio: false },
                                             }) => {
  // Generate a unique key for this chart instance
  const chartKey = useChartKey(data);

  return (
    <div className="card chart-card">
      <div className="card-header">
        <FontAwesomeIcon icon={icon} style={{ marginRight: '8px', color: customColors.secondary }} />
        <h3>{title}</h3>
      </div>
      <div className="chart-container">
        <Component
          key={chartKey}
          data={data}
          options={options}
        />
      </div>
    </div>
  );
};

export default ChartCard;