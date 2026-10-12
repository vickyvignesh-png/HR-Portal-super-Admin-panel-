import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CreditCard,
  IndianRupee,
  Users,
  Briefcase,
  BellRing,
  CalendarCheck,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  AlertCircle,
  LifeBuoy,
  ShieldAlert,
  Clock,
  Sparkles,
  UserCheck,
  RotateCcw,
  Ban
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { dashboardService } from '../services/dashboardService';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatNumber } from '../utils/formatters';
import '../styles/dashboard.css';

export const Dashboard = () => {
  const { dataVersion } = useApp();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    setMetrics(dashboardService.getSummaryMetrics());
  }, [dataVersion]);

  if (!metrics) return null;

  const {
    companySummary,
    subscriptionSummary,
    paymentSummary,
    platformUsage,
    pendingWork
  } = metrics;

  return (
    <div className="dashboard-container">
      <PageHeader
        title="Dashboard"
        description="High-level enterprise overview across company tenants, active licensing, revenue intake, and pending operations."
      />

      {/* A. Company Summary */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            <Building2 size={18} className="section-icon-blue" />
            Company Summary
          </h2>
          <Link to="/companies" className="section-link-btn">
            View Companies
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="dashboard-stats-grid-6">
          <StatCard
            title="Total Companies"
            value={formatNumber(companySummary.totalCompanies)}
            icon={Building2}
            variant="blue"
          />
          <StatCard
            title="New Companies"
            value={formatNumber(companySummary.newCompanies)}
            icon={Sparkles}
            variant="purple"
          />
          <StatCard
            title="Active Companies"
            value={formatNumber(companySummary.activeCompanies)}
            icon={CheckCircle}
            variant="green"
          />
          <StatCard
            title="Trial Companies"
            value={formatNumber(companySummary.trialCompanies)}
            icon={Clock}
            variant="yellow"
          />
          <StatCard
            title="Expired Companies"
            value={formatNumber(companySummary.expiredCompanies)}
            icon={AlertTriangle}
            variant="red"
          />
          <StatCard
            title="Suspended Companies"
            value={formatNumber(companySummary.suspendedCompanies)}
            icon={Ban}
            variant="red"
          />
        </div>
      </div>

      {/* B. Subscription Summary */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            <CreditCard size={18} className="section-icon-blue" />
            Subscription Summary
          </h2>
          <Link to="/subscriptions" className="section-link-btn">
            View Subscriptions
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="dashboard-stats-grid-5">
          <StatCard
            title="Active Subscriptions"
            value={formatNumber(subscriptionSummary.activeSubscriptions)}
            icon={CheckCircle}
            variant="green"
          />
          <StatCard
            title="Trials"
            value={formatNumber(subscriptionSummary.trials)}
            icon={Clock}
            variant="yellow"
          />
          <StatCard
            title="Renewals Due"
            value={formatNumber(subscriptionSummary.renewalsDue)}
            icon={RotateCcw}
            variant="yellow"
          />
          <StatCard
            title="Expired Subscriptions"
            value={formatNumber(subscriptionSummary.expiredSubscriptions)}
            icon={AlertTriangle}
            variant="red"
          />
          <StatCard
            title="Cancelled Subscriptions"
            value={formatNumber(subscriptionSummary.cancelledSubscriptions)}
            icon={Ban}
            variant="red"
          />
        </div>
      </div>

      {/* C. Payment Summary */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            <IndianRupee size={18} className="section-icon-blue" />
            Payment Summary
          </h2>
          <Link to="/billing" className="section-link-btn">
            View Billing & Payments
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="dashboard-stats-grid-5">
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(paymentSummary.todayRevenue)}
            icon={TrendingUp}
            variant="blue"
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(paymentSummary.monthlyRevenue)}
            icon={IndianRupee}
            variant="blue"
          />
          <StatCard
            title="Successful Payments"
            value={formatNumber(paymentSummary.successfulPayments)}
            icon={CheckCircle}
            variant="green"
          />
          <StatCard
            title="Failed Payments"
            value={formatNumber(paymentSummary.failedPayments)}
            icon={AlertTriangle}
            variant="red"
          />
          <StatCard
            title="Refunds"
            value={formatNumber(paymentSummary.refunds)}
            icon={RotateCcw}
            variant="purple"
          />
        </div>
      </div>

      {/* D. Platform Usage (Aggregate values only) */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            <Briefcase size={18} className="section-icon-blue" />
            Platform Usage
          </h2>
          <Link to="/usage" className="section-link-btn">
            View Usage Quotas
            <ArrowRight size={14} />
          </Link>
        </div>
        <div className="dashboard-stats-grid-5">
          <StatCard
            title="Total Jobs"
            value={formatNumber(platformUsage.totalJobs)}
            icon={Briefcase}
            variant="blue"
          />
          <StatCard
            title="Total Alerts"
            value={formatNumber(platformUsage.totalAlerts)}
            icon={BellRing}
            variant="yellow"
          />
          <StatCard
            title="Candidate Registrations"
            value={formatNumber(platformUsage.totalCandidateRegistrations)}
            icon={Users}
            variant="purple"
          />
          <StatCard
            title="Total Interviews"
            value={formatNumber(platformUsage.totalInterviews)}
            icon={CalendarCheck}
            variant="blue"
          />
          <StatCard
            title="Total Hires"
            value={formatNumber(platformUsage.totalHires)}
            icon={UserCheck}
            variant="green"
          />
        </div>
      </div>

      {/* E. Pending Work */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">
            <AlertCircle size={18} className="section-icon-blue" />
            Pending Work
          </h2>
        </div>
        <div className="dashboard-stats-grid-5">
          <StatCard
            title="Awaiting Verification"
            value={formatNumber(pendingWork.companiesAwaitingVerification)}
            icon={FileCheck2}
            variant="yellow"
          />
          <StatCard
            title="Payment Issues"
            value={formatNumber(pendingWork.paymentIssues)}
            icon={ShieldAlert}
            variant="red"
          />
          <StatCard
            title="Support Tickets"
            value={formatNumber(pendingWork.supportTickets)}
            icon={LifeBuoy}
            variant="yellow"
          />
          <StatCard
            title="Flagged Jobs"
            value={formatNumber(pendingWork.flaggedJobs)}
            icon={AlertTriangle}
            variant="red"
          />
          <StatCard
            title="Renewal Alerts"
            value={formatNumber(pendingWork.renewalAlerts)}
            icon={Clock}
            variant="yellow"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
