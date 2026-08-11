import React, { useState } from 'react';

import {
  Home,
  Camera,
  CloudSun,
  Zap,
  Calendar,
  Sprout,
  Bot,
  Bell,
  FileText,
  Landmark,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  MapPin,
  ShoppingCart,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import { HomePage } from './HomePage';
import { CropScannerPage } from './CropScannerPage';
import { WeatherPage } from './WeatherPage';
import { CropHistoryPage } from './CropHistoryPage';
import { FarmPlannerPage } from './FarmPlannerPage';
import { AIAdvisorPage } from './AIAdvisorPage';
import { SeedHubPage } from './SeedHubPage';
import { CartPage } from './CartPage';
import { LoansKnowledgePage } from './LoansKnowledgePage';
import { SettingsPage } from './SettingsPage';

import { getTranslation } from '../utils/translations';


/* =========================================================
   FARM IQ NAVIGATION
========================================================= */

const navItems = [
  {
    id: 'home',
    labelKey: 'home',
    defaultLabel: 'Home',
    icon: Home,
  },
  {
    id: 'scanner',
    labelKey: 'scanner',
    defaultLabel: 'AI Crop Scanner',
    icon: Camera,
  },
  {
    id: 'weather',
    labelKey: 'weather',
    defaultLabel: 'Weather',
    icon: CloudSun,
  },
  {
    id: 'actnow',
    labelKey: 'actnow',
    defaultLabel: 'Act Now',
    icon: Zap,
  },
  {
    id: 'planner',
    labelKey: 'planner',
    defaultLabel: 'Farm Planner',
    icon: Calendar,
  },
  {
    id: 'seeds',
    labelKey: 'seeds',
    defaultLabel: 'Seed Hub',
    icon: Sprout,
  },
  {
    id: 'advisor',
    labelKey: 'advisor',
    defaultLabel: 'AI Advisor',
    icon: Bot,
  },
  {
    id: 'alerts',
    labelKey: 'alerts',
    defaultLabel: 'Smart Alerts',
    icon: Bell,
  },
  {
    id: 'history',
    labelKey: 'history',
    defaultLabel: 'Crop History',
    icon: FileText,
  },
  {
    id: 'loans',
    labelKey: 'loans',
    defaultLabel: 'Farmer Loans',
    icon: Landmark,
  },
  {
    id: 'knowledge',
    labelKey: 'knowledge',
    defaultLabel: 'Knowledge Center',
    icon: BookOpen,
  },
  {
    id: 'settings',
    labelKey: 'settings',
    defaultLabel: 'Settings',
    icon: Settings,
  },
];


/* =========================================================
   MAIN COMPONENT
========================================================= */

export const DashboardLayout = ({
  onNavigate,
  currentTab = 'home',
}) => {
  const {
    user,
    logout,
    language,
    changeLanguage,
    totalCartCount,
  } = useAuth();

  const t = (key) => getTranslation(language, key);

  const [activeTab, setActiveTab] = useState(currentTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);


  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setNotifOpen(false);
    setLanguageOpen(false);

    if (onNavigate && tabId === 'welcome') {
      onNavigate('welcome');
    }
  };


  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    logout();

    if (onNavigate) {
      onNavigate('welcome');
    }
  };


  /* =========================================================
     LANGUAGE
  ========================================================= */

  const selectLanguage = (value) => {
    changeLanguage(value);
    setLanguageOpen(false);
  };


  /* =========================================================
     SIDEBAR
  ========================================================= */

 /* =========================================================
   SIDEBAR
========================================================= */

const Sidebar = ({ mobile = false }) => (
  <aside
    className="farmiq-sidebar"
    style={{
      width: '260px',
      height: '100vh',

      /* MAIN SIDEBAR COLOR */
      background: '#2E8B57',

      borderRight: '1px solid #26784A',

      display: 'flex',
      flexDirection: 'column',

      position: mobile ? 'relative' : 'fixed',

      top: 0,
      left: 0,

      zIndex: 200,

      boxSizing: 'border-box',

      boxShadow:
        '8px 0 30px rgba(20, 80, 45, 0.12)',

      overflow: 'hidden',
    }}
  >

    {/* =====================================================
        VERY SUBTLE DECORATIVE GLOW
    ===================================================== */}

    <div
      style={{
        position: 'absolute',
        top: '-130px',
        left: '-110px',

        width: '300px',
        height: '300px',

        borderRadius: '50%',

        background:
          'rgba(255,255,255,0.045)',

        filter: 'blur(75px)',

        pointerEvents: 'none',
      }}
    />

    <div
      style={{
        position: 'absolute',
        bottom: '-150px',
        right: '-130px',

        width: '300px',
        height: '300px',

        borderRadius: '50%',

        background:
          'rgba(0, 55, 30, 0.06)',

        filter: 'blur(80px)',

        pointerEvents: 'none',
      }}
    />


    {/* =====================================================
        LOGO
    ===================================================== */}

    <div
      onClick={() => handleTabChange('home')}
      style={{
        height: '82px',

        padding: '0 20px',

        display: 'flex',
        alignItems: 'center',

        gap: '12px',

        borderBottom:
          '1px solid rgba(255,255,255,0.12)',

        cursor: 'pointer',

        position: 'relative',

        zIndex: 2,
      }}
    >

      {/* LOGO ICON */}

      <div
        style={{
          width: '44px',
          height: '44px',

          borderRadius: '14px',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          background:
            'rgba(0, 80, 45, 0.30)',

          border:
            '1px solid rgba(255,255,255,0.13)',

          boxShadow:
            '0 5px 15px rgba(0, 50, 25, 0.14)',
        }}
      >
        <Sprout
          size={24}
          color="#8FF0B8"
          strokeWidth={2.2}
        />
      </div>


      {/* LOGO TEXT */}

      <div>

        <div
          style={{
            fontSize: '1.22rem',

            fontWeight: '900',

            letterSpacing: '-0.6px',

            color: '#FFFFFF',
          }}
        >
          Farm
          <span
            style={{
              color: '#8FF0B8',
            }}
          >
            IQ
          </span>
        </div>


        <div
          style={{
            fontSize: '0.62rem',

            color: '#BDE5CC',

            letterSpacing: '1.3px',

            textTransform: 'uppercase',

            marginTop: '2px',

            fontWeight: '600',
          }}
        >
          Smart Farming
        </div>

      </div>

    </div>


    {/* =====================================================
        FARM STATUS
    ===================================================== */}

    <div
      style={{
        margin: '16px 14px 8px',

        padding: '12px 13px',

        borderRadius: '14px',

        /*
          SLIGHTLY DARKER THAN #2E8B57
          NOT BLACK / NOT TOO DARK
        */
        background: '#287B4D',

        border:
          '1px solid rgba(255,255,255,0.10)',

        position: 'relative',

        zIndex: 2,

        boxShadow:
          '0 5px 16px rgba(0, 50, 25, 0.10)',
      }}
    >

      <div
        style={{
          display: 'flex',

          alignItems: 'center',

          gap: '8px',

          marginBottom: '5px',
        }}
      >

        <span
          style={{
            width: '7px',
            height: '7px',

            borderRadius: '50%',

            background: '#7FF0AA',

            boxShadow:
              '0 0 8px rgba(127,240,170,0.40)',
          }}
        />


        <span
          style={{
            color: '#D9FBE5',

            fontSize: '0.72rem',

            fontWeight: '800',

            letterSpacing: '0.2px',
          }}
        >
          FARM STATUS
        </span>

      </div>


      <div
        style={{
          color: '#C5EBD2',

          fontSize: '0.76rem',

          fontWeight: '500',
        }}
      >
        Your farm is looking healthy
      </div>

    </div>


    {/* =====================================================
        NAVIGATION
    ===================================================== */}

    <nav
      style={{
        flex: 1,

        overflowY: 'auto',

        padding: '8px 11px',

        position: 'relative',

        zIndex: 2,
      }}
    >

      <div
        style={{
          color: '#A9D6B9',

          fontSize: '0.63rem',

          fontWeight: '800',

          letterSpacing: '1.4px',

          padding: '8px 10px',

          textTransform: 'uppercase',
        }}
      >
        Workspace
      </div>


      {navItems.map((item) => {

        const Icon = item.icon;

        const isActive =
          activeTab === item.id;


        return (
          <button
            key={item.id}

            onClick={() =>
              handleTabChange(item.id)
            }

            className={`farmiq-nav-item ${
              isActive ? 'active' : ''
            }`}

            style={{
              width: '100%',

              height: '45px',

              display: 'flex',

              alignItems: 'center',

              gap: '12px',

              padding: '0 12px',

              marginBottom: '3px',

              border:
                '1px solid transparent',

              borderRadius: '12px',

              cursor: 'pointer',

              textAlign: 'left',

              /*
                ACTIVE = DARKER GREEN
              */
              background: isActive
                ? '#216B43'
                : 'transparent',

              /*
                VERY VISIBLE TEXT
              */
              color: isActive
                ? '#FFFFFF'
                : '#E4F5EA',

              fontSize: '0.82rem',

              fontWeight: isActive
                ? '800'
                : '600',

              borderColor: isActive
                ? 'rgba(255,255,255,0.12)'
                : 'transparent',

              boxShadow: isActive
                ? 'inset 3px 0 0 #72E7A2, 0 4px 12px rgba(0,50,25,0.10)'
                : 'none',

              transition:
                'all 0.20s ease',
            }}
          >

            <Icon
              size={17}

              strokeWidth={
                isActive
                  ? 2.4
                  : 2
              }

              color={
                isActive
                  ? '#8FF0B8'
                  : '#BDE5CC'
              }
            />


            <span
              style={{
                flex: 1,
              }}
            >
              {t(item.labelKey) ||
                item.defaultLabel}
            </span>


            {isActive && (
              <ChevronRight
                size={14}
                color="#8FF0B8"
                strokeWidth={2.5}
              />
            )}

          </button>
        );
      })}

    </nav>


    {/* =====================================================
        LOGOUT
    ===================================================== */}

    <div
      style={{
        padding: '12px',

        borderTop:
          '1px solid rgba(255,255,255,0.12)',

        position: 'relative',

        zIndex: 2,

        background:
          'rgba(0,50,25,0.08)',
      }}
    >

      <button
        onClick={handleLogout}

        className="farmiq-logout"

        style={{
          width: '100%',

          height: '43px',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          gap: '8px',

          borderRadius: '11px',

          border:
            '1px solid rgba(255,255,255,0.15)',

          background:
            'rgba(0,55,30,0.18)',

          color: '#FFE1E1',

          fontSize: '0.8rem',

          fontWeight: '700',

          cursor: 'pointer',

          transition:
            'all 0.2s ease',
        }}
      >

        <LogOut size={16} />

        {t('signOut') || 'Sign Out'}

      </button>

    </div>

  </aside>
);

  /* =========================================================
     HEADER
  ========================================================= */

  const Header = () => (
    <header
      className="farmiq-header"
      style={{
        height: '72px',

        flexShrink: 0,

        background:
          'rgba(255,255,255,0.88)',

        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',

        borderBottom:
          '1px solid #DDEDE3',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',

        padding: '0 30px',

        position: 'sticky',
        top: 0,

        zIndex: 100,

        boxShadow:
          '0 3px 18px rgba(40, 100, 65, 0.035)',
      }}
    >

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >

        {/* Mobile Menu */}

        <button
          onClick={() =>
            setMobileMenuOpen(!mobileMenuOpen)
          }
          className="farmiq-mobile-menu"
          style={{
            display: 'none',

            width: '40px',
            height: '40px',

            alignItems: 'center',
            justifyContent: 'center',

            borderRadius: '11px',

            border:
              '1px solid #D7EADF',

            background:
              '#F4FBF7',

            color: '#38715A',

            cursor: 'pointer',
          }}
        >
          {mobileMenuOpen ? (
            <X size={20} />
          ) : (
            <Menu size={20} />
          )}
        </button>


        {/* Location */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',

            padding: '8px 13px',

            borderRadius: '12px',

            background:
              '#F4FBF7',

            border:
              '1px solid #DDEDE3',
          }}
        >

          <div
            style={{
              width: '27px',
              height: '27px',

              borderRadius: '8px',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              background:
                '#E4F7EB',
            }}
          >
            <MapPin
              size={14}
              color="#13A866"
            />
          </div>


          <div>

            <div
              style={{
                fontSize: '0.7rem',
                color: '#82958B',
                lineHeight: 1,
                marginBottom: '4px',
              }}
            >
              Location
            </div>

            <div
              style={{
                fontSize: '0.8rem',
                color: '#355B48',
                fontWeight: '750',
              }}
            >
              {user?.village || 'Guntur'}
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
        }}
      >

        {/* Weather */}

        <div
          className="header-weather"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',

            padding: '8px 12px',

            borderRadius: '11px',

            background:
              '#F7FBF8',

            border:
              '1px solid #DDEDE3',

            color: '#587166',

            fontSize: '0.78rem',
            fontWeight: '650',
          }}
        >
          <CloudSun
            size={16}
            color="#E7A91B"
          />

          29.5°C
        </div>


        {/* Cart */}

        <button
          onClick={() =>
            handleTabChange('cart')
          }
          className="farmiq-header-button"
          style={{
            position: 'relative',

            height: '40px',
            padding: '0 11px',

            display: 'flex',
            alignItems: 'center',
            gap: '7px',

            borderRadius: '11px',

            border:
              '1px solid #DDEDE3',

            background:
              activeTab === 'cart'
                ? '#E6F8ED'
                : '#F8FCF9',

            color: '#557065',

            cursor: 'pointer',
          }}
        >

          <ShoppingCart
            size={17}
            color="#13A866"
          />

          {totalCartCount > 0 && (
            <span
              style={{
                minWidth: '18px',
                height: '18px',

                padding: '0 4px',

                borderRadius: '20px',

                background: '#18B96D',

                color: '#FFFFFF',

                fontSize: '0.65rem',
                fontWeight: '900',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {totalCartCount}
            </span>
          )}

        </button>


        {/* =====================================================
            PROFESSIONAL LANGUAGE SELECTOR
        ===================================================== */}

        <div
          className="farmiq-language-wrapper"
          style={{
            position: 'relative',
          }}
        >

          <button
            onClick={() =>
              setLanguageOpen(!languageOpen)
            }
            className="farmiq-language-button"
            style={{
              height: '40px',

              display: 'flex',
              alignItems: 'center',
              gap: '7px',

              padding: '0 11px',

              borderRadius: '11px',

              border:
                '1px solid #DDEDE3',

              background:
                languageOpen
                  ? '#E8F8EE'
                  : '#F8FCF9',

              color: '#456759',

              cursor: 'pointer',

              fontWeight: '700',
              fontSize: '0.75rem',

              transition:
                'all 0.2s ease',
            }}
          >

            <Globe
              size={15}
              color="#13A866"
            />

            <span>
              {language === 'Telugu'
                ? 'TE'
                : language === 'Hindi'
                ? 'HI'
                : 'EN'}
            </span>

            <ChevronDown
              size={14}
              color="#6F877A"
              style={{
                transform: languageOpen
                  ? 'rotate(180deg)'
                  : 'rotate(0deg)',
                transition:
                  'transform 0.2s ease',
              }}
            />

          </button>


          {languageOpen && (
            <div
              className="farmiq-language-dropdown"
              style={{
                position: 'absolute',

                top: '47px',
                right: 0,

                width: '145px',

                padding: '6px',

                borderRadius: '13px',

                background:
                  'rgba(255,255,255,0.98)',

                border:
                  '1px solid #DDEDE3',

                boxShadow:
                  '0 15px 40px rgba(40, 100, 65, 0.12)',

                zIndex: 600,
              }}
            >

              {[
                {
                  value: 'English',
                  label: 'English',
                  short: 'EN',
                },
                {
                  value: 'Telugu',
                  label: 'తెలుగు',
                  short: 'TE',
                },
                {
                  value: 'Hindi',
                  label: 'हिन्दी',
                  short: 'HI',
                },
              ].map((item) => {

                const selected =
                  language === item.value;

                return (
                  <button
                    key={item.value}
                    onClick={() =>
                      selectLanguage(item.value)
                    }
                    className="farmiq-language-option"
                    style={{
                      width: '100%',

                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'space-between',

                      padding:
                        '9px 10px',

                      border: 'none',

                      borderRadius: '9px',

                      background:
                        selected
                          ? '#E7F8ED'
                          : 'transparent',

                      color:
                        selected
                          ? '#118454'
                          : '#50695C',

                      fontSize: '0.78rem',

                      fontWeight:
                        selected
                          ? '750'
                          : '550',

                      cursor: 'pointer',

                      transition:
                        'all 0.18s ease',
                    }}
                  >

                    <span>
                      {item.label}
                    </span>

                    <span
                      style={{
                        fontSize:
                          '0.67rem',

                        color:
                          selected
                            ? '#13A866'
                            : '#91A49A',

                        fontWeight: '800',
                      }}
                    >
                      {item.short}
                    </span>

                  </button>
                );
              })}

            </div>
          )}

        </div>


        {/* =====================================================
            NOTIFICATIONS
        ===================================================== */}

        <div
          style={{
            position: 'relative',
          }}
        >

          <button
            onClick={() =>
              setNotifOpen(!notifOpen)
            }
            className="farmiq-header-button"
            style={{
              width: '40px',
              height: '40px',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              borderRadius: '11px',

              border:
                '1px solid #DDEDE3',

              background:
                notifOpen
                  ? '#E6F8ED'
                  : '#F8FCF9',

              cursor: 'pointer',

              position: 'relative',
            }}
          >

            <Bell
              size={17}
              color="#5C7468"
            />

            <span
              style={{
                position: 'absolute',

                top: '7px',
                right: '7px',

                width: '6px',
                height: '6px',

                borderRadius: '50%',

                background: '#F06A6A',

                boxShadow:
                  '0 0 7px rgba(240,106,106,0.35)',
              }}
            />

          </button>


          {notifOpen && (
            <div
              className="farmiq-dropdown"
              style={{
                position: 'absolute',

                right: 0,
                top: '50px',

                width: '310px',

                padding: '17px',

                borderRadius: '16px',

                background:
                  'rgba(255,255,255,0.98)',

                border:
                  '1px solid #DCEDE3',

                boxShadow:
                  '0 20px 55px rgba(40, 100, 65, 0.13)',

                zIndex: 500,
              }}
            >

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'space-between',

                  marginBottom: '13px',
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >

                  <Sparkles
                    size={16}
                    color="#13A866"
                  />

                  <span
                    style={{
                      color: '#315D49',
                      fontSize: '0.86rem',
                      fontWeight: '800',
                    }}
                  >
                    Smart Alerts
                  </span>

                </div>


                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#8AA095',
                  }}
                >
                  1 new
                </span>

              </div>


              <div
                style={{
                  padding: '12px',

                  borderRadius: '12px',

                  background:
                    'linear-gradient(135deg, #E6F8ED, #F5FBF7)',

                  border:
                    '1px solid #D0ECDD',
                }}
              >

                <div
                  style={{
                    color: '#148856',
                    fontSize: '0.77rem',
                    fontWeight: '750',
                    marginBottom: '5px',
                  }}
                >
                  Good spraying window
                </div>


                <div
                  style={{
                    color: '#6A8176',
                    fontSize: '0.74rem',
                    lineHeight: 1.5,
                  }}
                >
                  Tomorrow between 7:00 AM and
                  10:00 AM.
                </div>

              </div>

            </div>
          )}

        </div>


        {/* =====================================================
            PROFILE
        ===================================================== */}

        <button
          onClick={() =>
            handleTabChange('settings')
          }
          className="farmiq-profile"
          style={{
            height: '42px',

            display: 'flex',
            alignItems: 'center',

            gap: '9px',

            padding: '3px 9px 3px 4px',

            borderRadius: '13px',

            border:
              '1px solid #CFE8D9',

            background:
              '#F0FAF4',

            cursor: 'pointer',
          }}
        >

          <div
            style={{
              width: '34px',
              height: '34px',

              borderRadius: '10px',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              background:
                'linear-gradient(135deg, #19B86D, #0E9D59)',

              color: '#FFFFFF',

              fontWeight: '900',
              fontSize: '0.82rem',

              boxShadow:
                '0 4px 12px rgba(16, 185, 105, 0.18)',
            }}
          >
            {user?.full_name
              ? user.full_name
                  .charAt(0)
                  .toUpperCase()
              : 'U'}
          </div>


          <div
            className="profile-name"
            style={{
              maxWidth: '115px',

              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',

              color: '#3B604E',

              fontSize: '0.77rem',
              fontWeight: '750',
            }}
          >
            {user?.full_name || 'Farmer'}
          </div>


          <ChevronDown
            size={14}
            color="#71877B"
          />

        </button>

      </div>

    </header>
  );


  /* =========================================================
     PAGE RENDERER
  ========================================================= */

  const renderPage = () => {

    switch (activeTab) {

      case 'home':
        return (
          <HomePage
            onNavigate={handleTabChange}
          />
        );


      case 'scanner':
        return (
          <CropScannerPage
            onNavigate={handleTabChange}
          />
        );


      case 'weather':

      case 'actnow':
        return (
          <WeatherPage
            onNavigate={handleTabChange}
          />
        );


      case 'planner':
        return (
          <FarmPlannerPage
            onNavigate={handleTabChange}
          />
        );


      case 'seeds':
        return (
          <SeedHubPage
            onNavigate={handleTabChange}
          />
        );


      case 'cart':
        return (
          <CartPage
            onNavigate={handleTabChange}
          />
        );


      case 'advisor':
        return (
          <AIAdvisorPage
            onNavigate={handleTabChange}
          />
        );


      case 'alerts':
        return (
          <FarmPlannerPage
            onNavigate={handleTabChange}
          />
        );


      case 'history':
        return (
          <CropHistoryPage
            onNavigate={handleTabChange}
          />
        );


      case 'loans':
        return (
          <LoansKnowledgePage
            defaultTab="loans"
            onNavigate={handleTabChange}
          />
        );


      case 'knowledge':
        return (
          <LoansKnowledgePage
            defaultTab="knowledge"
            onNavigate={handleTabChange}
          />
        );


      case 'settings':
        return (
          <SettingsPage
            onNavigate={onNavigate}
          />
        );


      default:
        return (
          <HomePage
            onNavigate={handleTabChange}
          />
        );
    }
  };


  /* =========================================================
     FINAL UI
  ========================================================= */

  return (
    <>

      {/* =====================================================
          GLOBAL STYLES + ANIMATIONS
      ===================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }


        html,
        body,
        #root {
          margin: 0;
          min-height: 100%;
        }


        body {
          margin: 0;
          background: #F3FAF5;
          font-family: 'Outfit', sans-serif;
        }


        button,
        select {
          font-family: inherit;
        }


        /* ===================================================
           SIDEBAR NAV HOVER
        =================================================== */

        /* ===================================================
   SIDEBAR NAV HOVER
=================================================== */

.farmiq-nav-item:hover {
  background: #27784B !important;
  border-color: rgba(255, 255, 255, 0.10) !important;

  transform: translateX(3px);

  color: #FFFFFF !important;
}


/* ===================================================
   ACTIVE ITEM
=================================================== */

.farmiq-nav-item.active {
  background: #216B43 !important;

  border-color:
    rgba(255, 255, 255, 0.12) !important;

  color: #FFFFFF !important;

  box-shadow:
    inset 3px 0 0 #72E7A2,
    0 4px 12px rgba(0, 50, 25, 0.10);
}


/* Active + hover stays dark */

.farmiq-nav-item.active:hover {
  background: #1F643F !important;

  border-color:
    rgba(255, 255, 255, 0.15) !important;

  color: #FFFFFF !important;
}


/* ===================================================
   SIDEBAR TEXT VISIBILITY
=================================================== */

.farmiq-sidebar .farmiq-nav-item span {
  color: #E4F5EA;
}

.farmiq-sidebar .farmiq-nav-item:hover span,
.farmiq-sidebar .farmiq-nav-item.active span {
  color: #FFFFFF;
}


/* ===================================================
   SIDEBAR SCROLLBAR
=================================================== */

.farmiq-sidebar nav::-webkit-scrollbar {
  width: 4px;
}

.farmiq-sidebar nav::-webkit-scrollbar-track {
  background: transparent;
}

.farmiq-sidebar nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.16);
  border-radius: 10px;
}

.farmiq-sidebar nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}


/* ===================================================
   LOGOUT HOVER
=================================================== */

.farmiq-logout:hover {
  background: #246F46 !important;

  border-color:
    rgba(255, 255, 255, 0.22) !important;

  color: #FFFFFF !important;

  transform: translateY(-1px);
}
        /* ===================================================
           HEADER BUTTON HOVER
        =================================================== */

        .farmiq-header-button:hover {
          background:
            #EAF8EF !important;

          border-color:
            #BFDCCA !important;

          transform:
            translateY(-1px);
        }


        /* ===================================================
           LANGUAGE BUTTON
        =================================================== */

        .farmiq-language-button:hover {
          background:
            #EAF8EF !important;

          border-color:
            #BFDCCA !important;

          transform:
            translateY(-1px);
        }


        /* ===================================================
           LANGUAGE OPTIONS
        =================================================== */

        .farmiq-language-option:hover {
          background:
            #EAF8EF !important;

          color:
            #128455 !important;
        }


        /* ===================================================
           PROFILE HOVER
        =================================================== */

        .farmiq-profile:hover {
          background:
            #E5F7EC !important;

          border-color:
            #BBDFC9 !important;

          transform:
            translateY(-1px);
        }


        /* ===================================================
           LOGOUT HOVER
        =================================================== */

        .farmiq-logout:hover {
          background:
            #FFF0F0 !important;

          border-color:
            #F0C4C4 !important;

          transform:
            translateY(-1px);
        }


        /* ===================================================
           SMOOTH TRANSITIONS
        =================================================== */

        .farmiq-nav-item,
        .farmiq-header-button,
        .farmiq-language-button,
        .farmiq-profile,
        .farmiq-logout {
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            color 0.2s ease;
        }


        /* ===================================================
           DROPDOWN ANIMATION
        =================================================== */

        .farmiq-dropdown,
        .farmiq-language-dropdown {
          animation:
            farmiqDrop
            0.18s
            ease-out;
        }


        @keyframes farmiqDrop {

          from {
            opacity: 0;
            transform:
              translateY(-6px)
              scale(0.98);
          }

          to {
            opacity: 1;
            transform:
              translateY(0)
              scale(1);
          }

        }


        /* ===================================================
           SOFT PAGE MOTION
        =================================================== */

        .farmiq-main-shell {
          animation:
            farmiqPageIn
            0.45s
            ease-out;
        }


        @keyframes farmiqPageIn {

          from {
            opacity: 0.85;
          }

          to {
            opacity: 1;
          }


        }


        /* ===================================================
           SIDEBAR SCROLLBAR
        =================================================== */

        .farmiq-sidebar nav::-webkit-scrollbar {
  width: 4px;
}

.farmiq-sidebar nav::-webkit-scrollbar-track {
  background: transparent;
}

.farmiq-sidebar nav::-webkit-scrollbar-thumb {
  background: rgba(94, 227, 154, 0.22);
  border-radius: 10px;
}

.farmiq-sidebar nav::-webkit-scrollbar-thumb:hover {
  background: rgba(94, 227, 154, 0.38);
}

        /* ===================================================
           MOBILE
        =================================================== */

        @media (max-width: 900px) {

          .desktop-sidebar {
            display: none !important;
          }


          .main-content-shell {
            margin-left: 0 !important;
          }


          .farmiq-mobile-menu {
            display: flex !important;
          }


          .header-weather {
            display: none !important;
          }


          .profile-name {
            display: none;
          }

        }


        @media (max-width: 650px) {

          .farmiq-language-wrapper {
            display: none !important;
          }


          .farmiq-profile {
            padding-right:
              4px !important;
          }


          .farmiq-header {
            padding:
              0 14px !important;
          }


          .farmiq-main {
            padding:
              20px 14px !important;
          }


          .farmiq-dropdown {
            position: fixed !important;

            top: 66px !important;

            right: 12px !important;

            width:
              calc(100vw - 24px) !important;
          }

        }


        /* ===================================================
           MOBILE SIDEBAR ANIMATION
        =================================================== */

        @keyframes farmiqMobileSlide {

          from {
            transform:
              translateX(-100%);
          }

          to {
            transform:
              translateX(0);
          }

        }

      `}</style>


      {/* =====================================================
          APPLICATION WRAPPER
      ===================================================== */}

      <div
        style={{
          display: 'flex',

          minHeight: '100vh',

          width: '100%',

          background:
            'linear-gradient(135deg, #F4FBF6 0%, #EEF9F2 45%, #F7FCF8 100%)',

          color: '#294B3A',

          fontFamily:
            "'Outfit', sans-serif",
        }}
      >

        {/* ===================================================
            DESKTOP SIDEBAR
        =================================================== */}

        <div className="desktop-sidebar">
          <Sidebar />
        </div>


        {/* ===================================================
            MAIN CONTENT
        =================================================== */}

        <div
          className="main-content-shell farmiq-main-shell"
          style={{
            flex: 1,

            marginLeft: '260px',

            minWidth: 0,

            minHeight: '100vh',

            display: 'flex',

            flexDirection: 'column',

            background:
              'linear-gradient(180deg, #F4FBF6 0%, #EDF8F0 100%)',
          }}
        >

          <Header />


          <main
            className="farmiq-main"
            style={{
              flex: 1,

              width: '100%',

              maxWidth: '1500px',

              margin: '0 auto',

              padding:
                '30px 34px 50px',

              position: 'relative',
            }}
          >

            {/* =================================================
                SOFT BACKGROUND GLOW
            ================================================= */}

            <div
              style={{
                position: 'fixed',

                width: '500px',
                height: '500px',

                top: '25%',
                right: '-250px',

                borderRadius: '50%',

                background:
                  'rgba(34, 197, 94, 0.045)',

                filter:
                  'blur(100px)',

                pointerEvents: 'none',

                zIndex: 0,
              }}
            />


            <div
              style={{
                position: 'fixed',

                width: '400px',
                height: '400px',

                bottom: '-180px',
                left: '28%',

                borderRadius: '50%',

                background:
                  'rgba(16, 185, 129, 0.035)',

                filter:
                  'blur(100px)',

                pointerEvents: 'none',

                zIndex: 0,
              }}
            />


            {/* =================================================
                PAGE CONTENT
            ================================================= */}

            <div
              style={{
                position: 'relative',

                zIndex: 1,

                width: '100%',
              }}
            >
              {renderPage()}
            </div>

          </main>

        </div>


        {/* ===================================================
            MOBILE DRAWER
        =================================================== */}

        {mobileMenuOpen && (
          <div
            style={{
              position: 'fixed',

              inset: 0,

              background:
                'rgba(30, 70, 45, 0.16)',

              backdropFilter:
                'blur(5px)',

              WebkitBackdropFilter:
                'blur(5px)',

              zIndex: 999,
            }}
            onClick={() =>
              setMobileMenuOpen(false)
            }
          >

            <div
              style={{
                width: '260px',

                height: '100%',

                animation:
                  'farmiqMobileSlide 0.22s ease-out',
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <Sidebar mobile />
            </div>

          </div>
        )}

      </div>

    </>
  );
};