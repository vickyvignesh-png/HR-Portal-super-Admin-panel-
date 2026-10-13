import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';

export const PageHeader = ({
  title,
  actions,
  badge
}) => {
  return (
    <div className="page-header">
      <div className="page-header-text">
        <div className="flex items-center gap-3">
          <h1 className="page-title">{title}</h1>
          {badge}
        </div>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
};

