import React, { useState } from 'react';
import { Settings, User, Globe, Sliders, LogOut, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { getTranslation } from '../utils/translations';

export const SettingsPage = ({ onNavigate }) => {
  const { user, setUser, logout, language, changeLanguage, simpleMode, setSimpleMode } = useAuth();
  const t = (key) => getTranslation(language, key);

  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    village: user?.village || 'Guntur'
  });
  const [savedMsg, setSavedMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setUser({
      ...user,
      full_name: formData.fullName,
      mobile: formData.mobile,
      village: formData.village
    });
    setSavedMsg('Profile settings updated successfully!');
    setTimeout(() => setSavedMsg(''), 2500);
  };

  const handleLogout = () => {
    logout();
    onNavigate('welcome');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={28} color="#16a34a" /> {t('settings')} & {t('profileDetails')}
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b' }}>
          Manage your personal account profile, village location, language, and dashboard settings.
        </p>
      </div>

      {savedMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '12px 18px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {savedMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Profile Information Form (NO MAIN CROP) */}
        <GlassCard style={{ padding: '28px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="#16a34a" /> {t('profileDetails')}
          </h3>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>
                {t('fullName')}
              </label>
              <GlassInput
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>
                {t('emailAddress')} (Read-only)
              </label>
              <GlassInput
                type="email"
                value={formData.email}
                disabled
                style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>
                {t('mobileNumber')}
              </label>
              <GlassInput
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '4px', display: 'block' }}>
                {t('villageLocation')}
              </label>
              <GlassInput
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              />
            </div>

            <PrimaryButton type="submit" style={{ marginTop: '10px' }}>
              <Save size={16} /> {t('saveChanges')}
            </PrimaryButton>
          </form>
        </GlassCard>

        {/* Display Mode & Language & Logout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Display Mode Toggle */}
          <GlassCard style={{ padding: '24px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} color="#16a34a" /> {t('displayMode')}
            </h3>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setSimpleMode(true)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  border: simpleMode ? '2px solid #16a34a' : '1px solid #cbd5e1',
                  background: simpleMode ? '#f0fdf4' : '#ffffff',
                  fontWeight: '700', fontSize: '0.9rem', color: simpleMode ? '#16a34a' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {t('simpleMode')}<br />
                <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#64748b' }}>What's wrong? What to do?</span>
              </button>

              <button
                onClick={() => setSimpleMode(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  border: !simpleMode ? '2px solid #16a34a' : '1px solid #cbd5e1',
                  background: !simpleMode ? '#f0fdf4' : '#ffffff',
                  fontWeight: '700', fontSize: '0.9rem', color: !simpleMode ? '#16a34a' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {t('detailedMode')}<br />
                <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#64748b' }}>Raw AI confidence & metrics</span>
              </button>
            </div>
          </GlassCard>

          {/* Language Preference */}
          <GlassCard style={{ padding: '24px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={20} color="#16a34a" /> {t('interfaceLanguage')}
            </h3>
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="form-input"
              style={{ fontWeight: '700' }}
            >
              <option value="English">English</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
            </select>
          </GlassCard>

          {/* Account Logout */}
          <GlassCard style={{ padding: '24px', background: '#fef2f2', border: '1px solid #fecaca' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#dc2626', marginBottom: '8px' }}>
              Account Session
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '16px' }}>
              Logged in as <strong>{user?.email}</strong>. Logging out will clear your local session.
            </p>
            <button
              onClick={handleLogout}
              style={{
                background: '#dc2626', color: '#ffffff', border: 'none', padding: '12px',
                borderRadius: '12px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%'
              }}
            >
              <LogOut size={18} /> {t('signOut')}
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
