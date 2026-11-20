import React, { Suspense, lazy, useState } from 'react';
import { Home, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { HargaPasProvider, useHargaPas } from './store/HargaPasContext';
import { Sidebar, NAV_ITEMS } from './components/layout/Sidebar';
import { Toast } from './components/ui/Toast';
import { NavModuleId } from './types/hargapas';
import { LandingPage } from './modules/LandingPage';

// Lazy-load AuthPage and all 10 workspace modules so the Landing Page bundle stays super fast
const AuthPage = lazy(() =>
  import('./modules/AuthPage').then((m) => ({ default: m.AuthPage }))
);
const DashboardOverview = lazy(() =>
  import('./modules/DashboardOverview').then((m) => ({ default: m.DashboardOverview }))
);
const HppCalculator = lazy(() =>
  import('./modules/HppCalculator').then((m) => ({ default: m.HppCalculator }))
);
const WhatIfSimulator = lazy(() =>
  import('./modules/WhatIfSimulator').then((m) => ({ default: m.WhatIfSimulator }))
);
const BepAnalysis = lazy(() =>
  import('./modules/BepAnalysis').then((m) => ({ default: m.BepAnalysis }))
);
const ProductCatalogBom = lazy(() =>
  import('./modules/ProductCatalogBom').then((m) => ({ default: m.ProductCatalogBom }))
);
const IngredientInventory = lazy(() =>
  import('./modules/IngredientInventory').then((m) => ({ default: m.IngredientInventory }))
);
const MarketplaceCalculator = lazy(() =>
  import('./modules/MarketplaceCalculator').then((m) => ({ default: m.MarketplaceCalculator }))
);
const PosCashier = lazy(() =>
  import('./modules/PosCashier').then((m) => ({ default: m.PosCashier }))
);
const ProfitLossReport = lazy(() =>
  import('./modules/ProfitLossReport').then((m) => ({ default: m.ProfitLossReport }))
);
const BusinessSettings = lazy(() =>
  import('./modules/BusinessSettings').then((m) => ({ default: m.BusinessSettings }))
);

const ModuleLoadingFallback: React.FC = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#EFF9F7] dark:bg-[#1E293B] border border-[#CCE5DF] dark:border-[#334155] text-xs font-semibold text-[#0F766E] dark:text-[#99F6E4]">
      <span className="w-4 h-4 rounded-full border-2 border-[#99F6E4] border-t-[#0D9488] animate-spin" />
      Memuat modul...
    </div>
  </div>
);

const AppShell: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [pendingModule, setPendingModule] = useState<NavModuleId>('dashboard');
  const [activeModule, setActiveModule] = useState<NavModuleId>('dashboard');
  const [hppEditProductId, setHppEditProductId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout, settings, updateSettings } = useHargaPas();

  const currentNav = NAV_ITEMS.find((n) => n.id === activeModule);

  const handleEnterApp = (initialModule: NavModuleId = 'dashboard') => {
    setPendingModule(initialModule);
    setActiveModule(initialModule);
    setShowLanding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditHppFromCatalog = (productId: string) => {
    setHppEditProductId(productId);
    setActiveModule('hpp-calculator');
  };

  if (showLanding) {
    return (
      <>
        <LandingPage onEnterApp={handleEnterApp} />
        <Toast />
      </>
    );
  }

  // Wajib login sebelum masuk ke workspace aplikasi
  if (!currentUser) {
    return (
      <>
        <Suspense fallback={<ModuleLoadingFallback />}>
          <AuthPage
            onSuccess={() => {
              setActiveModule(pendingModule);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToLanding={() => {
              setShowLanding(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </Suspense>
        <Toast />
      </>
    );
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview onNavigate={setActiveModule} />;
      case 'hpp-calculator':
        return (
          <HppCalculator
            initialEditProductId={hppEditProductId}
            onClearInitialEdit={() => setHppEditProductId(null)}
          />
        );
      case 'what-if':
        return <WhatIfSimulator />;
      case 'bep':
        return <BepAnalysis />;
      case 'products':
        return <ProductCatalogBom onEditHpp={handleEditHppFromCatalog} />;
      case 'inventory':
        return <IngredientInventory />;
      case 'marketplace':
        return <MarketplaceCalculator />;
      case 'pos':
        return <PosCashier />;
      case 'profit-loss':
        return <ProfitLossReport />;
      case 'settings':
        return <BusinessSettings />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] dark:bg-[#0F172A] text-[#134E4A] dark:text-[#CBD5E1]">
      <Sidebar
        activeModule={activeModule}
        onSelect={setActiveModule}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (Mobile + Beranda + Theme + Keluar) */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-[#FAF9F6]/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-[#DCECE9] dark:border-[#334155]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#EFF9F7] dark:bg-[#1E293B] border border-[#CCE5DF] dark:border-[#334155] btn-press cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5 text-[#0D9488] dark:text-[#5EEAD4]" />
            </button>
            <div className="text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] truncate">
              HargaPas UMKM <span className="mx-1.5">/</span>{' '}
              <span className="text-[#134E4A] dark:text-[#CBD5E1] font-semibold">
                {currentNav?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setShowLanding(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#EFF9F7] dark:bg-[#1E293B] border border-[#CCE5DF] dark:border-[#334155] text-xs font-semibold text-[#0F766E] dark:text-[#99F6E4] hover:bg-[#CCFBF1] dark:hover:bg-[#334155] btn-press cursor-pointer whitespace-nowrap"
              title="Kembali ke Landing Page"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Beranda</span>
            </button>
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className="p-2 rounded-2xl bg-[#EFF9F7] dark:bg-[#1E293B] border border-[#CCE5DF] dark:border-[#334155] text-[#0D9488] dark:text-[#5EEAD4] btn-press cursor-pointer"
              aria-label="Ganti mode warna"
              title={settings.darkMode ? 'Mode Terang' : 'Mode Gelap'}
            >
              {settings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#FFE4E6] dark:bg-[#7F1D1D] text-xs font-semibold text-[#BE123C] dark:text-[#FDA4AF] hover:bg-[#FECDD3] dark:hover:bg-[#991B1B] btn-press cursor-pointer whitespace-nowrap"
              title="Keluar dari akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Suspense fallback={<ModuleLoadingFallback />}>
            {renderModule()}
          </Suspense>
        </main>
      </div>

      <Toast />
    </div>
  );
};

export function App() {
  return (
    <HargaPasProvider>
      <AppShell />
    </HargaPasProvider>
  );
}

export default App;
