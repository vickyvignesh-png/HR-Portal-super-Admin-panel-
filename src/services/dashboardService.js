import { storageService } from './storageService';
import { mockDashboardTrends } from '../data/mockData';

export const dashboardService = {
  getSummaryMetrics() {
    const companies = storageService.getCompanies();
    const subscriptions = storageService.getSubscriptions();
    const payments = storageService.getPayments();
    const tickets = storageService.getTickets();
    const usageList = storageService.getUsage();

    // A. Company Summary
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter((c) => c.status === 'Active').length;
    const trialCompanies = subscriptions.filter((s) => s.status === 'Trial').length;
    const expiredCompanies = subscriptions.filter((s) => s.status === 'Expired').length;
    const suspendedCompanies = companies.filter(
      (c) => c.status === 'Suspended' || c.status === 'Blocked'
    ).length;
    const newCompanies = 2; // Recent 30-day onboarding count

    // B. Subscription Summary
    const activeSubscriptions = subscriptions.filter((s) => s.status === 'Active').length;
    const trials = subscriptions.filter((s) => s.status === 'Trial').length;
    const renewalsDue = subscriptions.filter(
      (s) => s.status === 'Past Due' || s.status === 'Grace Period'
    ).length;
    const expiredSubscriptions = subscriptions.filter((s) => s.status === 'Expired').length;
    const cancelledSubscriptions = subscriptions.filter((s) => s.status === 'Cancelled').length;

    // C. Payment Summary
    const successfulPayments = payments.filter((p) => p.status === 'Successful');
    const failedPayments = payments.filter((p) => p.status === 'Failed');
    const refundedPayments = payments.filter((p) => p.status === 'Refunded');

    const successfulVolume = successfulPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const todayRevenue = 14500; // INR Today's intake
    const monthlyRevenue = 87297; // INR Monthly revenue as referenced in requirements

    // D. Platform Usage (Aggregates only)
    const totalJobs = usageList.reduce((sum, u) => sum + (u.activeJobs || 0), 0) + 2450;
    const totalAlerts = usageList.reduce((sum, u) => sum + (u.candidateAlertsUsed || 0), 0) + 48200;
    const totalCandidateRegistrations = 124500;
    const totalInterviews = 8450;
    const totalHires = 2890;

    // E. Pending Work
    const companiesAwaitingVerification = companies.filter(
      (c) =>
        c.status === 'Pending' ||
        c.gstVerificationStatus === 'Pending' ||
        c.gstVerificationStatus === 'Verification Failed' ||
        c.gstVerificationStatus === 'Invalid'
    ).length;
    const paymentIssues = failedPayments.length;
    const supportTickets = tickets.filter(
      (t) => t.status === 'Open' || t.status === 'In Progress'
    ).length;
    const flaggedJobs = 3;
    const renewalAlerts = subscriptions.filter(
      (s) => s.status === 'Past Due' || s.status === 'Grace Period' || s.status === 'Trial'
    ).length;

    return {
      companySummary: {
        totalCompanies,
        newCompanies,
        activeCompanies,
        trialCompanies,
        expiredCompanies,
        suspendedCompanies
      },
      subscriptionSummary: {
        activeSubscriptions,
        trials,
        renewalsDue,
        expiredSubscriptions,
        cancelledSubscriptions
      },
      paymentSummary: {
        todayRevenue,
        monthlyRevenue,
        successfulPayments: successfulPayments.length,
        failedPayments: failedPayments.length,
        refunds: refundedPayments.length
      },
      platformUsage: {
        totalJobs,
        totalAlerts,
        totalCandidateRegistrations,
        totalInterviews,
        totalHires
      },
      pendingWork: {
        companiesAwaitingVerification,
        paymentIssues,
        supportTickets,
        flaggedJobs,
        renewalAlerts
      }
    };
  },

  getTrends() {
    return mockDashboardTrends;
  },

  getRecentActivity() {
    const auditLogs = storageService.getAuditLogs();
    if (auditLogs && auditLogs.length > 0) {
      return auditLogs.slice(0, 5).map((log) => ({
        id: log.id,
        title: `${log.module}: ${log.action}`,
        description: log.reason || `${log.companyReference || 'System'} updated by ${log.user}`,
        actor: log.user,
        timestamp: log.timestamp,
        type: log.action.includes('Refund') || log.action.includes('Blocked') ? 'warning' : 'info'
      }));
    }

    return [
      {
        id: 'ACT-01',
        title: 'Company Verification',
        description: 'Apex Global Technologies GST registry verified successfully',
        actor: 'Marcus Vance',
        timestamp: '2 hours ago',
        type: 'success'
      },
      {
        id: 'ACT-02',
        title: 'Subscription Upgraded',
        description: 'Nexus Healthcare Systems transitioned to Enterprise Plan',
        actor: 'System',
        timestamp: '4 hours ago',
        type: 'info'
      },
      {
        id: 'ACT-03',
        title: 'Payment Processed',
        description: 'Monthly license payment of ₹48,000 confirmed for TechNova',
        actor: 'Razorpay Gateway',
        timestamp: 'Yesterday',
        type: 'success'
      },
      {
        id: 'ACT-04',
        title: 'Job Deactivation',
        description: 'Job REQ-2004 deactivated due to expired requisition cycle',
        actor: 'Marcus Vance',
        timestamp: '2 days ago',
        type: 'warning'
      },
      {
        id: 'ACT-05',
        title: 'Candidate Profile Action',
        description: 'Verified engineering experience and credentials for CND-3001',
        actor: 'Marcus Vance',
        timestamp: '3 days ago',
        type: 'info'
      }
    ];
  },

  getPendingItems() {
    const companies = storageService.getCompanies();
    const payments = storageService.getPayments();
    const tickets = storageService.getTickets();
    const subscriptions = storageService.getSubscriptions();

    const pendingVerification = companies.find(
      (c) => c.status === 'Pending' || c.gstVerificationStatus === 'Invalid' || c.gstVerificationStatus === 'Pending'
    );
    const failedPayment = payments.find((p) => p.status === 'Failed');
    const openTicket = tickets.find((t) => t.status === 'Open' || t.status === 'In Progress');
    const renewalDue = subscriptions.find((s) => s.status === 'Past Due' || s.status === 'Grace Period' || s.status === 'Trial');

    const items = [];

    if (pendingVerification) {
      items.push({
        id: 'PND-01',
        title: `Verification Request: ${pendingVerification.name}`,
        subtitle: `GST Status: ${pendingVerification.gstVerificationStatus || 'Pending'} — Requires documentation audit`,
        link: '/companies',
        severity: 'warning',
        badgeText: 'Awaiting Audit'
      });
    }

    if (failedPayment) {
      items.push({
        id: 'PND-02',
        title: `Payment Issue: ${failedPayment.company || 'TechNova Solutions'}`,
        subtitle: `Invoice ${failedPayment.invoiceNumber} (₹${(failedPayment.amount || 48000).toLocaleString('en-IN')}) transaction failed`,
        link: '/billing',
        severity: 'critical',
        badgeText: 'Action Required'
      });
    }

    if (openTicket) {
      items.push({
        id: 'PND-03',
        title: `Open Support Ticket: ${openTicket.ticketId || 'TIK-5002'}`,
        subtitle: `${openTicket.subject || 'Invoice GST Tax Calculation Discrepancy'} — ${openTicket.priority || 'High'} Priority`,
        link: '/support',
        severity: 'warning',
        badgeText: 'Open Ticket'
      });
    }

    items.push({
      id: 'PND-04',
      title: 'Flagged Job Requisition: REQ-2003',
      subtitle: 'Senior DevOps Specialist — Candidate reported misleading salary bracket',
      link: '/jobs/reported',
      severity: 'critical',
      badgeText: 'Review Report'
    });

    if (renewalDue) {
      items.push({
        id: 'PND-05',
        title: `Subscription Renewal: ${renewalDue.companyName}`,
        subtitle: `Current status is ${renewalDue.status} (${renewalDue.planName}) — Grace period ending soon`,
        link: '/subscriptions',
        severity: 'info',
        badgeText: 'Renewal Due'
      });
    }

    return items;
  }
};

export default dashboardService;
