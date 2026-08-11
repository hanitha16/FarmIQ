import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sprout, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { getTranslation } from '../utils/translations';

export const LoginPage = ({ onNavigate }) => {
  const { loginUser, language } = useAuth();
  const t = (key) => getTranslation(language, key);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email address and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Invalid email or password.');
      }

      loginUser(data.token, data.user);
      setIsTransitioning(true);

      setTimeout(() => {
        onNavigate('dashboard');
      }, 1600);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotMessage(`Password reset instructions sent to ${forgotEmail}. Please check your inbox.`);
  };

  if (isTransitioning) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontFamily: "'Outfit', sans-serif"
      }} className="animate-fade-in">
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          padding: '16px',
          borderRadius: '20px',
          marginBottom: '20px'
        }}>
          <Sprout size={48} color="#84cc16" />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>
          Farm<span style={{ color: '#84cc16' }}>IQ</span>
        </h2>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '12px' }}>
          {t('welcomeBack')}!
        </h3>
        <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Preparing your farm intelligence...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.55)), url('/images/login_bg.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <GlassCard style={{
        maxWidth: '460px',
        width: '100%',
        padding: '36px 32px',
        background: 'rgba(255, 255, 255, 0.88)'
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <img src="/images/farmiq_logo.svg" alt="FarmIQ Logo" style={{ height: '48px', width: 'auto' }} />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', textAlign: 'center', marginBottom: '4px' }}>
          {t('welcomeBack')}
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', textAlign: 'center', marginBottom: '24px' }}>
          {t('signInSub')}
        </p>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email */}
          <GlassInput
            icon={Mail}
            type="email"
            name="email"
            placeholder={t('emailAddress')}
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Password */}
          <GlassInput
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder={t('password')}
            value={formData.password}
            onChange={handleChange}
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
              </button>
            }
          />

          {/* Remember Me & Forgot Password */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#475569' }}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                style={{ accentColor: '#16a34a', width: '16px', height: '16px' }}
              />
              {t('rememberMe')}
            </label>

            <span
              onClick={() => setForgotModalOpen(true)}
              style={{ color: '#16a34a', fontWeight: '600', cursor: 'pointer' }}
            >
              {t('forgotPassword')}
            </span>
          </div>

          <PrimaryButton
            type="submit"
            loading={loading}
            style={{ width: '100%', marginTop: '8px', padding: '14px' }}
          >
            {t('signIn')}
          </PrimaryButton>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '24px' }}>
          {t('dontHaveAccount')}{' '}
          <span
            onClick={() => onNavigate('signup')}
            style={{ color: '#16a34a', fontWeight: '700', cursor: 'pointer' }}
          >
            {t('signUp')}
          </span>
        </p>
      </GlassCard>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }}>
          <GlassCard style={{ maxWidth: '400px', width: '100%', padding: '24px', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Reset Password</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px' }}>
              Enter your registered email address and we'll send you password recovery instructions.
            </p>

            {forgotMessage ? (
              <div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '12px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '16px' }}>
                  {forgotMessage}
                </div>
                <PrimaryButton style={{ width: '100%' }} onClick={() => { setForgotModalOpen(false); setForgotMessage(''); }}>
                  Close
                </PrimaryButton>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <GlassInput
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={{ marginBottom: '16px' }}
                  required
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-secondary" onClick={() => setForgotModalOpen(false)}>
                    Cancel
                  </button>
                  <PrimaryButton type="submit">
                    Send Reset Link
                  </PrimaryButton>
                </div>
              </form>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
};
