# HargaPas UMKM — Smart Pricing & Financial Simulation Prototype

> **Project Status: Interactive Prototype (Local Dummy Data)**
>
> This application currently runs entirely on **local dummy/seed data** persisted in browser `localStorage`. **The backend database (Supabase) has not been connected yet.** All authentication sessions, HPP calculations, stock deductions, cash flow entries, and price updates happen locally in the browser for prototyping and UI/UX evaluation.

---

## What is HargaPas UMKM?

**HargaPas UMKM** is a web-based smart pricing, Cost of Goods Sold (**HPP / COGS**), and financial simulation prototype designed for Indonesian MSMEs (**UMKM**), especially food & beverage and café businesses. It helps business owners calculate accurate production costs per portion from batch recipes (BOM), set profitable selling prices, protect margins against raw material price spikes, and simulate multi-channel marketplace commissions.

---

## Key Features Built

### 1. Interactive 3D Landing Page (`src/modules/LandingPage.tsx`)
- **Real 3D WebGL Café Treats Showcase (`src/components/landing/CoffeeMarket3D.tsx`)**:
  - Built with **Three.js**, **`@react-three/fiber`**, **`RoomEnvironment` PBR lighting**, **`GLTFLoader`** (supports external `/cup.glb` with automatic physically-based procedural fallback), **`THREE.Raycaster`**, and **GSAP**.
  - Features a tilted refractive iced latte cup with marbled espresso & milk layers, refractive 3D ice cubes, batched `InstancedMesh` condensation water beads, floating open dome lid, spiral straw, takeaway paper coffee cup with matte black lid, pink-glazed donut with 3D capsule sprinkles & sugar pearls, red paper carton with crispy golden french fries, floating roasted coffee beans, and sugar cubes.
  - **Hover & Levitation Animation**: On pointer hover, a reversible GSAP timeline rotates the 3D cluster and lifts the cup upward, erupts a **360° sculpted liquid crown**, **8 multi-tone splash ribbons** (milk, latte, espresso-caramel), and **22 velocity-aligned 3D teardrop droplets**, then stops and gently levitates in mid-air (*ngambang*). Moving the pointer away smoothly reverses the entire timeline back to the initial resting pose.
  - **Viewport-Aware GPU Optimization**: Automatically pauses WebGL rendering (`frameloop="never"`) via `IntersectionObserver` when scrolled past the Hero section so scrolling down the page uses **0% WebGL GPU budget**.
- **Scroll-Driven Aurora River Current (`src/components/landing/RiverAurora.tsx`)**:
  - Hardware-accelerated 2D `<canvas>` renderer (replacing heavy SVG `feGaussianBlur` filters for 60–120fps scrolling).
  - Flows along a $C^1$-continuous meandering river trajectory: **Top-Left Corner → Right/Left → Middle → Far-Right Edge → Right/Left → Bottom-Left Corner** as the user scrolls down.
- **Sticky Stacked Card Deck (`src/components/landing/StackedSection.tsx`)**:
  - GPU-isolated (`contain: layout style paint`) stacked sections that land cleanly over each other like a uniform deck of cards (`01` to `05`), including a real-time **Mini Price Simulator** and an expandable **9+ Financial Modules Bento Grid** with a *"Lihat Selengkapnya / Tampilkan Lebih Sedikit"* toggle.

### 2. Overlay Login & Register Modal Dialog (`src/modules/AuthPage.tsx`)
- Opens as an accessible **Modal Dialog** directly over the Landing Page without full-page navigation (supports `Esc` key, backdrop click, and top-right `X` close button).
- Includes **Masuk Akun**, **Daftar Baru**, a **1-Click Demo Account** button (`demo@hargapas.id` / `hargapas123`), and a simulated **Google Account Picker (`Lanjutkan dengan Google`)** ready for future Supabase OAuth integration.

### 3. 10 Integrated Financial & Operational Modules
1. **Dashboard Overview** (`src/modules/DashboardOverview.tsx`)
   - Monthly revenue, net profit, average margin %, active product count, financial health badge, 14-day Revenue & Gross Profit SVG chart (`src/components/charts/SalesProfitChart.tsx`), and automated **Smart Alerts**.
2. **Kalkulator HPP & Penetapan Harga** (`src/modules/HppCalculator.tsx`)
   - **List-first catalog view** displaying saved product HPP summaries with **Tambah HPP Baru**, **Edit HPP**, and **Hapus** actions.
   - Interactive batch production calculator linked to inventory ingredient prices, labor, and overhead, with Markup vs. Margin comparison and regional market benchmarks (Jabodetabek, Bandung, Surabaya, Yogyakarta, Medan, Bali).
3. **Simulasi Laba & What-If Analysis** (`src/modules/WhatIfSimulator.tsx`)
   - Real-time sliders for ingredient price changes (%), sales volume changes (%), and promotional discounts (%), complete with a price sensitivity curve (`src/components/charts/SensitivityChart.tsx`).
4. **Analisis BEP & Target Finansial** (`src/modules/BepAnalysis.tsx`)
   - Break-Even Point calculation in portions and IDR, plus monthly revenue and net profit target trackers.
5. **Katalog Produk & Resep (BOM)** (`src/modules/ProductCatalogBom.tsx`)
   - Product list with margin health badges (`Aman`, `Waspada`, `Kritis`), inline selling price editing, shortcut to edit HPP recipe, and Bill of Materials (BOM) breakdown per portion.
6. **Inventaris Bahan Baku** (`src/modules/IngredientInventory.tsx`)
   - Stock tracking, minimum reorder points, restocking, purchase price updates (which dynamically recalculate product HPP and Smart Alerts), and price history modal.
7. **Kalkulator Marketplace & Multi-Kanal** (`src/modules/MarketplaceCalculator.tsx`)
   - Automatic online price markup calculator (`Net Price / (1 - Commission%)`) for GoFood (20%), GrabFood (20%), ShopeeFood (20%), and TikTok Shop (10%) with promo subsidy simulation.
8. **Kas & POS Sederhana** (`src/modules/PosCashier.tsx`)
   - Quick daily sales cashier that automatically deducts raw material stock according to each product's BOM recipe, plus cash-in/cash-out logging.
9. **Laporan Laba / Rugi Sederhana** (`src/modules/ProfitLossReport.tsx`)
   - Profit & Loss summary (revenue, COGS used, gross profit, operational expenses, net profit) and per-product profit contribution breakdown.
10. **Pengaturan Usaha** (`src/modules/BusinessSettings.tsx`)
    - Business profile, category, market region, margin safety threshold, light/dark mode toggle, and a **Reset Data Dummy** button.

---

## Color Theme: Caffe Klasik (Warm Café Palette)

The entire UI is styled around a warm **Caffe Klasik** palette (`src/index.css` & `src/theme/colors.ts`) with a **Dark Roast Night Café** dark mode:

| Peran | Nama | Hex |
| :--- | :--- | :--- |
| **Primary** | Caramel | `#C68B59` |
| **Primary Hover** | Toffee | `#A8703F` |
| **Teks Heading** | Espresso | `#2B1B14` |
| **Teks Isi** | Mocha | `#5A4636` |
| **Aksen Gelap** | Dark Roast | `#3E2A20` |
| **Latar Halaman** | Krem Susu | `#FAF6F0` |
| **Latar Section** | Cappuccino | `#EFE3D3` |
| **Latar Card** | Foam | `#FFFDF9` |
| **Aksen Manis** | Pink Donat | `#F4B9C8` |
| **Aksen Hangat** | Coral Kentang | `#EF7A5A` |

---

## Tech Stack & Performance Architecture

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 6 with vendor chunk splitting (`react-vendor`, `three-vendor`, `gsap-vendor`, `icons-vendor`) and `React.lazy` module code-splitting
- **3D & Animation:** Three.js (`three`), `@react-three/fiber`, and **GSAP 3** (`gsap` + `ScrollTrigger`)
- **Styling:** Tailwind CSS v4 + custom CSS variables (`src/index.css`)
- **Icons:** `lucide-react`
- **Persistence (Prototype):** Browser `localStorage` (`hargapas_umkm_v1`, `hargapas_auth_session_v1`, `hargapas_auth_users_v1`)

---

## Project Structure

```text
├── index.html
├── aurora-scroll.html          # Standalone scroll-driven Aurora River demo
├── cafe-hero-gsap.html         # Standalone 3D Café Hero + GSAP hover demo
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx                 # App shell, lazy module loader & Login Modal trigger
    ├── index.css               # Caffe Klasik design tokens & micro-interaction styles
    ├── main.tsx
    ├── components/
    │   ├── charts/
    │   │   ├── SalesProfitChart.tsx
    │   │   └── SensitivityChart.tsx
    │   ├── landing/
    │   │   ├── CoffeeMarket3D.tsx
    │   │   ├── RiverAurora.tsx
    │   │   ├── StackedSection.tsx
    │   │   └── models/
    │   │       ├── geometries.ts
    │   │       └── textures.ts
    │   ├── layout/
    │   │   └── Sidebar.tsx
    │   └── ui/
    │       ├── PointerCard.tsx
    │       ├── PressButton.tsx
    │       └── Toast.tsx
    ├── data/
    │   └── seedData.ts
    ├── modules/
    │   ├── AuthPage.tsx        # Overlay Login & Register Modal Dialog
    │   ├── BepAnalysis.tsx
    │   ├── BusinessSettings.tsx
    │   ├── DashboardOverview.tsx
    │   ├── HppCalculator.tsx
    │   ├── IngredientInventory.tsx
    │   ├── LandingPage.tsx
    │   ├── MarketplaceCalculator.tsx
    │   ├── PosCashier.tsx
    │   ├── ProductCatalogBom.tsx
    │   ├── ProfitLossReport.tsx
    │   └── WhatIfSimulator.tsx
    ├── store/
    │   └── HargaPasContext.tsx
    ├── theme/
    │   └── colors.ts
    ├── types/
    │   └── hargapas.ts
    └── utils/
        ├── finance.ts
        └── format.ts
```

---

## Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Type-check and build for production
npm run build
```

*(Note: On Windows PowerShell with restricted script execution policy, use `npm.cmd` instead of `npm`.)*

---

## Roadmap / Next Steps

- [ ] Design PostgreSQL schema in **Supabase** (users, businesses, ingredients, price history, products, BOM items, sales transactions, cash flow, business settings).
- [ ] Replace `localStorage` persistence in `src/store/HargaPasContext.tsx` and simulated auth in `src/modules/AuthPage.tsx` with Supabase Auth (Email/Password + Google OAuth) and Supabase database queries.
- [ ] Add multi-user UMKM workspace sync and exportable PDF/Excel financial reports.
