import React from 'react';

export const GlassInput = ({ icon: Icon, rightElement, ...props }) => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {Icon && (
        <Icon
          size={18}
          color="#94a3b8"
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
        />
      )}

      <input
        {...props}
        className="form-input"
        style={{
          width: '100%',
          padding: '12px 16px',
          paddingLeft: Icon ? '42px' : '16px',
          paddingRight: rightElement ? '42px' : '16px',
          borderRadius: '12px',
          border: '1px solid rgba(203, 213, 225, 0.8)',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          fontSize: '0.95rem',
          color: '#0f172a',
          outline: 'none',
          transition: 'all 0.2s ease',
          ...props.style
        }}
      />

      {rightElement && (
        <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
          {rightElement}
        </div>
      )}
    </div>
  );
};
