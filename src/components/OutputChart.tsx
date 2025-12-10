import { useMemo, forwardRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { MineData, ChartType, TrendDegree, Anomaly } from '../types';
import { calculateTrendline } from '../utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface OutputChartProps {
  data: MineData[];
  mineNames: string[];
  selectedMine: string;
  chartType: ChartType;
  trendDegree: TrendDegree;
  anomalies: Anomaly[];
}

const COLORS = [
  'rgba(37, 99, 235, 0.7)',    // primary blue
  'rgba(107, 114, 128, 0.7)',  // gray
  'rgba(37, 99, 235, 0.4)',    // light blue
  'rgba(156, 163, 175, 0.7)',  // light gray
  'rgba(37, 99, 235, 0.55)',   // medium blue
];

export const OutputChart = forwardRef<HTMLDivElement, OutputChartProps>(
  ({ data, mineNames, selectedMine, chartType, trendDegree, anomalies }, ref) => {
    const labels = data.map(d => d.date);
    const anomalyDates = new Set(anomalies.map(a => a.date));

    const chartData = useMemo(() => {
      if (chartType === 'stacked') {
        return {
          labels,
          datasets: mineNames.map((name, idx) => ({
            label: name,
            data: data.map(d => d.mines[name] || 0),
            backgroundColor: COLORS[idx % COLORS.length],
            stack: 'stack1',
          })),
        };
      }

      const values = selectedMine === 'Total'
        ? data.map(d => d.total)
        : data.map(d => d.mines[selectedMine] || 0);

      const trendline = calculateTrendline(values, trendDegree);

      // Highlight anomaly points - subtle distinction
      const pointColors = data.map(d => {
        if (anomalyDates.has(d.date)) {
          return 'rgba(220, 38, 38, 0.9)'; // muted red for anomalies
        }
        return 'rgba(37, 99, 235, 0.8)';
      });

      const pointRadius = data.map(d => anomalyDates.has(d.date) ? 6 : 2);

      return {
        labels,
        datasets: [
          {
            label: selectedMine,
            data: values,
            backgroundColor: chartType === 'bar' ? 'rgba(37, 99, 235, 0.6)' : 'rgba(37, 99, 235, 0.1)',
            borderColor: 'rgba(37, 99, 235, 1)',
            pointBackgroundColor: pointColors,
            pointRadius,
            pointHoverRadius: pointRadius.map(r => r + 2),
            tension: 0.3,
            fill: true,
            type: chartType === 'bar' ? 'bar' as const : 'line' as const,
          },
          {
            label: `Trend`,
            data: trendline,
            borderColor: 'rgba(220, 38, 38, 0.8)',
            borderWidth: 2.5,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
            type: 'line' as const,
          },
        ],
      };
    }, [data, mineNames, selectedMine, chartType, trendDegree, anomalies, labels, anomalyDates]);

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            boxWidth: 12,
            padding: 20,
            font: { size: 11 },
          },
        },
        title: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.9)',
          titleFont: { size: 12 },
          bodyFont: { size: 11 },
          padding: 10,
          callbacks: {
            afterLabel: (context: { dataIndex: number }) => {
              const date = labels[context.dataIndex];
              const dateAnomalies = anomalies.filter(a => a.date === date);
              if (dateAnomalies.length > 0) {
                return dateAnomalies.map(a => 
                  `Anomaly: ${a.method} (${a.type})`
                );
              }
              return '';
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 12,
            font: { size: 10 },
            color: '#6b7280',
            callback: function(_: unknown, index: number) {
              const label = labels[index];
              if (!label) return '';
              const day = label.split('-')[2];
              return day;
            },
          },
        },
        y: {
          beginAtZero: true,
          stacked: chartType === 'stacked',
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: {
            font: { size: 10 },
            color: '#6b7280',
          },
        },
      },
    };

    return (
      <div ref={ref} className="chart-container">
        <Chart 
          type={chartType === 'stacked' ? 'bar' : chartType} 
          data={chartData} 
          options={options} 
        />
      </div>
    );
  }
);

OutputChart.displayName = 'OutputChart';
