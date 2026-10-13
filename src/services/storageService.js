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
  initialMockSecurityEvents,
  initialMockPostedJobs,
  initialMockReportedJobs,
  initialMockCandidates
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
  SECURITY_EVENTS: 'hr_superadmin_security_events',
  POSTED_JOBS: 'hr_superadmin_posted_jobs',
  REPORTED_JOBS: 'hr_superadmin_reported_jobs',
  CANDIDATES: 'hr_superadmin_candidates'
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
    if (!localStorage.getItem(STORAGE_KEYS.POSTED_JOBS)) {
      safeSet(STORAGE_KEYS.POSTED_JOBS, initialMockPostedJobs);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTED_JOBS)) {
      safeSet(STORAGE_KEYS.REPORTED_JOBS, initialMockReportedJobs);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CANDIDATES)) {
      safeSet(STORAGE_KEYS.CANDIDATES, initialMockCandidates);
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
    safeSet(STORAGE_KEYS.POSTED_JOBS, initialMockPostedJobs);
    safeSet(STORAGE_KEYS.REPORTED_JOBS, initialMockReportedJobs);
    safeSet(STORAGE_KEYS.CANDIDATES, initialMockCandidates);
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
  },

  // Posted Jobs
  getPostedJobs() {
    return safeGet(STORAGE_KEYS.POSTED_JOBS, initialMockPostedJobs);
  },

  getPostedJobById(id) {
    const list = this.getPostedJobs();
    return list.find((j) => j.id === id);
  },

  savePostedJob(jobData) {
    const list = this.getPostedJobs();
    const index = list.findIndex((j) => j.id === jobData.id);
    let updated;
    const now = new Date().toISOString().slice(0, 10);

    if (index >= 0) {
      const old = list[index];
      const updatedJob = { ...old, ...jobData, lastUpdated: now };
      updated = [...list];
      updated[index] = updatedJob;

      this.logAuditEvent({
        module: 'Job Management',
        action: 'Update Job',
        companyReference: updatedJob.companyName || updatedJob.company,
        recordReference: updatedJob.id,
        oldValue: `${old.title} (${old.jobStatus || old.status})`,
        newValue: `${updatedJob.title} (${updatedJob.jobStatus || updatedJob.status})`,
        reason: 'Super Admin updated job requisition parameters'
      });
      safeSet(STORAGE_KEYS.POSTED_JOBS, updated);
      return updatedJob;
    } else {
      const newJob = {
        ...jobData,
        id: jobData.id || `JOB-${(2000 + list.length + 1).toString()}`,
        postedDate: jobData.postedDate || now,
        lastUpdated: now
      };
      updated = [newJob, ...list];
      this.logAuditEvent({
        module: 'Job Management',
        action: 'Create Job',
        companyReference: newJob.companyName || newJob.company,
        recordReference: newJob.id,
        oldValue: 'N/A',
        newValue: `${newJob.title} (${newJob.jobStatus || newJob.status})`,
        reason: 'Super Admin posted requisition'
      });
      safeSet(STORAGE_KEYS.POSTED_JOBS, updated);
      return newJob;
    }
  },

  closeJob(id, { reason = 'Closed by Super Admin', adminUser = 'Marcus Vance (Super Admin)' } = {}) {
    const list = this.getPostedJobs();
    const index = list.findIndex((j) => j.id === id);
    if (index === -1) return null;

    const job = list[index];
    const now = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const historyItem = {
      id: `ACT-J${Date.now().toString().slice(-4)}`,
      action: 'Job Closed',
      reason,
      takenBy: adminUser,
      date: nowTime
    };

    const updatedJob = {
      ...job,
      jobStatus: 'Closed',
      status: 'Closed',
      lastUpdated: now,
      actionHistory: [historyItem, ...(job.actionHistory || [])]
    };

    const updatedList = [...list];
    updatedList[index] = updatedJob;
    safeSet(STORAGE_KEYS.POSTED_JOBS, updatedList);

    this.logAuditEvent({
      module: 'Job Management',
      action: 'Close Job',
      companyReference: updatedJob.companyName || updatedJob.company,
      recordReference: updatedJob.id,
      oldValue: job.jobStatus || job.status,
      newValue: 'Closed',
      reason
    });

    return updatedJob;
  },

  toggleDeactivateJob(id, { reason = 'Administrative deactivation', adminUser = 'Marcus Vance (Super Admin)' } = {}) {
    const list = this.getPostedJobs();
    const index = list.findIndex((j) => j.id === id);
    if (index === -1) return null;

    const job = list[index];
    const now = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const willDeactivate = !job.isDeactivated;

    const historyItem = {
      id: `ACT-J${Date.now().toString().slice(-4)}`,
      action: willDeactivate ? 'Job Deactivated' : 'Job Reactivated',
      reason: willDeactivate ? reason : 'Reactivated by Super Admin',
      takenBy: adminUser,
      date: nowTime
    };

    const updatedJob = {
      ...job,
      isDeactivated: willDeactivate,
      deactivationReason: willDeactivate ? reason : null,
      lastUpdated: now,
      actionHistory: [historyItem, ...(job.actionHistory || [])]
    };

    const updatedList = [...list];
    updatedList[index] = updatedJob;
    safeSet(STORAGE_KEYS.POSTED_JOBS, updatedList);

    this.logAuditEvent({
      module: 'Job Management',
      action: willDeactivate ? 'Deactivate Job' : 'Reactivate Job',
      companyReference: updatedJob.companyName || updatedJob.company,
      recordReference: updatedJob.id,
      oldValue: job.isDeactivated ? 'Deactivated' : 'Active Availability',
      newValue: willDeactivate ? 'Deactivated' : 'Active Availability',
      reason: willDeactivate ? reason : 'Super Admin reinstated availability'
    });

    return updatedJob;
  },

  // Reported Jobs
  getReportedJobs() {
    return safeGet(STORAGE_KEYS.REPORTED_JOBS, initialMockReportedJobs);
  },

  getReportedJobById(id) {
    const list = this.getReportedJobs();
    return list.find((r) => r.id === id);
  },

  saveReportedJob(reportData) {
    const list = this.getReportedJobs();
    const index = list.findIndex((r) => r.id === reportData.id);
    let updated;
    const now = new Date().toISOString().slice(0, 10);

    if (index >= 0) {
      const old = list[index];
      const updatedReport = { ...old, ...reportData, lastUpdated: now };
      updated = [...list];
      updated[index] = updatedReport;

      this.logAuditEvent({
        module: 'Job Management',
        action: 'Review Reported Job',
        companyReference: updatedReport.companyName || updatedReport.company,
        recordReference: updatedReport.id,
        oldValue: `${old.reportStatus || old.status} - ${old.actionTaken || 'None'}`,
        newValue: `${updatedReport.reportStatus || updatedReport.status} - ${updatedReport.actionTaken || 'None'}`,
        reason: updatedReport.adminRemarks || updatedReport.resolutionNotes || 'Review status and audit update'
      });
      safeSet(STORAGE_KEYS.REPORTED_JOBS, updated);
      return updatedReport;
    } else {
      const newReport = {
        ...reportData,
        id: reportData.id || `REP-${(5000 + list.length + 1).toString()}`,
        reportedDate: reportData.reportedDate || reportData.reportDate || now,
        lastUpdated: now
      };
      updated = [newReport, ...list];
      safeSet(STORAGE_KEYS.REPORTED_JOBS, updated);
      return newReport;
    }
  },

  resolveReport(id, { actionTaken = 'No Action', adminRemarks = '', adminUser = 'Marcus Vance (Super Admin)' } = {}) {
    const list = this.getReportedJobs();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const report = list[index];
    const now = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const historyItem = {
      id: `ACT-R${Date.now().toString().slice(-4)}`,
      action: actionTaken === 'Job Deactivated' ? 'Report Resolved (Job Deactivated)' : actionTaken === 'Warning' ? 'Report Resolved (Warning Issued)' : 'Report Resolved (No Action)',
      reason: adminRemarks || 'Resolved by Super Admin',
      takenBy: adminUser,
      date: nowTime
    };

    const updatedReport = {
      ...report,
      reportStatus: 'Resolved',
      status: 'Resolved',
      actionTaken,
      adminRemarks,
      resolvedDate: now,
      lastUpdated: now,
      actionHistory: [historyItem, ...(report.actionHistory || [])]
    };

    const updatedList = [...list];
    updatedList[index] = updatedReport;
    safeSet(STORAGE_KEYS.REPORTED_JOBS, updatedList);

    // If Action Taken is 'Job Deactivated', update associated job's availability
    if (actionTaken === 'Job Deactivated') {
      const postedJobs = this.getPostedJobs();
      const jobIdx = postedJobs.findIndex((j) => j.id === report.jobId || j.title === report.jobTitle);
      if (jobIdx >= 0) {
        const targetJob = postedJobs[jobIdx];
        const jobHistoryItem = {
          id: `ACT-J${Date.now().toString().slice(-4)}`,
          action: 'Job Deactivated',
          reason: `Deactivated following incident report ${report.id}: ${adminRemarks}`,
          takenBy: adminUser,
          date: nowTime
        };
        const updatedTargetJob = {
          ...targetJob,
          isDeactivated: true,
          deactivationReason: `Report ${report.id}: ${adminRemarks}`,
          lastUpdated: now,
          actionHistory: [jobHistoryItem, ...(targetJob.actionHistory || [])]
        };
        const updatedPostedJobs = [...postedJobs];
        updatedPostedJobs[jobIdx] = updatedTargetJob;
        safeSet(STORAGE_KEYS.POSTED_JOBS, updatedPostedJobs);

        this.logAuditEvent({
          module: 'Job Management',
          action: 'Deactivate Job via Report',
          companyReference: targetJob.companyName || targetJob.company,
          recordReference: targetJob.id,
          oldValue: targetJob.isDeactivated ? 'Deactivated' : 'Active Availability',
          newValue: 'Deactivated',
          reason: `Deactivated pursuant to incident resolution on ${report.id}`
        });
      }
    }

    this.logAuditEvent({
      module: 'Job Management',
      action: 'Resolve Incident Report',
      companyReference: updatedReport.companyName || updatedReport.company,
      recordReference: updatedReport.id,
      oldValue: report.reportStatus || report.status,
      newValue: `Resolved (${actionTaken})`,
      reason: adminRemarks
    });

    return updatedReport;
  },

  dismissReport(id, { dismissalReason = '', adminUser = 'Marcus Vance (Super Admin)' } = {}) {
    const list = this.getReportedJobs();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const report = list[index];
    const now = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const historyItem = {
      id: `ACT-R${Date.now().toString().slice(-4)}`,
      action: 'Report Dismissed',
      reason: dismissalReason || 'Dismissed by Super Admin',
      takenBy: adminUser,
      date: nowTime
    };

    const updatedReport = {
      ...report,
      reportStatus: 'Dismissed',
      status: 'Dismissed',
      adminRemarks: dismissalReason,
      resolvedDate: null,
      lastUpdated: now,
      actionHistory: [historyItem, ...(report.actionHistory || [])]
    };

    const updatedList = [...list];
    updatedList[index] = updatedReport;
    safeSet(STORAGE_KEYS.REPORTED_JOBS, updatedList);

    this.logAuditEvent({
      module: 'Job Management',
      action: 'Dismiss Incident Report',
      companyReference: updatedReport.companyName || updatedReport.company,
      recordReference: updatedReport.id,
      oldValue: report.reportStatus || report.status,
      newValue: 'Dismissed',
      reason: dismissalReason
    });

    return updatedReport;
  },

  // Candidates
  getCandidates() {
    return safeGet(STORAGE_KEYS.CANDIDATES, initialMockCandidates);
  },

  getCandidateById(id) {
    const list = this.getCandidates();
    return list.find((c) => c.id === id);
  },

  saveCandidate(candidateData) {
    const list = this.getCandidates();
    const index = list.findIndex((c) => c.id === candidateData.id);
    let updated;
    const now = new Date().toISOString().slice(0, 10);

    if (index >= 0) {
      const old = list[index];
      const updatedCandidate = { ...old, ...candidateData, lastActive: now };
      updated = [...list];
      updated[index] = updatedCandidate;

      this.logAuditEvent({
        module: 'Candidate Management',
        action: 'Update Candidate Status',
        companyReference: 'Global Candidate Directory',
        recordReference: updatedCandidate.id,
        oldValue: old.accountStatus || old.status,
        newValue: updatedCandidate.accountStatus || updatedCandidate.status,
        reason: updatedCandidate.actionReason || 'Super Admin updated candidate profile verification/status'
      });
      safeSet(STORAGE_KEYS.CANDIDATES, updated);
      return updatedCandidate;
    } else {
      const newCandidate = {
        ...candidateData,
        id: candidateData.id || `CND-${(3000 + list.length + 1).toString()}`,
        registrationDate: candidateData.registrationDate || now,
        lastActive: now
      };
      updated = [newCandidate, ...list];
      safeSet(STORAGE_KEYS.CANDIDATES, updated);
      return newCandidate;
    }
  },

  toggleBlockCandidate(id, { reason = '', adminUser = 'Marcus Vance (Super Admin)' } = {}) {
    const list = this.getCandidates();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const candidate = list[index];
    const isCurrentlyBlocked = candidate.accountStatus === 'Blocked';
    const newStatus = isCurrentlyBlocked ? 'Active' : 'Blocked';
    const now = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const historyItem = {
      id: `ACT-C${Date.now().toString().slice(-4)}`,
      action: isCurrentlyBlocked ? 'Account Unblocked' : 'Account Blocked',
      reason: reason || (isCurrentlyBlocked ? 'Unblocked by Super Admin' : 'Blocked by Super Admin'),
      takenBy: adminUser,
      date: nowTime
    };

    const updatedCandidate = {
      ...candidate,
      accountStatus: newStatus,
      status: newStatus,
      actionReason: reason,
      actionTakenBy: adminUser,
      actionDate: now,
      actionHistory: [historyItem, ...(candidate.actionHistory || [])]
    };

    const updatedList = [...list];
    updatedList[index] = updatedCandidate;
    safeSet(STORAGE_KEYS.CANDIDATES, updatedList);

    this.logAuditEvent({
      module: 'Candidate Management',
      action: isCurrentlyBlocked ? 'Unblock Candidate Account' : 'Block Candidate Account',
      companyReference: candidate.name,
      recordReference: candidate.id,
      oldValue: candidate.accountStatus || candidate.status,
      newValue: newStatus,
      reason: reason || (isCurrentlyBlocked ? 'Account unblocked' : 'Account blocked')
    });

    return updatedCandidate;
  }
};
