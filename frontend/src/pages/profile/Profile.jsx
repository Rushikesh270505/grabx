import React, { useState, useEffect } from 'react';
import { auth } from '../services/auth';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const [formData, setFormData] = useState({
    'profile.firstName': '',
    'profile.lastName': '',
    'profile.bio': '',
    'profile.phone': '',
    'profile.country': '',
    'profile.timezone': '',
    'preferences.theme': 'dark',
    'preferences.language': 'en',
    'preferences.notifications.email': true,
    'preferences.notifications.push': true,
    'preferences.notifications.trading': true,
    'preferences.notifications.priceAlerts': true
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await auth.get('/users/profile');
      setUser(response.data);
      
      // Populate form data
      setFormData({
        'profile.firstName': response.data.profile?.firstName || '',
        'profile.lastName': response.data.profile?.lastName || '',
        'profile.bio': response.data.profile?.bio || '',
        'profile.phone': response.data.profile?.phone || '',
        'profile.country': response.data.profile?.country || '',
        'profile.timezone': response.data.profile?.timezone || '',
        'preferences.theme': response.data.preferences?.theme || 'dark',
        'preferences.language': response.data.preferences?.language || 'en',
        'preferences.notifications.email': response.data.preferences?.notifications?.email ?? true,
        'preferences.notifications.push': response.data.preferences?.notifications?.push ?? true,
        'preferences.notifications.trading': response.data.preferences?.notifications?.trading ?? true,
        'preferences.notifications.priceAlerts': response.data.preferences?.notifications?.priceAlerts ?? true
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setMessage('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await auth.put('/users/profile', formData);
      setMessage('Profile updated successfully!');
      fetchProfile(); // Refresh data
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      const response = await auth.post('/users/avatar');
      setMessage('Avatar updated successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setMessage('Failed to upload avatar');
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', color: '#fff' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginTop: 0, marginBottom: '8px' }}>Profile Settings</h1>
        <p style={{ color: '#9aa1aa', marginTop: 0 }}>Manage your account settings and preferences</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px' }}>
        {/* Sidebar */}
        <div>
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'profile', label: 'Profile Info', icon: '👤' },
                { id: 'preferences', label: 'Preferences', icon: '⚙️' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' },
                { id: 'security', label: 'Security', icon: '🔒' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px',
                    background: activeTab === tab.id ? 'rgba(93, 169, 255, 0.2)' : 'transparent',
                    border: activeTab === tab.id ? '1px solid rgba(93, 169, 255, 0.3)' : '1px solid transparent',
                    borderRadius: '8px',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#5da9ff' }}>Profile Information</h3>
                
                {/* Avatar */}
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <img 
                      src={user?.profile?.avatar || `https://ui-avatars.com/api/?name=${user?.username}&background=random`}
                      alt="Avatar"
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%',
                        border: '3px solid rgba(93, 169, 255, 0.3)'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAvatarUpload}
                    className="cta-btn"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    Change Avatar
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="profile.firstName"
                      value={formData['profile.firstName']}
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

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="profile.lastName"
                      value={formData['profile.lastName']}
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

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="profile.phone"
                      value={formData['profile.phone']}
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

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                      Country
                    </label>
                    <input
                      type="text"
                      name="profile.country"
                      value={formData['profile.country']}
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
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                    Bio
                  </label>
                  <textarea
                    name="profile.bio"
                    value={formData['profile.bio']}
                    onChange={handleInputChange}
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button
                    type="submit"
                    className="cta-btn"
                    disabled={saving}
                    style={{ fontSize: '16px', padding: '12px 24px' }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'preferences' && (
              <form onSubmit={handleSubmit}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#5da9ff' }}>Preferences</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                      Theme
                    </label>
                    <select
                      name="preferences.theme"
                      value={formData['preferences.theme']}
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
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#cfd3d8', fontSize: '14px' }}>
                      Language
                    </label>
                    <select
                      name="preferences.language"
                      value={formData['preferences.language']}
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
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button
                    type="submit"
                    className="cta-btn"
                    disabled={saving}
                    style={{ fontSize: '16px', padding: '12px 24px' }}
                  >
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'notifications' && (
              <form onSubmit={handleSubmit}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#5da9ff' }}>Notification Settings</h3>
                
                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    { key: 'email', label: 'Email Notifications', name: 'preferences.notifications.email' },
                    { key: 'push', label: 'Push Notifications', name: 'preferences.notifications.push' },
                    { key: 'trading', label: 'Trading Alerts', name: 'preferences.notifications.trading' },
                    { key: 'priceAlerts', label: 'Price Alerts', name: 'preferences.notifications.priceAlerts' }
                  ].map(notification => (
                    <div key={notification.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        name={notification.name}
                        checked={formData[notification.name]}
                        onChange={handleInputChange}
                        style={{ width: '20px', height: '20px' }}
                      />
                      <label style={{ color: '#cfd3d8', fontSize: '14px', margin: 0 }}>
                        {notification.label}
                      </label>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button
                    type="submit"
                    className="cta-btn"
                    disabled={saving}
                    style={{ fontSize: '16px', padding: '12px 24px' }}
                  >
                    {saving ? 'Saving...' : 'Save Notification Settings'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#5da9ff' }}>Security Settings</h3>
                
                <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '12px', color: '#9aa1aa' }}>Two-Factor Authentication</h4>
                  <p style={{ color: '#9aa1aa', marginBottom: '12px' }}>
                    {user?.security?.twoFactorEnabled ? '2FA is enabled' : '2FA is not enabled'}
                  </p>
                  <button className="cta-btn" style={{ fontSize: '14px' }}>
                    {user?.security?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>

                <div className="glass-panel" style={{ padding: '16px' }}>
                  <h4 style={{ marginTop: 0, marginBottom: '12px', color: '#9aa1aa' }}>Change Password</h4>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <input
                      type="password"
                      placeholder="Current Password"
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
                    <input
                      type="password"
                      placeholder="New Password"
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
                    <input
                      type="password"
                      placeholder="Confirm New Password"
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
                  <button className="cta-btn" style={{ fontSize: '14px', marginTop: '12px' }}>
                    Update Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
