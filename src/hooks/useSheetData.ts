import { useState, useEffect, useCallback } from 'react';
import type { MineData } from '../types';
import { fetchSheetData, extractMineNames } from '../utils';
import { CONFIG } from '../config';

interface UseSheetDataResult {
  data: MineData[];
  mineNames: string[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useSheetData(): UseSheetDataResult {
  const [data, setData] = useState<MineData[]>([]);
  const [mineNames, setMineNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedData = await fetchSheetData();
      setData(fetchedData);
      setMineNames(extractMineNames(fetchedData));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    
    // Auto-refresh
    const interval = setInterval(refresh, CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  return { data, mineNames, loading, error, lastUpdated, refresh };
}
