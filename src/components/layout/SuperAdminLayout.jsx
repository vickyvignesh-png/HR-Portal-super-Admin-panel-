import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const SuperAdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <div
        className={`app-wrapper ${
          isCollapsed ? 'sidebar-collapsed' : ''
        }`}
      >
        <Topbar onToggleMobile={() => setIsMobileOpen(true)} />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
