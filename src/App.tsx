import { useState, useRef, useMemo } from 'react';
import { useSheetData } from './hooks';
import { StatsTable, Controls, OutputChart, AnomalyTable } from './components';
import { detectAnomalies, DEFAULT_PARAMS, generatePDF } from './utils';
import type { AnomalyParams, ChartType, TrendDegree } from './types';
import './App.css';

function App() {
  const { data, mineNames, loading, error, lastUpdated, refresh } = useSheetData();
  const chartRef = useRef<HTMLDivElement>(null);

  const [params, setParams] = useState<AnomalyParams>(DEFAULT_PARAMS);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [trendDegree, setTrendDegree] = useState<TrendDegree>(1);
  const [selectedMine, setSelectedMine] = useState('Total');

  const anomalies = useMemo(() => {
    if (data.length === 0) return [];
    
    const values = selectedMine === 'Total'
      ? data.map(d => d.total)
      : data.map(d => d.mines[selectedMine] || 0);
    
    const dates = data.map(d => d.date);
    return detectAnomalies(values, dates, params);
  }, [data, selectedMine, params]);

  const handleGeneratePDF = async () => {
    await generatePDF(data, mineNames, anomalies, params, chartRef.current);
  };

  if (error) {
    return (
      <div className="app error-state">
        <h1>⚠️ Error Loading Data</h1>
        <p>{error}</p>
        <button onClick={refresh}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Weyland-Yutani Mining Analytics</h1>
        <div className="header-links">
          <a href="https://github.com/apayziev/Itransition-Task5" target="_blank" rel="noopener noreferrer" className="header-link">
            GitHub
          </a>
          {lastUpdated && (
            <span className="last-updated">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </header>

      <main>
        <aside className="sidebar">
          <Controls
            params={params}
            onParamsChange={setParams}
            chartType={chartType}
            onChartTypeChange={setChartType}
            trendDegree={trendDegree}
            onTrendDegreeChange={setTrendDegree}
            selectedMine={selectedMine}
            mineNames={mineNames}
            onMineChange={setSelectedMine}
            onRefresh={refresh}
            onGeneratePDF={handleGeneratePDF}
            loading={loading}
          />
        </aside>

        <section className="content">
          {loading && data.length === 0 ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading data from Google Sheets...</p>
            </div>
          ) : (
            <>
              <OutputChart
                ref={chartRef}
                data={data}
                mineNames={mineNames}
                selectedMine={selectedMine}
                chartType={chartType}
                trendDegree={trendDegree}
                anomalies={anomalies}
              />

              <div className="tables-grid">
                <StatsTable data={data} mineNames={mineNames} />
                <AnomalyTable anomalies={anomalies} />
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
