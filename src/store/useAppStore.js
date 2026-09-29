/**
 * Zustand Global Store — NeuraTrade AI
 * Manages coins, portfolio, watchlist, settings, predictions, chat, and UI state
 */
import { create } from 'zustand';

// Load from localStorage helpers
const loadJSON = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch { return fallback; }
};
const saveJSON = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

const useAppStore = create((set, get) => ({
  // ── Theme ──
  theme: loadJSON('nt-theme', 'dark'),
  setTheme: (theme) => {
    set({ theme });
    saveJSON('nt-theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },

  // ── Active Page ──
  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),

  // ── Coins Data ──
  coins: [],
  coinsLoading: true,
  coinsError: null,
  activeApi: 'coingecko',
  lastUpdated: null,
  setCoins: (coins) => set({ coins, coinsLoading: false, coinsError: null, lastUpdated: Date.now() }),
  setCoinsLoading: (loading) => set({ coinsLoading: loading }),
  setCoinsError: (error) => set({ coinsError: error, coinsLoading: false }),
  setActiveApi: (api) => set({ activeApi: api }),

  // ── Trending ──
  trending: [],
  setTrending: (trending) => set({ trending }),

  // ── Global Stats ──
  globalStats: null,
  setGlobalStats: (stats) => set({ globalStats: stats }),

  // ── Coin Detail ──
  selectedCoin: null,
  coinDetail: null,
  coinChart: null,
  coinDetailLoading: false,
  setSelectedCoin: (coin) => set({ selectedCoin: coin }),
  setCoinDetail: (detail) => set({ coinDetail: detail }),
  setCoinChart: (chart) => set({ coinChart: chart }),
  setCoinDetailLoading: (loading) => set({ coinDetailLoading: loading }),

  // ── DIA Prices ──
  diaPrices: {},
  setDiaPrice: (symbol, price) => set(state => ({
    diaPrices: { ...state.diaPrices, [symbol]: price }
  })),

  // ── Portfolio ──
  portfolio: loadJSON('nt-portfolio', []),
  addHolding: (holding) => {
    const updated = [...get().portfolio, { ...holding, id: Date.now() }];
    set({ portfolio: updated });
    saveJSON('nt-portfolio', updated);
  },
  removeHolding: (id) => {
    const updated = get().portfolio.filter(h => h.id !== id);
    set({ portfolio: updated });
    saveJSON('nt-portfolio', updated);
  },
  clearPortfolio: () => {
    set({ portfolio: [] });
    saveJSON('nt-portfolio', []);
  },

  // ── Watchlist ──
  watchlist: loadJSON('nt-watchlist', []),
  toggleWatchlist: (coinId) => {
    const current = get().watchlist;
    const updated = current.includes(coinId)
      ? current.filter(id => id !== coinId)
      : [...current, coinId];
    set({ watchlist: updated });
    saveJSON('nt-watchlist', updated);
  },

  // ── Price Alerts ──
  priceAlerts: loadJSON('nt-alerts', []),
  addPriceAlert: (alert) => {
    const updated = [...get().priceAlerts, { ...alert, id: Date.now(), triggered: false }];
    set({ priceAlerts: updated });
    saveJSON('nt-alerts', updated);
  },
  removePriceAlert: (id) => {
    const updated = get().priceAlerts.filter(a => a.id !== id);
    set({ priceAlerts: updated });
    saveJSON('nt-alerts', updated);
  },
  triggerAlert: (id) => {
    const updated = get().priceAlerts.map(a => a.id === id ? { ...a, triggered: true } : a);
    set({ priceAlerts: updated });
    saveJSON('nt-alerts', updated);
  },

  // ── Predictions Cache ──
  predictions: {},
  setPrediction: (coinId, data) => set(state => ({
    predictions: { ...state.predictions, [coinId]: { data, timestamp: Date.now() } }
  })),

  // ── Signals ──
  signals: [],
  signalsLoading: false,
  setSignals: (signals) => set({ signals, signalsLoading: false }),
  setSignalsLoading: (loading) => set({ signalsLoading: loading }),

  // ── Chat Messages ──
  chatMessages: loadJSON('nt-chat', []),
  addChatMessage: (msg) => {
    const updated = [...get().chatMessages, { ...msg, id: Date.now(), timestamp: Date.now() }];
    set({ chatMessages: updated });
    saveJSON('nt-chat', updated);
  },
  clearChat: () => {
    set({ chatMessages: [] });
    saveJSON('nt-chat', []);
  },

  // ── Settings ──
  settings: loadJSON('nt-settings', {
    pollingInterval: 30,
    currency: 'usd',
  }),
  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    saveJSON('nt-settings', updated);
  },

  // ── Search ──
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  // ── Sidebar ──
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  sidebarCollapsed: loadJSON('nt-sidebar-collapsed', false),
  toggleSidebarCollapsed: () => {
    const next = !get().sidebarCollapsed;
    set({ sidebarCollapsed: next });
    saveJSON('nt-sidebar-collapsed', next);
  },
}));

export default useAppStore;
