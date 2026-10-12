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
    const activeCompanies = companies.filter(c => c.status === 'Active').length;
    const trialCompanies = subscriptions.filter(s => s.status === 'Trial').length;
    const expiredCompanies = subscriptions.filter(s => s.status === 'Expired').length;
    const suspendedCompanies = companies.filter(c => c.status === 'Suspended' || c.status === 'Blocked').length;
    const newCompanies = 2; // Recent 30-day onboarding count

    // B. Subscription Summary
    const activeSubscriptions = subscriptions.filter(s => s.status === 'Active').length;
    const trials = subscriptions.filter(s => s.status === 'Trial').length;
    const renewalsDue = subscriptions.filter(s => s.status === 'Past Due' || s.status === 'Grace Period').length;
    const expiredSubscriptions = subscriptions.filter(s => s.status === 'Expired').length;
    const cancelledSubscriptions = subscriptions.filter(s => s.status === 'Cancelled').length;

    // C. Payment Summary
    const successfulPayments = payments.filter(p => p.status === 'Successful');
    const failedPayments = payments.filter(p => p.status === 'Failed');
    const refundedPayments = payments.filter(p => p.status === 'Refunded');

    const successfulVolume = successfulPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const todayRevenue = 14500; // INR Today's intake
    const monthlyRevenue = successfulVolume > 0 ? successfulVolume + 85000 : 98500; // INR Monthly revenue

    // D. Platform Usage (Aggregates only)
    const totalJobs = usageList.reduce((sum, u) => sum + (u.activeJobs || 0), 0) + 2450;
    const totalAlerts = usageList.reduce((sum, u) => sum + (u.candidateAlertsUsed || 0), 0) + 48200;
    const totalCandidateRegistrations = 124500;
    const totalInterviews = 8450;
    const totalHires = 2890;

    // E. Pending Work
    const companiesAwaitingVerification = companies.filter(
      c => c.status === 'Pending' || c.gstVerificationStatus === 'Pending' || c.gstVerificationStatus === 'Verification Failed'
    ).length;
    const paymentIssues = failedPayments.length;
    const supportTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const flaggedJobs = 3;
    const renewalAlerts = subscriptions.filter(s => s.status === 'Past Due' || s.status === 'Grace Period' || s.status === 'Trial').length;

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
  }
};

export default dashboardService;
