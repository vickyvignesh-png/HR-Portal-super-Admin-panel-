import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNameMap = {
  '': 'Dashboard',
  'dashboard': 'Dashboard',
  'companies': 'Company Details',
  'subscriptions': 'Company Subscription',
  'plans': 'Subscription Plans',
  'billing': 'Payments & Invoices',
  'usage': 'Company Usage',
  'reports': 'Platform Reports',
  'support': 'Support',
  'access': 'Roles & Permissions',
  'settings': 'Platform Settings',
  'security': 'Audit & Security',
  'new': 'Create',
  'edit': 'Edit'
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <div className="breadcrumb-item">
        <Link to="/" title="Home">
          <Home size={14} />
        </Link>
      </div>

      {pathnames.length === 0 && (
        <>
          <span className="breadcrumb-separator">
            <ChevronRight size={12} />
          </span>
          <div className="breadcrumb-item active">Dashboard</div>
        </>
      )}

      {pathnames.map((segment, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = routeNameMap[segment] || segment;

        return (
          <React.Fragment key={to}>
            <span className="breadcrumb-separator">
              <ChevronRight size={12} />
            </span>
            <div className={`breadcrumb-item ${isLast ? 'active' : ''}`}>
              {isLast ? <span>{name}</span> : <Link to={to}>{name}</Link>}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
