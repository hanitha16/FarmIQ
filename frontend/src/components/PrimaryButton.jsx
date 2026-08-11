import React from 'react';

export const PrimaryButton = ({
  children,
  onClick,
  loading = false,
  style = {},
  type = 'button',
  disabled = false,
  variant = 'primary', // 'primary' | 'secondary-dark' | 'danger'
}) => {
  const isDisabled = disabled || loading;

  const variantClass = {
    primary: 'btn-primary',
    'secondary-dark': 'btn-secondary-dark',
    danger: 'btn-danger',
  }[variant] || 'btn-primary';

  return (
    <button
      type={type}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      className={variantClass}
      style={{
        ...style,
        opacity: isDisabled ? 0.65 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? (
        <>
          <span className="spinner" />
          <span>Processing...</span>
        </>
      ) : children}
    </button>
  );
};
