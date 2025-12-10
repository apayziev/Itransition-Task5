import type { Anomaly } from '../types';

interface AnomalyTableProps {
  anomalies: Anomaly[];
}

export function AnomalyTable({ anomalies }: AnomalyTableProps) {
  const uniqueAnomalies = getUniqueByDateAndMethod(anomalies);
  
  const byMethod = {
    IQR: uniqueAnomalies.filter(a => a.method === 'IQR'),
    'Z-Score': uniqueAnomalies.filter(a => a.method === 'Z-Score'),
    'Moving Avg': uniqueAnomalies.filter(a => a.method === 'Moving Avg'),
    Grubbs: uniqueAnomalies.filter(a => a.method === 'Grubbs'),
  };

  return (
    <div className="anomaly-table">
      <h3>Anomalies</h3>
      
      {uniqueAnomalies.length === 0 ? (
        <p className="no-anomalies">No anomalies detected with current parameters.</p>
      ) : (
        <div className="anomaly-methods">
          {Object.entries(byMethod).map(([method, items]) => (
            <div key={method} className="method-section">
              <h4>
                {method} 
                <span className="count">({items.length})</span>
              </h4>
              {items.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Value</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.slice(0, 10).map((a, idx) => (
                      <tr key={idx} className={a.type}>
                        <td>{a.date}</td>
                        <td>
                          <span className={`badge ${a.type}`}>
                            {a.type === 'spike' ? '↑' : '↓'} {a.type}
                          </span>
                        </td>
                        <td>{a.value.toFixed(1)}</td>
                        <td>{a.severity.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-items"><span className="check-icon">✓</span> None detected</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getUniqueByDateAndMethod(anomalies: Anomaly[]): Anomaly[] {
  const seen = new Set<string>();
  return anomalies.filter(a => {
    const key = `${a.date}-${a.method}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
