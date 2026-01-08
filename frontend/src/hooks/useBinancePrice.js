import { useState, useEffect, useRef } from 'react';
import binanceService, { POPULAR_PAIRS } from '../services/binanceService';

export function useBinancePrice(symbol) {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    const handlePriceUpdate = (data) => {
      setPriceData(data);
      setLoading(false);
    };

    // Subscribe to price updates
    binanceService.subscribe(symbol, handlePriceUpdate);

    // Check if we already have data
    const existingData = binanceService.getPrice(symbol);
    if (existingData) {
      setPriceData(existingData);
      setLoading(false);
    }

    // Cleanup
    return () => {
      binanceService.unsubscribe(symbol);
    };
  }, [symbol]);

  return { priceData, loading, error };
}

export function useBinancePrices(symbols = POPULAR_PAIRS) {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    setLoading(true);

    // Connect to Binance WebSocket
    binanceService.connect();

    const updatedPrices = {};
    let receivedCount = 0;

    // Subscribe to all symbols
    symbols.forEach(symbol => {
      const handlePriceUpdate = (data) => {
        updatedPrices[symbol] = data;
        setPrices(prev => ({ ...prev, [symbol]: data }));
        
        receivedCount++;
        if (receivedCount === symbols.length) {
          setLoading(false);
        }
      };

      binanceService.subscribe(symbol, handlePriceUpdate);

      // Check if we already have data
      const existingData = binanceService.getPrice(symbol);
      if (existingData) {
        updatedPrices[symbol] = existingData;
        setPrices(prev => ({ ...prev, [symbol]: existingData }));
        receivedCount++;
      }
    });

    // Cleanup
    return () => {
      symbols.forEach(symbol => {
        binanceService.unsubscribe(symbol);
      });
    };
  }, [symbols]);

  return { prices, loading };
}

export { POPULAR_PAIRS };
