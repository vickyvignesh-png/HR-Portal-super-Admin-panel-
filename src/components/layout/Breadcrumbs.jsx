import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNameMap = {
  '': 'Dashboard',
  'dashboard': 'Dashboard',
  'companies': 'Company Details',
  'subscriptions': 'Company Subscription',
  'jobs': 'Job Management',
  'posted': 'Posted Jobs',
  'reported': 'Reported Jobs',
  'candidates': 'Candidate Management',
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
  return null;
};
