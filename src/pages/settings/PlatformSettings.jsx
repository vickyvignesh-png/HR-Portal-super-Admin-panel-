import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Settings,
  Save,
  RotateCcw,
  Bell,
  Sliders,
  Mail,
  Smartphone,
  Radio,
  Clock,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { storageService } from '../../services/storageService';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import './PlatformSettings.css';

export const PlatformSettings = () => {
  const { dataVersion, triggerRefresh } = useApp();
  const { addToast } = useToast();
  const location = useLocation();

  // Exactly two settings sections: 'notifications' | 'defaults'
  const [activeTab, setActiveTab] = useState(() => {
    return location.search.includes('tab=defaults') ? 'defaults' : 'notifications';
  });

  useEffect(() => {
    if (location.search.includes('tab=defaults')) {
      setActiveTab('defaults');
    } else {
      setActiveTab('notifications');
    }
  }, [location.search]);

  const settings = useMemo(() => {
    const raw = storageService.getSettings();
    return {
      notifications: {
        emailNotifications: true,
        emailDigestFrequency: 'Daily',
        senderEmail: 'notifications@hrportal.example.com',
        senderName: 'HR Portal Super Admin',
        smsAlerts: true,
        smsGateway: 'Standard Telecom Route',
        urgentIncidentSms: true,
        pushNotifications: true,
        pushAudioAlert: true,
        highPriorityPush: true,
        ...(raw.notifications || {})
      },
      systemDefaults: {
        defaultCurrency: 'INR',
        taxRatePercentage: 18.0,
        supportEmail: 'support-admin@hrportal.example.com',
        defaultTrialDays: 14,
        standardJobQuota: 50,
        resumeSearchQuota: 500,
        renewalReminderDays: 14,
        inactivityWarningDays: 30,
        gracePeriodDays: 7,
        accountSuspensionDays: 15,
        ...(raw.systemDefaults || {})
      }
    };
  }, [dataVersion]);

  const [localSettings, setLocalSettings] = useState(settings);

  // Sync when dataVersion updates
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleNotificationChange = (field, val) => {
    setLocalSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: val
      }
    }));
  };

  const handleDefaultsChange = (field, val) => {
    setLocalSettings((prev) => ({
      ...prev,
      systemDefaults: {
        ...prev.systemDefaults,
        [field]: val
      }
    }));
  };

  const handleSaveAll = () => {
    storageService.saveSettings(localSettings);
    triggerRefresh();
    addToast({
      type: 'success',
      title: 'Platform Settings Saved',
      message: 'Notification configurations and system defaults were saved successfully.'
    });
  };

  const handleResetDefaults = () => {
    setLocalSettings(settings);
    addToast({
      type: 'info',
      title: 'Changes Discarded',
      message: 'Reverted unsaved edits back to currently stored settings.'
    });
  };

  return (
    <div className="settings-container">
      <PageHeader
        title="Platform Settings"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={RotateCcw} onClick={handleResetDefaults}>
              Discard Changes
            </Button>
            <Button variant="primary" icon={Save} onClick={handleSaveAll}>
              Save Settings
            </Button>
          </div>
        }
      />

      {/* Exactly Two Settings Sections */}
      <Tabs
        tabs={[
          { id: 'notifications', label: 'Notification Settings', icon: Bell },
          { id: 'defaults', label: 'System Defaults', icon: Sliders }
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'defaults') {
            navigate('/settings?tab=defaults', { replace: true });
          } else {
            navigate('/settings', { replace: true });
          }
        }}
      />

      {/* 1. NOTIFICATION SETTINGS SECTION */}
      {activeTab === 'notifications' && (
        <div className="settings-card">
          {/* A. Platform Email Settings */}
          <div className="settings-section-block">
            <div className="settings-section-header">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-blue" />
                <h3 className="settings-section-title">Platform Email Settings</h3>
              </div>
              <p className="settings-section-desc">Manage system-generated dispatch emails and administrative delivery triggers</p>
            </div>

            <div className="flex flex-col">
              <div className="toggle-setting-row">
                <div className="toggle-setting-info">
                  <span className="toggle-title">System Email Notifications</span>
                  <span className="toggle-desc">Dispatch automated email notifications for company verification, subscription renewals, and billing</span>
                </div>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={Boolean(localSettings.notifications.emailNotifications)}
                  onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                />
              </div>

              <div className="settings-grid">
                <Select
                  label="Administrative Email Digest Frequency"
                  value={localSettings.notifications.emailDigestFrequency || 'Daily'}
                  onChange={(e) => handleNotificationChange('emailDigestFrequency', e.target.value)}
                  options={['Real-time', 'Daily', 'Weekly Summary', 'Disabled']}
                />
                <Input
                  label="Dispatch Sender Address"
                  type="email"
                  value={localSettings.notifications.senderEmail || ''}
                  onChange={(e) => handleNotificationChange('senderEmail', e.target.value)}
                  placeholder="notifications@hrportal.example.com"
                />
                <Input
                  label="Dispatch Sender Display Name"
                  value={localSettings.notifications.senderName || ''}
                  onChange={(e) => handleNotificationChange('senderName', e.target.value)}
                  placeholder="HR Portal Super Admin"
                />
              </div>
            </div>
          </div>

          {/* B. SMS Settings */}
          <div className="settings-section-block">
            <div className="settings-section-header">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-blue" />
                <h3 className="settings-section-title">SMS Settings</h3>
              </div>
              <p className="settings-section-desc">Configure carrier routing and urgent text escalations for critical operational anomalies</p>
            </div>

            <div className="flex flex-col">
              <div className="toggle-setting-row">
                <div className="toggle-setting-info">
                  <span className="toggle-title">Enable Platform SMS Notifications</span>
                  <span className="toggle-desc">Send automated SMS notifications to corporate tenant representatives</span>
                </div>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={Boolean(localSettings.notifications.smsAlerts)}
                  onChange={(e) => handleNotificationChange('smsAlerts', e.target.checked)}
                />
              </div>

              <div className="toggle-setting-row">
                <div className="toggle-setting-info">
                  <span className="toggle-title">Urgent SMS Alerts for Incident Outages</span>
                  <span className="toggle-desc">Direct high-severity platform failure notices immediately to Super Admin mobile phones</span>
                </div>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={Boolean(localSettings.notifications.urgentIncidentSms)}
                  onChange={(e) => handleNotificationChange('urgentIncidentSms', e.target.checked)}
                />
              </div>

              <div className="settings-grid">
                <Select
                  label="Primary SMS Gateway Carrier"
                  value={localSettings.notifications.smsGateway || 'Standard Telecom Route'}
                  onChange={(e) => handleNotificationChange('smsGateway', e.target.value)}
                  options={['Standard Telecom Route', 'High-Priority Enterprise Route', 'Local Regulatory SMS Gateway']}
                />
              </div>
            </div>
          </div>

          {/* C. Push Notification Settings */}
          <div className="settings-section-block">
            <div className="settings-section-header">
              <div className="flex items-center gap-2">
                <Radio size={16} className="text-blue" />
                <h3 className="settings-section-title">Push Notification Settings</h3>
              </div>
              <p className="settings-section-desc">Real-time in-browser alerts and administrative telemetry pings</p>
            </div>

            <div className="flex flex-col">
              <div className="toggle-setting-row">
                <div className="toggle-setting-info">
                  <span className="toggle-title">In-Browser Real-Time Push Notifications</span>
                  <span className="toggle-desc">Display web push notification toasts for immediate support escalations</span>
                </div>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={Boolean(localSettings.notifications.pushNotifications)}
                  onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                />
              </div>

              <div className="toggle-setting-row">
                <div className="toggle-setting-info">
                  <span className="toggle-title">Audio Chime for Critical Alerts</span>
                  <span className="toggle-desc">Trigger subtle browser notification audio chime on critical platform anomalies</span>
                </div>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={Boolean(localSettings.notifications.pushAudioAlert)}
                  onChange={(e) => handleNotificationChange('pushAudioAlert', e.target.checked)}
                />
              </div>

              <div className="toggle-setting-row">
                <div className="toggle-setting-info">
                  <span className="toggle-title">High-Priority Security Escalation Pings</span>
                  <span className="toggle-desc">Broadcast instant banner notifications when multi-factor or authentication events fail</span>
                </div>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={Boolean(localSettings.notifications.highPriorityPush)}
                  onChange={(e) => handleNotificationChange('highPriorityPush', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SYSTEM DEFAULTS SECTION */}
      {activeTab === 'defaults' && (
        <div className="settings-card">
          {/* A. Default Limits */}
          <div className="settings-section-block">
            <div className="settings-section-header">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-blue" />
                <h3 className="settings-section-title">Default Limits</h3>
              </div>
              <p className="settings-section-desc">Baseline resource quotas assigned to newly registered enterprise tenants</p>
            </div>

            <div className="settings-grid">
              <Input
                label="Default Free Trial Duration (Days)"
                type="number"
                value={localSettings.systemDefaults.defaultTrialDays}
                onChange={(e) => handleDefaultsChange('defaultTrialDays', parseInt(e.target.value, 10) || 14)}
              />
              <Input
                label="Standard Monthly Job Posting Limit"
                type="number"
                value={localSettings.systemDefaults.standardJobQuota}
                onChange={(e) => handleDefaultsChange('standardJobQuota', parseInt(e.target.value, 10) || 50)}
              />
              <Input
                label="Monthly Candidate Resume Access Limit"
                type="number"
                value={localSettings.systemDefaults.resumeSearchQuota}
                onChange={(e) => handleDefaultsChange('resumeSearchQuota', parseInt(e.target.value, 10) || 500)}
              />
            </div>
          </div>

          {/* B. Reminder Rules */}
          <div className="settings-section-block">
            <div className="settings-section-header">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue" />
                <h3 className="settings-section-title">Reminder Rules</h3>
              </div>
              <p className="settings-section-desc">Timelines for dispatching recurring automated renewal alerts and account warnings</p>
            </div>

            <div className="settings-grid">
              <Input
                label="Subscription Renewal Warning Horizon (Days Prior)"
                type="number"
                value={localSettings.systemDefaults.renewalReminderDays}
                onChange={(e) => handleDefaultsChange('renewalReminderDays', parseInt(e.target.value, 10) || 14)}
              />
              <Input
                label="Tenant Inactivity Warning Threshold (Days)"
                type="number"
                value={localSettings.systemDefaults.inactivityWarningDays}
                onChange={(e) => handleDefaultsChange('inactivityWarningDays', parseInt(e.target.value, 10) || 30)}
              />
            </div>
          </div>

          {/* C. Expiry Rules */}
          <div className="settings-section-block">
            <div className="settings-section-header">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-blue" />
                <h3 className="settings-section-title">Expiry Rules</h3>
              </div>
              <p className="settings-section-desc">Grace periods and mandatory account suspension triggers upon subscription termination</p>
            </div>

            <div className="settings-grid">
              <Input
                label="Payment Grace Period Duration (Days)"
                type="number"
                value={localSettings.systemDefaults.gracePeriodDays}
                onChange={(e) => handleDefaultsChange('gracePeriodDays', parseInt(e.target.value, 10) || 7)}
              />
              <Input
                label="Suspension Enforcement Post-Grace (Days)"
                type="number"
                value={localSettings.systemDefaults.accountSuspensionDays}
                onChange={(e) => handleDefaultsChange('accountSuspensionDays', parseInt(e.target.value, 10) || 15)}
              />
            </div>
          </div>

          {/* D. Other Common Platform Defaults */}
          <div className="settings-section-block">
            <div className="settings-section-header">
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-blue" />
                <h3 className="settings-section-title">Common Platform Defaults</h3>
              </div>
              <p className="settings-section-desc">Standard financial currencies, statutory tax rates, and support communication routing</p>
            </div>

            <div className="settings-grid">
              <Select
                label="Default Platform Base Currency"
                value={localSettings.systemDefaults.defaultCurrency || 'INR'}
                onChange={(e) => handleDefaultsChange('defaultCurrency', e.target.value)}
                options={['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)']}
              />
              <Input
                label="Standard Statutory GST / Tax Rate (%)"
                type="number"
                step="0.1"
                value={localSettings.systemDefaults.taxRatePercentage}
                onChange={(e) => handleDefaultsChange('taxRatePercentage', parseFloat(e.target.value) || 18.0)}
              />
              <Input
                label="Primary Super Admin Dispatch Support Email"
                type="email"
                value={localSettings.systemDefaults.supportEmail || ''}
                onChange={(e) => handleDefaultsChange('supportEmail', e.target.value)}
                placeholder="support-admin@hrportal.example.com"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformSettings;
