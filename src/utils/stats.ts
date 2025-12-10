import type { Statistics } from '../types';

export function calculateStatistics(values: number[]): Statistics {
  const n = values.length;
  if (n === 0) {
    return { mean: 0, stdDev: 0, median: 0, q1: 0, q3: 0, iqr: 0, min: 0, max: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / n;
  
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  const median = getPercentile(sorted, 50);
  const q1 = getPercentile(sorted, 25);
  const q3 = getPercentile(sorted, 75);
  const iqr = q3 - q1;

  return {
    mean,
    stdDev,
    median,
    q1,
    q3,
    iqr,
    min: sorted[0],
    max: sorted[n - 1],
  };
}

function getPercentile(sorted: number[], p: number): number {
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  
  if (lower === upper) return sorted[lower];
  
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function calculateTrendline(values: number[], degree: number): number[] {
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  
  // Polynomial regression using normal equations
  const coeffs = polyfit(x, values, degree);
  
  return x.map(xi => {
    let y = 0;
    for (let i = 0; i <= degree; i++) {
      y += coeffs[i] * Math.pow(xi, i);
    }
    return y;
  });
}

function polyfit(x: number[], y: number[], degree: number): number[] {
  const n = x.length;
  const m = degree + 1;
  
  // Build Vandermonde matrix
  const X: number[][] = [];
  for (let i = 0; i < n; i++) {
    X[i] = [];
    for (let j = 0; j < m; j++) {
      X[i][j] = Math.pow(x[i], j);
    }
  }
  
  // X^T * X
  const XtX: number[][] = Array(m).fill(0).map(() => Array(m).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      for (let k = 0; k < n; k++) {
        XtX[i][j] += X[k][i] * X[k][j];
      }
    }
  }
  
  // X^T * y
  const Xty: number[] = Array(m).fill(0);
  for (let i = 0; i < m; i++) {
    for (let k = 0; k < n; k++) {
      Xty[i] += X[k][i] * y[k];
    }
  }
  
  // Solve using Gaussian elimination
  return gaussianElimination(XtX, Xty);
}

function gaussianElimination(A: number[][], b: number[]): number[] {
  const n = b.length;
  const aug: number[][] = A.map((row, i) => [...row, b[i]]);
  
  for (let i = 0; i < n; i++) {
    // Partial pivoting
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
        maxRow = k;
      }
    }
    [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];
    
    // Elimination
    for (let k = i + 1; k < n; k++) {
      const factor = aug[k][i] / aug[i][i];
      for (let j = i; j <= n; j++) {
        aug[k][j] -= factor * aug[i][j];
      }
    }
  }
  
  // Back substitution
  const x: number[] = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = aug[i][n];
    for (let j = i + 1; j < n; j++) {
      x[i] -= aug[i][j] * x[j];
    }
    x[i] /= aug[i][i];
  }
  
  return x;
}
