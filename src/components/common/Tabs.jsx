import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div className={`tabs-nav ${className}`.trim()} role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className={`tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <tab.icon size={16} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="tab-badge">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
