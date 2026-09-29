import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useAppStore from './store/useAppStore';
import { useCoinData } from './hooks/useCoinData';
import { useDiaPrice } from './hooks/useDiaPrice';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import Portfolio from './pages/Portfolio';
import Signals from './pages/Signals';
import ChatBot from './pages/ChatBot';
import Settings from './pages/Settings';

const PAGES = {
  dashboard: Dashboard,
  markets: Markets,
  portfolio: Portfolio,
  signals: Signals,
  chatbot: ChatBot,
  settings: Settings,
};

export default function App() {
  const { activePage, theme, setTheme, setActivePage, coins, priceAlerts, triggerAlert, sidebarCollapsed } = useAppStore();

  // Initialize data hooks
  useCoinData();
  useDiaPrice();

  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('nt-theme');
    if (saved) {
      const t = JSON.parse(saved);
      document.documentElement.classList.toggle('light', t === 'light');
      document.documentElement.classList.toggle('dark', t === 'dark');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      switch (e.key) {
        case '/': e.preventDefault(); document.getElementById('search-input')?.focus(); break;
        case 'd': case 'D': setActivePage('dashboard'); break;
        case 'm': case 'M': setActivePage('markets'); break;
        case 'c': case 'C': setActivePage('chatbot'); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActivePage]);

  // Price alert checker
  useEffect(() => {
    if (!coins.length) return;
    priceAlerts.forEach(alert => {
      if (alert.triggered) return;
      const coin = coins.find(c => c.id === alert.coinId);
      if (!coin) return;
      const hit = alert.direction === 'above'
        ? coin.current_price >= alert.targetPrice
        : coin.current_price <= alert.targetPrice;
      if (hit) {
        triggerAlert(alert.id);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`🔔 Price Alert: ${coin.name}`, {
            body: `${coin.name} is now ${alert.direction} $${alert.targetPrice} at $${coin.current_price}`,
          });
        }
      }
    });
  }, [coins, priceAlerts, triggerAlert]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const PageComponent = PAGES[activePage] || Dashboard;

  const sidebarWidth = sidebarCollapsed ? '80px' : '260px';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '13px' },
        }}
      />
      <Sidebar />
      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ marginLeft: window.innerWidth >= 1024 ? sidebarWidth : 0 }}
      >
        <Topbar />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          <PageComponent />
        </main>
      </div>
    </div>
  );
}
