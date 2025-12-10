import type { AnomalyParams, ChartType, TrendDegree } from '../types';

interface ControlsProps {
  params: AnomalyParams;
  onParamsChange: (params: AnomalyParams) => void;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  trendDegree: TrendDegree;
  onTrendDegreeChange: (degree: TrendDegree) => void;
  selectedMine: string;
  mineNames: string[];
  onMineChange: (mine: string) => void;
  onRefresh: () => void;
  onGeneratePDF: () => void;
  loading: boolean;
}

export function Controls({
  params,
  onParamsChange,
  chartType,
  onChartTypeChange,
  trendDegree,
  onTrendDegreeChange,
  selectedMine,
  mineNames,
  onMineChange,
  onRefresh,
  onGeneratePDF,
  loading,
}: ControlsProps) {
  const updateParam = <K extends keyof AnomalyParams>(key: K, value: AnomalyParams[K]) => {
    onParamsChange({ ...params, [key]: value });
  };

  return (
    <div className="controls">
      <div className="control-actions">
        <button onClick={onRefresh} disabled={loading} className="btn-refresh">
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <button onClick={onGeneratePDF} disabled={loading} className="btn-pdf">
          Export PDF
        </button>
      </div>

      <div className="control-section">
        <h4>Chart</h4>
        <div className="control-group">
          <label>Mine</label>
          <select value={selectedMine} onChange={e => onMineChange(e.target.value)}>
            <option value="Total">Total Output</option>
            {mineNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label>Chart Type</label>
          <select value={chartType} onChange={e => onChartTypeChange(e.target.value as ChartType)}>
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="stacked">Stacked</option>
          </select>
        </div>
        <div className="control-group">
          <label>Trendline</label>
          <select 
            value={trendDegree} 
            onChange={e => onTrendDegreeChange(Number(e.target.value) as TrendDegree)}
          >
            <option value={1}>Straight Line</option>
            <option value={2}>Curved (Quadratic)</option>
            <option value={3}>S-Curve (Cubic)</option>
            <option value={4}>Complex (Quartic)</option>
          </select>
        </div>
      </div>

      <div className="control-section">
        <h4>Detection</h4>
        <div className="control-group">
          <label title="Multiplier for Interquartile Range. Values outside Q1-(IQR×M) to Q3+(IQR×M) are flagged. Lower = more sensitive. Recommended: 1.5">
            IQR Multiplier <span className="help-icon">?</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0.5"
            max="3"
            value={params.iqrMultiplier}
            onChange={e => updateParam('iqrMultiplier', parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label title="Number of standard deviations from mean to flag as anomaly. Lower = more sensitive. Recommended: 2.5-3.0">
            Z-Score Threshold <span className="help-icon">?</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="5"
            value={params.zScoreThreshold}
            onChange={e => updateParam('zScoreThreshold', parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label title="Number of days used to calculate the moving average. Larger window = smoother baseline.">
            MA Window (days) <span className="help-icon">?</span>
          </label>
          <input
            type="number"
            step="1"
            min="3"
            max="14"
            value={params.maWindow}
            onChange={e => updateParam('maWindow', parseInt(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label title="Percentage deviation from moving average to flag. E.g., 30% means values 30% above/below MA are flagged.">
            MA Threshold (%) <span className="help-icon">?</span>
          </label>
          <input
            type="number"
            step="5"
            min="10"
            max="100"
            value={params.maThreshold}
            onChange={e => updateParam('maThreshold', parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label title="Significance level for Grubbs' test. Lower = stricter outlier detection. Recommended: 0.05">
            Grubbs Alpha <span className="help-icon">?</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="0.1"
            value={params.grubbsAlpha}
            onChange={e => updateParam('grubbsAlpha', parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
