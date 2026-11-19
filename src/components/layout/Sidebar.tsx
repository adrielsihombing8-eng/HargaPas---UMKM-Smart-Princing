import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Calculator,
  SlidersHorizontal,
  Target,
  Package,
  Warehouse,
  Store,
  ShoppingCart,
  FileSpreadsheet,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { NavModuleId } from '../../types/hargapas';
import { useHargaPas } from '../../store/HargaPasContext';

export interface NavItem {
  id: NavModuleId;
  label: string;
  icon: React.FC<{ className?: string }>;
  group: 'Utama' | 'Analisis & Harga' | 'Operasional' | 'Sistem';
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Utama' },
  { id: 'hpp-calculator', label: 'Kalkulator HPP', icon: Calculator, group: 'Analisis & Harga' },
  { id: 'what-if', label: 'Simulasi What-If', icon: SlidersHorizontal, group: 'Analisis & Harga' },
  { id: 'bep', label: 'Analisis BEP', icon: Target, group: 'Analisis & Harga' },
  { id: 'marketplace', label: 'Marketplace', icon: Store, group: 'Analisis & Harga' },
  { id: 'products', label: 'Katalog & Resep', icon: Package, group: 'Operasional' },
  { id: 'inventory', label: 'Inventaris Bahan', icon: Warehouse, group: 'Operasional' },
  { id: 'pos', label: 'Kas & POS', icon: ShoppingCart, group: 'Operasional' },
  { id: 'profit-loss', label: 'Laporan Laba/Rugi', icon: FileSpreadsheet, group: 'Sistem' },
  { id: 'settings', label: 'Pengaturan Usaha', icon: Settings, group: 'Sistem' },
];

interface SidebarProps {
  activeModule: NavModuleId;
  onSelect: (id: NavModuleId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface SidebarPanelProps {
  activeModule: NavModuleId;
  onSelect: (id: NavModuleId) => void;
  onCloseMobile?: () => void;
  isMobile?: boolean;
}

const GROUPS: NavItem['group'][] = ['Utama', 'Analisis & Harga', 'Operasional', 'Sistem'];

const SidebarPanel: React.FC<SidebarPanelProps> = ({
  activeModule,
  onSelect,
  onCloseMobile,
  isMobile = false,
}) => {
  const { settings, smartAlerts } = useHargaPas();
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pillStyle, setPillStyle] = useState<{
    top: number;
    height: number;
    opacity: number;
  }>({
    top: 0,
    height: 40,
    opacity: 0,
  });

  const updatePill = useCallback(() => {
    const container = containerRef.current;
    const activeEl = itemRefs.current[activeModule];
    if (!container || !activeEl) return;

    if (activeEl.offsetHeight === 0 || container.clientWidth === 0) return;

    setPillStyle({
      top: activeEl.offsetTop,
      height: activeEl.offsetHeight,
      opacity: 1,
    });
  }, [activeModule]);

  useLayoutEffect(() => {
    updatePill();
  }, [updatePill]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      updatePill();
    });
    observer.observe(container);

    const activeEl = itemRefs.current[activeModule];
    if (activeEl) observer.observe(activeEl);

    window.addEventListener('resize', updatePill);
    document.fonts?.ready.then(updatePill).catch(() => {});

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePill);
    };
  }, [activeModule, updatePill]);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--px', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--py', `${e.clientY - rect.top}px`);
  };

  return (
    <aside className="flex flex-col h-full w-68 xl:w-72 bg-[#E6F6F3] dark:bg-[#1E293B] text-[#134E4A] dark:text-[#CBD5E1] border-r border-[#CCE5DF] dark:border-[#334155] select-none">
      {/* Brand Header */}
      <div className="px-5 xl:px-6 pt-5 pb-4 flex items-center justify-between border-b border-[#CCE5DF] dark:border-[#334155] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-2xl bg-[#5EEAD4] dark:bg-[#14B8A6] text-[#0F172A] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight leading-tight text-[#0F766E] dark:text-[#99F6E4]">
              HargaPas
            </div>
            <div className="text-[11px] text-[#0D9488] dark:text-[#5EEAD4] font-medium">
              UMKM Smart Finance
            </div>
          </div>
        </div>
        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl bg-[#CCFBF1] dark:bg-[#334155] text-[#0F766E] dark:text-[#CBD5E1] btn-press cursor-pointer"
            aria-label="Tutup menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Business Pill */}
      <div className="px-4 pt-3.5 pb-1.5 shrink-0">
        <div className="rounded-2xl bg-[#D6F1EC] dark:bg-[#0F172A] border border-[#BDE4DC] dark:border-[#334155] px-3.5 py-2.5">
          <div className="text-[11px] text-[#0D9488] dark:text-[#94A3B8]">Usaha Aktif</div>
          <div className="text-xs font-semibold truncate mt-0.5 text-[#134E4A] dark:text-[#CBD5E1]">
            {settings.businessName}
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#0F766E] dark:text-[#5EEAD4]">
            <span>{settings.category}</span>
            <span>•</span>
            <span>{settings.region}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation with Anti-Scrollbar & Spring Pill */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3">
        <div ref={containerRef} className="relative space-y-3.5">
          {/* Spring Physics Active Indicator */}
          <div
            className="nav-spring-pill absolute left-0 right-0 rounded-2xl bg-[#99F6E4] dark:bg-[#5EEAD4] shadow-sm pointer-events-none"
            style={{
              transform: `translate3d(0, ${pillStyle.top}px, 0)`,
              height: `${pillStyle.height}px`,
              opacity: pillStyle.opacity,
              top: 0,
            }}
          />

          {GROUPS.map((group) => (
            <div key={group}>
              <div className="relative z-10 px-3 mb-1 text-[11px] font-semibold tracking-wide text-[#0D9488]/75 dark:text-[#64748B]">
                {group}
              </div>
              <div className="space-y-0.5">
                {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  const showAlertBadge =
                    item.id === 'dashboard' && smartAlerts.length > 0;

                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        itemRefs.current[item.id] = el;
                      }}
                      onPointerMove={handlePointerMove}
                      onClick={() => {
                        onSelect(item.id);
                        onCloseMobile?.();
                      }}
                      className={`btn-press pointer-track z-10 w-full flex items-center justify-between px-3.5 py-2 xl:py-2.5 rounded-2xl text-sm font-medium cursor-pointer transition-colors duration-150 ${
                        isActive
                          ? 'text-[#0F172A] font-semibold'
                          : 'text-[#134E4A] dark:text-[#94A3B8] hover:bg-[#D6F1EC] dark:hover:bg-[#115E59]/70 hover:text-[#0F766E] dark:hover:text-[#CBD5E1]'
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? 'text-[#0F766E] dark:text-[#0F172A]'
                              : 'text-[#0D9488] dark:text-[#5EEAD4]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {showAlertBadge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full shrink-0 bg-[#FDE68A] text-[#92400E]">
                          {smartAlerts.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-[#CCE5DF] dark:border-[#334155] text-[11px] text-[#0D9488] dark:text-[#94A3B8] flex items-center justify-between shrink-0">
        <span>Mode Lokal (Dummy)</span>
        <span className="inline-flex items-center gap-1.5 text-[#0F766E] dark:text-[#5EEAD4] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#0D9488] dark:bg-[#5EEAD4] animate-pulse" />
          Siap Supabase
        </span>
      </div>
    </aside>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelect,
  mobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">
        <SidebarPanel activeModule={activeModule} onSelect={onSelect} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">
            <SidebarPanel
              activeModule={activeModule}
              onSelect={onSelect}
              onCloseMobile={onCloseMobile}
              isMobile
            />
          </div>
        </div>
      )}
    </>
  );
};
