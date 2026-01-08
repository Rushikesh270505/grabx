import React, { useState, useEffect } from 'react';
import { auth } from '../services/auth';

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState('');
  const [syncingWallet, setSyncingWallet] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'spot',
    exchange: 'binance',
    apiKey: '',
    secretKey: '',
    passphrase: ''
  });

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const response = await auth.get('/wallets');
      setWallets(response.data);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      setMessage('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await auth.post('/wallets', formData);
      setMessage('Wallet created successfully!');
      setShowCreateForm(false);
      setFormData({
        name: '',
        type: 'spot',
        exchange: 'binance',
        apiKey: '',
        secretKey: '',
        passphrase: ''
      });
      fetchWallets();
    } catch (error) {
      console.error('Failed to create wallet:', error);
      setMessage('Failed to create wallet');
    }
  };

  const handleSync = async (walletId) => {
    setSyncingWallet(walletId);
    try {
      await auth.post(`/wallets/${walletId}/sync`);
      setMessage('Wallet synced successfully!');
      fetchWallets();
    } catch (error) {
      console.error('Failed to sync wallet:', error);
      setMessage('Failed to sync wallet');
    } finally {
      setSyncingWallet(null);
    }
  };

  const handleDelete = async (walletId) => {
    if (!window.confirm('Are you sure you want to delete this wallet?')) {
      return;
    }

    try {
      await auth.delete(`/wallets/${walletId}`);
      setMessage('Wallet deleted successfully!');
      fetchWallets();
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      setMessage('Failed to delete wallet');
    }
  };

  const toggleWalletStatus = async (walletId, currentStatus) => {
    try {
      await auth.put(`/wallets/${walletId}`, { isActive: !currentStatus });
      setMessage(`Wallet ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchWallets();
    } catch (error) {
      console.error('Failed to update wallet status:', error);
      setMessage('Failed to update wallet status');
    }
  };

  const formatBalance = (balance) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(balance);
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading wallets...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', color: '#fff' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginTop: 0, marginBottom: '8px' }}>Wallets</h1>
          <p style={{ color: '#9aa1aa', marginTop: 0 }}>Manage your exchange wallets and trading accounts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="cta-btn"
          style={{ fontSize: '16px', padding: '12px 24px' }}
        >
          + Add Wallet
        </button>
      </div>

      {message && (
        <div className="glass-panel" style={{ 
          padding: '12px', 
          marginBottom: '24px',
          background: message.includes('success') ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
          border: `1px solid ${message.includes('success') ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`
        }}>
          {message}
        </div>
      )}

      {/* Create Wallet Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: '32px', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#5da9ff' }}>Add New Wallet</h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                    Wallet Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                      Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
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
                      <option value="spot">Spot</option>
                      <option value="futures">Futures</option>
                      <option value="margin">Margin</option>
                      <option value="savings">Savings</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                      Exchange
                    </label>
                    <select
                      name="exchange"
                      value={formData.exchange}
                      onChange={handleInputChange}
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
                      <option value="binance">Binance</option>
                      <option value="coinbase">Coinbase</option>
                      <option value="kraken">Kraken</option>
                      <option value="kucoin">KuCoin</option>
                      <option value="bybit">Bybit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                    API Key
                  </label>
                  <input
                    type="password"
                    name="apiKey"
                    value={formData.apiKey}
                    onChange={handleInputChange}
                    required
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
                    Secret Key
                  </label>
                  <input
                    type="password"
                    name="secretKey"
                    value={formData.secretKey}
                    onChange={handleInputChange}
                    required
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

                {formData.exchange === 'coinbase' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                      Passphrase
                    </label>
                    <input
                      type="password"
                      name="passphrase"
                      value={formData.passphrase}
                      onChange={handleInputChange}
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
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="submit"
                  className="cta-btn"
                  style={{ flex: 1 }}
                >
                  Create Wallet
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="cta-btn"
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wallets Grid */}
      {wallets.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', color: '#9aa1aa', marginBottom: '16px' }}>
            No wallets yet
          </div>
          <p style={{ color: '#9aa1aa', marginBottom: '24px' }}>
            Add your first wallet to start trading
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="cta-btn"
          >
            + Add Your First Wallet
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {wallets.map(wallet => (
            <div key={wallet._id} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{wallet.name}</h3>
                  <div style={{ color: '#9aa1aa', fontSize: '14px', marginTop: '4px' }}>
                    {wallet.exchange.toUpperCase()} • {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    background: wallet.isActive ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                    color: wallet.isActive ? '#4ade80' : '#f87171',
                    border: `1px solid ${wallet.isActive ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`
                  }}>
                    {wallet.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#5da9ff' }}>
                  {formatBalance(wallet.totalBalanceUSD)}
                </div>
                <div style={{ color: '#9aa1aa', fontSize: '12px' }}>
                  Total Balance
                </div>
              </div>

              {wallet.balances && wallet.balances.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: '#9aa1aa', fontSize: '12px', marginBottom: '8px' }}>
                    Top Assets
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {wallet.balances.slice(0, 3).map((balance, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: '#9aa1aa' }}>{balance.asset}</span>
                        <span>{balance.free.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wallet.lastSync && (
                <div style={{ color: '#9aa1aa', fontSize: '11px', marginBottom: '16px' }}>
                  Last sync: {new Date(wallet.lastSync).toLocaleString()}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleSync(wallet._id)}
                  disabled={syncingWallet === wallet._id}
                  className="cta-btn"
                  style={{ 
                    fontSize: '12px', 
                    padding: '6px 12px',
                    opacity: syncingWallet === wallet._id ? 0.6 : 1
                  }}
                >
                  {syncingWallet === wallet._id ? 'Syncing...' : 'Sync'}
                </button>
                <button
                  onClick={() => toggleWalletStatus(wallet._id, wallet.isActive)}
                  className="cta-btn"
                  style={{ 
                    fontSize: '12px', 
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {wallet.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(wallet._id)}
                  className="cta-btn"
                  style={{ 
                    fontSize: '12px', 
                    padding: '6px 12px',
                    background: 'transparent',
                    border: '1px solid rgba(248, 113, 113, 0.3)',
                    color: '#f87171'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wallets;
