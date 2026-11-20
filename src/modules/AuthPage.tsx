import React, { useState } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Store,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import { PointerCard } from '../components/ui/PointerCard';
import { PressButton } from '../components/ui/PressButton';

interface AuthPageProps {
  onSuccess: () => void;
  onBackToLanding: () => void;
}

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
    />
  </svg>
);

const GOOGLE_PRESET_ACCOUNTS = [
  {
    name: 'Andi Pratama',
    email: 'andi.pratama@gmail.com',
    businessName: 'Kedai Kopi & Teh Nusantara',
    initials: 'AP',
  },
  {
    name: 'Siti Rahmawati',
    email: 'siti.umkm@gmail.com',
    businessName: 'Dapur Nusantara UMKM',
    initials: 'SR',
  },
];

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onBackToLanding }) => {
  const { login, register, loginDemo, loginWithGoogle, settings, updateSettings } = useHargaPas();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('demo@hargapas.id');
  const [password, setPassword] = useState('hargapas123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Sign-In Modal state (prototype local simulation)
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const inputClass =
    'w-full rounded-2xl border border-[#CCE5DF] dark:border-[#334155] bg-[#E3F3F0] dark:bg-[#0F172A] pl-10 pr-3.5 py-2.5 text-sm text-[#134E4A] dark:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0D9488] dark:focus:ring-[#14B8A6]';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      const res = login(email, password);
      if (!res.ok) {
        setError(res.error ?? 'Gagal masuk.');
        return;
      }
      onSuccess();
      return;
    }

    const res = register({ name, email, password, businessName });
    if (!res.ok) {
      setError(res.error ?? 'Gagal mendaftar.');
      return;
    }
    onSuccess();
  };

  const handleDemoLogin = () => {
    setError(null);
    loginDemo();
    onSuccess();
  };

  const handleSelectGoogleAccount = (acc: {
    name: string;
    email: string;
    businessName?: string;
  }) => {
    setShowGoogleModal(false);
    loginWithGoogle(acc);
    onSuccess();
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim() || !customGoogleEmail.includes('@')) return;
    handleSelectGoogleAccount({
      name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
      email: customGoogleEmail.trim(),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#0F172A] text-[#134E4A] dark:text-[#CBD5E1]">
      {/* Top Bar */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between max-w-6xl w-full mx-auto">
        <PressButton variant="secondary" size="sm" onClick={onBackToLanding}>
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </PressButton>

        <button
          onClick={() => updateSettings({ darkMode: !settings.darkMode })}
          className="p-2 rounded-2xl bg-[#EFF9F7] dark:bg-[#1E293B] border border-[#CCE5DF] dark:border-[#334155] text-[#0D9488] dark:text-[#5EEAD4] btn-press cursor-pointer"
          aria-label="Ganti mode warna"
          title={settings.darkMode ? 'Mode Terang' : 'Mode Gelap'}
        >
          {settings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Auth Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Intro Card */}
          <PointerCard className="lg:col-span-5 p-7 bg-[#E6F6F3] dark:bg-[#1E293B] flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5EEAD4] dark:bg-[#14B8A6] text-[#0F172A] flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-base text-[#0F766E] dark:text-[#99F6E4]">
                    HargaPas UMKM
                  </div>
                  <div className="text-[11px] text-[#0D9488] dark:text-[#5EEAD4] font-medium">
                    Workspace Finansial Usaha
                  </div>
                </div>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#CBD5E1]">
                Masuk untuk Mengelola HPP, Stok, & Kas Usaha Anda
              </h1>
              <p className="text-xs text-[#4B5563] dark:text-[#94A3B8] leading-relaxed">
                Setiap perubahan harga bahan baku, produk, resep BOM, dan transaksi POS tersimpan aman per sesi di browser Anda.
              </p>
            </div>

            <div className="rounded-2xl bg-[#CCFBF1] dark:bg-[#115E59] border border-[#99F6E4] dark:border-[#14B8A6]/40 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E] dark:text-[#99F6E4]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                Akses Cepat Akun Demo
              </div>
              <div className="text-[11px] text-[#134E4A] dark:text-[#CBD5E1] space-y-0.5">
                <div>
                  Email: <strong className="select-all">demo@hargapas.id</strong>
                </div>
                <div>
                  Sandi: <strong className="select-all">hargapas123</strong>
                </div>
              </div>
              <PressButton
                type="button"
                variant="primary"
                size="sm"
                className="w-full mt-1"
                onClick={handleDemoLogin}
              >
                Masuk 1-Klik dengan Akun Demo
              </PressButton>
            </div>
          </PointerCard>

          {/* Right Form Card */}
          <PointerCard className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#E3F3F0] dark:bg-[#0F172A] border border-[#CCE5DF] dark:border-[#334155] mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`py-2.5 rounded-xl text-xs font-semibold cursor-pointer btn-press ${
                  mode === 'login'
                    ? 'bg-[#99F6E4] dark:bg-[#14B8A6] text-[#0F172A] shadow-xs'
                    : 'text-[#4B5563] dark:text-[#94A3B8]'
                }`}
              >
                Masuk Akun
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setEmail('');
                  setPassword('');
                }}
                className={`py-2.5 rounded-xl text-xs font-semibold cursor-pointer btn-press ${
                  mode === 'register'
                    ? 'bg-[#99F6E4] dark:bg-[#14B8A6] text-[#0F172A] shadow-xs'
                    : 'text-[#4B5563] dark:text-[#94A3B8]'
                }`}
              >
                Daftar Baru
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl bg-[#FFE4E6] dark:bg-[#7F1D1D] border border-[#FDA4AF]/70 dark:border-[#FDA4AF]/35 px-4 py-3 text-xs font-medium text-[#BE123C] dark:text-[#FDA4AF]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
                      Nama Pemilik
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#0D9488] dark:text-[#5EEAD4] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="mis. Siti Aminah"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
                      Nama Usaha UMKM
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-[#0D9488] dark:text-[#5EEAD4] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="mis. Warung Kopi Senja"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
                  Email Usaha
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#0D9488] dark:text-[#5EEAD4] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@usahaanda.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#0D9488] dark:text-[#5EEAD4] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#94A3B8] hover:text-[#0D9488] cursor-pointer"
                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <PressButton type="submit" variant="primary" size="lg" className="w-full mt-2">
                {mode === 'login' ? 'Masuk ke Workspace' : 'Buat Akun & Masuk'}
              </PressButton>

              <div className="relative py-2 flex items-center">
                <div className="flex-1 border-t border-[#CCE5DF] dark:border-[#334155]" />
                <span className="px-3 text-[11px] font-medium text-[#6B7280] dark:text-[#94A3B8]">
                  atau
                </span>
                <div className="flex-1 border-t border-[#CCE5DF] dark:border-[#334155]" />
              </div>

              {/* Quick Login with Google */}
              <PressButton
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => setShowGoogleModal(true)}
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Lanjutkan dengan Google</span>
              </PressButton>

              <p className="text-[11px] text-center text-[#6B7280] dark:text-[#94A3B8] pt-1">
                Mode autentikasi lokal (data dummy). Siap dihubungkan ke Supabase OAuth & Auth.
              </p>
            </form>
          </PointerCard>
        </div>
      </main>

      {/* Google Account Picker Modal (Local Prototype Simulation) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <PointerCard className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E3F3F0] dark:bg-[#0F172A] border border-[#CCE5DF] dark:border-[#334155] flex items-center justify-center">
                  <GoogleIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Pilih Akun Google</h2>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                    Simulasi login Google (mode lokal sebelum Supabase OAuth)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="p-1.5 rounded-xl bg-[#E3F3F0] dark:bg-[#0F172A] text-[#6B7280] dark:text-[#94A3B8] btn-press cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {GOOGLE_PRESET_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectGoogleAccount(acc)}
                  className="btn-press w-full flex items-center gap-3 p-3 rounded-2xl bg-[#E3F3F0] dark:bg-[#0F172A] border border-[#CCE5DF] dark:border-[#334155] hover:bg-[#CCFBF1] dark:hover:bg-[#115E59] text-left cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#5EEAD4] dark:bg-[#14B8A6] text-[#0F172A] font-bold text-xs flex items-center justify-center shrink-0">
                    {acc.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{acc.name}</div>
                    <div className="text-xs text-[#6B7280] dark:text-[#94A3B8] truncate">
                      {acc.email}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <form
              onSubmit={handleCustomGoogleSubmit}
              className="pt-3 border-t border-[#CCE5DF] dark:border-[#334155] space-y-2.5"
            >
              <div className="text-xs font-semibold text-[#0F766E] dark:text-[#99F6E4]">
                Atau pakai akun Gmail lain:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nama Anda"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  className="rounded-xl border border-[#CCE5DF] dark:border-[#334155] bg-[#E3F3F0] dark:bg-[#0F172A] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
                <input
                  type="email"
                  required
                  placeholder="email@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="rounded-xl border border-[#CCE5DF] dark:border-[#334155] bg-[#E3F3F0] dark:bg-[#0F172A] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>
              <PressButton type="submit" variant="primary" size="sm" className="w-full">
                Masuk dengan Gmail Ini
              </PressButton>
            </form>
          </PointerCard>
        </div>
      )}
    </div>
  );
};
