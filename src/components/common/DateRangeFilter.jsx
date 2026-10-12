import React from 'react';
import { Calendar } from 'lucide-react';

export const DateRangeFilter = ({
  value = 'all',
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-muted" />
        <select
          className="filter-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Filter by time range"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="lastQuarter">Last Quarter</option>
          <option value="thisYear">This Year</option>
        </select>
      </div>
    </div>
  );
};
