import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MetricSeries } from '../types/dataTypes';

interface OverviewChartsProps {
  metrics: MetricSeries[];
}

export default function OverviewCharts({ metrics }: OverviewChartsProps) {
  // Combine all metrics into a single dataset for the chart
  const combinedData = React.useMemo(() => {
    if (metrics.length === 0) return [];

    const timestamps = metrics[0]?.data.map(d => d.timestamp) || [];
    
    return timestamps.map(timestamp => {
      const dataPoint: any = { timestamp: new Date(timestamp).toLocaleDateString() };
      
      metrics.forEach(metric => {
        const point = metric.data.find(d => d.timestamp === timestamp);
        dataPoint[metric.name] = point?.value || 0;
      });
      
      return dataPoint;
    });
  }, [metrics]);

  if (metrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No metrics data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="timestamp" 
            stroke="var(--color-muted-foreground)"
            fontSize={12}
          />
          <YAxis 
            stroke="var(--color-muted-foreground)"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--color-popover)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-popover-foreground)'
            }}
          />
          <Legend />
          {metrics.map((metric, index) => (
            <Line
              key={metric.id}
              type="monotone"
              dataKey={metric.name}
              stroke={metric.color || `var(--color-chart-${(index % 5) + 1})`}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}