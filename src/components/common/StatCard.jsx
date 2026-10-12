import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up',
  subtitle,
  variant = 'blue'
}) => {
  const iconVariantClass = {
    blue: 'stat-icon-blue',
    green: 'stat-icon-green',
    yellow: 'stat-icon-yellow',
    red: 'stat-icon-red',
    purple: 'stat-icon-purple'
  }[variant] || 'stat-icon-blue';

  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className={`stat-icon-wrapper ${iconVariantClass}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      {(trend || subtitle) && (
        <div className="stat-card-bottom">
          {trend && (
            <span
              className={`stat-badge-trend ${
                trendDirection === 'up' ? 'trend-up' : 'trend-down'
              }`}
            >
              {trendDirection === 'up' ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {trend}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
