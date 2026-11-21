import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  User,
  X,
} from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import { PressButton } from '../components/ui/PressButton';

interface AuthPageProps {
  onSuccess: () => void;
  onClose: () => void;
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

/**
 * Login & Register Modal Dialog (Overlay above Landing Page without page navigation).
 * Styled in Caffe Klasik theme (#FFFDF9 Foam card, #EFE3D3 Cappuccino, #C68B59 Caramel, #2B1B14 Espresso).
 */
export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onClose }) => {
  const { login, register, loginDemo, loginWithGoogle, isSupabaseReady } = useHargaPas();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('demo@hargapas.id');
  const [password, setPassword] = useState('hargapas123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Google account picker view inside the modal
  const [showGoogleView, setShowGoogleView] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Close modal on Escape key & lock body scroll while open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showGoogleView) {
          setShowGoogleView(false);
        } else {
          onClose();
        }
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, showGoogleView]);

  const inputClass =
    'w-full rounded-2xl border border-[#E2D3C1] dark:border-[#4E372B] bg-[#FAF6F0] dark:bg-[#1B120D] pl-10 pr-3.5 py-2.5 text-sm text-[#2B1B14] dark:text-[#FAF6F0] placeholder:text-[#5A4636]/55 dark:placeholder:text-[#D5C3B3]/50 focus:outline-none focus:ring-2 focus:ring-[#C68B59]';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.ok) {
          setError(res.error ?? 'Gagal masuk.');
          return;
        }
        onSuccess();
        return;
      }

      const res = await register({ name, email, password, businessName });
      if (!res.ok) {
        setError(res.error ?? 'Gagal mendaftar.');
        return;
      }
      if (res.needsEmailConfirmation) {
        setInfoMsg('Pendaftaran berhasil! Silakan cek kotak masuk email Anda untuk konfirmasi sebelum masuk.');
        return;
      }
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    setError(null);
    setInfoMsg(null);
    loginDemo();
    onSuccess();
  };

  const handleGoogleButtonClick = async () => {
    setError(null);
    if (isSupabaseReady) {
      setSubmitting(true);
      const res = await loginWithGoogle();
      setSubmitting(false);
      if (!res.ok) {
        setError(res.error ?? 'Gagal memulai login Google.');
      }
      return;
    }
    setShowGoogleView(true);
  };

  const handleSelectGoogleAccount = async (acc: {
    name: string;
    email: string;
    businessName?: string;
  }) => {
    setShowGoogleView(false);
    await loginWithGoogle(acc);
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#2B1B14]/60 dark:bg-black/70 backdrop-blur-sm animate-[fadeIn_160ms_ease-out]"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto no-scrollbar rounded-[2rem] bg-[#FFFDF9] dark:bg-[#2B1B14] text-[#2B1B14] dark:text-[#FAF6F0] border border-[#E2D3C1] dark:border-[#4E372B] shadow-[0_28px_64px_-16px_rgba(43,27,20,0.45)] p-6 sm:p-7"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-4 mb-5 border-b border-[#E2D3C1] dark:border-[#4E372B]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm shrink-0 overflow-hidden ${
                showGoogleView
                  ? 'bg-[#C68B59] text-[#FFFDF9]'
                  : 'bg-[#EFE3D3] border border-[#C68B59]/45 p-1'
              }`}
            >
              {showGoogleView ? (
                <GoogleIcon className="w-5 h-5" />
              ) : (
                <img
                  src="/logo-kopi.jpg"
                  alt="Logo HargaPas UMKM"
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              )}
            </div>
            <div>
              <h2
                id="auth-modal-title"
                className="text-lg font-extrabold tracking-tight text-[#2B1B14] dark:text-[#FAF6F0]"
              >
                {showGoogleView
                  ? 'Pilih Akun Google'
                  : mode === 'login'
                  ? 'Masuk ke HargaPas UMKM'
                  : 'Daftar Akun Usaha Baru'}
              </h2>
              <p className="text-xs text-[#5A4636] dark:text-[#D5C3B3]">
                {showGoogleView
                  ? 'Simulasi login Google (mode lokal sebelum Supabase OAuth)'
                  : 'Kelola HPP, stok BOM, & simulasi harga dalam satu workspace'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#EFE3D3] dark:bg-[#3E2A20] text-[#5A4636] dark:text-[#FAF6F0] hover:bg-[#C68B59] hover:text-[#FFFDF9] btn-press cursor-pointer shrink-0 transition-colors"
            aria-label="Tutup dialog login"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showGoogleView ? (
          /* Google Account Picker View inside Modal */
          <div className="space-y-4">
            <div className="space-y-2">
              {GOOGLE_PRESET_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectGoogleAccount(acc)}
                  className="btn-press w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#1B120D] border border-[#E2D3C1] dark:border-[#4E372B] hover:bg-[#EFE3D3] dark:hover:bg-[#3E2A20] text-left cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#C68B59] text-[#FFFDF9] font-bold text-xs flex items-center justify-center shrink-0">
                    {acc.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate text-[#2B1B14] dark:text-[#FAF6F0]">
                      {acc.name}
                    </div>
                    <div className="text-xs text-[#5A4636] dark:text-[#D5C3B3] truncate">
                      {acc.email} • {acc.businessName}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <form
              onSubmit={handleCustomGoogleSubmit}
              className="pt-3 border-t border-[#E2D3C1] dark:border-[#4E372B] space-y-2.5"
            >
              <div className="text-xs font-semibold text-[#A8703F] dark:text-[#C68B59]">
                Atau pakai akun Gmail lain:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nama Anda"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  className="rounded-xl border border-[#E2D3C1] dark:border-[#4E372B] bg-[#FAF6F0] dark:bg-[#1B120D] px-3 py-2 text-xs text-[#2B1B14] dark:text-[#FAF6F0] focus:outline-none focus:ring-2 focus:ring-[#C68B59]"
                />
                <input
                  type="email"
                  required
                  placeholder="email@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="rounded-xl border border-[#E2D3C1] dark:border-[#4E372B] bg-[#FAF6F0] dark:bg-[#1B120D] px-3 py-2 text-xs text-[#2B1B14] dark:text-[#FAF6F0] focus:outline-none focus:ring-2 focus:ring-[#C68B59]"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <PressButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowGoogleView(false)}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali
                </PressButton>
                <PressButton type="submit" variant="primary" size="sm" className="flex-1">
                  Masuk dengan Gmail Ini
                </PressButton>
              </div>
            </form>
          </div>
        ) : (
          /* Standard Login / Register + 1-Click Demo View */
          <div className="space-y-4">
            {/* Quick 1-Click Demo Account Banner */}
            <div className="rounded-2xl bg-[#EFE3D3] dark:bg-[#3E2A20] border border-[#C68B59]/45 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#A8703F] dark:text-[#C68B59]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  Akses Cepat Akun Demo
                </div>
                <div className="text-[11px] text-[#5A4636] dark:text-[#D5C3B3]">
                  <strong className="text-[#2B1B14] dark:text-[#FAF6F0]">demo@hargapas.id</strong> • sandi:{' '}
                  <strong className="text-[#2B1B14] dark:text-[#FAF6F0]">hargapas123</strong>
                </div>
              </div>
              <PressButton
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDemoLogin}
                className="shrink-0"
              >
                Masuk 1-Klik Demo
              </PressButton>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#EFE3D3] dark:bg-[#1B120D] border border-[#E2D3C1] dark:border-[#4E372B]">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`py-2 rounded-xl text-xs font-semibold cursor-pointer btn-press ${
                  mode === 'login'
                    ? 'bg-[#C68B59] text-[#FFFDF9] shadow-xs'
                    : 'text-[#5A4636] dark:text-[#D5C3B3] hover:text-[#2B1B14] dark:hover:text-[#FAF6F0]'
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
                className={`py-2 rounded-xl text-xs font-semibold cursor-pointer btn-press ${
                  mode === 'register'
                    ? 'bg-[#C68B59] text-[#FFFDF9] shadow-xs'
                    : 'text-[#5A4636] dark:text-[#D5C3B3] hover:text-[#2B1B14] dark:hover:text-[#FAF6F0]'
                }`}
              >
                Daftar Baru
              </button>
            </div>

            {error && (
              <div className="rounded-2xl bg-[#FFE4E6] dark:bg-[#7F1D1D] border border-[#FDA4AF]/70 dark:border-[#FDA4AF]/35 px-4 py-2.5 text-xs font-medium text-[#BE123C] dark:text-[#FDA4AF]">
                {error}
              </div>
            )}

            {infoMsg && (
              <div className="rounded-2xl bg-[#DCFCE7] dark:bg-[#14532D] border border-[#4ADE80]/50 px-4 py-2.5 text-xs font-medium text-[#15803D] dark:text-[#4ADE80]">
                {infoMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1">
                      Nama Pemilik
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#C68B59] absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                    <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1">
                      Nama Usaha UMKM
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-[#C68B59] absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1">
                  Email Usaha
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#C68B59] absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#C68B59] absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A4636] dark:text-[#D5C3B3] hover:text-[#A8703F] cursor-pointer"
                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <PressButton type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
                {submitting
                  ? 'Memproses...'
                  : mode === 'login'
                  ? 'Masuk ke Workspace'
                  : 'Buat Akun & Masuk'}
              </PressButton>

              <div className="relative py-1 flex items-center">
                <div className="flex-1 border-t border-[#E2D3C1] dark:border-[#4E372B]" />
                <span className="px-3 text-[11px] font-medium text-[#5A4636] dark:text-[#D5C3B3]">
                  atau
                </span>
                <div className="flex-1 border-t border-[#E2D3C1] dark:border-[#4E372B]" />
              </div>

              {/* Quick Login with Google (Real OAuth when Supabase .env is set, local picker otherwise) */}
              <PressButton
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                disabled={submitting}
                onClick={handleGoogleButtonClick}
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Lanjutkan dengan Google</span>
              </PressButton>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
