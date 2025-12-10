import type { Anomaly, AnomalyParams } from '../types';
import { calculateStatistics } from './stats';

export const DEFAULT_PARAMS: AnomalyParams = {
  iqrMultiplier: 1.5,
  zScoreThreshold: 2.5,
  maWindow: 7,
  maThreshold: 30,
  grubbsAlpha: 0.05,
};

export function detectAnomalies(
  values: number[],
  dates: string[],
  params: AnomalyParams
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  
  const iqrAnomalies = detectIQR(values, dates, params.iqrMultiplier);
  const zScoreAnomalies = detectZScore(values, dates, params.zScoreThreshold);
  const maAnomalies = detectMovingAverage(values, dates, params.maWindow, params.maThreshold);
  const grubbsAnomalies = detectGrubbs(values, dates, params.grubbsAlpha);
  
  anomalies.push(...iqrAnomalies, ...zScoreAnomalies, ...maAnomalies, ...grubbsAnomalies);
  
  return anomalies;
}

export function detectIQR(values: number[], dates: string[], multiplier: number): Anomaly[] {
  const stats = calculateStatistics(values);
  const lowerBound = stats.q1 - multiplier * stats.iqr;
  const upperBound = stats.q3 + multiplier * stats.iqr;
  
  return values
    .map((value, i) => {
      if (value < lowerBound) {
        return {
          date: dates[i],
          value,
          type: 'drop' as const,
          method: 'IQR',
          severity: (lowerBound - value) / stats.iqr,
        };
      }
      if (value > upperBound) {
        return {
          date: dates[i],
          value,
          type: 'spike' as const,
          method: 'IQR',
          severity: (value - upperBound) / stats.iqr,
        };
      }
      return null;
    })
    .filter((a): a is Anomaly => a !== null);
}

export function detectZScore(values: number[], dates: string[], threshold: number): Anomaly[] {
  const stats = calculateStatistics(values);
  if (stats.stdDev === 0) return [];
  
  return values
    .map((value, i) => {
      const zScore = (value - stats.mean) / stats.stdDev;
      if (Math.abs(zScore) > threshold) {
        return {
          date: dates[i],
          value,
          type: zScore > 0 ? 'spike' as const : 'drop' as const,
          method: 'Z-Score',
          severity: Math.abs(zScore),
        };
      }
      return null;
    })
    .filter((a): a is Anomaly => a !== null);
}

export function detectMovingAverage(
  values: number[],
  dates: string[],
  window: number,
  thresholdPct: number
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  
  for (let i = window; i < values.length; i++) {
    const windowValues = values.slice(i - window, i);
    const ma = windowValues.reduce((a, b) => a + b, 0) / window;
    
    if (ma === 0) continue;
    
    const pctDiff = ((values[i] - ma) / ma) * 100;
    
    if (Math.abs(pctDiff) > thresholdPct) {
      anomalies.push({
        date: dates[i],
        value: values[i],
        type: pctDiff > 0 ? 'spike' : 'drop',
        method: 'Moving Avg',
        severity: Math.abs(pctDiff) / thresholdPct,
      });
    }
  }
  
  return anomalies;
}

export function detectGrubbs(values: number[], dates: string[], alpha: number): Anomaly[] {
  const n = values.length;
  if (n < 3) return [];
  
  const stats = calculateStatistics(values);
  if (stats.stdDev === 0) return [];
  
  // Critical value from t-distribution (approximation)
  const tCrit = getTCritical(n - 2, alpha / (2 * n));
  const gCrit = ((n - 1) / Math.sqrt(n)) * Math.sqrt(tCrit * tCrit / (n - 2 + tCrit * tCrit));
  
  return values
    .map((value, i) => {
      const g = Math.abs(value - stats.mean) / stats.stdDev;
      if (g > gCrit) {
        return {
          date: dates[i],
          value,
          type: value > stats.mean ? 'spike' as const : 'drop' as const,
          method: 'Grubbs',
          severity: g / gCrit,
        };
      }
      return null;
    })
    .filter((a): a is Anomaly => a !== null);
}

// Approximation of t-distribution critical value
function getTCritical(df: number, alpha: number): number {
  // Using approximation for large df
  const z = -Math.log(4 * alpha * (1 - alpha));
  return Math.sqrt(z * (1 + (z - 2) / (4 * df)));
}

export function groupAnomaliesByDate(anomalies: Anomaly[]): Map<string, Anomaly[]> {
  const map = new Map<string, Anomaly[]>();
  for (const a of anomalies) {
    const existing = map.get(a.date) || [];
    existing.push(a);
    map.set(a.date, existing);
  }
  return map;
}
