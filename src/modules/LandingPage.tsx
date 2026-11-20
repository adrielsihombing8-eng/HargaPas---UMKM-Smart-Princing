import React, { Suspense, lazy, useMemo, useState } from 'react';
import {
  ArrowRight,
  BellRing,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Layers,
  LogIn,
  Moon,
  Package,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Sun,
  Target,
  Warehouse,
} from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import {
  calculateMarginPercent,
  calculateOnlinePrice,
  calculateProductHpp,
  calculateSellingPriceFromMargin,
} from '../utils/finance';
import { formatIDR, formatPercent } from '../utils/format';
import { PointerCard } from '../components/ui/PointerCard';
import { PressButton } from '../components/ui/PressButton';
import { RiverAurora } from '../components/landing/RiverAurora';
import { StackedSection } from '../components/landing/StackedSection';
import { NavModuleId } from '../types/hargapas';

const CoffeeMarket3D = lazy(() =>
  import('../components/landing/CoffeeMarket3D').then((m) => ({
    default: m.CoffeeMarket3D,
  }))
);

interface LandingPageProps {
  onEnterApp: (initialModule?: NavModuleId) => void;
}

const FEATURE_CARDS: Array<{
  id: NavModuleId;
  title: string;
  desc: string;
  tag: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    id: 'hpp-calculator',
    title: 'Kalkulator HPP & Harga Jual',
    desc: 'Hitung modal per porsi dari batch produksi, tenaga kerja, overhead, hingga benchmark harga pasar wilayah.',
    tag: 'Inti Sistem',
    icon: Calculator,
  },
  {
    id: 'what-if',
    title: 'Simulasi What-If & Sensitivitas',
    desc: 'Uji skenario kenaikan harga bahan baku, promo diskon, dan perubahan volume penjualan secara real-time.',
    tag: 'Analisis',
    icon: SlidersHorizontal,
  },
  {
    id: 'marketplace',
    title: 'Kalkulator Marketplace',
    desc: 'Markup harga otomatis agar margin bersih tetap utuh setelah potongan GoFood, GrabFood, ShopeeFood, & TikTok Shop.',
    tag: 'Multi-Kanal',
    icon: Store,
  },
  {
    id: 'products',
    title: 'Katalog Produk & Resep BOM',
    desc: 'Pantau status margin aman/waspada/kritis beserta takaran bahan baku per porsi setiap menu.',
    tag: 'Resep',
    icon: Package,
  },
  {
    id: 'inventory',
    title: 'Inventaris & Peringatan Stok',
    desc: 'Lacak stok menipis, reorder point, dan riwayat kenaikan harga beli bahan yang langsung memperbarui HPP.',
    tag: 'Stok',
    icon: Warehouse,
  },
  {
    id: 'pos',
    title: 'Kas & POS Potong Stok Otomatis',
    desc: 'Catat penjualan cepat harian dan kurangi stok bahan baku secara otomatis sesuai resep BOM.',
    tag: 'Kasir',
    icon: ShoppingCart,
  },
  {
    id: 'bep',
    title: 'Analisis BEP & Target Bulanan',
    desc: 'Ketahui berapa porsi dan omzet minimal untuk balik modal serta pantau progress target laba bulanan.',
    tag: 'Target',
    icon: Target,
  },
  {
    id: 'profit-loss',
    title: 'Laporan Laba / Rugi Sederhana',
    desc: 'Rekap omzet, HPP terpakai, laba kotor, beban operasional, hingga kontribusi laba tiap produk.',
    tag: 'Laporan',
    icon: FileSpreadsheet,
  },
  {
    id: 'dashboard',
    title: 'Dashboard & Peringatan Cerdas',
    desc: 'Grafik performa 14 hari terakhir dan notifikasi otomatis saat margin produk mulai tergerus.',
    tag: 'Ringkasan',
    icon: BellRing,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { currentUser, products, ingredients, settings, updateSettings } = useHargaPas();

  const [demoProdIdx, setDemoProdIdx] = useState(0);
  const [demoMargin, setDemoMargin] = useState(35);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const visibleFeatures = showAllFeatures ? FEATURE_CARDS : FEATURE_CARDS.slice(0, 6);

  const demoProduct = products[demoProdIdx] ?? products[0];

  const demoCalc = useMemo(() => {
    const baseHpp = demoProduct
      ? calculateProductHpp(demoProduct, ingredients)
      : 8950;
    const rawPrice = calculateSellingPriceFromMargin(baseHpp, demoMargin);
    const sellingPrice = Math.ceil(rawPrice / 500) * 500;
    const actualMargin = calculateMarginPercent(sellingPrice, baseHpp);
    const profitPerUnit = sellingPrice - baseHpp;
    const gofoodPrice = Math.ceil(calculateOnlinePrice(sellingPrice, 20) / 500) * 500;

    return {
      baseHpp,
      sellingPrice,
      actualMargin,
      profitPerUnit,
      gofoodPrice,
    };
  }, [demoProduct, ingredients, demoMargin]);

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] dark:bg-[#0F172A] text-[#134E4A] dark:text-[#CBD5E1]">
      {/* Organic River-Flowing Aurora Following Scroll */}
      <RiverAurora darkMode={settings.darkMode} />

      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#FAF9F6]/85 dark:bg-[#0F172A]/85 backdrop-blur-md border-b border-[#CCE5DF] dark:border-[#334155]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#5EEAD4] dark:bg-[#14B8A6] text-[#0F172A] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-[#0F766E] dark:text-[#99F6E4]">
                HargaPas UMKM
              </div>
              <div className="text-[11px] text-[#0D9488] dark:text-[#5EEAD4] font-medium">
                Smart Pricing & Simulasi Usaha
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#4B5563] dark:text-[#94A3B8]">
            <a href="#simulasi" className="hover:text-[#0D9488] dark:hover:text-[#5EEAD4] transition-colors">
              Simulasi Mini
            </a>
            <a href="#masalah" className="hover:text-[#0D9488] dark:hover:text-[#5EEAD4] transition-colors">
              Mengapa HargaPas
            </a>
            <a href="#fitur" className="hover:text-[#0D9488] dark:hover:text-[#5EEAD4] transition-colors">
              9+ Modul Utama
            </a>
            <a href="#alur" className="hover:text-[#0D9488] dark:hover:text-[#5EEAD4] transition-colors">
              Cara Kerja
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className="p-2 rounded-2xl bg-[#EFF9F7] dark:bg-[#1E293B] border border-[#CCE5DF] dark:border-[#334155] text-[#0D9488] dark:text-[#5EEAD4] btn-press cursor-pointer"
              aria-label="Ganti mode warna"
              title={settings.darkMode ? 'Mode Terang' : 'Mode Gelap'}
            >
              {settings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {currentUser ? (
              <PressButton variant="primary" size="md" onClick={() => onEnterApp('dashboard')}>
                Buka Workspace ({currentUser.name.split(' ')[0]})
                <ArrowRight className="w-4 h-4" />
              </PressButton>
            ) : (
              <PressButton variant="primary" size="md" onClick={() => onEnterApp('dashboard')}>
                <LogIn className="w-4 h-4" />
                Masuk / Daftar
              </PressButton>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section Band — Soft Mint (#CFEFE6) background ONLY for this section */}
      <section className="relative bg-[#CFEFE6] dark:bg-[#132A2E] border-b border-[#B7E4D8]/80 dark:border-[#1E293B]">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-14 lg:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF9F7]/90 dark:bg-[#115E59]/90 border border-[#99F6E4] dark:border-[#14B8A6]/40 text-xs font-semibold text-[#0F766E] dark:text-[#99F6E4]">
              <Layers className="w-3.5 h-3.5" />
              Prototipe Interaktif • Data Dummy Lokal
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12] text-[#0F172A] dark:text-[#CBD5E1]">
              Hitung HPP, jaga margin, dan tentukan harga jual UMKM tanpa tebak-tebakan.
            </h1>

            <p className="text-sm sm:text-base text-[#1E3A3A] dark:text-[#94A3B8] leading-relaxed max-w-xl">
              HargaPas UMKM menggabungkan kalkulator modal produksi (BOM), simulasi skenario
              laba, perhitungan harga marketplace, hingga kasir POS yang otomatis memotong stok
              bahan baku dalam satu dashboard yang ramah pemula.
            </p>

            <div className="flex items-center gap-3 flex-wrap pt-1">
              <PressButton variant="primary" size="lg" onClick={() => onEnterApp('dashboard')}>
                Buka Dashboard Aplikasi
                <ArrowRight className="w-4 h-4" />
              </PressButton>
              <PressButton variant="secondary" size="lg" onClick={() => onEnterApp('hpp-calculator')}>
                <Calculator className="w-4 h-4" />
                Coba Kalkulator HPP
              </PressButton>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#99E2D0] dark:border-[#334155]">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#0F766E] dark:text-[#5EEAD4] tabular-nums">
                  10 Modul
                </div>
                <div className="text-xs text-[#2C5552] dark:text-[#94A3B8]">
                  Alur bisnis terintegrasi
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#0F766E] dark:text-[#5EEAD4] tabular-nums">
                  Auto-BOM
                </div>
                <div className="text-xs text-[#2C5552] dark:text-[#94A3B8]">
                  Stok & HPP saling terhubung
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#0F766E] dark:text-[#5EEAD4] tabular-nums">
                  4 Kanal
                </div>
                <div className="text-xs text-[#2C5552] dark:text-[#94A3B8]">
                  Simulasi komisi online
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 3D UMKM Culinary & Beverage Objects (Lazy-Loaded & GPU-Paused Offscreen) */}
          <div className="lg:col-span-6">
            <Suspense
              fallback={
                <div className="w-full h-[500px] sm:h-[580px] flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-[#99F6E4] border-t-[#0D9488] animate-spin" />
                </div>
              }
            >
              <CoffeeMarket3D />
            </Suspense>
          </div>
        </div>
      </section>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-12 sm:pt-16 pb-28">
        {/* Stacked Card Deck Sections (each lands cleanly over the previous one) */}
        <div className="space-y-12 lg:space-y-20">
          {/* Card 01: Interactive Mini Price Simulator */}
          <StackedSection id="simulasi" index={0} label="SIMULASI MINI LANGSUNG">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Uji Penetapan Harga Jual Secara Real-Time
                </h2>
                <p className="text-sm text-[#4B5563] dark:text-[#94A3B8] leading-relaxed">
                  Pilih contoh menu UMKM, geser target margin laba, dan lihat langsung rekomendasi
                  harga offline, laba bersih per porsi, serta harga jual GoFood (+20%) tanpa
                  menggerus keuntungan.
                </p>
                <div className="pt-2">
                  <PressButton variant="accent" onClick={() => onEnterApp('hpp-calculator')}>
                    Buka Kalkulator HPP Lengkap
                    <ArrowRight className="w-4 h-4" />
                  </PressButton>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#E3F3F0] dark:bg-[#0F172A] border border-[#CCE5DF] dark:border-[#334155]">
                  {products.slice(0, 2).map((prod, idx) => {
                    const active = demoProdIdx === idx;
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => setDemoProdIdx(idx)}
                        className={`btn-press py-2.5 px-3 rounded-xl text-xs font-semibold truncate cursor-pointer ${
                          active
                            ? 'bg-[#99F6E4] dark:bg-[#14B8A6] text-[#0F172A] shadow-xs'
                            : 'text-[#4B5563] dark:text-[#94A3B8] hover:text-[#134E4A]'
                        }`}
                      >
                        {prod.name}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl bg-[#E3F3F0] dark:bg-[#0F172A] border border-[#CCE5DF] dark:border-[#334155] p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span>Target Margin Laba (%)</span>
                    <span className="font-bold text-[#0F766E] dark:text-[#5EEAD4] tabular-nums text-sm">
                      {demoMargin}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={65}
                    value={demoMargin}
                    onChange={(e) => setDemoMargin(Number(e.target.value))}
                    className="w-full mint-slider"
                  />
                  <div className="flex justify-between text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                    <span>HPP Modal / porsi: {formatIDR(demoCalc.baseHpp)}</span>
                    <span>Margin Aktual: {formatPercent(demoCalc.actualMargin)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-[#CCFBF1] dark:bg-[#115E59] border border-[#99F6E4] dark:border-[#14B8A6]/30 p-3.5">
                    <div className="text-[11px] text-[#0F766E] dark:text-[#99F6E4] font-medium">
                      Harga Jual Offline
                    </div>
                    <div className="text-lg font-extrabold text-[#0F172A] dark:text-[#5EEAD4] tabular-nums mt-1">
                      {formatIDR(demoCalc.sellingPrice)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#E3F3F0] dark:bg-[#0F172A] border border-[#CCE5DF] dark:border-[#334155] p-3.5">
                    <div className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] font-medium">
                      Laba / Porsi
                    </div>
                    <div className="text-lg font-extrabold text-[#15803D] dark:text-[#4ADE80] tabular-nums mt-1">
                      +{formatIDR(demoCalc.profitPerUnit)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#FEF3C7]/85 dark:bg-[#78350F]/45 border border-[#FDE68A] dark:border-[#FDE68A]/30 p-3.5">
                    <div className="text-[11px] text-[#92400E] dark:text-[#FDE68A] font-medium">
                      Harga GoFood (+20%)
                    </div>
                    <div className="text-lg font-extrabold text-[#92400E] dark:text-[#FDE68A] tabular-nums mt-1">
                      {formatIDR(demoCalc.gofoodPrice)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </StackedSection>

          {/* Card 02: Pain Points */}
          <StackedSection id="masalah" index={1} label="MENGAPA HARGAPAS">
            <div className="space-y-6">
              <div className="max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Masalah Klasik UMKM yang Diselesaikan HargaPas
                </h2>
                <p className="text-sm text-[#6B7280] dark:text-[#94A3B8] mt-1">
                  Banyak usaha ramai pembeli, tetapi kas menipis karena harga jual belum memperhitungkan komponen biaya tersembunyi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl bg-[#E3F3F0] dark:bg-[#0F172A] border border-[#CCE5DF] dark:border-[#334155] p-6 space-y-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] dark:bg-[#78350F] text-[#B45309] dark:text-[#FDE68A] flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <h3 className="font-bold text-base">Harga Bahan Naik Diam-Diam</h3>
                  <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] leading-relaxed">
                    Saat harga kopi bubuk atau susu naik, HPP ikut naik. HargaPas otomatis mendeteksi penurunan margin dan memicu Peringatan Cerdas.
                  </p>
                </div>

                <div className="rounded-3xl bg-[#E3F3F0] dark:bg-[#0F172A] border border-[#CCE5DF] dark:border-[#334155] p-6 space-y-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#CCFBF1] dark:bg-[#115E59] text-[#0F766E] dark:text-[#99F6E4] flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <h3 className="font-bold text-base">Komisi Aplikasi Online 20%</h3>
                  <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] leading-relaxed">
                    Menyamakan harga offline dan online sering membuat rugi. Kalkulator Marketplace menghitung harga markup tepat agar net diterima tetap aman.
                  </p>
                </div>

                <div className="rounded-3xl bg-[#E3F3F0] dark:bg-[#0F172A] border border-[#CCE5DF] dark:border-[#334155] p-6 space-y-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] dark:bg-[#14532D] text-[#15803D] dark:text-[#4ADE80] flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <h3 className="font-bold text-base">Tidak Tahu Target Balik Modal</h3>
                  <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] leading-relaxed">
                    Modul BEP menghitung persis berapa porsi per hari yang harus terjual untuk menutup sewa, listrik, gaji, serta memantau target laba bulanan.
                  </p>
                </div>
              </div>
            </div>
          </StackedSection>

          {/* Card 03: Feature Bento Grid */}
          <StackedSection id="fitur" index={2} label="EKSPLORASI MODUL SISTEM">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    9+ Modul Finansial Terintegrasi
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
                    Klik kartu mana saja untuk langsung mencoba modul terkait di dalam aplikasi.
                  </p>
                </div>
                <PressButton variant="accent" size="sm" onClick={() => onEnterApp('dashboard')}>
                  Masuk ke Workspace
                  <ArrowRight className="w-3.5 h-3.5" />
                </PressButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleFeatures.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <PointerCard
                      key={feat.id}
                      lift
                      onClick={() => onEnterApp(feat.id)}
                      className="p-3.5 bg-[#E3F3F0] dark:bg-[#0F172A] flex flex-col justify-between gap-2 cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="w-8 h-8 rounded-xl bg-[#CCFBF1] dark:bg-[#115E59] text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF9F6] dark:bg-[#1E293B] text-[#0D9488] dark:text-[#99F6E4]">
                            {feat.tag}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm mt-2.5 leading-snug">{feat.title}</h3>
                        <p className="text-[11px] text-[#4B5563] dark:text-[#94A3B8] mt-1 leading-relaxed line-clamp-2">
                          {feat.desc}
                        </p>
                      </div>
                    </PointerCard>
                  );
                })}
              </div>

              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllFeatures((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#CCFBF1] dark:bg-[#115E59] hover:bg-[#99F6E4] dark:hover:bg-[#0F766E] border border-[#99F6E4] dark:border-[#14B8A6]/40 text-xs font-bold text-[#0F766E] dark:text-[#99F6E4] btn-press cursor-pointer transition-colors"
                >
                  {showAllFeatures ? (
                    <>
                      Tampilkan Lebih Sedikit
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Lihat Selengkapnya (+{FEATURE_CARDS.length - 6} Modul Lainnya)
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </StackedSection>

          {/* Card 04: How It Works */}
          <StackedSection id="alur" index={3} label="ALUR PENGGUNAAN">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  3 Langkah Mulai Mengelola Harga Usaha
                </h2>
                <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#94A3B8] mt-2 leading-relaxed">
                  Semua data awal sudah terisi otomatis dengan contoh kedai minuman sehingga Anda bisa langsung mencoba setiap fitur.
                </p>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-[#CCFBF1]/70 dark:bg-[#0F172A] border border-[#99F6E4] dark:border-[#334155] p-5 space-y-1.5">
                  <div className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4]">Langkah 1</div>
                  <div className="font-bold text-sm">Input Bahan & Stok</div>
                  <p className="text-xs text-[#4B5563] dark:text-[#94A3B8]">
                    Catat bahan baku beserta harga beli dan batas minimum stok di Inventaris.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#CCFBF1]/70 dark:bg-[#0F172A] border border-[#99F6E4] dark:border-[#334155] p-5 space-y-1.5">
                  <div className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4]">Langkah 2</div>
                  <div className="font-bold text-sm">Set HPP & Harga Jual</div>
                  <p className="text-xs text-[#4B5563] dark:text-[#94A3B8]">
                    Susun resep batch produksi di Kalkulator HPP lalu simpan ke Katalog.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#CCFBF1]/70 dark:bg-[#0F172A] border border-[#99F6E4] dark:border-[#334155] p-5 space-y-1.5">
                  <div className="text-xs font-bold text-[#0F766E] dark:text-[#5EEAD4]">Langkah 3</div>
                  <div className="font-bold text-sm">Catat Penjualan & Pantau</div>
                  <p className="text-xs text-[#4B5563] dark:text-[#94A3B8]">
                    Gunakan Kas & POS untuk potong stok otomatis dan pantau Laba/Rugi.
                  </p>
                </div>
              </div>
            </div>
          </StackedSection>

          {/* Card 05: Final CTA */}
          <StackedSection index={4} label="MULAI SEKARANG">
            <div className="py-4 text-center space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#15803D] dark:text-[#4ADE80] bg-[#DCFCE7] dark:bg-[#14532D] px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Siap Dicoba Langsung di Browser (LocalStorage)
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Siap Menentukan Harga yang Pas untuk Bisnis Anda?
              </h2>
              <p className="text-sm text-[#4B5563] dark:text-[#94A3B8] max-w-xl mx-auto">
                Masuk ke workspace HargaPas UMKM sekarang untuk melihat ringkasan keuangan, menguji simulasi What-If, atau mengatur HPP produk Anda sendiri.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                <PressButton variant="primary" size="lg" onClick={() => onEnterApp('dashboard')}>
                  Mulai Sekarang
                  <ArrowRight className="w-4 h-4" />
                </PressButton>
                <PressButton variant="secondary" size="lg" onClick={() => onEnterApp('what-if')}>
                  Simulasi What-If
                </PressButton>
              </div>
            </div>
          </StackedSection>
        </div>
      </main>

      <footer className="relative z-10 border-t border-[#CCE5DF] dark:border-[#334155] bg-[#FAF9F6]/90 dark:bg-[#0F172A]/90 backdrop-blur-md py-6 px-4 sm:px-8 text-center text-xs text-[#6B7280] dark:text-[#94A3B8]">
        HargaPas UMKM • Prototipe Aplikasi Web Manajemen Harga & Finansial UMKM (Mode Data Dummy Lokal)
      </footer>
    </div>
  );
};
