import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, RotateCcw, ShieldCheck, ChevronDown, LogOut, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Button } from '../common/Button';

export const Topbar = ({ onToggleMobile }) => {
  const { resetDemoData, currentUser, logout } = useApp();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleMobile}
          aria-label="Toggle mobile menu"
        >
          <Menu size={20} />
        </button>

        <div className="demo-badge-indicator" title="Changes persist to localStorage">
          <ShieldCheck size={13} />
          <span>Super Admin Mode (Local Demo)</span>
        </div>
      </div>

      <div className="topbar-right">
        <Button
          variant="secondary"
          size="sm"
          icon={RotateCcw}
          onClick={() => setShowResetDialog(true)}
          title="Restore factory demonstration records"
        >
          Reset Demo Data
        </Button>

        <button
          className="topbar-action-btn"
          aria-label="Notifications"
          title="Super Admin Notifications"
        >
          <Bell size={18} />
          <span className="action-dot"></span>
        </button>

        {/* User Profile Menu */}
        <div className="topbar-profile-container" ref={profileMenuRef}>
          <button
            type="button"
            className="topbar-profile-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-expanded={isProfileOpen}
            aria-label="User profile menu"
          >
            <div className="topbar-avatar">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="topbar-user-meta">
              <span className="topbar-user-name">{currentUser.name}</span>
              <span className="topbar-user-role">{currentUser.role}</span>
            </div>
            <ChevronDown size={14} className="text-muted" />
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-user-header">
                <div className="font-semibold text-primary">{currentUser.name}</div>
                <div className="dropdown-user-email">{currentUser.email}</div>
                <div className="role-badge mt-1">{currentUser.role}</div>
              </div>

              <button
                type="button"
                className="dropdown-item-btn logout-btn"
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        <ConfirmDialog
          isOpen={showResetDialog}
          onClose={() => setShowResetDialog(false)}
          onConfirm={resetDemoData}
          title="Reset All Demo Data"
          message="Are you sure you want to reset all mock companies, subscriptions, plans, payments, tickets, and platform settings back to initial factory demo state? Any local modifications will be replaced."
          confirmText="Yes, Reset Data"
          variant="danger"
        />
      </div>
    </header>
  );
};
