import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { MineData, Anomaly, AnomalyParams } from '../types';
import { calculateStatistics } from './stats';
import { groupAnomaliesByDate } from './anomaly';

export async function generatePDF(
  data: MineData[],
  mineNames: string[],
  anomalies: Anomaly[],
  params: AnomalyParams,
  chartRef: HTMLElement | null
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Weyland-Yutani Mining Report', pageWidth / 2, y, { align: 'center' });
  y += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Summary Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', margin, y);
  y += 8;

  const dateRange = `${data[0]?.date || 'N/A'} to ${data[data.length - 1]?.date || 'N/A'}`;
  const totalRecords = data.length;
  const totalAnomalies = anomalies.length;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Date Range: ${dateRange}`, margin, y);
  y += 5;
  pdf.text(`Total Records: ${totalRecords}`, margin, y);
  y += 5;
  pdf.text(`Anomalies Detected: ${totalAnomalies}`, margin, y);
  y += 5;
  pdf.text(`Mines Analyzed: ${mineNames.join(', ')}`, margin, y);
  y += 12;

  // Statistics Table
  y = addStatisticsTable(pdf, data, mineNames, margin, y);

  // Chart
  if (chartRef) {
    y = await addChart(pdf, chartRef, margin, y);
  }

  // Anomaly Parameters
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Anomaly Detection Parameters', margin, y);
  y += 7;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const paramLines = [
    `IQR Multiplier: ${params.iqrMultiplier}`,
    `Z-Score Threshold: ${params.zScoreThreshold}`,
    `Moving Average Window: ${params.maWindow} days`,
    `Moving Average Threshold: ${params.maThreshold}%`,
    `Grubbs Alpha: ${params.grubbsAlpha}`,
  ];
  paramLines.forEach(line => {
    pdf.text(line, margin, y);
    y += 4;
  });
  y += 8;

  // Anomaly Details
  y = addAnomalyDetails(pdf, anomalies, margin, y);

  pdf.save('wy-mining-report.pdf');
}

function addStatisticsTable(
  pdf: jsPDF,
  data: MineData[],
  mineNames: string[],
  margin: number,
  startY: number
): number {
  let y = startY;
  const pageWidth = pdf.internal.pageSize.getWidth();

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Statistical Analysis', margin, y);
  y += 8;

  // Table header
  const colWidth = (pageWidth - 2 * margin) / 6;
  const headers = ['Source', 'Mean', 'Std Dev', 'Median', 'IQR', 'Range'];
  
  pdf.setFillColor(51, 51, 51);
  pdf.rect(margin, y - 4, pageWidth - 2 * margin, 7, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  headers.forEach((h, i) => {
    pdf.text(h, margin + i * colWidth + 2, y);
  });
  pdf.setTextColor(0, 0, 0);
  y += 6;

  // Table rows
  pdf.setFont('helvetica', 'normal');
  const sources = [...mineNames, 'Total'];
  
  sources.forEach((source, rowIdx) => {
    const values = source === 'Total' 
      ? data.map(d => d.total)
      : data.map(d => d.mines[source] || 0);
    
    const stats = calculateStatistics(values);
    
    if (rowIdx % 2 === 0) {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, y - 4, pageWidth - 2 * margin, 6, 'F');
    }
    
    const row = [
      source,
      stats.mean.toFixed(1),
      stats.stdDev.toFixed(1),
      stats.median.toFixed(1),
      stats.iqr.toFixed(1),
      `${stats.min.toFixed(0)}-${stats.max.toFixed(0)}`,
    ];
    
    row.forEach((cell, i) => {
      pdf.text(cell, margin + i * colWidth + 2, y);
    });
    y += 6;
  });

  return y + 10;
}

async function addChart(
  pdf: jsPDF,
  chartRef: HTMLElement,
  margin: number,
  startY: number
): Promise<number> {
  let y = startY;

  // Check if need new page
  if (y > 180) {
    pdf.addPage();
    y = margin;
  }

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Output Visualization', margin, y);
  y += 5;

  try {
    const canvas = await html2canvas(chartRef, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', margin, y, imgWidth, Math.min(imgHeight, 80));
    y += Math.min(imgHeight, 80) + 10;
  } catch (e) {
    console.error('Chart capture failed:', e);
    y += 5;
  }

  return y;
}

function addAnomalyDetails(
  pdf: jsPDF,
  anomalies: Anomaly[],
  margin: number,
  startY: number
): number {
  let y = startY;
  const pageWidth = pdf.internal.pageSize.getWidth();

  if (y > 220) {
    pdf.addPage();
    y = margin;
  }

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Anomaly Details', margin, y);
  y += 8;

  if (anomalies.length === 0) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text('No anomalies detected with current parameters.', margin, y);
    return y + 10;
  }

  const grouped = groupAnomaliesByDate(anomalies);
  
  pdf.setFontSize(9);
  grouped.forEach((dateAnomalies, date) => {
    if (y > 270) {
      pdf.addPage();
      y = margin;
    }

    // Date header
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(230, 230, 250);
    pdf.rect(margin, y - 4, pageWidth - 2 * margin, 6, 'F');
    pdf.text(date, margin + 2, y);
    y += 6;

    // Anomalies for this date
    pdf.setFont('helvetica', 'normal');
    dateAnomalies.forEach(a => {
      const icon = a.type === 'spike' ? '↑' : '↓';
      const color = a.type === 'spike' ? [220, 53, 69] : [255, 193, 7];
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.text(icon, margin + 2, y);
      pdf.setTextColor(0, 0, 0);
      pdf.text(
        `${a.method}: Value=${a.value.toFixed(1)}, Severity=${a.severity.toFixed(2)}`,
        margin + 8,
        y
      );
      y += 5;
    });
    y += 3;
  });

  return y;
}
