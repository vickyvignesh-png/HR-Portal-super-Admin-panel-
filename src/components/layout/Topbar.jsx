import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  CheckCheck,
  Calendar,
  ChevronDown,
  Settings,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './Topbar.css';

export const Topbar = ({ onToggleMobile }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();

  // Administrator Profile Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Live Current Date & Time
  const [currentDateTime, setCurrentDateTime] = useState(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      time: now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDateTime({
        date: now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        time: now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const adminInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'MV';

  // Notification State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationMenuRef = useRef(null);
  const [notifications, setNotifications] = useState([
    {
      id: 'N1',
      title: 'Company Verification Validated',
      desc: 'Apex Global Technologies GST verification completed.',
      time: '10m ago',
      unread: true
    },
    {
      id: 'N2',
      title: 'Subscription Renewal Alert',
      desc: 'SwiftLogistics Express renewal due in 7 days.',
      time: '1h ago',
      unread: true
    },
    {
      id: 'N3',
      title: 'Transaction Failed',
      desc: 'TechNova Solutions license payment of ₹48,000 failed.',
      time: '3h ago',
      unread: true
    },
    {
      id: 'N4',
      title: 'Job Requisition Flagged',
      desc: 'REQ-2003 Senior DevOps Specialist reported by applicant.',
      time: '1d ago',
      unread: false
    }
  ]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="topbar">
      {/* Left: Mobile Toggle Only (Desktop toggle is solely in sidebar) */}
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-toggle-btn mobile-menu-toggle"
          onClick={onToggleMobile}
          aria-label="Toggle mobile menu"
          title="Open Menu"
        >
          <Menu size={18} />
        </button>
      </div>



      {/* Right: Date-Time Display, Notifications, and Administrator Profile Dropdown */}
      <div className="topbar-right">
        {/* Date and Time Display (Visible on shared header) */}
        <div className="topbar-datetime-display" title="Current Local Date & Time">
          <Calendar size={14} className="topbar-datetime-icon" />
          <span className="topbar-date-text">{currentDateTime.date}</span>
          <span className="topbar-datetime-divider">•</span>
          <span className="topbar-time-text">{currentDateTime.time}</span>
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="topbar-notification-container" ref={notificationMenuRef}>
          <button
            type="button"
            className="topbar-action-btn"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            aria-label="Platform Notifications"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotificationsCount > 0 && <span className="action-dot" />}
          </button>

          {isNotificationsOpen && (
            <div className="notifications-dropdown-menu">
              <div className="notifications-header">
                <span className="notifications-title">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <button
                    type="button"
                    className="mark-read-btn"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="notifications-empty-state">
                    <CheckCheck size={28} className="text-muted" />
                    <span>All caught up! No notifications.</span>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`notification-item ${item.unread ? 'unread' : ''}`}
                    >
                      {item.unread && <span className="notification-bullet" />}
                      <div className="notification-content">
                        <span className="notification-item-title">{item.title}</span>
                        <span className="notification-item-desc">{item.desc}</span>
                        <span className="notification-item-time">{item.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Administrator Profile Dropdown with Logout */}
        <div className="topbar-profile-container" ref={profileMenuRef}>
          <button
            type="button"
            className={`topbar-profile-trigger ${isProfileOpen ? 'active' : ''}`}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="Administrator profile menu"
            title="Admin account details"
          >
            <div className="topbar-profile-avatar" title={currentUser?.name || 'Marcus Vance'}>
              {adminInitials}
            </div>
            <div className="topbar-profile-meta">
              <span className="topbar-profile-name">{currentUser?.name || 'Marcus Vance'}</span>
              <span className="topbar-profile-role">{currentUser?.role || 'Super Admin'}</span>
            </div>
            <ChevronDown size={14} className={`topbar-profile-chevron ${isProfileOpen ? 'rotated' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown-menu">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-avatar">
                  {adminInitials}
                </div>
                <div className="profile-dropdown-details">
                  <span className="profile-dropdown-name">{currentUser?.name || 'Marcus Vance'}</span>
                  <span className="profile-dropdown-email">{currentUser?.email || 'hrportal@gmail.com'}</span>
                  <span className="profile-dropdown-role">{currentUser?.role || 'Super Admin'}</span>
                </div>
              </div>

              <div className="profile-dropdown-actions">
                <button
                  type="button"
                  className="profile-dropdown-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/settings');
                  }}
                >
                  <Settings size={15} />
                  <span>Platform Settings</span>
                </button>

                <button
                  type="button"
                  className="profile-dropdown-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/access');
                  }}
                >
                  <ShieldCheck size={15} />
                  <span>Roles & Permissions</span>
                </button>
              </div>

              <div className="profile-dropdown-divider" />

              <button
                type="button"
                className="profile-dropdown-item profile-dropdown-logout"
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
