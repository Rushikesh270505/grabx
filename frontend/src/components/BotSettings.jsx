import React, { useState, useEffect, useRef } from 'react';

export default function BotSettings({ botName, pair, onSettingsChange, disabled = false, initialSettings }) {
  const [settings, setSettings] = useState({
    // Basic Settings
    investment: 100,
    leverage: 1,
    
    // Risk Management
    stopLoss: 2.0,
    takeProfit: 5.0,
    maxDrawdown: 10.0,
    
    // Grid Settings (for Grid Trader)
    gridCount: 20,
    gridSpacing: 0.5,
    gridStepUp: 0.5,
    upperPrice: '',
    lowerPrice: '',
    upperGrid: '',
    lowerGrid: '',
    buyBuffer: 0.5,
    sellBuffer: 0.5,
    
    // Trailing Settings
    trailUp: 0.5,
    trailDown: 0.5,
    
    // Investment
    investmentType: 'USDT', // 'USDT' | 'COIN'
    minInvestment: 50,
    
    // Advanced Settings
    maxPositions: 5,
    positionSize: 10,
    rebalanceInterval: 60,
    trailingStop: 1.0,
    
    // Time Settings
    runTime: '24/7',
    startTime: '00:00',
    endTime: '23:59',
    
    // Notifications
    enableNotifications: true,
    profitThreshold: 5.0,
    lossThreshold: 3.0
  });

  const appliedInitialRef = useRef(false);

  useEffect(() => {
    appliedInitialRef.current = false;
  }, [botName]);

  useEffect(() => {
    if (appliedInitialRef.current) return;
    if (!initialSettings || typeof initialSettings !== 'object') return;
    setSettings(prev => ({ ...prev, ...initialSettings }));
    appliedInitialRef.current = true;
  }, [initialSettings]);

  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const presetConfigs = {
    'Conservative': {
      stopLoss: 1.5,
      takeProfit: 3.0,
      maxDrawdown: 5.0,
      leverage: 1,
      positionSize: 5
    },
    'Balanced': {
      stopLoss: 2.5,
      takeProfit: 5.0,
      maxDrawdown: 10.0,
      leverage: 2,
      positionSize: 10
    },
    'Aggressive': {
      stopLoss: 5.0,
      takeProfit: 10.0,
      maxDrawdown: 20.0,
      leverage: 5,
      positionSize: 20
    }
  };

  const applyPreset = (preset) => {
    setSettings(prev => ({ ...prev, ...presetConfigs[preset] }));
  };

  const isGridBot = botName?.toLowerCase().includes('grid');
  const isScalper = botName?.toLowerCase().includes('scalper');
  const isArbitrage = botName?.toLowerCase().includes('arbitrage');

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '20px', marginBottom: '20px', color: '#5da9ff' }}>
        ⚙️ Bot Configuration
      </h3>

      {/* Preset Configurations */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#9aa1aa' }}>
          Quick Presets
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          {Object.keys(presetConfigs).map(preset => (
            <button
              key={preset}
              onClick={() => applyPreset(preset)}
              disabled={disabled}
              className="cta-btn"
              style={{
                background: 'transparent',
                border: '1px solid rgba(93,169,255,0.3)',
                color: '#5da9ff',
                padding: '8px 16px',
                fontSize: '14px'
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Settings */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#9aa1aa' }}>
          💰 Basic Settings
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                Investment ({settings.investmentType})
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  value={settings.investmentType}
                  onChange={(e) => updateSetting('investmentType', e.target.value)}
                  disabled={disabled}
                  style={{
                    padding: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <option value="USDT">USDT</option>
                  <option value="COIN">Coin</option>
                </select>
                <input
                  type="number"
                  value={settings.investment}
                  onChange={(e) => updateSetting('investment', Number(e.target.value))}
                  disabled={disabled}
                  min="10"
                  max="100000"
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ fontSize: '12px', color: '#9aa1aa', marginTop: '4px' }}>
                Min Required: {settings.minInvestment} {settings.investmentType}
              </div>
            </div>

          {!isArbitrage && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                Leverage: {settings.leverage}x
              </label>
              <input
                type="range"
                value={settings.leverage}
                onChange={(e) => updateSetting('leverage', Number(e.target.value))}
                disabled={disabled}
                min="1"
                max="20"
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Risk Management */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#9aa1aa' }}>
          🛡️ Risk Management
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
              Stop Loss: {settings.stopLoss}%
            </label>
            <input
              type="range"
              value={settings.stopLoss}
              onChange={(e) => updateSetting('stopLoss', Number(e.target.value))}
              disabled={disabled}
              min="0.5"
              max="20"
              step="0.1"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
              Take Profit: {settings.takeProfit}%
            </label>
            <input
              type="range"
              value={settings.takeProfit}
              onChange={(e) => updateSetting('takeProfit', Number(e.target.value))}
              disabled={disabled}
              min="1"
              max="50"
              step="0.1"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
              Max Drawdown: {settings.maxDrawdown}%
            </label>
            <input
              type="range"
              value={settings.maxDrawdown}
              onChange={(e) => updateSetting('maxDrawdown', Number(e.target.value))}
              disabled={disabled}
              min="1"
              max="50"
              step="0.5"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Grid Settings */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#9aa1aa' }}>
          🏗️ Grid Configuration
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
              Upper Grid
            </label>
            <input
              type="number"
              value={settings.upperGrid}
              onChange={(e) => updateSetting('upperGrid', e.target.value)}
              disabled={disabled}
              placeholder="Auto"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
              Lower Grid
            </label>
            <input
              type="number"
              value={settings.lowerGrid}
              onChange={(e) => updateSetting('lowerGrid', e.target.value)}
              disabled={disabled}
              placeholder="Auto"
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
          </div>

          {isGridBot && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                  Grid Count: {settings.gridCount}
                </label>
                <input
                  type="range"
                  value={settings.gridCount}
                  onChange={(e) => updateSetting('gridCount', Number(e.target.value))}
                  disabled={disabled}
                  min="5"
                  max="100"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                  Grid Step Up: {settings.gridStepUp}%
                </label>
                <input
                  type="range"
                  value={settings.gridStepUp}
                  onChange={(e) => updateSetting('gridStepUp', Number(e.target.value))}
                  disabled={disabled}
                  min="0.1"
                  max="5"
                  step="0.1"
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Buy/Sell Buffers */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#9aa1aa' }}>
          📊 Buy/Sell Buffers
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
              Buy Buffer: {settings.buyBuffer}%
            </label>
            <input
              type="range"
              value={settings.buyBuffer}
              onChange={(e) => updateSetting('buyBuffer', Number(e.target.value))}
              disabled={disabled}
              min="0.1"
              max="5"
              step="0.1"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
              Sell Buffer: {settings.sellBuffer}%
            </label>
            <input
              type="range"
              value={settings.sellBuffer}
              onChange={(e) => updateSetting('sellBuffer', Number(e.target.value))}
              disabled={disabled}
              min="0.1"
              max="5"
              step="0.1"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Trailing Settings */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#9aa1aa' }}>
          🎯 Trailing Settings
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
              Trail Up: {settings.trailUp}%
            </label>
            <input
              type="range"
              value={settings.trailUp}
              onChange={(e) => updateSetting('trailUp', Number(e.target.value))}
              disabled={disabled}
              min="0.1"
              max="10"
              step="0.1"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
              Trail Down: {settings.trailDown}%
            </label>
            <input
              type="range"
              value={settings.trailDown}
              onChange={(e) => updateSetting('trailDown', Number(e.target.value))}
              disabled={disabled}
              min="0.1"
              max="10"
              step="0.1"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#9aa1aa' }}>
          🔧 Advanced Settings
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
              Max Positions: {settings.maxPositions}
            </label>
            <input
              type="range"
              value={settings.maxPositions}
              onChange={(e) => updateSetting('maxPositions', Number(e.target.value))}
              disabled={disabled}
              min="1"
              max="20"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
              Position Size: {settings.positionSize}%
            </label>
            <input
              type="range"
              value={settings.positionSize}
              onChange={(e) => updateSetting('positionSize', Number(e.target.value))}
              disabled={disabled}
              min="1"
              max="100"
              style={{ width: '100%' }}
            />
          </div>

          {!isScalper && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                Trailing Stop: {settings.trailingStop}%
              </label>
              <input
                type="range"
                value={settings.trailingStop}
                onChange={(e) => updateSetting('trailingStop', Number(e.target.value))}
                disabled={disabled}
                min="0.1"
                max="10"
                step="0.1"
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Time Settings */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#9aa1aa' }}>
          ⏰ Time Settings
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
              Run Time
            </label>
            <select
              value={settings.runTime}
              onChange={(e) => updateSetting('runTime', e.target.value)}
              disabled={disabled}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
            >
              <option value="24/7">24/7</option>
              <option value="custom">Custom Hours</option>
              <option value="market">Market Hours Only</option>
            </select>
          </div>

          {settings.runTime === 'custom' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                  Start Time
                </label>
                <input
                  type="time"
                  value={settings.startTime}
                  onChange={(e) => updateSetting('startTime', e.target.value)}
                  disabled={disabled}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                  End Time
                </label>
                <input
                  type="time"
                  value={settings.endTime}
                  onChange={(e) => updateSetting('endTime', e.target.value)}
                  disabled={disabled}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#9aa1aa' }}>
          🔔 Notifications
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cfd3d8', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => updateSetting('enableNotifications', e.target.checked)}
                disabled={disabled}
                style={{ width: '16px', height: '16px' }}
              />
              Enable Notifications
            </label>
          </div>

          {settings.enableNotifications && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                  Profit Alert: {settings.profitThreshold}%
                </label>
                <input
                  type="range"
                  value={settings.profitThreshold}
                  onChange={(e) => updateSetting('profitThreshold', Number(e.target.value))}
                  disabled={disabled}
                  min="1"
                  max="50"
                  step="0.5"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                  Loss Alert: {settings.lossThreshold}%
                </label>
                <input
                  type="range"
                  value={settings.lossThreshold}
                  onChange={(e) => updateSetting('lossThreshold', Number(e.target.value))}
                  disabled={disabled}
                  min="1"
                  max="20"
                  step="0.5"
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
