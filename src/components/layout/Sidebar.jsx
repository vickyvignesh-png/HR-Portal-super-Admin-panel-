import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  IndianRupee,
  ReceiptIndianRupee,
  BarChart3,
  LifeBuoy,
  ShieldCheck,
  Settings,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CreditCard,
  Activity,
  Layers,
  FileSpreadsheet,
  TrendingUp,
  Users,
  LineChart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { activeReportType, setActiveReportType } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Track expanded parent states
  const [expandedMenus, setExpandedMenus] = useState(() => {
    const path = location.pathname;
    return {
      company: path.startsWith('/companies') || path.startsWith('/subscriptions') || path.startsWith('/usage'),
      billing: path.startsWith('/plans') || path.startsWith('/billing'),
      reports: path.startsWith('/reports')
    };
  });

  // Keep parent visually expanded when one of its children is active
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/companies') || path.startsWith('/subscriptions') || path.startsWith('/usage')) {
      setExpandedMenus((prev) => ({ ...prev, company: true }));
    } else if (path.startsWith('/plans') || path.startsWith('/billing')) {
      setExpandedMenus((prev) => ({ ...prev, billing: true }));
    } else if (path.startsWith('/reports')) {
      setExpandedMenus((prev) => ({ ...prev, reports: true }));
    }
  }, [location.pathname]);

  const toggleParent = (key) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setExpandedMenus((prev) => ({ ...prev, [key]: true }));
      return;
    }
    setExpandedMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReportSelect = (reportType) => {
    if (setActiveReportType) {
      setActiveReportType(reportType);
    }
    if (location.pathname !== '/reports') {
      navigate('/reports');
    }
    setIsMobileOpen(false);
  };

  const isCompanyActive =
    location.pathname.startsWith('/companies') ||
    location.pathname.startsWith('/subscriptions') ||
    location.pathname.startsWith('/usage');

  const isBillingActive =
    location.pathname.startsWith('/plans') ||
    location.pathname.startsWith('/billing');

  const isReportsActive = location.pathname.startsWith('/reports');

  return (
    <>
      <div
        className={`sidebar-backdrop ${isMobileOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Sidebar Header with Logo */}
        <div className={`sidebar-header ${isCollapsed ? 'collapsed' : ''}`}>
          <NavLink
            to="/"
            className={`sidebar-brand ${isCollapsed ? 'collapsed' : ''}`}
            onClick={() => setIsMobileOpen(false)}
            title="HR Portal"
          >
            {isCollapsed ? (
              <div className="sidebar-favicon-container">
                <img
                  src="/assets/OG%20Favicon.png"
                  alt="HR Portal Favicon"
                  className="sidebar-logo-collapsed"
                />
              </div>
            ) : (
              <img
                src="/assets/Blue%20HR%20Portal%20Logo%20on%20Transparency%20(1).png"
                alt="HR Portal Logo"
                className="sidebar-logo-expanded"
              />
            )}
          </NavLink>

          {!isCollapsed && (
            <button
              className="sidebar-collapse-btn"
              onClick={() => setIsCollapsed(true)}
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Dedicated Expand Button Bar when collapsed */}
        {isCollapsed && (
          <div className="sidebar-expand-bar">
            <button
              className="sidebar-expand-btn"
              onClick={() => setIsCollapsed(false)}
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Main Navigation (Exact 8 Top-Level Modules) */}
        <nav className="sidebar-nav">
          {/* 1. Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileOpen(false)}
            title={isCollapsed ? 'Dashboard' : undefined}
          >
            <LayoutDashboard className="nav-icon" />
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          {/* 2. Company (Expandable Parent) */}
          <div className="nav-group-item">
            <button
              type="button"
              className={`nav-parent-btn ${isCompanyActive ? 'parent-active' : ''}`}
              onClick={() => toggleParent('company')}
              title={isCollapsed ? 'Company' : undefined}
            >
              <Building2 className="nav-icon" />
              {!isCollapsed && (
                <>
                  <span>Company</span>
                  <ChevronDown
                    size={16}
                    className={`menu-chevron ${expandedMenus.company ? 'rotated' : ''}`}
                  />
                </>
              )}
            </button>

            {!isCollapsed && expandedMenus.company && (
              <div className="submenu-list">
                <NavLink
                  to="/companies"
                  className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Building2 className="sub-nav-icon" />
                  <span>Company Details</span>
                </NavLink>

                <NavLink
                  to="/subscriptions"
                  className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <CreditCard className="sub-nav-icon" />
                  <span>Company Subscription</span>
                </NavLink>

                <NavLink
                  to="/usage"
                  className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Activity className="sub-nav-icon" />
                  <span>Company Usage</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 3. Billing (Expandable Parent) */}
          <div className="nav-group-item">
            <button
              type="button"
              className={`nav-parent-btn ${isBillingActive ? 'parent-active' : ''}`}
              onClick={() => toggleParent('billing')}
              title={isCollapsed ? 'Billing' : undefined}
            >
              <IndianRupee className="nav-icon" />
              {!isCollapsed && (
                <>
                  <span>Billing</span>
                  <ChevronDown
                    size={16}
                    className={`menu-chevron ${expandedMenus.billing ? 'rotated' : ''}`}
                  />
                </>
              )}
            </button>

            {!isCollapsed && expandedMenus.billing && (
              <div className="submenu-list">
                <NavLink
                  to="/plans"
                  className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Layers className="sub-nav-icon" />
                  <span>Subscription Plans</span>
                </NavLink>

                <NavLink
                  to="/billing"
                  className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <ReceiptIndianRupee className="sub-nav-icon" />
                  <span>Payments & Invoices</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 4. Platform Reports (Expandable Parent - all 6 submodules on /reports) */}
          <div className="nav-group-item">
            <button
              type="button"
              className={`nav-parent-btn ${isReportsActive ? 'parent-active' : ''}`}
              onClick={() => toggleParent('reports')}
              title={isCollapsed ? 'Platform Reports' : undefined}
            >
              <BarChart3 className="nav-icon" />
              {!isCollapsed && (
                <>
                  <span>Platform Reports</span>
                  <ChevronDown
                    size={16}
                    className={`menu-chevron ${expandedMenus.reports ? 'rotated' : ''}`}
                  />
                </>
              )}
            </button>

            {!isCollapsed && expandedMenus.reports && (
              <div className="submenu-list">
                {[
                  { label: 'Company Reports', icon: FileSpreadsheet },
                  { label: 'Subscription Reports', icon: CreditCard },
                  { label: 'Revenue Reports', icon: IndianRupee },
                  { label: 'Usage Reports', icon: Activity },
                  { label: 'Candidate Reports', icon: Users },
                  { label: 'Platform Trend', icon: LineChart }
                ].map((rep) => {
                  const IconComponent = rep.icon;
                  const isCurrentActive =
                    isReportsActive &&
                    (activeReportType === rep.label || (!activeReportType && rep.label === 'Company Reports'));

                  return (
                    <button
                      key={rep.label}
                      type="button"
                      className={`sub-nav-link ${isCurrentActive ? 'active' : ''}`}
                      onClick={() => handleReportSelect(rep.label)}
                    >
                      <IconComponent className="sub-nav-icon" />
                      <span>{rep.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Support */}
          <NavLink
            to="/support"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileOpen(false)}
            title={isCollapsed ? 'Support' : undefined}
          >
            <LifeBuoy className="nav-icon" />
            {!isCollapsed && <span>Support</span>}
          </NavLink>

          {/* 6. Roles & Permissions */}
          <NavLink
            to="/access"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileOpen(false)}
            title={isCollapsed ? 'Roles & Permissions' : undefined}
          >
            <ShieldCheck className="nav-icon" />
            {!isCollapsed && <span>Roles & Permissions</span>}
          </NavLink>

          {/* 7. Platform Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileOpen(false)}
            title={isCollapsed ? 'Platform Settings' : undefined}
          >
            <Settings className="nav-icon" />
            {!isCollapsed && <span>Platform Settings</span>}
          </NavLink>

          {/* 8. Audit & Security */}
          <NavLink
            to="/security"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileOpen(false)}
            title={isCollapsed ? 'Audit & Security' : undefined}
          >
            <Lock className="nav-icon" />
            {!isCollapsed && <span>Audit & Security</span>}
          </NavLink>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
