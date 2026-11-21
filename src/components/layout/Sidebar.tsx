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
  LogOut,
  Settings,
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
  const { currentUser, logout, settings, smartAlerts } = useHargaPas();
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
    <aside className="flex flex-col h-full w-68 xl:w-72 bg-[#EFE3D3] dark:bg-[#2B1B14] text-[#2B1B14] dark:text-[#FAF6F0] border-r border-[#E2D3C1] dark:border-[#4E372B] select-none">
      {/* Brand Header */}
      <div className="px-5 xl:px-6 pt-5 pb-4 flex items-center justify-between border-b border-[#E2D3C1] dark:border-[#4E372B] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-2xl bg-[#FAF6F0] dark:bg-[#EFE3D3] border border-[#C68B59]/45 flex items-center justify-center shadow-sm overflow-hidden p-1 shrink-0">
            <img
              src="/logo-kopi.jpg"
              alt="Logo HargaPas"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight leading-tight text-[#2B1B14] dark:text-[#FAF6F0]">
              HargaPas
            </div>
            <div className="text-[11px] text-[#A8703F] dark:text-[#C68B59] font-medium">
              UMKM Smart Finance
            </div>
          </div>
        </div>
        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl bg-[#FFFDF9] dark:bg-[#3E2A20] text-[#A8703F] dark:text-[#FAF6F0] btn-press cursor-pointer"
            aria-label="Tutup menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Business & User Pill */}
      <div className="px-4 pt-3.5 pb-1.5 shrink-0">
        <div className="rounded-2xl bg-[#FFFDF9] dark:bg-[#3E2A20] border border-[#E2D3C1] dark:border-[#4E372B] px-3.5 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-[#5A4636] dark:text-[#D5C3B3]">
              {currentUser ? currentUser.name : 'Usaha Aktif'}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EFE3D3] dark:bg-[#2B1B14] text-[#A8703F] dark:text-[#C68B59]">
              {currentUser?.role ?? 'Owner'}
            </span>
          </div>
          <div className="text-xs font-semibold truncate mt-0.5 text-[#2B1B14] dark:text-[#FAF6F0]">
            {settings.businessName}
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#A8703F] dark:text-[#C68B59]">
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
            className="nav-spring-pill absolute left-0 right-0 rounded-2xl bg-[#C68B59] dark:bg-[#C68B59] shadow-sm pointer-events-none"
            style={{
              transform: `translate3d(0, ${pillStyle.top}px, 0)`,
              height: `${pillStyle.height}px`,
              opacity: pillStyle.opacity,
              top: 0,
            }}
          />

          {GROUPS.map((group) => (
            <div key={group}>
              <div className="relative z-10 px-3 mb-1 text-[11px] font-semibold tracking-wide text-[#C68B59]/75 dark:text-[#A38D7B]">
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
                          ? 'text-[#FFFDF9] font-semibold'
                          : 'text-[#2B1B14] dark:text-[#D5C3B3] hover:bg-[#FFFDF9]/75 dark:hover:bg-[#3E2A20]/70 hover:text-[#A8703F] dark:hover:text-[#FAF6F0]'
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? 'text-[#FFFDF9]'
                              : 'text-[#A8703F] dark:text-[#C68B59]'
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
      <div className="px-4 py-3 border-t border-[#E2D3C1] dark:border-[#4E372B] flex items-center justify-between gap-2 shrink-0">
        <div className="text-[11px] text-[#C68B59] dark:text-[#D5C3B3] truncate">
          <span className="inline-flex items-center gap-1.5 text-[#A8703F] dark:text-[#C68B59] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#C68B59] dark:bg-[#C68B59] animate-pulse" />
            Mode Lokal
          </span>
        </div>
        <button
          onClick={() => {
            logout();
            onCloseMobile?.();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFE4E6] dark:bg-[#7F1D1D] text-[#BE123C] dark:text-[#FDA4AF] text-xs font-semibold hover:bg-[#FECDD3] dark:hover:bg-[#991B1B] btn-press cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar
        </button>
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
