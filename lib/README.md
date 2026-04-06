# Offline Dependencies

This folder contains all the required dependencies to run the IATF project **without internet connection**.

## Folder Structure

```
lib/
├── chartjs/           # Chart.js library files
│   ├── chart.umd.js
│   └── chartjs-plugin-datalabels.min.js
└── fonts/             # Google Fonts (Inter)
    ├── inter.css
    ├── inter-400.ttf
    ├── inter-600.ttf
    └── inter-700.ttf
```

## Dependencies Included

### 1. Chart.js 4.4.0
- **Purpose**: JavaScript charting library for creating interactive charts
- **Files**: 
  - `chartjs/chart.umd.js` - Main Chart.js library
  - `chartjs/chartjs-plugin-datalabels.min.js` - Plugin for adding data labels to charts

### 2. Inter Font (Google Fonts)
- **Purpose**: Font family used throughout the application
- **Files**:
  - `fonts/inter.css` - Font definitions
  - `fonts/inter-400.ttf` - Regular weight (400)
  - `fonts/inter-600.ttf` - Semibold weight (600)
  - `fonts/inter-700.ttf` - Bold weight (700)

## How to Use

All HTML files have been automatically configured to load these offline dependencies. Simply copy the entire project folder to another system, and everything will work without internet.

### Files Modified
The following HTML files have been updated to reference local dependencies:
- `index.html`
- `iatf.html`
- `admin-login.html`
- `admin-dashboard.html`
- `supply-module.html`
- `production-module.html`
- `quality-module.html`
- `maintenance-module.html`
- `technical-module.html`

## Transfer to Another System

1. Copy the entire IATF project folder (including the `lib` folder) to your new system
2. No internet connection needed - all charts and fonts will load from the local `lib` folder
3. Open any HTML file in a web browser

## If You Need to Update Dependencies

To get the latest versions in the future:

1. **Chart.js updates**: Download from `https://cdn.jsdelivr.net/npm/chart.js@latest/dist/chart.umd.js`
2. **Plugin updates**: Download from `https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@latest/dist/chartjs-plugin-datalabels.min.js`
3. **Font updates**: Download from Google Fonts at `https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap`

Then update the respective files in this `lib` folder and the CSS references as needed.

## Troubleshooting

**Charts not showing?**
- Make sure all files in the `lib` folder are present
- Check browser console for errors (F12 → Console tab)
- Verify the relative paths in HTML files point to `lib/chartjs/` and `lib/fonts/`

**Fonts not loading?**
- Ensure all `.ttf` files are in `lib/fonts/`
- Check that `lib/fonts/inter.css` references the TTF files correctly
- Clear browser cache and refresh

## Version Information
- Chart.js: 4.4.0
- chartjs-plugin-datalabels: 2.2.0
- Inter Font: v20

**Last Updated**: March 24, 2026
