import React, { useEffect, useMemo, useState } from 'react';
import { useBinancePrice, useBinancePrices, POPULAR_PAIRS } from '../hooks/useBinancePrice';

export default function CoinSelector({ selectedPair, onPairChange, disabled = false }) {
  const { prices: popularPrices, loading: popularLoading } = useBinancePrices(POPULAR_PAIRS);
  const { priceData: selectedPriceData } = useBinancePrice(selectedPair);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(true);
  const [allPairs, setAllPairs] = useState([]);
  const [symbolsLoading, setSymbolsLoading] = useState(false);

  const prices = useMemo(() => {
    const base = { ...(popularPrices || {}) };
    if (selectedPair && selectedPriceData) base[selectedPair] = selectedPriceData;
    return base;
  }, [popularPrices, selectedPair, selectedPriceData]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setSymbolsLoading(true);
      const controller = new AbortController();
      const timer = setTimeout(() => {
        try { controller.abort(); } catch (e) {}
      }, 8000);
      try {
        const res = await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo', { signal: controller.signal });
        const json = await res.json();
        const list = (json?.symbols || [])
          .filter(s => s && s.status === 'TRADING' && s.quoteAsset === 'USDT' && s.contractType === 'PERPETUAL')
          .map(s => s.symbol)
          .filter(Boolean);
        if (mounted) setAllPairs(list);
      } catch (e) {
        if (mounted) setAllPairs([]);
      } finally {
        clearTimeout(timer);
        if (mounted) setSymbolsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const displayPairs = showAll ? (allPairs.length ? allPairs : POPULAR_PAIRS) : POPULAR_PAIRS;
  const filteredPairs = displayPairs.filter(pair => pair.toLowerCase().includes(searchTerm.toLowerCase()));
  const visiblePairs = filteredPairs.slice(0, 200);

  const getPriceColor = (change) => {
    if (change > 0) return '#4ade80';
    if (change < 0) return '#f87171';
    return '#9aa1aa';
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  const formatChange = (change) => {
    if (!change) return '0.00%';
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  const isLoading = symbolsLoading;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#5da9ff' }}>
        💰 Select Trading Pair
      </h3>

      {/* Current Selection */}
      <div className="glass-panel" style={{ 
        padding: '16px', 
        marginBottom: '20px',
        background: 'rgba(93,169,255,0.1)',
        border: '1px solid rgba(93,169,255,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>
              {selectedPair || 'Select a pair'}
            </div>
            {prices[selectedPair] && (
              <div style={{ fontSize: '14px', color: '#9aa1aa' }}>
                Current Price: {formatPrice(prices[selectedPair].price)}
              </div>
            )}
          </div>
          {prices[selectedPair] && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '700',
                color: getPriceColor(prices[selectedPair].priceChange)
              }}>
                {formatChange(prices[selectedPair].priceChange)}
              </div>
              <div style={{ fontSize: '12px', color: '#9aa1aa' }}>
                24h Change
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search pairs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
        />
      </div>

      {/* Coin Grid */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '12px',
          maxHeight: '350px',
          overflowY: 'auto'
        }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9aa1aa' }}>
              Loading symbols from Binance...
            </div>
          ) : (
            visiblePairs.map(pair => {
              const priceData = prices[pair];
              const isSelected = pair === selectedPair;
              
              return (
                <div
                  key={pair}
                  onClick={() => !disabled && onPairChange(pair)}
                  className="glass-panel"
                  style={{
                    padding: '12px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    border: isSelected ? '2px solid #5da9ff' : '1px solid rgba(255,255,255,0.1)',
                    background: isSelected ? 'rgba(93,169,255,0.15)' : 'rgba(255,255,255,0.05)',
                    transition: 'all 0.3s ease',
                    opacity: disabled ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>
                      {pair.slice(0, -4)}/{pair.slice(-4)}
                    </span>
                    {priceData && (
                      <span style={{ 
                        fontSize: '12px',
                        color: getPriceColor(priceData.priceChange),
                        fontWeight: '600'
                      }}>
                        {formatChange(priceData.priceChange)}
                      </span>
                    )}
                  </div>
                  {priceData && (
                    <div style={{ fontSize: '13px', color: '#cfd3d8' }}>
                      {formatPrice(priceData.price)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        {!isLoading && popularLoading && (
          <div style={{ marginTop: 10, color: '#9aa1aa', fontSize: 12 }}>
            Loading live prices…
          </div>
        )}
        {!isLoading && filteredPairs.length > visiblePairs.length && (
          <div style={{ marginTop: 10, color: '#9aa1aa', fontSize: 12 }}>
            Showing {visiblePairs.length} of {filteredPairs.length} results. Use search to narrow.
          </div>
        )}
      </div>

      {/* Show More/Less */}
      {!searchTerm && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setShowAll(!showAll)}
            className="cta-btn"
            style={{ 
              background: 'transparent',
              border: '1px solid rgba(93,169,255,0.3)',
              color: '#5da9ff'
            }}
          >
            {showAll ? `Show Popular (${POPULAR_PAIRS.length})` : `Show All (${allPairs.length || POPULAR_PAIRS.length})`}
          </button>
        </div>
      )}

      {/* Market Stats */}
      {prices && Object.keys(prices).length > 0 && (
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#5da9ff' }}>
            📊 Market Overview
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {Object.entries(prices).slice(0, 6).map(([pair, data]) => (
              <div key={pair} className="glass-panel" style={{ 
                padding: '8px', 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ fontSize: '12px', color: '#9aa1aa', marginBottom: '4px' }}>
                  {pair.slice(0, -4)}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: getPriceColor(data.priceChange)
                }}>
                  {formatChange(data.priceChange)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
