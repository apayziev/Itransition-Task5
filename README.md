# Weyland-Yutani Mining Analytics Dashboard

**Author:** Abdulkhay Payziev

## 🔗 Links

| Resource | URL |
|----------|-----|
| **Live Dashboard** | [https://apayziev.github.io/Itransition-Task5/](https://apayziev.github.io/Itransition-Task5/) |
| **Google Spreadsheet** | [WY Resource Generator](https://docs.google.com/spreadsheets/d/e/2PACX-1vR84zoYulxjiNgg4OXS4Lypvxdf5VDnkOe6o8B5W_tJrSnlxENCPqAOAb9VLaLaK42itlyZub0scZ9_/pubhtml) |
| **GitHub Repository** | [https://github.com/apayziev/Itransition-Task5](https://github.com/apayziev/Itransition-Task5) |

## 📋 Project Overview

This project is **Task #5** for the Data Engineering group at Itransition. It consists of two parts:

### Part I: Google Spreadsheet Generator
A formula-based data generator for daily mining output simulation with:
- Customizable mine names and date ranges
- Distribution types (uniform/normal) with dynamic parameters
- Smoothing for value correlation
- Day-of-week factors for periodic patterns
- Overall trend configuration
- Event-based anomalies (spikes/drops) with bell-curve patterns
- Auto-updating chart

### Part II: Web Dashboard
A React + TypeScript dashboard that:
- Fetches data from the Google Spreadsheet
- Displays statistics (mean, std dev, median, IQR) per mine and total
- Detects anomalies using 4 methods:
  - IQR rule
  - Z-score
  - Moving average deviation
  - Grubbs' test
- Interactive charts (line, bar, stacked) with:
  - Highlighted outliers
  - Polynomial trendlines (degree 1-4)
- PDF report generation with tables, charts, and anomaly details

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Charts:** Chart.js + react-chartjs-2
- **PDF:** jsPDF + html2canvas
- **Data:** PapaParse (CSV parsing)
- **Deployment:** GitHub Pages

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/apayziev/Itransition-Task5.git
cd Itransition-Task5

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your VITE_SHEET_URL

# Start development server
npm run dev
```

## 📄 License

MIT License
