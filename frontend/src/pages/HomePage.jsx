import React, { useState, useEffect } from 'react';
import {
  Sprout,
  ShieldAlert,
  CloudSun,
  Droplet,
  Zap,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Bell,
  Activity,
  MapPin,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';

const C = {
  text: '#17352B',
  heading: '#12372A',
  muted: '#71857D',
  softMuted: '#94A59E',

  green: '#18A878',
  greenDark: '#087A55',
  greenLight: '#DDF7EC',
  greenSoft: '#EFFBF5',

  white: '#FFFFFF',
  page: '#F7FBF9',
  border: '#DDEDE5',

  yellow: '#D89A16',
  yellowBg: '#FFF8E7',

  blue: '#2587C7',
  blueBg: '#EEF8FE',

  purple: '#8767C5',
  purpleBg: '#F4F0FC',

  red: '#DC6B6B',
};

export const HomePage = ({ onNavigate }) => {
  const { user, language } = useAuth();

  const t = (key) => getTranslation(language, key);

  const [currentBanner, setCurrentBanner] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  /* =====================================================
     BANNERS
  ====================================================== */

  const banners = [
    {
      id: 1,
      title: 'Check Your Crop',
      text: 'See changes in your crop early. Take a clear photo to understand what may be wrong.',
      cta: 'Scan Crop',
      nav: 'scanner',
      badge: '📷 AI Scanner',
      image: '/images/farm_banner_1.jpg',
    },
    {
      id: 2,
      title: 'Plan With the Weather',
      text: 'Know the weather before you start important farm activities.',
      cta: 'View Weather',
      nav: 'weather',
      badge: '🌦️ Weather Intelligence',
      image: '/images/farm_banner_2.jpg',
    },
    {
      id: 3,
      title: 'Act at the Right Time',
      text: 'Use weather intelligence to choose the best time for farm work.',
      cta: 'Check Act Now',
      nav: 'actnow',
      badge: '⚡ Act Now',
      image: '/images/farm_banner_3.jpg',
    },
    {
      id: 4,
      title: 'Keep Your Crop Healthy',
      text: 'Monitor your crop regularly for disease, pests and water stress.',
      cta: 'Check Crop Health',
      nav: 'scanner',
      badge: '🌱 Crop Health',
      image: '/images/farm_banner_4.jpg',
    },
    {
      id: 5,
      title: 'Plan Ahead',
      text: 'Prepare your farm activities using your upcoming weather and crop plan.',
      cta: 'Open Farm Planner',
      nav: 'planner',
      badge: '📅 Farm Planning',
      image: '/images/farm_banner_5.jpg',
    },
  ];

  /* =====================================================
     AUTO SLIDER
  ====================================================== */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((p) => (p + 1) % banners.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [banners.length]);

  /* =====================================================
     WEATHER
  ====================================================== */

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `/api/weather?location=${encodeURIComponent(
            user?.village || 'Guntur'
          )}`
        );

        if (res.ok) {
          const data = await res.json();
          setWeatherData(data);
        }
      } catch (error) {
        console.log('Weather unavailable');
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [user]);

  const b = banners[currentBanner];

  /* =====================================================
     STATUS CARDS
  ====================================================== */

  const statusCards = [
    {
      label: t('cropHealth'),
      value: '82%',
      sub: 'Healthy Canopy',
      icon: Sprout,
      color: C.green,
      bg: C.greenLight,
      trend: '+6%',
    },
    {
      label: t('diseaseRisk'),
      value: '24%',
      sub: 'Low Risk',
      icon: ShieldAlert,
      color: C.yellow,
      bg: C.yellowBg,
      trend: 'Low',
    },
    {
      label: t('weatherRisk'),
      value: '18%',
      sub: 'Clear Conditions',
      icon: CloudSun,
      color: C.blue,
      bg: C.blueBg,
      trend: 'Stable',
    },
    {
      label: t('waterRisk'),
      value: '28%',
      sub: 'Moderate Moisture',
      icon: Droplet,
      color: C.purple,
      bg: C.purpleBg,
      trend: 'Monitor',
    },
  ];

  return (
    <div className="farm-home">

      {/* =====================================================
          SOFT BACKGROUND
      ====================================================== */}

      <div className="soft-orb orb-one" />
      <div className="soft-orb orb-two" />

      {/* =====================================================
          HEADER / GREETING
      ====================================================== */}

      <section className="home-header">
        <div className="home-header-content">

          <div className="eyebrow">
            <Activity size={15} />
            FARM INTELLIGENCE
          </div>

          <h1>
            {t('goodMorning')},{' '}
            <span>{user?.full_name || 'Farmer'}</span>
            <span className="wave">👋</span>
          </h1>

          <p className="location-text">
            <MapPin size={16} />

            <span className="location-name">
              {user?.village || 'Guntur Village'}
            </span>

            <span className="location-separator">•</span>

            <span className="location-dashboard">
              {t('dashboardTitle')}
            </span>
          </p>

        </div>

        {weatherData?.demo_mode && (
          <div className="demo-badge">
            <span />
            Demo Weather
          </div>
        )}
      </section>

      {/* =====================================================
          HERO BANNER
      ====================================================== */}

      <section className="hero-wrapper">

        <div
          className="hero-banner"
          style={{
            backgroundImage: `
              linear-gradient(
                90deg,
                rgba(0, 35, 25, 0.72) 0%,
                rgba(0, 35, 25, 0.52) 35%,
                rgba(0, 35, 25, 0.20) 65%,
                rgba(0, 35, 25, 0.04) 100%
              ),
              url('${b.image}')
            `,
          }}
        >

          <div className="hero-content">

            <div className="hero-badge">
              <span className="badge-dot" />
              <span>{b.badge}</span>
            </div>

            <h2>{b.title}</h2>

            <p>{b.text}</p>

            <button
              className="hero-button"
              onClick={() => onNavigate(b.nav)}
            >
              {b.cta}
              <ArrowRight size={17} />
            </button>

          </div>

          {/* LEFT ARROW */}

          <button
            className="hero-arrow hero-left"
            onClick={() =>
              setCurrentBanner(
                (p) => (p - 1 + banners.length) % banners.length
              )
            }
            aria-label="Previous banner"
          >
            <ChevronLeft size={20} />
          </button>

          {/* RIGHT ARROW */}

          <button
            className="hero-arrow hero-right"
            onClick={() =>
              setCurrentBanner((p) => (p + 1) % banners.length)
            }
            aria-label="Next banner"
          >
            <ChevronRight size={20} />
          </button>

        </div>

        {/* SLIDER DOTS */}

        <div className="slider-dots">
          {banners.map((_, index) => (
            <button
              key={index}
              className={
                index === currentBanner
                  ? 'slider-dot active'
                  : 'slider-dot'
              }
              onClick={() => setCurrentBanner(index)}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>

      </section>

      {/* =====================================================
          QUICK STATUS
      ====================================================== */}

      <section>

        <div className="section-heading">

          <div>
            <span className="section-kicker">
              OVERVIEW
            </span>

            <h3>{t('quickStatus')}</h3>
          </div>

          <button
            className="text-button"
            onClick={() => onNavigate('history')}
          >
            View Details
            <ArrowRight size={15} />
          </button>

        </div>

        <div className="status-grid">

          {statusCards.map(
            ({
              label,
              value,
              sub,
              icon: Icon,
              color,
              bg,
              trend,
            }) => (
              <div
                className="status-card"
                key={label}
              >

                <div className="status-top">

                  <div
                    className="status-icon"
                    style={{
                      background: bg,
                      color,
                    }}
                  >
                    <Icon size={19} />
                  </div>

                  <span
                    className="status-trend"
                    style={{
                      color,
                      background: bg,
                    }}
                  >
                    {trend}
                  </span>

                </div>

                <div
                  className="status-value"
                  style={{ color }}
                >
                  {value}
                </div>

                <div className="status-label">
                  {label}
                </div>

                <div className="status-sub">
                  {sub}
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: value,
                      background: color,
                    }}
                  />
                </div>

              </div>
            )
          )}

        </div>

      </section>

      {/* =====================================================
          ACT NOW
      ====================================================== */}

      <section className="act-now-card">

        <div className="act-content">

          <div className="act-title">

            <div className="act-icon">
              <Zap size={19} />
            </div>

            <div>
              <span>SMART DECISION</span>
              <h3>{t('actNowScore')}</h3>
            </div>

          </div>

          <div className="score-row">

            <strong>
              {loadingWeather
                ? '—'
                : weatherData?.act_now_score || 87}
            </strong>

            <span>/100</span>

            <div className="score-status">
              <span />
              {t('goodTimeToAct')}
            </div>

          </div>

          <p className="act-description">
            <strong>{t('why')}:</strong>{' '}
            {weatherData?.act_now_rationale ||
              'Weather conditions are currently favorable and rain risk is low.'}
          </p>

          <div className="action-window">

            <Calendar size={16} />

            <span>
              {t('bestActionWindow')}:
            </span>

            <strong>
              {weatherData?.best_action_window ||
                'Tomorrow • 7:00 AM – 10:00 AM'}
            </strong>

          </div>

        </div>

        <button
          className="analysis-button"
          onClick={() => onNavigate('actnow')}
        >
          Full Analysis
          <ArrowRight size={17} />
        </button>

      </section>

      {/* =====================================================
          LOWER CARDS
      ====================================================== */}

      <section className="bottom-grid">

        {/* SMART ALERTS */}

        <div className="premium-card">

          <div className="card-heading">

            <div className="heading-icon warning">
              <Bell size={17} />
            </div>

            <div>
              <span>MONITORING</span>
              <h3>Smart Alerts</h3>
            </div>

            <button
              onClick={() => onNavigate('alerts')}
            >
              View All
            </button>

          </div>

          <div className="alerts-list">

            <div className="alert-item success">

              <div className="alert-indicator">
                <Zap size={15} />
              </div>

              <div>
                <strong>
                  Good Spraying Window Tomorrow
                </strong>

                <p>
                  Optimal weather 7 AM–10 AM.
                  Act Now Score: 87/100.
                </p>
              </div>

            </div>

            <div className="alert-item warning">

              <div className="alert-indicator">
                <ShieldAlert size={15} />
              </div>

              <div>
                <strong>
                  Leaf Blast Humidity Warning
                </strong>

                <p>
                  High night humidity may increase
                  crop disease risk.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* 7 DAY PLAN */}

        <div className="premium-card">

          <div className="card-heading">

            <div className="heading-icon">
              <Calendar size={17} />
            </div>

            <div>
              <span>UPCOMING</span>
              <h3>7-Day Farm Plan</h3>
            </div>

            <button
              onClick={() => onNavigate('planner')}
            >
              Open
            </button>

          </div>

          <div className="timeline">

            {[
              {
                day: 'TODAY',
                task: 'Field Inspection & Moisture Check',
                active: false,
              },
              {
                day: 'TOMORROW',
                task: 'Optimal Spraying / Fertilization',
                active: true,
              },
              {
                day: 'DAY 3',
                task: 'Crop Monitoring & Weeding',
                active: false,
              },
            ].map(
              ({ day, task, active }, index) => (
                <div
                  className={
                    active
                      ? 'timeline-item active'
                      : 'timeline-item'
                  }
                  key={day}
                >

                  <div className="timeline-line">

                    <div className="timeline-dot" />

                    {index !== 2 && (
                      <div className="timeline-connector" />
                    )}

                  </div>

                  <div className="timeline-content">

                    <span>{day}</span>

                    <p>{task}</p>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          CSS
      ====================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        /* =====================================================
           MAIN
        ====================================================== */

        .farm-home {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 30px;
          min-height: 100%;
          color: ${C.text};
          background: transparent;
        }

        /* =====================================================
           SOFT BACKGROUND
        ====================================================== */

        .soft-orb {
          position: fixed;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(90px);
          z-index: -1;
        }

        .orb-one {
          width: 380px;
          height: 380px;
          top: 80px;
          right: 5%;
          background: rgba(65, 190, 130, 0.10);
        }

        .orb-two {
          width: 300px;
          height: 300px;
          bottom: 5%;
          left: 18%;
          background: rgba(93, 194, 156, 0.07);
        }

        /* =====================================================
           TOP HEADER
           
           IMPORTANT:
           This is the GREEN BAR you asked for.
        ====================================================== */

        .home-header {
          position: relative;
          z-index: 10;

          display: flex;
          justify-content: space-between;
          align-items: center;

          gap: 20px;
          flex-wrap: wrap;

          width: calc(100% + 60px);

          margin: -30px -30px 0;

          padding: 26px 30px;

          background: #178A58 !important;

          color: #FFFFFF !important;

          border: none !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.16) !important;

          box-shadow:
            0 5px 18px rgba(0, 70, 45, 0.16);

          overflow: hidden;
        }

        .home-header-content {
          position: relative;
          z-index: 2;
        }

        /* =====================================================
           HEADER EYEBROW
        ====================================================== */

        .home-header .eyebrow {
          display: flex;
          align-items: center;
          gap: 7px;

          margin-bottom: 8px;

          color: #FFFFFF !important;

          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        .home-header .eyebrow svg {
          color: #FFFFFF !important;
          stroke: #FFFFFF !important;
        }

        /* =====================================================
           HEADER TITLE
        ====================================================== */

        .home-header h1 {
          margin: 0;

          color: #FFFFFF !important;

          font-size: clamp(1.8rem, 3vw, 2.55rem);

          font-weight: 800;

          letter-spacing: -1.1px;

          line-height: 1.15;
        }

        .home-header h1 span {
          color: #FFFFFF !important;
        }

        .home-header h1 .wave {
          color: #FFFFFF !important;
          margin-left: 7px;
        }

        /* =====================================================
           HEADER LOCATION
        ====================================================== */

        .home-header .location-text {
          display: flex;
          align-items: center;
          gap: 7px;

          margin: 8px 0 0;

          color: #FFFFFF !important;

          font-size: 14px;
        }

        .home-header .location-text svg {
          color: #FFFFFF !important;
          stroke: #FFFFFF !important;
          flex-shrink: 0;
        }

        .home-header .location-name {
          color: #FFFFFF !important;
          font-weight: 600;
        }

        .home-header .location-dashboard {
          color: #FFFFFF !important;
        }

        .home-header .location-separator {
          color: rgba(255, 255, 255, 0.65) !important;
        }

        /* =====================================================
           DEMO BADGE
        ====================================================== */

        .home-header .demo-badge {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          gap: 8px;

          padding: 9px 14px;

          border-radius: 20px;

          background: rgba(0, 60, 40, 0.30) !important;

          border: 1px solid rgba(255, 255, 255, 0.35) !important;

          color: #FFFFFF !important;

          font-size: 12px;
          font-weight: 700;

          backdrop-filter: blur(5px);
        }

        .home-header .demo-badge span {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #F5C542;
        }

        /* =====================================================
           HERO
        ====================================================== */

        .hero-wrapper {
          position: relative;
        }

        .hero-banner {
          min-height: 300px;

          border-radius: 24px;

          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;

          border: 1px solid rgba(10, 75, 50, 0.25);

          box-shadow:
            0 15px 40px rgba(31, 93, 67, 0.08),
            0 2px 8px rgba(30, 70, 50, 0.04);

          position: relative;

          overflow: hidden;

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .hero-banner:hover {
          transform: translateY(-2px);

          box-shadow:
            0 20px 48px rgba(31, 93, 67, 0.11),
            0 3px 10px rgba(30, 70, 50, 0.05);
        }

        .hero-content {
          position: relative;
          z-index: 2;

          padding: 42px 55px;

          max-width: 650px;
        }

        /* =====================================================
           BANNER BADGE
           
           NO WHITE BACKGROUND
        ====================================================== */

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          padding: 7px 12px;

          border-radius: 20px;

          background: rgba(0, 65, 43, 0.72) !important;

          border: 1px solid rgba(255, 255, 255, 0.35) !important;

          color: #FFFFFF !important;

          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.1px;

          backdrop-filter: blur(5px);

          text-shadow:
            0 1px 4px rgba(0, 0, 0, 0.45);
        }

        .hero-badge span {
          color: #FFFFFF !important;
        }

        .badge-dot {
          width: 6px;
          height: 6px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #FFFFFF !important;

          box-shadow:
            0 0 7px rgba(255, 255, 255, 0.65);
        }

        /* =====================================================
           BANNER TITLE
        ====================================================== */

        .hero-content h2 {
          margin: 18px 0 10px;

          font-size: clamp(2rem, 4vw, 3rem);

          line-height: 1.05;

          letter-spacing: -1.5px;

          font-weight: 850;

          color: #FFFFFF !important;

          text-shadow:
            0 2px 8px rgba(0, 0, 0, 0.65);
        }

        /* =====================================================
           BANNER DESCRIPTION
        ====================================================== */

        .hero-content p {
          margin: 0 0 24px;

          max-width: 540px;

          color: #FFFFFF !important;

          line-height: 1.6;

          font-size: 15px;

          font-weight: 600;

          text-shadow:
            0 2px 7px rgba(0, 0, 0, 0.65);
        }

        /* =====================================================
           BANNER BUTTON
        ====================================================== */

        .hero-button {
          display: inline-flex;

          align-items: center;

          gap: 9px;

          padding: 12px 20px;

          border: 0;

          border-radius: 12px;

          background: linear-gradient(
            135deg,
            #21B981,
            #109669
          );

          color: #FFFFFF !important;

          font-weight: 750;

          cursor: pointer;

          box-shadow:
            0 8px 22px rgba(18, 150, 104, 0.20);

          transition: all 0.25s ease;
        }

        .hero-button svg {
          color: #FFFFFF !important;
        }

        .hero-button:hover {
          transform: translateY(-2px);

          box-shadow:
            0 12px 28px rgba(18, 150, 104, 0.26);
        }

        /* =====================================================
           HERO ARROWS
           
           NO WHITE BACKGROUND
        ====================================================== */

        .hero-arrow {
          position: absolute;

          top: 50%;

          transform: translateY(-50%);

          width: 38px;
          height: 38px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(0, 60, 40, 0.62) !important;

          backdrop-filter: blur(6px);

          border: 1px solid rgba(255, 255, 255, 0.35) !important;

          color: #FFFFFF !important;

          cursor: pointer;

          z-index: 4;

          transition: all 0.2s ease;
        }

        .hero-arrow svg {
          color: #FFFFFF !important;
          stroke: #FFFFFF !important;
        }

        .hero-arrow:hover {
          background: rgba(0, 100, 65, 0.90) !important;

          color: #FFFFFF !important;

          border-color: rgba(255, 255, 255, 0.65) !important;
        }

        .hero-left {
          left: 15px;
        }

        .hero-right {
          right: 15px;
        }

        /* =====================================================
           SLIDER DOTS
        ====================================================== */

        .slider-dots {
          display: flex;

          justify-content: center;

          gap: 7px;

          margin-top: 13px;
        }

        .slider-dot {
          width: 7px;
          height: 7px;

          border: none;

          padding: 0;

          border-radius: 10px;

          background: #C9D8D2;

          cursor: pointer;

          transition: all 0.3s ease;
        }

        .slider-dot.active {
          width: 27px;

          background: ${C.green};

          box-shadow:
            0 0 10px rgba(24, 168, 120, 0.18);
        }

        /* =====================================================
           SECTION HEADING
        ====================================================== */

        .section-heading {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          margin-bottom: 15px;
        }

        .section-kicker {
          display: block;

          color: ${C.green};

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1.5px;

          margin-bottom: 4px;
        }

        .section-heading h3 {
          margin: 0;

          color: ${C.heading};

          font-size: 19px;

          font-weight: 750;
        }

        .text-button {
          display: flex;

          align-items: center;

          gap: 5px;

          background: transparent;

          border: none;

          color: ${C.greenDark};

          font-size: 12px;

          font-weight: 700;

          cursor: pointer;
        }

        .text-button:hover {
          color: ${C.green};
        }

        /* =====================================================
           STATUS CARDS
        ====================================================== */

        .status-grid {
          display: grid;

          grid-template-columns: repeat(4, 1fr);

          gap: 16px;
        }

        .status-card {
          padding: 19px;

          border-radius: 17px;

          background: rgba(255, 255, 255, 0.88);

          border: 1px solid ${C.border};

          box-shadow:
            0 8px 25px rgba(34, 87, 64, 0.055);

          transition: all 0.25s ease;
        }

        .status-card:hover {
          transform: translateY(-4px);

          border-color: #B9DFCE;

          box-shadow:
            0 14px 32px rgba(34, 87, 64, 0.09);
        }

        .status-top {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-bottom: 15px;
        }

        .status-icon {
          width: 38px;
          height: 38px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 11px;
        }

        .status-trend {
          font-size: 10px;

          font-weight: 800;

          padding: 5px 8px;

          border-radius: 8px;
        }

        .status-value {
          font-size: 29px;

          line-height: 1;

          font-weight: 850;

          letter-spacing: -1px;
        }

        .status-label {
          color: ${C.text};

          font-size: 13px;

          font-weight: 700;

          margin-top: 8px;
        }

        .status-sub {
          color: ${C.softMuted};

          font-size: 11px;

          margin-top: 3px;
        }

        .progress-track {
          height: 5px;

          margin-top: 15px;

          border-radius: 10px;

          background: #E8F0EC;

          overflow: hidden;
        }

        .progress-fill {
          height: 100%;

          border-radius: 10px;

          opacity: 0.75;
        }

        /* =====================================================
           ACT NOW
        ====================================================== */

        .act-now-card {
          position: relative;

          overflow: hidden;

          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 25px;

          padding: 25px 28px;

          border-radius: 20px;

          background:
            linear-gradient(
              135deg,
              #F0FBF5,
              #FFFFFF
            );

          border: 1px solid #CDE9DA;

          box-shadow:
            0 10px 30px rgba(29, 99, 68, 0.07);
        }

        .act-now-card::after {
          content: '';

          position: absolute;

          width: 220px;
          height: 220px;

          right: 4%;
          top: -130px;

          border-radius: 50%;

          background: rgba(52, 190, 130, 0.10);

          filter: blur(60px);

          pointer-events: none;
        }

        .act-content {
          position: relative;

          z-index: 2;
        }

        .act-title {
          display: flex;

          align-items: center;

          gap: 10px;
        }

        .act-icon {
          width: 40px;
          height: 40px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 12px;

          color: ${C.greenDark};

          background: ${C.greenLight};

          border: 1px solid #C2E7D3;
        }

        .act-title span {
          color: ${C.softMuted};

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1.2px;
        }

        .act-title h3 {
          margin: 1px 0 0;

          color: ${C.heading};

          font-size: 16px;
        }

        .score-row {
          display: flex;

          align-items: baseline;

          gap: 8px;

          margin-top: 12px;
        }

        .score-row strong {
          font-size: 45px;

          line-height: 1;

          color: ${C.green};

          font-weight: 850;

          letter-spacing: -2px;
        }

        .score-row > span {
          color: ${C.softMuted};

          font-size: 14px;

          font-weight: 700;
        }

        .score-status {
          display: flex;

          align-items: center;

          gap: 6px;

          margin-left: 8px;

          padding: 5px 9px;

          border-radius: 10px;

          background: #E7F8EF;

          color: ${C.greenDark};

          font-size: 11px;

          font-weight: 700;
        }

        .score-status span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: ${C.green};
        }

        .act-description {
          max-width: 650px;

          margin: 9px 0 0;

          color: ${C.muted};

          font-size: 12px;

          line-height: 1.55;
        }

        .act-description strong {
          color: ${C.text};
        }

        .action-window {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          margin-top: 12px;

          padding: 8px 11px;

          border-radius: 10px;

          background: #F7FBF9;

          border: 1px solid #DDEBE4;

          color: ${C.muted};

          font-size: 11px;
        }

        .action-window svg {
          color: ${C.green};
        }

        .action-window strong {
          color: ${C.text};
        }

        .analysis-button {
          position: relative;

          z-index: 3;

          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding: 12px 20px;

          border: none;

          border-radius: 12px;

          background: linear-gradient(
            135deg,
            #21B981,
            #109669
          );

          color: #FFFFFF !important;

          font-weight: 750;

          cursor: pointer;

          white-space: nowrap;

          box-shadow:
            0 8px 22px rgba(18, 150, 104, 0.18);

          transition: all 0.25s ease;
        }

        .analysis-button svg {
          color: #FFFFFF !important;
        }

        .analysis-button:hover {
          transform: translateY(-2px);

          box-shadow:
            0 12px 28px rgba(18, 150, 104, 0.24);
        }

        /* =====================================================
           BOTTOM CARDS
        ====================================================== */

        .bottom-grid {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 18px;
        }

        .premium-card {
          padding: 21px;

          border-radius: 18px;

          background: rgba(255, 255, 255, 0.90);

          border: 1px solid ${C.border};

          box-shadow:
            0 8px 28px rgba(35, 84, 62, 0.055);

          transition: all 0.25s ease;
        }

        .premium-card:hover {
          transform: translateY(-2px);

          box-shadow:
            0 13px 32px rgba(35, 84, 62, 0.075);
        }

        .card-heading {
          display: flex;

          align-items: center;

          gap: 10px;

          margin-bottom: 17px;
        }

        .card-heading > div:nth-child(2) {
          flex: 1;
        }

        .card-heading span {
          display: block;

          color: ${C.softMuted};

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 1.2px;
        }

        .card-heading h3 {
          margin: 2px 0 0;

          color: ${C.heading};

          font-size: 15px;
        }

        .heading-icon {
          width: 35px;
          height: 35px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 10px;

          color: ${C.greenDark};

          background: ${C.greenLight};
        }

        .heading-icon.warning {
          color: ${C.yellow};

          background: ${C.yellowBg};
        }

        .card-heading button {
          background: transparent;

          border: none;

          color: ${C.greenDark};

          font-size: 11px;

          font-weight: 700;

          cursor: pointer;
        }

        .card-heading button:hover {
          color: ${C.green};
        }

        /* =====================================================
           ALERTS
        ====================================================== */

        .alerts-list {
          display: flex;

          flex-direction: column;

          gap: 9px;
        }

        .alert-item {
          display: flex;

          align-items: flex-start;

          gap: 10px;

          padding: 11px;

          border-radius: 12px;

          border: 1px solid #E4EEE9;
        }

        .alert-item.success {
          background: #F0FBF5;
        }

        .alert-item.warning {
          background: #FFF9EC;
        }

        .alert-indicator {
          flex-shrink: 0;

          width: 29px;
          height: 29px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background: #E0F5EA;

          color: ${C.greenDark};
        }

        .alert-item.warning .alert-indicator {
          background: #FFF0C9;

          color: ${C.yellow};
        }

        .alert-item strong {
          display: block;

          color: ${C.text};

          font-size: 12px;
        }

        .alert-item p {
          margin: 3px 0 0;

          color: ${C.muted};

          font-size: 10px;

          line-height: 1.5;
        }

        /* =====================================================
           TIMELINE
        ====================================================== */

        .timeline {
          display: flex;

          flex-direction: column;
        }

        .timeline-item {
          display: flex;

          gap: 12px;

          min-height: 51px;
        }

        .timeline-line {
          width: 15px;

          position: relative;

          display: flex;

          justify-content: center;
        }

        .timeline-dot {
          width: 8px;
          height: 8px;

          margin-top: 4px;

          border-radius: 50%;

          background: #C5D3CD;

          border: 2px solid #FFFFFF;

          box-shadow:
            0 0 0 1px #D5E3DD;

          z-index: 2;
        }

        .timeline-item.active .timeline-dot {
          background: ${C.green};

          box-shadow:
            0 0 0 1px #A9DCC4,
            0 0 9px rgba(24, 168, 120, 0.25);
        }

        .timeline-connector {
          position: absolute;

          top: 11px;

          bottom: -4px;

          width: 1px;

          background: #DCE8E2;
        }

        .timeline-content {
          padding-bottom: 13px;
        }

        .timeline-content span {
          color: ${C.softMuted};

          font-size: 8px;

          font-weight: 800;

          letter-spacing: 1px;
        }

        .timeline-item.active .timeline-content span {
          color: ${C.greenDark};
        }

        .timeline-content p {
          margin: 3px 0 0;

          color: ${C.muted};

          font-size: 11px;
        }

        /* =====================================================
           ANIMATIONS
        ====================================================== */

        .farm-home > section {
          animation: softFade 0.45s ease both;
        }

        .farm-home > section:nth-of-type(2) {
          animation-delay: 0.04s;
        }

        .farm-home > section:nth-of-type(3) {
          animation-delay: 0.08s;
        }

        .farm-home > section:nth-of-type(4) {
          animation-delay: 0.12s;
        }

        @keyframes softFade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* =====================================================
           RESPONSIVE
        ====================================================== */

        @media (max-width: 1100px) {

          .status-grid {
            grid-template-columns: repeat(2, 1fr);
          }

        }

        @media (max-width: 800px) {

          .home-header {
            width: calc(100% + 40px);
            margin-left: -20px;
            margin-right: -20px;

            padding: 24px 20px;
          }

          .hero-content {
            padding: 35px 30px;
          }

          .hero-content h2 {
            font-size: 2rem;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .act-now-card {
            align-items: flex-start;

            flex-direction: column;
          }

          .analysis-button {
            width: 100%;

            justify-content: center;
          }

        }

        @media (max-width: 560px) {

          .status-grid {
            grid-template-columns: 1fr;
          }

          .home-header {
            width: calc(100% + 30px);

            margin-left: -15px;
            margin-right: -15px;

            padding: 22px 15px;
          }

          .home-header h1 {
            font-size: 1.65rem;
          }

          .home-header .location-text {
            font-size: 12px;
          }

          .hero-banner {
            min-height: 330px;

            background-position: center;
          }

          .hero-content {
            padding: 28px 22px;
          }

          .hero-content h2 {
            font-size: 1.8rem;
          }

          .hero-arrow {
            display: none;
          }

          .score-row strong {
            font-size: 38px;
          }

          .score-status {
            display: none;
          }

          .action-window {
            flex-wrap: wrap;
          }

        }

      `}</style>
    </div>
  );
};