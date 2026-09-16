# 🛡️ AEGIS Defense Ballistics Suite

A comprehensive ballistic missile defense analysis platform built with React + Vite.

## 🚀 Live Demo
> Deployed via Vercel — link coming soon

## 📦 Projects Included

### 1. Defense Landing Page
A premium React/TypeScript landing page featuring:
- **Multi-tier defense system** visualization (Tier I, II, III interception layers)
- **Blueprint vehicle schematic** animations with real missile diagrams
- **Interactive arsenal database** — 29+ regional ballistic missiles (China, Pakistan, Afghanistan)
- **Sand/particle dissolve** image transitions
- **Glassmorphism UI** with tactical dark theme

### 2. Ballistic Simulator (`arsenal.js`)
- Full missile database with range, payload, class, and status data
- Filterable/searchable missile cards UI
- Radar coverage visualization

### 3. Reference Documents
Research PDFs covering:
- Introduction to Ballistic Missiles
- Ballistic component classification
- Mathematical aspects & trajectory calculation
- Ballistic working principles

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |

## ⚡ Run Locally

```bash
# Clone the repo
git clone https://github.com/VS000007/defense-ballistics-suite.git
cd defense-ballistics-suite

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open http://localhost:5173

## 📁 Project Structure

```
defense-ballistics-suite/
├── src/
│   ├── App.tsx          # Main React application
│   ├── App.css          # Component styles
│   └── index.css        # Global styles
├── public/
│   ├── interceptor_hero.jpg
│   ├── launcher_blueprint.png
│   └── chapter_*.jpg    # Chapter cover images
├── arsenal.js           # Standalone missile database module
├── extracted_assets/    # Extracted PDF imagery
└── *.pdf                # Reference research documents
```

## 🔬 Features

- ✅ Animated hero section with tactical HUD overlay
- ✅ Multi-chapter defense systems breakdown
- ✅ Interactive missile arsenal browser (filterable by country/class)
- ✅ Blueprint schematic with zoom/pan views
- ✅ MILP solver visualization for site optimization
- ✅ GIS polygon siting analysis section
- ✅ Fully responsive dark tactical UI

---
*Built by VS000007 · AEGIS Defense Intelligence Platform*
