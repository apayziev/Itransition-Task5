export interface MineData {
  date: string;
  day: string;
  mines: Record<string, number>;
  total: number;
  dayOfWeekPct: number;
  growthPct: number;
  eventPct: number;
}

export interface Statistics {
  mean: number;
  stdDev: number;
  median: number;
  q1: number;
  q3: number;
  iqr: number;
  min: number;
  max: number;
}

export interface Anomaly {
  date: string;
  value: number;
  type: 'spike' | 'drop';
  method: string;
  severity: number;
}

export interface AnomalyParams {
  iqrMultiplier: number;
  zScoreThreshold: number;
  maWindow: number;
  maThreshold: number;
  grubbsAlpha: number;
}

export type ChartType = 'line' | 'bar' | 'stacked';
export type TrendDegree = 1 | 2 | 3 | 4;
