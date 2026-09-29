/**
 * useCoinData — CoinGecko polling hook with CoinLore fallback
 * Polls every N seconds for market data, handles rate limiting
 */
import { useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAppStore from '../store/useAppStore';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const COINLORE_BASE = 'https://api.coinlore.net/api';

export function useCoinData() {
  const {
    setCoins, setCoinsLoading, setCoinsError, setActiveApi,
    setTrending, setGlobalStats, settings
  } = useAppStore();
  const intervalRef = useRef(null);
  const failCountRef = useRef(0);

  const fetchCoinGecko = useCallback(async () => {
    try {
      const res = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
        params: {
          vs_currency: settings.currency || 'usd',
          order: 'market_cap_desc',
          per_page: 25,
          page: 1,
          sparkline: true,
          price_change_percentage: '24h,7d',
        },
        timeout: 12000,
      });
      failCountRef.current = 0;
      setActiveApi('coingecko');
      setCoins(res.data);
      return true;
    } catch (err) {
      if (err.response?.status === 429) {
        failCountRef.current++;
        toast.error('CoinGecko rate limited — switching to CoinLore', { id: 'rate-limit' });
        return false;
      }
      failCountRef.current++;
      return false;
    }
  }, [setCoins, setActiveApi, settings.currency]);

  const fetchCoinLore = useCallback(async () => {
    try {
      const [tickersRes, globalRes] = await Promise.all([
        axios.get(`${COINLORE_BASE}/tickers/`, { params: { start: 0, limit: 50 }, timeout: 10000 }),
        axios.get(`${COINLORE_BASE}/global/`, { timeout: 10000 }),
      ]);

      // Map CoinLore format to match our expected format
      const coins = (tickersRes.data?.data || []).map(c => ({
        id: c.nameid || c.symbol?.toLowerCase(),
        symbol: c.symbol?.toLowerCase(),
        name: c.name,
        image: `https://www.coinlore.com/img/${(c.nameid || '').replace(/ /g, '-')}.png`,
        current_price: parseFloat(c.price_usd),
        market_cap: parseFloat(c.market_cap_usd),
        total_volume: parseFloat(c.volume24),
        price_change_percentage_24h: parseFloat(c.percent_change_24h),
        price_change_percentage_7d_in_currency: parseFloat(c.percent_change_7d),
        price_change_percentage_1h_in_currency: parseFloat(c.percent_change_1h),
        market_cap_rank: parseInt(c.rank),
        circulating_supply: parseFloat(c.csupply),
      }));

      setActiveApi('coinlore');
      setCoins(coins);

      if (globalRes.data?.[0]) {
        setGlobalStats({
          total_market_cap: parseFloat(globalRes.data[0].total_mcap),
          total_volume: parseFloat(globalRes.data[0].total_volume),
          btc_dominance: parseFloat(globalRes.data[0].btc_d),
          active_coins: parseInt(globalRes.data[0].coins_count),
        });
      }
      return true;
    } catch (err) {
      console.error('CoinLore fetch failed:', err);
      return false;
    }
  }, [setCoins, setActiveApi, setGlobalStats]);

  const fetchTrending = useCallback(async () => {
    try {
      const res = await axios.get(`${COINGECKO_BASE}/search/trending`, { timeout: 10000 });
      setTrending(res.data?.coins?.map(c => c.item) || []);
    } catch { /* silent fail */ }
  }, [setTrending]);

  const fetchGlobalGecko = useCallback(async () => {
    try {
      const res = await axios.get(`${COINGECKO_BASE}/global`, { timeout: 10000 });
      const d = res.data?.data;
      if (d) {
        setGlobalStats({
          total_market_cap: d.total_market_cap?.usd,
          total_volume: d.total_volume?.usd,
          btc_dominance: d.market_cap_percentage?.btc,
          active_coins: d.active_cryptocurrencies,
        });
      }
    } catch { /* Will use CoinLore global instead */ }
  }, [setGlobalStats]);

  const fetchAll = useCallback(async () => {
    setCoinsLoading(true);
    let success = false;

    // Try CoinGecko first, fallback to CoinLore
    if (failCountRef.current < 3) {
      success = await fetchCoinGecko();
    }

    if (!success) {
      success = await fetchCoinLore();
    }

    if (!success) {
      setCoinsError('All APIs unavailable. Using cached data.');
      toast.error('APIs unavailable — using cached data', { id: 'api-error' });
    }

    // Fetch trending and global stats in parallel
    await Promise.allSettled([fetchTrending(), fetchGlobalGecko()]);
  }, [fetchCoinGecko, fetchCoinLore, fetchTrending, fetchGlobalGecko, setCoinsLoading, setCoinsError]);

  useEffect(() => {
    fetchAll();
    // Default to 60s polling — enough for crypto which moves on minute scales
    const ms = Math.max((settings.pollingInterval || 60), 60) * 1000;
    intervalRef.current = setInterval(fetchAll, ms);
    return () => clearInterval(intervalRef.current);
  }, [fetchAll, settings.pollingInterval]);

  return { refetch: fetchAll };
}

/** Fetch coin detail + chart from CoinGecko */
export async function fetchCoinDetail(coinId) {
  try {
    const [detailRes, chartRes] = await Promise.all([
      axios.get(`${COINGECKO_BASE}/coins/${coinId}`, {
        params: { localization: false, tickers: false, community_data: true },
        timeout: 10000,
      }),
      axios.get(`${COINGECKO_BASE}/coins/${coinId}/market_chart`, {
        params: { vs_currency: 'usd', days: 90, interval: 'daily' },
        timeout: 10000,
      }),
    ]);
    return { detail: detailRes.data, chart: chartRes.data };
  } catch (err) {
    console.error('Failed to fetch coin detail:', err);
    return null;
  }
}
