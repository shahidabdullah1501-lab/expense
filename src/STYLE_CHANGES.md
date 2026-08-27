# Minimalist & Aesthetic UI Redesign Changelog

> **Project:** OMNI 3D Expense Tracker & Wealth Intelligence  
> **Theme:** Minimalist & Aesthetic Warm Pastel Fintech (Kinfolk, Notion, Apple Pastel & Stripe Luxury Edition)  
> **Date:** August 2026  
> **Aesthetic Color Palette:** `#FAFAEB`, `#F3E4F1`, `#D5EBDA`, `#F4DACD`, `#EAD3D4`

---

## 1. Aesthetic Palette Specification

The application has been unified around a curated 5-color aesthetic minimalist palette:

| Hex Code | Color Name | Role & Purpose in UI | Applied Components |
| :--- | :--- | :--- | :--- |
| **`#FAFAEB`** | **Warm Ivory / Cream** | Canvas background, subtle card base, light pill highlights, badge backgrounds | `body`, `App.tsx`, `index.html`, HUD active buttons, hover states |
| **`#F3E4F1`** | **Lilac / Soft Lavender** | Health index badges, education, subscriptions, subtle tech accents | Health diagnostics, subscription cards, wireframe toggle, tags |
| **`#D5EBDA`** | **Mint / Soft Sage** | Primary brand accent, income badges, positive cashflow, savings rate | Primary CTA buttons, income bars, net worth badge, 3D key light |
| **`#F4DACD`** | **Warm Apricot / Soft Peach** | Warning indicators, food/shopping category tags, Excel exports | Near-budget warning badges, category pills, export tiles |
| **`#EAD3D4`** | **Dusty Rose / Soft Blush** | Outflow indicators, expense tags, budget alerts, PDF export tile | Expense pills, over-budget tags, top merchant badges, PDF badge |

---

## 2. Design System & Token Evolution

| Design Token | Previous Style | New Aesthetic Minimalist Style |
| :--- | :--- | :--- |
| **Background Color** | Loud dark blue `#070c14` / `#090d16` | **Warm Ivory `#FAFAEB`** with clean, tranquil surface balance |
| **Cards & Surfaces** | Heavy dark glass | **Pure White `#FFFFFF`** with micro-borders (`border-stone-200/80`) and soft ambient shadows |
| **Borders** | Thick multi-color neon borders | Delicate stone micro-borders (`border-stone-200/80`) with soft hover elevation |
| **Primary Accent** | Oversaturated cyan/teal `#14b8a6` | **Aesthetic Mint-Sage `#D5EBDA`** with deep forest ink typography (`#144620` / `#1C1917`) |
| **Expense & Alert Accent** | Aggressive red `#ef4444` | **Aesthetic Soft Blush `#EAD3D4`** with deep rose ink typography (`#8B4246`) |
| **Warning Accent** | Saturated amber `#f59e0b` | **Aesthetic Soft Peach `#F4DACD`** with deep warm amber typography (`#AC522B`) |
| **Info & Diagnostic** | Electric purple | **Aesthetic Soft Lavender `#F3E4F1`** with deep purple typography (`#4A1D44`) |
| **Typography & Contrast** | Light text on dark bg | **Crisp high-contrast Dark Stone `#1C1917`** on warm ivory canvas for pristine legibility |
| **Scrollbars** | Dark thick scrollbars | Ultra-thin 5px minimalist translucent scrollbars |

---

## 3. Component-by-Component Transformations

### 3.1. Top Navigation (`src/components/Navbar.tsx`)
- **Header Canvas:** Frosted warm ivory header (`bg-[#FAFAEB]/90 backdrop-blur-xl border-b border-stone-200/80`).
- **Emblem:** Sage pill badge (`#D5EBDA`) with deep stone icon.
- **Segmented Tabs:** Refined pill switcher (`bg-stone-200/50`) with white active state (`bg-white text-stone-900 shadow-xs border border-stone-200/80`).
- **Global Search:** Clean white search bar with `⌘K` keyboard shortcut badge.
- **Action Buttons:** Primary CTA styled with aesthetic Sage (`#D5EBDA`).

### 3.2. Summary Cards (`src/components/SummaryCards.tsx`)
- **Card 1 (Net Worth):** Sage badge icon (`#D5EBDA`), live indicator, clean 24px bold typography.
- **Card 2 (Monthly Inflow):** Sage deposit badge (`#D5EBDA`), positive delta in `#3D9251`.
- **Card 3 (Monthly Outflow):** Blush expense badge (`#EAD3D4`), burn rate icon, outflow in `#8B4246`.
- **Card 4 (Health Index):** Lavender status pill (`#F3E4F1`), score ratio (`88/100`), Sage progress bar.

### 3.3. 3D WebGL Visualizer (`src/components/3d/ExpenseScene3D.tsx`)
- **Studio Lighting:** Warm ambient illumination (`0xffffff`), Sage key light (`0xD5EBDA`), Lavender fill light (`0xF3E4F1`), and warm slate grid helper (`0xCBD5E1`).
- **Floating HUD:** White frosted pills (`bg-white/95 border border-stone-200`) with cream active states (`#FAFAEB`).
- **Volume Indicator:** Sage dot indicator with bold dark stone volume figure.
- **Hover Raycast Card:** Translucent white micro-card (`bg-white/95 border border-stone-200`) with high-contrast typography.

### 3.4. Transaction Ledger (`src/components/TransactionList.tsx`)
- **Segmented Type Switcher:** Clean selector with `All`, `Expenses` (Blush `#EAD3D4`), and `Income` (Sage `#D5EBDA`).
- **Category Tags:** Dynamically color-coded with the 5 pastel tones (`#F3E4F1`, `#D5EBDA`, `#F4DACD`, `#EAD3D4`, `#FAFAEB`).
- **Amount Styling:** Inflow displayed in forest emerald (`#3D9251`) and Outflow in dusty rose (`#8B4246`).
- **Inline Actions:** Subtle hover-activated action buttons with Sage and Blush delete highlights.

### 3.5. Budget Governance (`src/components/BudgetManager.tsx`)
- **Overview Banner:** Monthly cap metrics with multi-tier progress bar (Sage for safe, Peach for warning, Blush for over-budget).
- **Status Badges:** `badge-sage` (On Track), `badge-peach` (Near Cap), and `badge-blush` (Over Cap).
- **Inline Editor:** Instant cap adjustment with Sage confirmation pill.

### 3.6. Financial Health & Analytics (`src/components/AnalyticsView.tsx`)
- **Health Audit Banner:** Lavender badge (`#F3E4F1`) and ivory score box (`#FAFAEB`).
- **Cashflow Flow:** Comparative dual bars rendered in Sage (`#D5EBDA`) for Inflow and Blush (`#EAD3D4`) for Outflow.
- **Category Breakdown:** Rendered in the complete 5-color pastel spectrum.
- **Top Payees Grid:** Clean ivory tiles (`#FAFAEB`) with Blush rank dots.

### 3.7. Multi-Vault Accounts (`src/components/WalletManager.tsx`)
- **Account Cards:** Minimalist virtual cards with pastel icon badges (Sage for checking, Lavender for savings, Blush for credit, Peach for crypto, Cream for cash).
- **Liquidity Summary:** Clean net balance counter.

### 3.8. Recurring Subscriptions (`src/components/RecurringManager.tsx`)
- **Overview:** Lavender icon banner (`#F3E4F1`) and monthly run-rate metrics.
- **Subscription Cards:** Pastel category badges, cadence tags, and next billing date indicators.

### 3.9. Dialogs & Modals (`TransactionModal.tsx` & `ExportModal.tsx`)
- **Modals:** Frosted stone backdrops (`bg-stone-900/40 backdrop-blur-sm`) and clean white dialog cards.
- **Export Tiles:** PDF (Blush `#EAD3D4`), CSV (Sage `#D5EBDA`), XLSX (Peach `#F4DACD`), PNG (Lavender `#F3E4F1`), and JSON backup tools.

### 3.10. Mobile Bottom Navigation (`src/components/BottomNav.tsx`)
- **Frosted Dock:** Warm ivory navigation dock (`bg-[#FAFAEB]/95 border-t border-stone-200/90`) with Sage active tab pills (`#D5EBDA`) and quick-add button.

---

## 4. Verification & Build Integrity

- **TypeScript Strict Mode:** Passed with 0 errors.
- **Vite Production Build:** Successfully bundled HTML, CSS, Three.js modules, and assets.
- **Mobile Responsive Layout:** 100% responsive across mobile, tablet, and desktop viewports.
