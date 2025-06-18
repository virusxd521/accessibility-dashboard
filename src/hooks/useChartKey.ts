import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js';

/**
 * A hook that manages Chart.js instances and ensures proper cleanup
 * @param data The data for the chart
 * @returns A unique key for the chart instance
 */
export const useChartKey = (data: any) => {
  const [chartKey, setChartKey] = useState<string>(() =>
    `chart-${Math.random().toString(36).substring(2, 9)}`
  );

  const chartInstanceRef = useRef<Chart | null>(null);

  // Clean up any existing chart instance when unmounting or when data changes
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [data]);

  // Update the key when data changes to force chart recreation
  useEffect(() => {
    setChartKey(`chart-${Math.random().toString(36).substring(2, 9)}`);
  }, [data]);

  return chartKey;
};