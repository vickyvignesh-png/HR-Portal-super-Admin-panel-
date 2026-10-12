import {
  initialMockCompanies,
  initialMockPlans,
  initialMockSubscriptions,
  initialMockPayments,
  initialMockUsage,
  initialMockTickets,
  initialMockAdminUsers,
  initialMockSettings,
  initialMockAuditLogs,
  initialMockSecurityEvents
} from '../data/mockData';

const STORAGE_KEYS = {
  COMPANIES: 'hr_superadmin_companies',
  PLANS: 'hr_superadmin_plans',
  SUBSCRIPTIONS: 'hr_superadmin_subscriptions',
  PAYMENTS: 'hr_superadmin_payments',
  USAGE: 'hr_superadmin_usage',
  TICKETS: 'hr_superadmin_tickets',
  ADMIN_USERS: 'hr_superadmin_admin_users',
  ROLES: 'hr_superadmin_roles',
  SETTINGS: 'hr_superadmin_settings',
  AUDIT_LOGS: 'hr_superadmin_audit_logs',
  SECURITY_EVENTS: 'hr_superadmin_security_events'
};

const safeGet = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
};

export const storageService = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
      safeSet(STORAGE_KEYS.COMPANIES, initialMockCompanies);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PLANS)) {
      safeSet(STORAGE_KEYS.PLANS, initialMockPlans);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) {
      safeSet(STORAGE_KEYS.SUBSCRIPTIONS, initialMockSubscriptions);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      safeSet(STORAGE_KEYS.PAYMENTS, initialMockPayments);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USAGE)) {
      safeSet(STORAGE_KEYS.USAGE, initialMockUsage);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
      safeSet(STORAGE_KEYS.TICKETS, initialMockTickets);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_USERS)) {
      safeSet(STORAGE_KEYS.ADMIN_USERS, initialMockAdminUsers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      safeSet(STORAGE_KEYS.SETTINGS, initialMockSettings);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      safeSet(STORAGE_KEYS.AUDIT_LOGS, initialMockAuditLogs);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SECURITY_EVENTS)) {
      safeSet(STORAGE_KEYS.SECURITY_EVENTS, initialMockSecurityEvents);
    }
  },

  resetAll() {
    safeSet(STORAGE_KEYS.COMPANIES, initialMockCompanies);
    safeSet(STORAGE_KEYS.PLANS, initialMockPlans);
    safeSet(STORAGE_KEYS.SUBSCRIPTIONS, initialMockSubscriptions);
    safeSet(STORAGE_KEYS.PAYMENTS, initialMockPayments);
    safeSet(STORAGE_KEYS.USAGE, initialMockUsage);
    safeSet(STORAGE_KEYS.TICKETS, initialMockTickets);
    safeSet(STORAGE_KEYS.ADMIN_USERS, initialMockAdminUsers);
    safeSet(STORAGE_KEYS.SETTINGS, initialMockSettings);
    safeSet(STORAGE_KEYS.AUDIT_LOGS, initialMockAuditLogs);
    safeSet(STORAGE_KEYS.SECURITY_EVENTS, initialMockSecurityEvents);
  },

  // Audit Logs
  getAuditLogs() {
    return safeGet(STORAGE_KEYS.AUDIT_LOGS, initialMockAuditLogs);
  },

  logAuditEvent({ module, action, companyReference, recordReference, oldValue, newValue, reason }) {
    const logs = this.getAuditLogs();
    const newEntry = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      user: 'Marcus Vance (Super Admin)',
      module,
      action,
      companyReference: companyReference || 'N/A',
      recordReference: recordReference || 'N/A',
      oldValue: oldValue || 'N/A',
      newValue: newValue || 'N/A',
      ipAddress: '192.168.1.42',
      device: 'Demo Browser Session',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      reason: reason || 'Super Admin operational action'
    };
    const updated = [newEntry, ...logs];
    safeSet(STORAGE_KEYS.AUDIT_LOGS, updated);
    return newEntry;
  },

  // Companies
  getCompanies() {
    return safeGet(STORAGE_KEYS.COMPANIES, initialMockCompanies);
  },

  getCompanyById(id) {
    const list = this.getCompanies();
    return list.find(c => c.id === id);
  },

  saveCompany(companyData) {
    const list = this.getCompanies();
    const index = list.findIndex(c => c.id === companyData.id);
    let updated;
    const now = new Date().toISOString().slice(0, 10);
    
    if (index >= 0) {
      const old = list[index];
      const updatedCompany = { ...old, ...companyData, lastUpdated: now };
      updated = [...list];
      updated[index] = updatedCompany;
      safeSet(STORAGE_KEYS.COMPANIES, updated);

      this.logAuditEvent({
        module: 'Company Details',
        action: 'Update Company',
        companyReference: `${updatedCompany.name} (${updatedCompany.id})`,
        recordReference: updatedCompany.id,
        oldValue: JSON.stringify({ status: old.status, name: old.name }),
        newValue: JSON.stringify({ status: updatedCompany.status, name: updatedCompany.name }),
        reason: 'Company profile updated via Super Admin'
      });
      return updatedCompany;
    } else {
      const newId = `CMP-${1000 + list.length + 1}`;
      const newTenant = `TEN-${(companyData.name || 'NEW').substring(0, 5).toUpperCase()}-${list.length + 1}`;
      const newCompany = {
        ...companyData,
        id: newId,
        tenantId: newTenant,
        registrationDate: now,
        lastUpdated: now,
        logo: (companyData.name || 'CO').slice(0, 2).toUpperCase()
      };
      updated = [newCompany, ...list];
      safeSet(STORAGE_KEYS.COMPANIES, updated);

      this.logAuditEvent({
        module: 'Company Details',
        action: 'Create Company',
        companyReference: `${newCompany.name} (${newCompany.id})`,
        recordReference: newCompany.id,
        oldValue: 'None',
        newValue: newCompany.status,
        reason: 'New company registration created in Super Admin'
      });
      return newCompany;
    }
  },

  updateCompanyStatus(id, newStatus, reason = '') {
    const list = this.getCompanies();
    const company = list.find(c => c.id === id);
    if (!company) return null;

    const oldStatus = company.status;
    company.status = newStatus;
    company.lastUpdated = new Date().toISOString().slice(0, 10);
    safeSet(STORAGE_KEYS.COMPANIES, list);

    this.logAuditEvent({
      module: 'Company Details',
      action: 'Status Change',
      companyReference: `${company.name} (${company.id})`,
      recordReference: company.id,
      oldValue: oldStatus,
      newValue: newStatus,
      reason: reason || `Status altered to ${newStatus}`
    });
    return company;
  },

  // Subscriptions
  getSubscriptions() {
    return safeGet(STORAGE_KEYS.SUBSCRIPTIONS, initialMockSubscriptions);
  },

  getSubscriptionById(id) {
    const list = this.getSubscriptions();
    return list.find(s => s.id === id);
  },

  saveSubscription(subData) {
    const list = this.getSubscriptions();
    const index = list.findIndex(s => s.id === subData.id);
    let updated;
    if (index >= 0) {
      const old = list[index];
      const updatedSub = { ...old, ...subData };
      updated = [...list];
      updated[index] = updatedSub;
      safeSet(STORAGE_KEYS.SUBSCRIPTIONS, updated);

      this.logAuditEvent({
        module: 'Company Subscription',
        action: 'Update Subscription',
        companyReference: `${updatedSub.companyName} (${updatedSub.id})`,
        recordReference: updatedSub.id,
        oldValue: old.status,
        newValue: updatedSub.status,
        reason: 'Subscription modified'
      });
      return updatedSub;
    } else {
      const newSub = { ...subData, id: `SUB-${Date.now().toString().slice(-6)}` };
      updated = [newSub, ...list];
      safeSet(STORAGE_KEYS.SUBSCRIPTIONS, updated);
      return newSub;
    }
  },

  // Plans
  getPlans() {
    return safeGet(STORAGE_KEYS.PLANS, initialMockPlans);
  },

  getPlanById(id) {
    const list = this.getPlans();
    return list.find(p => p.id === id);
  },

  savePlan(planData) {
    const list = this.getPlans();
    const index = list.findIndex(p => p.id === planData.id);
    let updated;
    if (index >= 0) {
      const old = list[index];
      const updatedPlan = { ...old, ...planData };
      updated = [...list];
      updated[index] = updatedPlan;
      safeSet(STORAGE_KEYS.PLANS, updated);

      this.logAuditEvent({
        module: 'Subscription Plans',
        action: 'Update Plan',
        companyReference: 'Global',
        recordReference: updatedPlan.id,
        oldValue: `${old.name} - ₹${old.price}`,
        newValue: `${updatedPlan.name} - ₹${updatedPlan.price}`,
        reason: 'Plan specifications modified'
      });
      return updatedPlan;
    } else {
      const newPlan = {
        ...planData,
        id: `PLAN-${(planData.name || 'NEW').replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString().slice(-3)}`,
        activeSubscribersCount: 0
      };
      updated = [...list, newPlan];
      safeSet(STORAGE_KEYS.PLANS, updated);

      this.logAuditEvent({
        module: 'Subscription Plans',
        action: 'Create Plan',
        companyReference: 'Global',
        recordReference: newPlan.id,
        oldValue: 'None',
        newValue: newPlan.name,
        reason: 'New subscription tier created'
      });
      return newPlan;
    }
  },

  // Payments & Invoices
  getPayments() {
    return safeGet(STORAGE_KEYS.PAYMENTS, initialMockPayments);
  },

  getPaymentById(id) {
    const list = this.getPayments();
    return list.find(p => p.id === id);
  },

  refundPayment(id, reason = 'Customer request / demo refund') {
    const list = this.getPayments();
    const payment = list.find(p => p.id === id);
    if (!payment) return null;

    const oldStatus = payment.status;
    payment.status = 'Refunded';
    payment.failureReason = `Refunded: ${reason}`;
    safeSet(STORAGE_KEYS.PAYMENTS, list);

    this.logAuditEvent({
      module: 'Payments & Invoices',
      action: 'Simulated Refund',
      companyReference: `${payment.companyName} (${payment.companyId})`,
      recordReference: payment.id,
      oldValue: `${oldStatus} (₹${payment.amount})`,
      newValue: `Refunded (₹${payment.amount})`,
      reason: reason
    });
    return payment;
  },

  // Company Usage
  getUsage() {
    return safeGet(STORAGE_KEYS.USAGE, initialMockUsage);
  },

  // Support Tickets
  getTickets() {
    return safeGet(STORAGE_KEYS.TICKETS, initialMockTickets);
  },

  getTicketById(id) {
    const list = this.getTickets();
    return list.find(t => t.id === id);
  },

  saveTicket(ticketData) {
    const list = this.getTickets();
    const index = list.findIndex(t => t.id === ticketData.id);
    let updated;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (index >= 0) {
      const old = list[index];
      const updatedTicket = { ...old, ...ticketData, updatedDate: now };
      updated = [...list];
      updated[index] = updatedTicket;
      safeSet(STORAGE_KEYS.TICKETS, updated);
      return updatedTicket;
    } else {
      const newTicket = {
        ...ticketData,
        id: `TCK-${500 + list.length + 1}`,
        createdDate: now,
        updatedDate: now,
        history: [
          { sender: 'System Admin', text: 'Ticket registered into Super Admin queue.', date: now.slice(0, 16) }
        ]
      };
      updated = [newTicket, ...list];
      safeSet(STORAGE_KEYS.TICKETS, updated);
      return newTicket;
    }
  },

  // Admin Users
  getAdminUsers() {
    return safeGet(STORAGE_KEYS.ADMIN_USERS, initialMockAdminUsers);
  },

  saveAdminUser(userData) {
    const list = this.getAdminUsers();
    const index = list.findIndex(u => u.id === userData.id);
    let updated;
    if (index >= 0) {
      const old = list[index];
      const updatedUser = { ...old, ...userData };
      updated = [...list];
      updated[index] = updatedUser;
      safeSet(STORAGE_KEYS.ADMIN_USERS, updated);
      return updatedUser;
    } else {
      const newUser = {
        ...userData,
        id: `USR-${(list.length + 1).toString().padStart(3, '0')}`,
        lastLogin: 'Never'
      };
      updated = [...list, newUser];
      safeSet(STORAGE_KEYS.ADMIN_USERS, updated);
      return newUser;
    }
  },

  // Roles & Permissions
  getRoles() {
    const defaultRoles = [
      { id: 'ROLE-01', name: 'Super Admin', description: 'Full root access to all system domains and security configurations.', permissions: ['View', 'Create', 'Edit', 'Approve', 'Export'] },
      { id: 'ROLE-02', name: 'Product Owner', description: 'Manages company configurations, feature modules, and usage allotments.', permissions: ['View', 'Create', 'Edit', 'Export'] },
      { id: 'ROLE-03', name: 'Finance Lead', description: 'Access to billing ledgers, invoices, payment disputes, and revenue analytics.', permissions: ['View', 'Edit', 'Approve', 'Export'] },
      { id: 'ROLE-04', name: 'Support Specialist', description: 'Handles tenant support tickets, escalations, and incident resolutions.', permissions: ['View', 'Edit'] }
    ];
    return safeGet(STORAGE_KEYS.ROLES, defaultRoles);
  },

  saveRole(roleData) {
    const list = this.getRoles();
    const index = list.findIndex(r => r.id === roleData.id || r.name.toLowerCase() === roleData.name.toLowerCase());
    let updated;
    if (index >= 0) {
      const updatedRole = { ...list[index], ...roleData };
      updated = [...list];
      updated[index] = updatedRole;
      safeSet(STORAGE_KEYS.ROLES, updated);
      return updatedRole;
    } else {
      const newRole = {
        ...roleData,
        id: `ROLE-${(list.length + 1).toString().padStart(2, '0')}`
      };
      updated = [...list, newRole];
      safeSet(STORAGE_KEYS.ROLES, updated);
      return newRole;
    }
  },

  // Settings
  getSettings() {
    return safeGet(STORAGE_KEYS.SETTINGS, initialMockSettings);
  },

  saveSettings(settingsData) {
    safeSet(STORAGE_KEYS.SETTINGS, settingsData);
    this.logAuditEvent({
      module: 'Platform Settings',
      action: 'Update Settings',
      companyReference: 'Global Platform',
      recordReference: 'CONFIG',
      oldValue: 'Previous configuration',
      newValue: 'Saved new configuration',
      reason: 'Platform master data and preference update'
    });
    return settingsData;
  },

  // Security Events
  getSecurityEvents() {
    return safeGet(STORAGE_KEYS.SECURITY_EVENTS, initialMockSecurityEvents);
  }
};
