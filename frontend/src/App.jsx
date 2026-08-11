import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WelcomePage } from './pages/WelcomePage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './pages/DashboardLayout';

function MainAppContent() {
  const { user, token, loading } = useAuth();
  // Navigation view state: 'welcome' | 'signup' | 'login' | 'dashboard'
  const [currentView, setCurrentView] = useState('welcome');

  if (loading) {
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
      }}>
        <div style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>
          Farm<span style={{ color: '#84cc16' }}>IQ</span>
        </div>
        <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)' }}>
          Loading farm intelligence...
        </p>
      </div>
    );
  }

  // If user is authenticated and navigating to dashboard or default, show protected Dashboard Layout
  if (token && user && currentView === 'dashboard') {
    return <DashboardLayout onNavigate={(view) => setCurrentView(view)} />;
  }

  // Routing Switch
  switch (currentView) {
    case 'signup':
      return <SignUpPage onNavigate={(view) => setCurrentView(view)} />;

    case 'login':
      return <LoginPage onNavigate={(view) => setCurrentView(view)} />;

    case 'dashboard':
      if (token && user) {
        return <DashboardLayout onNavigate={(view) => setCurrentView(view)} />;
      }
      // If not logged in, redirect to login page
      return <LoginPage onNavigate={(view) => setCurrentView(view)} />;

    case 'welcome':
    default:
      // If user is already authenticated when landing on welcome page, allow option to go straight to dashboard
      return <WelcomePage onNavigate={(view) => setCurrentView(view)} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
