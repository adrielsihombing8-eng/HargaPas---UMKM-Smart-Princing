import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AuthUser,
  BusinessSettings,
  CashFlowEntry,
  Ingredient,
  Product,
  SaleTransaction,
  SmartAlert,
} from '../types/hargapas';
import {
  SEED_CASHFLOW,
  SEED_INGREDIENTS,
  SEED_PRODUCTS,
  SEED_SETTINGS,
  SEED_TRANSACTIONS,
} from '../data/seedData';
import { calculateProductHpp, generateSmartAlerts } from '../utils/finance';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  addIngredientToDb,
  addProductToDb,
  deleteProductInDb,
  fetchUserProfile,
  fetchWorkspaceSnapshot,
  insertCashFlowInDb,
  insertSaleInDb,
  resetUserWorkspaceInDb,
  signInWithEmailPassword,
  signInWithGoogleOAuth,
  signOutSupabase,
  signUpWithEmailPassword,
  syncSettingsToDb,
  updateIngredientPriceInDb,
  updateIngredientStockInDb,
  updateProductInDb,
} from '../services/supabaseService';

interface HargaPasState {
  ingredients: Ingredient[];
  products: Product[];
  transactions: SaleTransaction[];
  cashFlow: CashFlowEntry[];
  settings: BusinessSettings;
}

interface StoredAccount {
  user: AuthUser;
  password: string;
}

export interface AuthResult {
  ok: boolean;
  needsEmailConfirmation?: boolean;
  error?: string;
}

interface HargaPasContextValue extends HargaPasState {
  currentUser: AuthUser | null;
  isSupabaseReady: boolean;
  isSyncing: boolean;
  smartAlerts: SmartAlert[];
  toastMessage: string | null;
  showToast: (msg: string) => void;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (params: {
    name: string;
    email: string;
    password: string;
    businessName: string;
  }) => Promise<AuthResult>;
  loginDemo: () => void;
  loginWithGoogle: (params?: { name: string; email: string; businessName?: string }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateSettings: (partial: Partial<BusinessSettings>) => void;
  updateIngredientPrice: (ingredientId: string, newPrice: number, note?: string) => void;
  restockIngredient: (ingredientId: string, addedQty: number) => void;
  addIngredient: (ing: Omit<Ingredient, 'id' | 'priceHistory'>) => void;
  addProduct: (prod: Omit<Product, 'id'>) => void;
  updateProduct: (prod: Product) => void;
  deleteProduct: (productId: string) => void;
  recordSale: (params: {
    productId: string;
    qty: number;
    channel: SaleTransaction['channel'];
    customPrice?: number;
  }) => void;
  addCashFlow: (entry: Omit<CashFlowEntry, 'id'>) => void;
  resetToSeed: () => void;
}

const STORAGE_KEY = 'hargapas_umkm_v1';
const AUTH_SESSION_KEY = 'hargapas_auth_session_v1';
const AUTH_ACCOUNTS_KEY = 'hargapas_auth_accounts_v1';

const DEMO_ACCOUNT: StoredAccount = {
  user: {
    id: 'user-demo',
    name: 'Budi Santoso',
    email: 'demo@hargapas.id',
    businessName: SEED_SETTINGS.businessName,
    role: 'Owner UMKM',
  },
  password: 'hargapas123',
};

function loadInitialUser(): AuthUser | null {
  if (isSupabaseConfigured) return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function loadStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(AUTH_ACCOUNTS_KEY);
    if (!raw) return [DEMO_ACCOUNT];
    const parsed = JSON.parse(raw) as StoredAccount[];
    const hasDemo = parsed.some(
      (a) => a.user.email.toLowerCase() === DEMO_ACCOUNT.user.email.toLowerCase()
    );
    return hasDemo ? parsed : [DEMO_ACCOUNT, ...parsed];
  } catch {
    return [DEMO_ACCOUNT];
  }
}

const demoState: HargaPasState = {
  ingredients: SEED_INGREDIENTS,
  products: SEED_PRODUCTS,
  transactions: SEED_TRANSACTIONS,
  cashFlow: SEED_CASHFLOW,
  settings: SEED_SETTINGS,
};

function createEmptyState(businessName = 'Usaha UMKM Saya'): HargaPasState {
  return {
    ingredients: [],
    products: [],
    transactions: [],
    cashFlow: [],
    settings: {
      ...SEED_SETTINGS,
      businessName,
    },
  };
}

function getUserStorageKey(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
}

function loadStateForUser(user: AuthUser | null): HargaPasState {
  if (!user) return createEmptyState();
  try {
    const raw = localStorage.getItem(getUserStorageKey(user.id));
    if (!raw) {
      return user.id === DEMO_ACCOUNT.user.id
        ? demoState
        : createEmptyState(user.businessName);
    }
    const parsed = JSON.parse(raw) as Partial<HargaPasState>;
    const fallback =
      user.id === DEMO_ACCOUNT.user.id
        ? demoState
        : createEmptyState(user.businessName);
    return {
      ingredients: parsed.ingredients ?? fallback.ingredients,
      products: parsed.products ?? fallback.products,
      transactions: parsed.transactions ?? fallback.transactions,
      cashFlow: parsed.cashFlow ?? fallback.cashFlow,
      settings: { ...fallback.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return user.id === DEMO_ACCOUNT.user.id
      ? demoState
      : createEmptyState(user.businessName);
  }
}

const HargaPasContext = createContext<HargaPasContextValue | null>(null);

export const HargaPasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadInitialUser);
  const [state, setState] = useState<HargaPasState>(() => loadStateForUser(loadInitialUser()));
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist local cache scoped per user ID
  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(getUserStorageKey(currentUser.id), JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state, currentUser]);

  // Apply Dark / Light theme attribute
  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [state.settings.darkMode]);

  // Subscribe to Supabase Auth state changes (Email/Password + Google OAuth callback)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let isMounted = true;

    const hydrateFromSupabase = async (userId: string, email: string) => {
      setIsSyncing(true);
      try {
        const [profile, snapshot] = await Promise.all([
          fetchUserProfile(userId, email),
          fetchWorkspaceSnapshot(userId),
        ]);
        if (!isMounted) return;
        setCurrentUser(profile);
        setState(snapshot);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser && isMounted) {
        hydrateFromSupabase(sessionUser.id, sessionUser.email ?? '');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        hydrateFromSupabase(session.user.id, session.user.email ?? '');
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) {
      return { ok: false, error: 'Email dan kata sandi wajib diisi.' };
    }

    if (isSupabaseConfigured) {
      const res = await signInWithEmailPassword(normalized, password);
      if (!res.ok) return res;
      showToast('Berhasil masuk ke workspace Supabase');
      return { ok: true };
    }

    const accounts = loadStoredAccounts();
    const matched = accounts.find(
      (a) => a.user.email.toLowerCase() === normalized
    );
    if (!matched || matched.password !== password) {
      return { ok: false, error: 'Email atau kata sandi belum sesuai.' };
    }
    setCurrentUser(matched.user);
    setState(loadStateForUser(matched.user));
    try {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(matched.user));
    } catch {
      // Ignore storage errors
    }
    showToast(`Selamat datang kembali, ${matched.user.name}`);
    return { ok: true };
  };

  const register: HargaPasContextValue['register'] = async ({
    name,
    email,
    password,
    businessName,
  }) => {
    const cleanName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const cleanBiz = businessName.trim();

    if (!cleanName || !normalizedEmail || !cleanBiz) {
      return { ok: false, error: 'Nama lengkap, nama usaha, dan email wajib diisi.' };
    }
    if (!normalizedEmail.includes('@')) {
      return { ok: false, error: 'Format email belum valid.' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'Kata sandi minimal 6 karakter.' };
    }

    if (isSupabaseConfigured) {
      const res = await signUpWithEmailPassword({
        name: cleanName,
        email: normalizedEmail,
        password,
        businessName: cleanBiz,
      });
      if (!res.ok) return res;
      if (res.needsEmailConfirmation) {
        showToast('Cek email Anda untuk konfirmasi pendaftaran Supabase.');
      } else {
        showToast(`Akun "${cleanName}" berhasil dibuat!`);
      }
      return res;
    }

    const accounts = loadStoredAccounts();
    if (accounts.some((a) => a.user.email.toLowerCase() === normalizedEmail)) {
      return { ok: false, error: 'Email tersebut sudah terdaftar. Silakan masuk.' };
    }

    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: normalizedEmail,
      businessName: cleanBiz,
      role: 'Owner UMKM',
    };

    try {
      localStorage.setItem(
        AUTH_ACCOUNTS_KEY,
        JSON.stringify([...accounts, { user: newUser, password }])
      );
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(newUser));
    } catch {
      // Ignore storage errors
    }

    setCurrentUser(newUser);
    setState(createEmptyState(cleanBiz));
    showToast(`Akun "${cleanName}" berhasil dibuat!`);
    return { ok: true };
  };

  const loginDemo = () => {
    setCurrentUser(DEMO_ACCOUNT.user);
    setState(loadStateForUser(DEMO_ACCOUNT.user));
    try {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(DEMO_ACCOUNT.user));
    } catch {
      // Ignore storage errors
    }
    showToast(`Masuk sebagai akun demo (${DEMO_ACCOUNT.user.name})`);
  };

  const loginWithGoogle: HargaPasContextValue['loginWithGoogle'] = async (params) => {
    if (isSupabaseConfigured) {
      const res = await signInWithGoogleOAuth();
      if (!res.ok) {
        showToast(res.error ?? 'Gagal membuka login Google');
      }
      return res;
    }

    const cleanEmail = (params?.email ?? 'andi.pratama@gmail.com').trim().toLowerCase();
    const cleanName = (params?.name ?? 'Pengguna Google').trim() || 'Pengguna Google';
    const googleUser: AuthUser = {
      id: `google-${cleanEmail}`,
      name: cleanName,
      email: cleanEmail,
      businessName: params?.businessName?.trim() || `Usaha ${cleanName}`,
      role: 'Owner UMKM',
    };
    setCurrentUser(googleUser);
    setState(loadStateForUser(googleUser));
    try {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(googleUser));
    } catch {
      // Ignore storage errors
    }
    showToast(`Berhasil masuk dengan Google (${cleanEmail})`);
    return { ok: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await signOutSupabase();
    }
    setCurrentUser(null);
    setState(createEmptyState());
    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
    } catch {
      // Ignore storage errors
    }
    showToast('Anda telah keluar dari sesi aplikasi');
  };

  const smartAlerts = useMemo(
    () => generateSmartAlerts(state.products, state.ingredients, state.settings.marginThreshold),
    [state.products, state.ingredients, state.settings.marginThreshold]
  );

  const isRealSupabaseUser =
    isSupabaseConfigured && Boolean(currentUser && currentUser.id !== DEMO_ACCOUNT.user.id);

  const updateSettings = (partial: Partial<BusinessSettings>) => {
    setState((prev) => {
      const nextSettings = { ...prev.settings, ...partial };
      if (isRealSupabaseUser && currentUser) {
        void syncSettingsToDb(currentUser.id, nextSettings);
      }
      return {
        ...prev,
        settings: nextSettings,
      };
    });
  };

  const updateIngredientPrice = (ingredientId: string, newPrice: number, note = 'Update harga pasar') => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing) =>
        ing.id === ingredientId
          ? {
              ...ing,
              pricePerUnit: newPrice,
              priceHistory: [
                ...ing.priceHistory,
                { id: `ph-${Date.now()}`, date: today, pricePerUnit: newPrice, note },
              ],
            }
          : ing
      ),
    }));
    if (isRealSupabaseUser && currentUser) {
      void updateIngredientPriceInDb(currentUser.id, ingredientId, newPrice, note);
    }
    showToast('Harga bahan baku diperbarui & HPP otomatis dihitung ulang');
  };

  const restockIngredient = (ingredientId: string, addedQty: number) => {
    setState((prev) => {
      const target = prev.ingredients.find((i) => i.id === ingredientId);
      const nextStock = target ? Number((target.stock + addedQty).toFixed(3)) : addedQty;
      if (isRealSupabaseUser && currentUser) {
        void updateIngredientStockInDb(currentUser.id, ingredientId, nextStock);
      }
      return {
        ...prev,
        ingredients: prev.ingredients.map((ing) =>
          ing.id === ingredientId ? { ...ing, stock: nextStock } : ing
        ),
      };
    });
    showToast('Stok bahan baku berhasil ditambahkan');
  };

  const addIngredient = (ing: Omit<Ingredient, 'id' | 'priceHistory'>) => {
    const today = new Date().toISOString().slice(0, 10);
    const tempId = `ing-${Date.now()}`;
    const newIng: Ingredient = {
      ...ing,
      id: tempId,
      priceHistory: [
        { id: `ph-${Date.now()}`, date: today, pricePerUnit: ing.pricePerUnit, note: 'Stok awal' },
      ],
    };
    setState((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, newIng],
    }));

    if (isRealSupabaseUser && currentUser) {
      void addIngredientToDb(currentUser.id, ing).then((realId) => {
        if (!realId) return;
        setState((prev) => ({
          ...prev,
          ingredients: prev.ingredients.map((item) =>
            item.id === tempId ? { ...item, id: realId } : item
          ),
        }));
      });
    }
    showToast(`${ing.name} ditambahkan ke inventaris`);
  };

  const addProduct = (prod: Omit<Product, 'id'>) => {
    const tempId = `prod-${Date.now()}`;
    const newProd: Product = { ...prod, id: tempId };
    setState((prev) => ({
      ...prev,
      products: [...prev.products, newProd],
    }));

    if (isRealSupabaseUser && currentUser) {
      void addProductToDb(currentUser.id, prod).then((realId) => {
        if (!realId) return;
        setState((prev) => ({
          ...prev,
          products: prev.products.map((item) =>
            item.id === tempId ? { ...item, id: realId } : item
          ),
        }));
      });
    }
    showToast(`Produk "${prod.name}" disimpan ke katalog`);
  };

  const updateProduct = (prod: Product) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === prod.id ? prod : p)),
    }));
    if (isRealSupabaseUser && currentUser) {
      void updateProductInDb(currentUser.id, prod);
    }
    showToast(`Produk "${prod.name}" diperbarui`);
  };

  const deleteProduct = (productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
    }));
    if (isRealSupabaseUser && currentUser) {
      void deleteProductInDb(currentUser.id, productId);
    }
    showToast('Produk dihapus dari katalog');
  };

  const recordSale: HargaPasContextValue['recordSale'] = ({
    productId,
    qty,
    channel,
    customPrice,
  }) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product || qty <= 0) return;

    const unitHpp = calculateProductHpp(product, state.ingredients);
    const unitPrice = customPrice ?? product.sellingPrice;
    const totalRevenue = unitPrice * qty;
    const totalHpp = unitHpp * qty;
    const profit = totalRevenue - totalHpp;
    const today = new Date().toISOString().slice(0, 10);

    const txPayload: Omit<SaleTransaction, 'id'> = {
      date: today,
      productId: product.id,
      productName: product.name,
      qty,
      unitPrice,
      unitHpp,
      channel,
      totalRevenue,
      totalHpp,
      profit,
    };

    const cashPayload: Omit<CashFlowEntry, 'id'> = {
      date: today,
      type: 'in',
      category: `Penjualan (${channel})`,
      description: `${qty}x ${product.name}`,
      amount: totalRevenue,
    };

    const updatedIngredients = state.ingredients.map((ing) => {
      const bomItem = product.bom.find((b) => b.ingredientId === ing.id);
      if (!bomItem) return ing;
      const deducted = bomItem.qtyPerUnit * qty;
      const nextStock = Math.max(0, Number((ing.stock - deducted).toFixed(3)));
      if (isRealSupabaseUser && currentUser) {
        void updateIngredientStockInDb(currentUser.id, ing.id, nextStock);
      }
      return {
        ...ing,
        stock: nextStock,
      };
    });

    if (isRealSupabaseUser && currentUser) {
      void insertSaleInDb(currentUser.id, txPayload);
      void insertCashFlowInDb(currentUser.id, cashPayload);
    }

    setState((prev) => ({
      ...prev,
      ingredients: updatedIngredients,
      transactions: [...prev.transactions, { ...txPayload, id: `tx-${Date.now()}` }],
      cashFlow: [{ ...cashPayload, id: `cf-${Date.now()}` }, ...prev.cashFlow],
    }));

    showToast(`Penjualan ${qty}x ${product.name} tercatat & stok bahan berkurang otomatis`);
  };

  const addCashFlow = (entry: Omit<CashFlowEntry, 'id'>) => {
    setState((prev) => ({
      ...prev,
      cashFlow: [{ ...entry, id: `cf-${Date.now()}` }, ...prev.cashFlow],
    }));
    if (isRealSupabaseUser && currentUser) {
      void insertCashFlowInDb(currentUser.id, entry);
    }
    showToast('Transaksi kas berhasil dicatat');
  };

  const resetToSeed = () => {
    const isDemo = currentUser?.id === DEMO_ACCOUNT.user.id;
    if (isRealSupabaseUser && currentUser) {
      void resetUserWorkspaceInDb(currentUser.id).then((snapshot) => {
        setState(snapshot);
        showToast('Database Supabase berhasil direset ke data awal');
      });
      return;
    }
    const next = isDemo
      ? demoState
      : createEmptyState(currentUser?.businessName);
    setState(next);
    localStorage.removeItem(getUserStorageKey(currentUser?.id));
    showToast('Data usaha berhasil direset ke kondisi awal');
  };

  return (
    <HargaPasContext.Provider
      value={{
        ...state,
        currentUser,
        isSupabaseReady: isSupabaseConfigured,
        isSyncing,
        smartAlerts,
        toastMessage,
        showToast,
        login,
        register,
        loginDemo,
        loginWithGoogle,
        logout,
        updateSettings,
        updateIngredientPrice,
        restockIngredient,
        addIngredient,
        addProduct,
        updateProduct,
        deleteProduct,
        recordSale,
        addCashFlow,
        resetToSeed,
      }}
    >
      {children}
    </HargaPasContext.Provider>
  );
};

export function useHargaPas(): HargaPasContextValue {
  const ctx = useContext(HargaPasContext);
  if (!ctx) throw new Error('useHargaPas must be used within HargaPasProvider');
  return ctx;
}
