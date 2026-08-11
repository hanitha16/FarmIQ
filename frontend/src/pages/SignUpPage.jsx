import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, MapPin, Sprout, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { getTranslation } from '../utils/translations';

export const SignUpPage = ({ onNavigate }) => {
  const { loginUser, language } = useAuth();
  const t = (key) => getTranslation(language, key);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    village: 'Guntur'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic live password requirements checklist
  const pw = formData.password;
  const reqs = {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pw)
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!reqs.length || !reqs.uppercase || !reqs.number || !reqs.special) {
      setError('Password does not meet all requirement criteria.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Send signup request without main_crop requirement
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          village: formData.village
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Signup failed. Please try again.');
      }

      setSuccess('Account created successfully! Redirecting to sign in...');
      
      setTimeout(() => {
        onNavigate('login');
      }, 1400);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.55)), url('/images/signup_bg.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <GlassCard style={{
        maxWidth: '500px',
        width: '100%',
        padding: '36px 32px',
        background: 'rgba(255, 255, 255, 0.88)'
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <img src="/images/farmiq_logo.svg" alt="FarmIQ Logo" style={{ height: '48px', width: 'auto' }} />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', textAlign: 'center', marginBottom: '4px' }}>
          {t('createAccount')}
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', textAlign: 'center', marginBottom: '24px' }}>
          {t('signUpSub')}
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

        {success && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.9rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={18} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Full Name */}
          <GlassInput
            icon={User}
            type="text"
            name="fullName"
            placeholder={t('fullName')}
            value={formData.fullName}
            onChange={handleChange}
            required
          />

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

          {/* Mobile */}
          <GlassInput
            icon={Phone}
            type="tel"
            name="mobile"
            placeholder={t('mobileNumber')}
            value={formData.mobile}
            onChange={handleChange}
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

          {/* Confirm Password */}
          <GlassInput
            icon={Lock}
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder={t('confirmPassword')}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showConfirmPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
              </button>
            }
          />

          {/* Password requirements checklist */}
          <div style={{
            background: 'rgba(241, 245, 249, 0.85)',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px'
          }}>
            <div style={{ color: reqs.length ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} color={reqs.length ? '#16a34a' : '#cbd5e1'} /> 8+ characters
            </div>
            <div style={{ color: reqs.uppercase ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} color={reqs.uppercase ? '#16a34a' : '#cbd5e1'} /> Uppercase letter
            </div>
            <div style={{ color: reqs.number ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} color={reqs.number ? '#16a34a' : '#cbd5e1'} /> Number
            </div>
            <div style={{ color: reqs.special ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} color={reqs.special ? '#16a34a' : '#cbd5e1'} /> Special character
            </div>
          </div>

          {/* Village / Location Input ONLY (NO MAIN CROP) */}
          <GlassInput
            icon={MapPin}
            type="text"
            name="village"
            placeholder={t('villageLocation')}
            value={formData.village}
            onChange={handleChange}
          />

          <PrimaryButton
            type="submit"
            loading={loading}
            style={{ width: '100%', marginTop: '8px', padding: '14px' }}
          >
            {t('signUp')}
          </PrimaryButton>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#64748b', marginTop: '20px' }}>
          {t('alreadyAccount')}{' '}
          <span
            onClick={() => onNavigate('login')}
            style={{ color: '#16a34a', fontWeight: '700', cursor: 'pointer' }}
          >
            {t('signIn')}
          </span>
        </p>
      </GlassCard>
    </div>
  );
};
