import React from 'react';

export const GlassCard = ({ children, style = {}, className = '', hoverEffect = true, onClick, dark = false }) => {
  const lightStyle = {
    background: 'rgba(255, 255, 255, 0.90)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(22, 163, 74, 0.14)',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(6, 78, 59, 0.07)',
    padding: '24px',
    transition: hoverEffect ? 'all 0.22s ease-out' : 'none',
    cursor: onClick ? 'pointer' : 'default',
  };

  const darkStyle = {
    background: 'rgba(255, 255, 255, 0.07)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.25)',
    padding: '24px',
    transition: hoverEffect ? 'all 0.22s ease-out' : 'none',
    cursor: onClick ? 'pointer' : 'default',
  };

  const baseStyle = dark ? darkStyle : lightStyle;

  return (
    <div
      onClick={onClick}
      className={`${dark ? 'dark-glass-card' : 'glass-card'} ${className}`}
      style={{ ...baseStyle, ...style }}
    >
      {children}
    </div>
  );
};
