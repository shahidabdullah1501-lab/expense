# 🌌 Omni3D Expense — Interactive 3D Financial Tracker & Wealth Analytics

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.170.0-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.15-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)

**Omni3D Expense** is a production-grade, privacy-first personal finance platform and 3D wealth visualizer. Built with **React 18**, **TypeScript**, **Three.js WebGL**, and **Tailwind CSS**, it transforms everyday financial bookkeeping into an engaging 3D spatial experience alongside enterprise-grade multi-format export capabilities (PDF, Excel XLSX, CSV, JSON).

---

## ✨ Key Features

### 1. 🪐 Interactive 3D Spatial Visualizer (Three.js WebGL)
- **4 Visualizer Modes**:
  - **Planetary Rings (`rings`)**: Orbiting category torus rings proportional in radius and thickness to expenditure weight.
  - **3D Bar Towers (`towers`)**: Spatial cylinder pillars with ambient neon bases showing proportional category heights.
  - **Wealth Vault (`vault`)**: Dynamic 3D dodecahedron core surrounded by rotating category satellite nodes.
  - **Particle Flow Stream (`flow`)**: Flowing 3D particle stream visualizing incoming and outgoing monetary velocity.
- **Raycasting & Spatial Interaction**: Hover over or click 3D objects to inspect category breakdowns or filter the entire ledger in real-time.
- **Orbit Controls & 3D Snapshot**: Drag to rotate, scroll to zoom, reset camera, or capture instant HD `.png` screenshots of your 3D wealth scene.

### 2. 💳 Multi-Wallet & Account Management
- Seamlessly manage multiple account types: **Checking**, **Savings**, **Credit Cards**, **Investments**, and **Cash**.
- Live balance reconciliation: transactions automatically update their associated wallet balance with rollback support upon deletion.
- Masked account numbers and customized color badges for each wallet.

### 3. 📑 Universal Multi-Format Exporter & Database Sync
- **Publication-Ready PDF Statements**: Generates formatted financial reports with summaries, category breakdowns, and transaction tables powered by `jspdf` and `jspdf-autotable`.
- **Excel (.xlsx) Workbooks**: Clean multi-tab spreadsheet generation powered by `xlsx` (SheetJS).
- **Standard CSV Export**: Universally compatible with Google Sheets, Apple Numbers, and Notion.
- **JSON Backup & 1-Click Restore**: Full state backup allowing seamless migration or offline database recovery.

### 4. 🎯 Budget Governance & Overspending Alerts
- Set custom spending limits per category on a monthly or yearly basis.
- Automated alert threshold detection (e.g., 80% warning badge) with animated visual progress bars.
- Real-time calculations comparing budget caps against actual expenses.

### 5. 🔄 Recurring Subscriptions & Commitments
- Track recurring bills and subscriptions (Netflix, AWS, Rent, Gym, Salaries) with flexible frequencies (Daily, Weekly, Monthly, Yearly).
- Automated next billing countdown and auto-deduction management.

### 6. 🧠 Financial Health Diagnostics & Analytics
- **Algorithmic Health Score (0–100)**: Evaluates savings rate, budget adherence, and spending discipline.
- **Status Classification**: Categorizes health from *Elite* to *Critical* with actionable financial recommendations.
- **Deep Metrics**: Daily burn rate calculations, top merchant expense rankings, and monthly cash flow history.

### 7. 📱 Mobile-First Responsive Design
- Clean modern dark aesthetic designed with custom cyan/teal brand tokens and glassmorphism.
- Fixed bottom tab navigation for mobile devices (< 1024px) and top navbar for desktop.
- Touch-friendly 44px targets and iOS-optimized input scaling.
- 100% client-side privacy: all data is stored locally in your browser (`localStorage`).

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 18.3](https://react.dev/) | Component architecture, custom hooks, and state management |
| **Language** | [TypeScript 5.6](https://www.typescriptlang.org/) | Strict type safety for financial data structures |
| **Build Tool** | [Vite 5.4](https://vitejs.dev/) | Lightning-fast development server and optimized build bundling |
| **3D Engine** | [Three.js 0.170](https://threejs.org/) | WebGL 3D rendering, custom lighting, materials, and raycasting |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Modern responsive design, custom utilities, and animations |
| **Icons** | [Lucide React](https://lucide.dev/) | Crisp, consistent SVG icons |
| **PDF Generation**| [jsPDF](https://github.com/parallax/jsPDF) & [AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Client-side formatted PDF report generation |
| **Spreadsheets** | [SheetJS (xlsx)](https://sheetjs.com/) | Client-side Excel workbook and table compilation |
| **Effects** | [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) | Micro-interactions and transaction confirmation feedback |

---

## 📂 Project Structure

```text
expense-tracker/
├── index.html                  # HTML entry point, Google Fonts (Inter, Outfit), SEO metadata
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript strict configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Custom theme, brand palette, and animations
├── postcss.config.js           # PostCSS Tailwind plugins
├── src/
│   ├── main.tsx                # Application bootstrap
│   ├── App.tsx                 # Core application controller & state coordinator
│   ├── index.css               # Tailwind directives and custom scrollbar styling
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces (Transaction, Wallet, Budget, etc.)
│   ├── data/
│   │   └── initialData.ts      # Curated default seed dataset and category mappings
│   ├── utils/
│   │   ├── formatters.ts       # Currency formatting, financial health calculator, aggregators
│   │   └── exportUtils.ts      # PDF, Excel, CSV, JSON export/import and canvas snapshot engine
│   └── components/
│       ├── Navbar.tsx          # Top navigation, global search, wallet picker, quick actions
│       ├── BottomNav.tsx       # Fixed mobile bottom tab navigation
│       ├── SummaryCards.tsx    # High-level net worth, income, expense, and budget summary cards
│       ├── TransactionList.tsx # Filterable, searchable, and sortable transaction ledger
│       ├── TransactionModal.tsx# Add/edit transaction modal form
│       ├── BudgetManager.tsx   # Budget progress tracker and budget creation modal
│       ├── AnalyticsView.tsx   # Financial health score, top merchants, cashflow graphs
│       ├── RecurringManager.tsx# Recurring subscriptions and billing manager
│       ├── WalletManager.tsx   # Multi-account balances and new wallet creation
│       ├── ExportModal.tsx     # Universal export, import, and backup dialog
│       └── 3d/
│           └── ExpenseScene3D.tsx # Full WebGL 3D interactive expense visualization scene
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- `npm` or `yarn` / `pnpm`

### Installation

1. **Clone the repository or navigate to the project directory**:
   ```bash
   cd "expense tracker"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL provided in the terminal (typically `http://localhost:5173`).

---

## 💻 Available Scripts

- `npm run dev`: Starts the Vite development server with Hot Module Replacement (HMR).
- `npm run build`: Type-checks with `tsc` and compiles an optimized production bundle into `dist/`.
- `npm run preview`: Previews the production build locally.

---

## 🎮 How to Use the 3D Visualizer

1. **Change View Modes**: Use the mode selector buttons at the top of the 3D viewport to toggle between **Rings**, **Towers**, **Vault**, or **Particle Flow**.
2. **Rotate and Orbit**: Left-click and drag inside the canvas to rotate the camera in 3D space.
3. **Zoom**: Scroll up or down with your mouse wheel or pinch on mobile touchscreens.
4. **Interactive Raycast Filtering**: Hover over any 3D node to preview category metrics. Click on any category node in 3D to instantly filter your entire transaction ledger below.
5. **Take Snapshots**: Click the **📸 Snapshot** button to download a high-resolution PNG image of your current 3D financial setup.

---

## 🔒 Privacy & Data Storage

- **100% Client-Side**: All transactions, budgets, wallets, and recurring items are processed and stored exclusively inside your browser's `localStorage`.
- **Zero Server Tracking**: No external database or cloud API is queried.
- **Portability**: You can export your entire state as a `.json` backup file anytime and import it onto another browser or computer with zero data loss.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
