import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  id
}) => {
  return (
    <div className={`search-bar-wrapper ${className}`.trim()}>
      <Search className="search-bar-icon" size={16} />
      <input
        id={id}
        type="text"
        className="search-bar-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search-bar-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
