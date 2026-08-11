import React from 'react';
import { Sprout, Sun, TrendingUp, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { getTranslation } from '../utils/translations';

export const WelcomePage = ({ onNavigate }) => {
  const { language, changeLanguage } = useAuth();
  const t = (key) => getTranslation(language, key);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.45)), url('/images/landing_bg.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      color: '#ffffff',
      position: 'relative',
      fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Top Header Nav */}
      <header style={{
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ cursor: 'pointer' }} onClick={() => onNavigate('welcome')}>
          <img src="/images/farmiq_logo.svg" alt="FarmIQ Logo" style={{ height: '52px', width: 'auto', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)' }}>
            <Globe size={16} color="#84cc16" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#ffffff', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
            >
              <option value="English" style={{ color: '#0f172a' }}>EN</option>
              <option value="Telugu" style={{ color: '#0f172a' }}>TE</option>
              <option value="Hindi" style={{ color: '#0f172a' }}>HI</option>
            </select>
          </div>

          <button 
            onClick={() => onNavigate('login')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '8px 16px'
            }}
          >
            {t('signIn')}
          </button>
          <button 
            onClick={() => onNavigate('signup')}
            style={{
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '1rem',
              fontWeight: '700',
              padding: '10px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 255, 255, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {t('signUp')}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 48px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        marginTop: '20px',
        marginBottom: '40px'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(12px)',
            padding: '6px 16px',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '20px',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <ShieldCheck size={16} color="#84cc16" /> AI-Powered Agriculture Assistant
          </div>

          <h1 style={{
            fontSize: '4rem',
            fontWeight: '800',
            lineHeight: 1.1,
            marginBottom: '16px',
            letterSpacing: '-1px'
          }}>
            Farm<span style={{ color: '#84cc16' }}>IQ</span>
          </h1>

          <h2 style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '16px'
          }}>
            {t('tagline')}
          </h2>

          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: '36px',
            lineHeight: 1.6
          }}>
            {t('heroDesc')}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <PrimaryButton 
              onClick={() => onNavigate('signup')}
              style={{
                fontSize: '1.1rem',
                padding: '14px 32px',
                borderRadius: '14px',
                boxShadow: '0 8px 24px rgba(22, 163, 74, 0.4)'
              }}
            >
              {t('getStarted')}
            </PrimaryButton>

            <button 
              onClick={() => onNavigate('login')}
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(12px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                padding: '14px 28px',
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {t('alreadyAccount')}
            </button>
          </div>
        </div>

        {/* 3 Feature Glass Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginTop: '64px',
          width: '100%'
        }}>
          <GlassCard style={{
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.32)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
          }}>
            <div style={{
              background: 'rgba(132, 204, 22, 0.22)',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Sprout size={26} color="#a3e635" style={{ filter: 'drop-shadow(0 0 4px rgba(163, 230, 53, 0.6))' }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>{t('smartInsightsTitle')}</h3>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.5 }}>
              {t('smartInsightsDesc')}
            </p>
          </GlassCard>

          <GlassCard style={{
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.32)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
          }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.2)',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Sun size={26} color="#fcd34d" style={{ filter: 'drop-shadow(0 0 4px rgba(252, 211, 77, 0.65))' }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>{t('weatherIntelTitle')}</h3>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.5 }}>
              {t('weatherIntelDesc')}
            </p>
          </GlassCard>

          <GlassCard style={{
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.32)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
          }}>
            <div style={{
              background: 'rgba(56, 189, 248, 0.2)',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <TrendingUp size={26} color="#7dd3fc" style={{ filter: 'drop-shadow(0 0 4px rgba(125, 211, 252, 0.6))' }} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>{t('betterProdTitle')}</h3>
            <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.5 }}>
              {t('betterProdDesc')}
            </p>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};
