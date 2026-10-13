import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  BriefcaseBusiness,
  Briefcase,
  AlertTriangle,
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
  Users,
  LineChart,
  Bell,
  Sliders
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

  const getParentForPath = (path) => {
    if (
      path.startsWith('/companies') ||
      path.startsWith('/subscriptions') ||
      path.startsWith('/usage')
    ) {
      return 'company';
    }
    if (path.startsWith('/jobs')) {
      return 'jobs';
    }
    if (path.startsWith('/plans') || path.startsWith('/billing') || path.startsWith('/payments')) {
      return 'billing';
    }
    if (path.startsWith('/reports')) {
      return 'reports';
    }
    if (path.startsWith('/settings')) {
      return 'settings';
    }
    return null;
  };

  // Single-expanded-submenu accordion state: only one parent expanded at a time
  const [expandedMenu, setExpandedMenu] = useState(() => {
    return getParentForPath(location.pathname);
  });

  // When opening a nested page directly, expand its corresponding parent automatically
  useEffect(() => {
    const parent = getParentForPath(location.pathname);
    if (parent) {
      setExpandedMenu(parent);
    }
  }, [location.pathname]);

  const toggleParent = (key) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setExpandedMenu(key);
      return;
    }
    // Clicking an already expanded parent collapses it; clicking another expands it and closes others
    setExpandedMenu((prev) => (prev === key ? null : key));
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

  const isJobsActive = location.pathname.startsWith('/jobs');

  const isBillingActive =
    location.pathname.startsWith('/plans') ||
    location.pathname.startsWith('/billing');

  const isReportsActive = location.pathname.startsWith('/reports');

  const isSettingsActive = location.pathname.startsWith('/settings');


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
        {/* Top Header with Brand Logo & Single Collapse/Expand Toggle Beside Logo */}
        <div className={`sidebar-header ${isCollapsed ? 'collapsed' : ''}`}>
          {isCollapsed ? (
            <div className="sidebar-header-collapsed-wrap">
              <NavLink
                to="/"
                className="sidebar-brand-collapsed"
                onClick={() => setIsMobileOpen(false)}
                title="HR Portal Super Admin"
              >
                <img
                  src="/assets/OG%20Favicon.png"
                  alt="HR Portal Favicon"
                  className="sidebar-logo-collapsed"
                />
              </NavLink>
              <button
                type="button"
                className="sidebar-expand-btn"
                onClick={() => setIsCollapsed(false)}
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <>
              <NavLink
                to="/"
                className="sidebar-brand"
                onClick={() => setIsMobileOpen(false)}
                title="HR Portal Super Admin"
              >
                <div className="sidebar-brand-wrapper">
                  <img
                    src="/assets/Blue%20HR%20Portal%20Logo%20on%20Transparency%20(1).png"
                    alt="HR Portal Logo"
                    className="sidebar-logo-expanded"
                  />
                </div>
              </NavLink>
              <button
                type="button"
                className="sidebar-collapse-btn"
                onClick={() => setIsCollapsed(true)}
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          )}
        </div>

        {/* Sidebar Navigation (Independently Scrollable) */}
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
          <div className={`nav-group-item ${isCompanyActive ? 'group-active' : ''}`}>
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
                    className={`menu-chevron ${expandedMenu === 'company' ? 'rotated' : ''}`}
                  />
                </>
              )}
            </button>

            {!isCollapsed && expandedMenu === 'company' && (
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

          {/* 3. Job Management (Expandable Parent) */}
          <div className={`nav-group-item ${isJobsActive ? 'group-active' : ''}`}>
            <button
              type="button"
              className={`nav-parent-btn ${isJobsActive ? 'parent-active' : ''}`}
              onClick={() => toggleParent('jobs')}
              title={isCollapsed ? 'Job Management' : undefined}
            >
              <BriefcaseBusiness className="nav-icon" />
              {!isCollapsed && (
                <>
                  <span>Job Management</span>
                  <ChevronDown
                    size={16}
                    className={`menu-chevron ${expandedMenu === 'jobs' ? 'rotated' : ''}`}
                  />
                </>
              )}
            </button>

            {!isCollapsed && expandedMenu === 'jobs' && (
              <div className="submenu-list">
                <NavLink
                  to="/jobs/posted"
                  className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Briefcase className="sub-nav-icon" />
                  <span>Posted Jobs</span>
                </NavLink>

                <NavLink
                  to="/jobs/reported"
                  className={({ isActive }) => `sub-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <AlertTriangle className="sub-nav-icon" />
                  <span>Reported Jobs</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 4. Candidate Management */}
          <NavLink
            to="/candidates"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileOpen(false)}
            title={isCollapsed ? 'Candidate Management' : undefined}
          >
            <Users className="nav-icon" />
            {!isCollapsed && <span>Candidate Management</span>}
          </NavLink>

          {/* 5. Billing (Expandable Parent) */}
          <div className={`nav-group-item ${isBillingActive ? 'group-active' : ''}`}>
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
                    className={`menu-chevron ${expandedMenu === 'billing' ? 'rotated' : ''}`}
                  />
                </>
              )}
            </button>

            {!isCollapsed && expandedMenu === 'billing' && (
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

          {/* 6. Platform Reports (Expandable Parent) */}
          <div className={`nav-group-item ${isReportsActive ? 'group-active' : ''}`}>
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
                    className={`menu-chevron ${expandedMenu === 'reports' ? 'rotated' : ''}`}
                  />
                </>
              )}
            </button>

            {!isCollapsed && expandedMenu === 'reports' && (
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

          {/* 7. Support */}
          <NavLink
            to="/support"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileOpen(false)}
            title={isCollapsed ? 'Support' : undefined}
          >
            <LifeBuoy className="nav-icon" />
            {!isCollapsed && <span>Support</span>}
          </NavLink>

          {/* 8. Roles & Permissions */}
          <NavLink
            to="/access"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileOpen(false)}
            title={isCollapsed ? 'Roles & Permissions' : undefined}
          >
            <ShieldCheck className="nav-icon" />
            {!isCollapsed && <span>Roles & Permissions</span>}
          </NavLink>

          {/* 9. Platform Settings (Expandable Parent) */}
          <div className={`nav-group-item ${isSettingsActive ? 'group-active' : ''}`}>
            <button
              type="button"
              className={`nav-parent-btn ${isSettingsActive ? 'parent-active' : ''}`}
              onClick={() => toggleParent('settings')}
              title={isCollapsed ? 'Platform Settings' : undefined}
            >
              <Settings className="nav-icon" />
              {!isCollapsed && (
                <>
                  <span>Platform Settings</span>
                  <ChevronDown
                    size={16}
                    className={`menu-chevron ${expandedMenu === 'settings' ? 'rotated' : ''}`}
                  />
                </>
              )}
            </button>

            {!isCollapsed && expandedMenu === 'settings' && (
              <div className="submenu-list">
                <NavLink
                  to="/settings"
                  end
                  className={({ isActive }) => {
                    const isDefaults = location.search.includes('tab=defaults');
                    return `sub-nav-link ${isActive && !isDefaults ? 'active' : ''}`;
                  }}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Bell className="sub-nav-icon" />
                  <span>Notification Settings</span>
                </NavLink>

                <NavLink
                  to="/settings?tab=defaults"
                  className={({ isActive }) => {
                    const isDefaults = location.search.includes('tab=defaults');
                    return `sub-nav-link ${isActive && isDefaults ? 'active' : ''}`;
                  }}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Sliders className="sub-nav-icon" />
                  <span>System Defaults</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 10. Audit & Security */}
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
