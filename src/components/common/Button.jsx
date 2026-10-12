import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  id,
  title
}) => {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    danger: 'btn-danger',
    dangerOutline: 'btn-danger-outline',
    icon: 'btn-icon-only'
  }[variant] || 'btn-primary';

  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  }[size] || '';

  return (
    <button
      id={id}
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children}
    </button>
  );
};
