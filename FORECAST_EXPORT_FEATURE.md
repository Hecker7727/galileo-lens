# 📊 Forecast Export Feature

## Overview
The Forecast View now includes comprehensive export functionality with multiple file formats to support various use cases.

## ✨ Features Implemented

### 1. **Enhanced UI with Animations**
- Smooth page transitions with Framer Motion
- Staggered form field animations
- Animated rocket icon on configuration panel
- Pulsing alert icon on risk assessment
- Hover effects on risk cards
- Gradient chart visualization with custom styling

### 2. **Multiple Export Formats**

#### 📄 JSON Export (`handleExportResults`)
**Format:** `.json`  
**Best for:** Data integration, APIs, programmatic processing

**Includes:**
```json
{
  "metadata": {
    "exportDate": "ISO timestamp",
    "modelUsed": "Model name",
    "forecastTimestamp": "Forecast timestamp"
  },
  "missionConfiguration": {
    "durationDays": 180,
    "gravityLevel": 0.38,
    "subject": { "age", "bmi", "activityLevel" },
    "contextNotes": []
  },
  "forecastExplanation": "AI-generated explanation",
  "risks": [
    {
      "id": "risk-id",
      "name": "Risk name",
      "probability": 0.15,
      "probabilityPercentage": "15.00%",
      "notes": "Additional notes"
    }
  ],
  "predictions": [
    {
      "timestamp": "ISO timestamp",
      "date": "Formatted date",
      "value": 0.234,
      "confidenceLower": 0.187,
      "confidenceUpper": 0.281
    }
  ]
}
```

#### 📊 CSV Export (`handleExportCSV`)
**Format:** `.csv`  
**Best for:** Excel, data analysis, spreadsheets, charts

**Structure:**
- **Section 1:** Prediction data with confidence intervals
- **Section 2:** Risk assessment with probabilities

```csv
Date,Value,Confidence Lower,Confidence Upper
"10/5/2025, 2:30:00 PM",0.234,0.187,0.281
...

Risk Assessment
Risk Name,Probability,Probability %,Notes
"Bone Density Loss",0.15,15.00%,"Monitor calcium levels"
```

#### 📝 Text Report Export (`handleExportText`)
**Format:** `.txt`  
**Best for:** Documentation, reports, presentations, readability

**Structure:**
```
============================================================
NASA GALILEO LENSES - FORECAST REPORT
============================================================

Generated: 10/5/2025, 2:30:00 PM
Model: gemini-pro-vision

MISSION CONFIGURATION
------------------------------------------------------------
Duration: 180 days
Gravity Level: 0.38g
Subject Age: 35
Subject BMI: 24
Activity Level: moderate

FORECAST EXPLANATION
------------------------------------------------------------
[AI-generated explanation text]

HEALTH RISK ASSESSMENT
------------------------------------------------------------

Bone Density Loss:
  Probability: 15.00%
  Notes: Monitor calcium levels
...

PREDICTION DATA
------------------------------------------------------------
10/5/2025: 0.2340 (CI: 0.1870 - 0.2810)
...
```

## 🎨 UI Improvements

### Configuration Panel
- **Animated Rocket Icon:** Rotates gently every few seconds
- **Staggered Field Animation:** Each input field fades in with a slight delay
- **Icon Labels:** Activity, Zap, and other icons add visual context
- **Gradient Background:** Subtle blue-purple-pink gradient on header
- **Emoji Gravity Selector:** 🌌 🌙 🔴 🌍 for visual clarity

### Risk Assessment Card
- **Pulsing Alert Icon:** Draws attention to risks
- **Gradient Badge:** Animated pulse on high-risk items
- **Hover Effects:** Cards scale slightly on hover
- **Enhanced Progress Bar:** Thicker, more visible
- **Staggered Card Animation:** Each risk card appears with a delay

### Chart Visualization
- **Custom Gradient Fill:** Purple gradient for area chart
- **Enhanced Line Styling:** Thicker line with white-stroke dots
- **Better Tooltip:** Larger padding, primary border, rounded corners
- **Trend Icon:** TrendingUp icon in header

### Export Buttons
- **Multiple Format Options:** JSON, CSV, and TXT buttons
- **Gradient Backgrounds:** 
  - JSON: Green to Emerald
  - CSV: Blue to Cyan
  - TXT: Purple to Pink
- **Animated Appearance:** Scale animation when results appear
- **Icon Identification:** FileJson, FileSpreadsheet, FileText icons

## 📋 Usage

### Running a Simulation
1. Configure mission parameters (duration, gravity, subject data)
2. Add optional context notes
3. Click **"Run Simulation"** button
4. Watch animated loading state
5. View results with animations

### Exporting Results
1. After simulation completes, export buttons appear
2. Choose your preferred format:
   - **JSON** for data integration
   - **CSV** for spreadsheet analysis
   - **TXT** for human-readable reports
3. File downloads automatically with timestamp: `nasa-forecast-{timestamp}.{ext}`

## 🔧 Technical Implementation

### Dependencies
- **Framer Motion:** Page transitions, animations
- **Recharts:** Chart visualization
- **Lucide React:** Icon library
- **Radix UI:** Card, Button, Input components

### Key Functions
```typescript
handleExportResults()  // JSON export with comprehensive data
handleExportCSV()      // CSV export with predictions and risks
handleExportText()     // Formatted text report
```

### File Naming Convention
```
nasa-forecast-{timestamp}.{json|csv|txt}
```
Example: `nasa-forecast-1696521600000.json`

## 🎯 Benefits

1. **Multiple Format Support:** Choose the right format for your workflow
2. **Comprehensive Data:** All configuration, predictions, and risks included
3. **Professional Reports:** Well-formatted text reports for presentations
4. **Data Analysis Ready:** CSV format perfect for Excel and data tools
5. **API Integration:** JSON format for programmatic processing
6. **Timestamp Tracking:** Each export includes generation and export timestamps
7. **Beautiful UI:** Engaging animations and visual feedback

## 🚀 Future Enhancements

- [ ] PDF export with charts
- [ ] Email report functionality
- [ ] Batch export for multiple simulations
- [ ] Export templates
- [ ] Share via link functionality
- [ ] Cloud storage integration

## 📝 Notes

- All exports happen client-side (no server required)
- Files are created using Blob API
- Automatic cleanup of object URLs
- Safe handling of missing/undefined data
- Responsive design for all screen sizes

---

**Made with 💜 for NASA Space Apps Challenge 2025**
