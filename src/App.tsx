import React, { Suspense, lazy, useState } from 'react';
import { Home, LogOut, Menu, Moon, Sun } from 'lucide-react';
import { HargaPasProvider, useHargaPas } from './store/HargaPasContext';
import { Sidebar, NAV_ITEMS } from './components/layout/Sidebar';
import { Toast } from './components/ui/Toast';
import { NavModuleId } from './types/hargapas';
import { LandingPage } from './modules/LandingPage';

// Lazy-load AuthPage (Login Modal Dialog) and all 10 workspace modules
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
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#FFFDF9] dark:bg-[#2B1B14] border border-[#E2D3C1] dark:border-[#4E372B] text-xs font-semibold text-[#A8703F] dark:text-[#C68B59]">
      <span className="w-4 h-4 rounded-full border-2 border-[#EFE3D3] border-t-[#C68B59] animate-spin" />
      Memuat modul...
    </div>
  </div>
);

const AppShell: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingModule, setPendingModule] = useState<NavModuleId>('dashboard');
  const [activeModule, setActiveModule] = useState<NavModuleId>('dashboard');
  const [hppEditProductId, setHppEditProductId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout, settings, updateSettings } = useHargaPas();

  const currentNav = NAV_ITEMS.find((n) => n.id === activeModule);

  const handleEnterApp = (initialModule: NavModuleId = 'dashboard') => {
    setPendingModule(initialModule);
    if (!currentUser) {
      // Open Login Modal Dialog on top of the current page instead of navigating to a new page
      setShowAuthModal(true);
      return;
    }
    setActiveModule(initialModule);
    setShowLanding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditHppFromCatalog = (productId: string) => {
    setHppEditProductId(productId);
    setActiveModule('hpp-calculator');
  };

  if (showLanding || !currentUser) {
    return (
      <>
        <LandingPage onEnterApp={handleEnterApp} />
        {showAuthModal && (
          <Suspense fallback={null}>
            <AuthPage
              onSuccess={() => {
                setShowAuthModal(false);
                setActiveModule(pendingModule);
                setShowLanding(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onClose={() => setShowAuthModal(false)}
            />
          </Suspense>
        )}
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
        return (
          <ProductCatalogBom
            onEditHpp={handleEditHppFromCatalog}
            onCreateNew={() => setActiveModule('hpp-calculator')}
          />
        );
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
    <div className="min-h-screen flex bg-[#FAF6F0] dark:bg-[#1B120D] text-[#2B1B14] dark:text-[#FAF6F0]">
      <Sidebar
        activeModule={activeModule}
        onSelect={setActiveModule}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (Mobile + Beranda + Theme + Keluar) */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-[#FAF6F0]/90 dark:bg-[#1B120D]/90 backdrop-blur-md border-b border-[#E2D3C1] dark:border-[#4E372B]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#FFFDF9] dark:bg-[#2B1B14] border border-[#E2D3C1] dark:border-[#4E372B] btn-press cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5 text-[#A8703F] dark:text-[#C68B59]" />
            </button>
            <div className="text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] truncate">
              HargaPas UMKM <span className="mx-1.5">/</span>{' '}
              <span className="text-[#2B1B14] dark:text-[#FAF6F0] font-semibold">
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#FFFDF9] dark:bg-[#2B1B14] border border-[#E2D3C1] dark:border-[#4E372B] text-xs font-semibold text-[#2B1B14] dark:text-[#FAF6F0] hover:bg-[#EFE3D3] dark:hover:bg-[#3E2A20] btn-press cursor-pointer whitespace-nowrap"
              title="Kembali ke Landing Page"
            >
              <Home className="w-3.5 h-3.5 text-[#A8703F] dark:text-[#C68B59]" />
              <span className="hidden sm:inline">Beranda</span>
            </button>
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className="p-2 rounded-2xl bg-[#FFFDF9] dark:bg-[#2B1B14] border border-[#E2D3C1] dark:border-[#4E372B] text-[#A8703F] dark:text-[#C68B59] btn-press cursor-pointer"
              aria-label="Ganti mode warna"
              title={settings.darkMode ? 'Mode Terang' : 'Mode Gelap'}
            >
              {settings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                logout();
                setShowLanding(true);
              }}
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
