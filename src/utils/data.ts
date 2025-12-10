import Papa from 'papaparse';
import type { MineData } from '../types';
import { CONFIG } from '../config';

interface RawRow {
  Date: string;
  Day: string;
  Total: string;
  'DayOfWeek%': string;
  'Growth%': string;
  'Event%': string;
  [key: string]: string;
}

export async function fetchSheetData(): Promise<MineData[]> {
  const response = await fetch(CONFIG.SHEET_URL);
  const csvText = await response.text();
  
  const { data } = Papa.parse<RawRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const mineNames = getMineNames(data[0]);

  return data
    .filter(row => row.Date && row.Date.trim() !== '')
    .map(row => ({
      date: row.Date,
      day: row.Day,
      mines: mineNames.reduce((acc, name) => {
        acc[name] = parseFloat(row[name]) || 0;
        return acc;
      }, {} as Record<string, number>),
      total: parseFloat(row.Total) || 0,
      dayOfWeekPct: parsePercent(row['DayOfWeek%']),
      growthPct: parseFloat(row['Growth%']) || 1,
      eventPct: parseFloat(row['Event%']) || 1,
    }));
}

function getMineNames(firstRow: RawRow): string[] {
  const excludeKeys = ['Date', 'Day', 'Total', 'DayOfWeek%', 'Growth%', 'Event%'];
  return Object.keys(firstRow).filter(key => !excludeKeys.includes(key));
}

function parsePercent(value: string): number {
  if (!value) return 1;
  return parseFloat(value.replace('%', '')) / 100;
}

export function extractMineNames(data: MineData[]): string[] {
  if (data.length === 0) return [];
  return Object.keys(data[0].mines);
}
