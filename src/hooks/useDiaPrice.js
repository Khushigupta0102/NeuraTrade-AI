/**
 * useDiaPrice — DIA on-chain oracle price hook
 */
import { useEffect, useCallback } from 'react';
import axios from 'axios';
import useAppStore from '../store/useAppStore';

const DIA_BASE = 'https://api.diadata.org/v1';

export function useDiaPrice() {
  const setDiaPrice = useAppStore(s => s.setDiaPrice);

  const fetchDiaPrices = useCallback(async () => {
    const symbols = ['BTC', 'ETH'];
    for (const symbol of symbols) {
      try {
        const res = await axios.get(`${DIA_BASE}/quotation/${symbol}`, { timeout: 8000 });
        if (res.data?.Price) {
          setDiaPrice(symbol, res.data.Price);
        }
      } catch {
        // silent fail — DIA is supplementary
      }
    }
  }, [setDiaPrice]);

  useEffect(() => {
    fetchDiaPrices();
    const interval = setInterval(fetchDiaPrices, 60000); // every 60s
    return () => clearInterval(interval);
  }, [fetchDiaPrices]);
}
