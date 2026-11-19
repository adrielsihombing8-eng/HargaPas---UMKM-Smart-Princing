import React, { useEffect, useRef, useState } from 'react';
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

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelect,
  mobileOpen,
  onCloseMobile,
}) => {
  const { settings, smartAlerts } = useHargaPas();
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pillStyle, setPillStyle] = useState<{ top: number; height: number; opacity: number }>({
    top: 0,
    height: 40,
    opacity: 0,
  });

  useEffect(() => {
    const activeEl = itemRefs.current[activeModule];
    if (activeEl) {
      setPillStyle({
        top: activeEl.offsetTop,
        height: activeEl.offsetHeight,
        opacity: 1,
      });
    }
  }, [activeModule, mobileOpen]);

  const groups: NavItem['group'][] = ['Utama', 'Analisis & Harga', 'Operasional', 'Sistem'];

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--px', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--py', `${e.clientY - rect.top}px`);
  };

  const sidebarContent = (
    <aside className="flex flex-col h-full w-72 bg-[#2c5f4e] text-white select-none">
      {/* Brand Header */}
      <div className="px-6 pt-6 pb-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7bdc93] text-[#030213] flex items-center justify-center shadow-md shadow-black/15">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight leading-tight">HargaPas</div>
            <div className="text-[11px] text-[#7bdc93] font-medium">UMKM Smart Finance</div>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-xl bg-[#3a6b5a] text-white/80 hover:text-white btn-press"
          aria-label="Tutup menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Business Pill */}
      <div className="px-4 pt-4 pb-2">
        <div className="rounded-2xl bg-[#3a6b5a]/80 border border-white/10 px-3.5 py-2.5">
          <div className="text-[11px] text-white/65">Usaha Aktif</div>
          <div className="text-xs font-semibold truncate mt-0.5">{settings.businessName}</div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#7bdc93]">
            <span>{settings.category}</span>
            <span>•</span>
            <span>{settings.region}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation with Anti-Scrollbar & Spring Pill */}
      <div ref={listRef} className="relative flex-1 overflow-y-auto no-scrollbar px-3 py-3">
        {/* Spring Physics Active Indicator */}
        <div
          className="nav-spring-pill absolute left-3 right-3 rounded-2xl bg-[#7bdc93] shadow-lg shadow-black/10 pointer-events-none"
          style={{
            transform: `translateY(${pillStyle.top}px)`,
            height: `${pillStyle.height}px`,
            opacity: pillStyle.opacity,
            top: 0,
          }}
        />

        <div className="relative z-10 space-y-4">
          {groups.map((group) => (
            <div key={group}>
              <div className="px-3 mb-1.5 text-[11px] font-semibold tracking-wide text-white/50">
                {group}
              </div>
              <div className="space-y-1">
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
                        onCloseMobile();
                      }}
                      className={`btn-press pointer-track w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium cursor-pointer transition-colors duration-150 ${
                        isActive
                          ? 'text-[#030213] font-semibold'
                          : 'text-white/85 hover:bg-[#3a6b5a]/75 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-[#030213]' : 'text-[#7bdc93]'
                          }`}
                        />
                        <span>{item.label}</span>
                      </span>
                      {showAlertBadge && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                            isActive
                              ? 'bg-[#2c5f4e] text-white'
                              : 'bg-amber-400 text-[#030213]'
                          }`}
                        >
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
      <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/60 flex items-center justify-between">
        <span>Mode Lokal (Dummy)</span>
        <span className="inline-flex items-center gap-1.5 text-[#7bdc93]">
          <span className="w-2 h-2 rounded-full bg-[#7bdc93] animate-pulse" />
          Siap Supabase
        </span>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">{sidebarContent}</div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
