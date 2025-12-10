import type { Statistics, MineData } from '../types';
import { calculateStatistics } from '../utils';

interface StatsTableProps {
  data: MineData[];
  mineNames: string[];
}

export function StatsTable({ data, mineNames }: StatsTableProps) {
  const getStats = (source: string): Statistics => {
    const values = source === 'Total'
      ? data.map(d => d.total)
      : data.map(d => d.mines[source] || 0);
    return calculateStatistics(values);
  };

  const sources = [...mineNames, 'Total'];

  return (
    <div className="stats-table">
      <h3>Statistics</h3>
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Mean</th>
            <th>Std Dev</th>
            <th>Median</th>
            <th>Q1</th>
            <th>Q3</th>
            <th>IQR</th>
          </tr>
        </thead>
        <tbody>
          {sources.map(source => {
            const stats = getStats(source);
            const isTotal = source === 'Total';
            return (
              <tr key={source} className={isTotal ? 'total-row' : ''}>
                <td className="source-name">{source}</td>
                <td>{stats.mean.toFixed(1)}</td>
                <td>{stats.stdDev.toFixed(1)}</td>
                <td>{stats.median.toFixed(1)}</td>
                <td>{stats.q1.toFixed(1)}</td>
                <td>{stats.q3.toFixed(1)}</td>
                <td>{stats.iqr.toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
