import React, { useState } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { HargaPasProvider, useHargaPas } from './store/HargaPasContext';
import { Sidebar, NAV_ITEMS } from './components/layout/Sidebar';
import { Toast } from './components/ui/Toast';
import { NavModuleId } from './types/hargapas';
import { DashboardOverview } from './modules/DashboardOverview';
import { HppCalculator } from './modules/HppCalculator';
import { WhatIfSimulator } from './modules/WhatIfSimulator';
import { BepAnalysis } from './modules/BepAnalysis';
import { ProductCatalogBom } from './modules/ProductCatalogBom';
import { IngredientInventory } from './modules/IngredientInventory';
import { MarketplaceCalculator } from './modules/MarketplaceCalculator';
import { PosCashier } from './modules/PosCashier';
import { ProfitLossReport } from './modules/ProfitLossReport';
import { BusinessSettings } from './modules/BusinessSettings';

const AppShell: React.FC = () => {
  const [activeModule, setActiveModule] = useState<NavModuleId>('dashboard');
  const [hppEditProductId, setHppEditProductId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings, updateSettings } = useHargaPas();

  const currentNav = NAV_ITEMS.find((n) => n.id === activeModule);

  const handleEditHppFromCatalog = (productId: string) => {
    setHppEditProductId(productId);
    setActiveModule('hpp-calculator');
  };

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
        {/* Top Bar (Mobile + Quick Theme Toggle) */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-[#FAF9F6]/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-[#DCECE9] dark:border-[#334155]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#EFF9F7] dark:bg-[#1E293B] border border-[#CCE5DF] dark:border-[#334155] btn-press cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5 text-[#0D9488] dark:text-[#5EEAD4]" />
            </button>
            <div className="text-xs font-medium text-[#6B7280] dark:text-[#94A3B8]">
              HargaPas UMKM <span className="mx-1.5">/</span>{' '}
              <span className="text-[#134E4A] dark:text-[#CBD5E1] font-semibold">
                {currentNav?.label}
              </span>
            </div>
          </div>

          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className="p-2 rounded-2xl bg-[#EFF9F7] dark:bg-[#1E293B] border border-[#CCE5DF] dark:border-[#334155] text-[#0D9488] dark:text-[#5EEAD4] btn-press cursor-pointer"
            aria-label="Ganti mode warna"
            title={settings.darkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {settings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {renderModule()}
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
