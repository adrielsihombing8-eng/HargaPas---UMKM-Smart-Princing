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
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings, updateSettings } = useHargaPas();

  const currentNav = NAV_ITEMS.find((n) => n.id === activeModule);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview onNavigate={setActiveModule} />;
      case 'hpp-calculator':
        return <HppCalculator />;
      case 'what-if':
        return <WhatIfSimulator />;
      case 'bep':
        return <BepAnalysis />;
      case 'products':
        return <ProductCatalogBom />;
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
    <div className="min-h-screen flex bg-[#f8faf9] dark:bg-[#0f172a] text-[#030213] dark:text-slate-100">
      <Sidebar
        activeModule={activeModule}
        onSelect={setActiveModule}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (Mobile + Quick Theme Toggle) */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-[#f8faf9]/85 dark:bg-[#0f172a]/85 backdrop-blur-md border-b border-[#2c5f4e]/8 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white dark:bg-slate-800 border border-[#2c5f4e]/15 dark:border-slate-700 btn-press cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs font-medium text-[#52605a] dark:text-slate-400">
              HargaPas UMKM <span className="mx-1.5">/</span>{' '}
              <span className="text-[#030213] dark:text-white font-semibold">
                {currentNav?.label}
              </span>
            </div>
          </div>

          <button
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className="p-2 rounded-2xl bg-white dark:bg-slate-800 border border-[#2c5f4e]/15 dark:border-slate-700 text-[#2c5f4e] dark:text-[#7bdc93] btn-press cursor-pointer"
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
