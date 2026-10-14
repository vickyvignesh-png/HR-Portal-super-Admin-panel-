import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { useToast } from './ToastContext';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [dataVersion, setDataVersion] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('hr_superadmin_auth') === 'true';
  });

  const [currentUser] = useState({
    id: 'USR-001',
    name: 'Marcus Vance',
    role: 'Super Admin',
    email: 'superadmin@2026'
  });

  const { addToast } = useToast();

  useEffect(() => {
    storageService.init();
  }, []);

  const login = (email, pin) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPin = String(pin || '').trim();

    if ((cleanEmail === 'superadmin@2026' || cleanEmail === 'hrportal@gmail.com') && cleanPin === '2026') {
      sessionStorage.setItem('hr_superadmin_auth', 'true');
      setIsAuthenticated(true);
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Invalid credentials.'
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('hr_superadmin_auth');
    setIsAuthenticated(false);
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been signed out of the Super Admin demonstration session.'
    });
  };

  const triggerRefresh = () => {
    setDataVersion((v) => v + 1);
  };

  const resetDemoData = () => {
    storageService.resetAll();
    triggerRefresh();
    addToast({
      type: 'info',
      title: 'Demo Data Reset',
      message: 'All local demo data has been restored to factory demonstration state.'
    });
  };

  const [activeReportType, setActiveReportType] = useState('Company Reports');

  return (
    <AppContext.Provider
      value={{
        dataVersion,
        triggerRefresh,
        resetDemoData,
        currentUser,
        isAuthenticated,
        login,
        logout,
        activeReportType,
        setActiveReportType
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
