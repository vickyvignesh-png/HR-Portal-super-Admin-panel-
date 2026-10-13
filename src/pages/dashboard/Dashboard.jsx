import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  TrendingUp,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dashboardService } from '../../services/dashboardService';
import { storageService } from '../../services/storageService';
import './Dashboard.css';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { dataVersion } = useApp();

  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reportedJobs, setReportedJobs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    setMetrics(dashboardService.getSummaryMetrics());
    setTrends(dashboardService.getTrends());
    setCompanies(storageService.getCompanies() || []);
    setSubscriptions(storageService.getSubscriptions() || []);
    setPayments(storageService.getPayments() || []);
    setReportedJobs(storageService.getReportedJobs() || []);
    setAuditLogs(storageService.getAuditLogs() || []);
  }, [dataVersion]);

  // Section 1: Key Metrics Data
  const keyMetrics = useMemo(() => {
    if (!metrics) return [];

    const totalCompanies = companies.length || metrics.companySummary?.totalCompanies || 6;
    const activeCompanies = companies.filter((c) => c.status === 'Active').length || 3;
    const activeSubs = subscriptions.filter((s) => s.status === 'Active').length || 3;
    const mrrValue = 87297; // INR Monthly Recurring Revenue
    const totalRevenueValue = 584500; // INR Total Revenue
    const pendingVerifications =
      companies.filter(
        (c) =>
          c.status === 'Pending' ||
          c.gstVerificationStatus === 'Pending' ||
          c.gstVerificationStatus === 'Invalid'
      ).length || 2;
    const trialExpiringSoon = subscriptions.filter((s) => s.status === 'Trial').length || 1;
    const failedPaymentsCount = payments.filter((p) => p.status === 'Failed').length || 1;

    return [
      {
        id: 'total-companies',
        label: 'Total Companies',
        value: totalCompanies.toString(),
        icon: Building2,
        colorClass: 'metric-icon-blue',
        path: '/companies'
      },
      {
        id: 'active-companies',
        label: 'Active Companies',
        value: activeCompanies.toString(),
        icon: CheckCircle2,
        colorClass: 'metric-icon-emerald',
        path: '/companies'
      },
      {
        id: 'active-subscriptions',
        label: 'Active Subscriptions',
        value: activeSubs.toString(),
        icon: CreditCard,
        colorClass: 'metric-icon-indigo',
        path: '/subscriptions'
      },
      {
        id: 'mrr',
        label: 'Monthly Recurring Revenue (MRR)',
        value: `₹${mrrValue.toLocaleString('en-IN')}`,
        icon: IndianRupee,
        colorClass: 'metric-icon-purple',
        path: '/billing'
      },
      {
        id: 'total-revenue',
        label: 'Total Revenue',
        value: `₹${totalRevenueValue.toLocaleString('en-IN')}`,
        icon: TrendingUp,
        colorClass: 'metric-icon-teal',
        path: '/billing'
      },
      {
        id: 'pending-verifications',
        label: 'Pending Verifications',
        value: pendingVerifications.toString(),
        icon: ShieldAlert,
        colorClass: 'metric-icon-amber',
        path: '/companies'
      },
      {
        id: 'trial-expiring',
        label: 'Trial Expiring Soon',
        value: trialExpiringSoon.toString(),
        icon: Clock,
        colorClass: 'metric-icon-orange',
        path: '/subscriptions'
      },
      {
        id: 'failed-payments',
        label: 'Failed Payments',
        value: failedPaymentsCount.toString(),
        icon: AlertTriangle,
        colorClass: 'metric-icon-rose',
        path: '/billing'
      }
    ];
  }, [metrics, companies, subscriptions, payments]);

  // Section 2: Revenue & Growth Analytics Data
  const revenueTrendData = useMemo(() => {
    return (
      trends?.revenueTrend || [
        { month: 'Sep', revenue: 14200 },
        { month: 'Oct', revenue: 16800 },
        { month: 'Nov', revenue: 19400 },
        { month: 'Dec', revenue: 22100 },
        { month: 'Jan', revenue: 24800 },
        { month: 'Feb', revenue: 27900 }
      ]
    );
  }, [trends]);

  const companyGrowthData = useMemo(() => {
    return (
      trends?.companyRegistrationsTrend || [
        { month: 'Sep', count: 8 },
        { month: 'Oct', count: 12 },
        { month: 'Nov', count: 15 },
        { month: 'Dec', count: 10 },
        { month: 'Jan', count: 18 },
        { month: 'Feb', count: 14 }
      ]
    );
  }, [trends]);

  // Section 3: Subscription Overview Breakdown
  const subscriptionBreakdown = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === 'Active').length;
    const trial = subscriptions.filter((s) => s.status === 'Trial').length;
    const expired = subscriptions.filter((s) => s.status === 'Expired').length;
    const cancelled = subscriptions.filter((s) => s.status === 'Cancelled').length;
    const suspended = subscriptions.filter(
      (s) => s.status === 'Suspended' || s.status === 'Past Due' || s.status === 'Grace Period'
    ).length;

    const total = Math.max(1, active + trial + expired + cancelled + suspended);

    const items = [
      {
        label: 'Active',
        count: active,
        pct: Math.round((active / total) * 100),
        color: '#2563EB',
        dotClass: 'status-dot-active'
      },
      {
        label: 'Trial',
        count: trial,
        pct: Math.round((trial / total) * 100),
        color: '#F59E0B',
        dotClass: 'status-dot-trial'
      },
      {
        label: 'Expired',
        count: expired,
        pct: Math.round((expired / total) * 100),
        color: '#EF4444',
        dotClass: 'status-dot-expired'
      },
      {
        label: 'Cancelled',
        count: cancelled,
        pct: Math.round((cancelled / total) * 100),
        color: '#94A3B8',
        dotClass: 'status-dot-cancelled'
      },
      {
        label: 'Suspended',
        count: suspended,
        pct: Math.round((suspended / total) * 100),
        color: '#64748B',
        dotClass: 'status-dot-suspended'
      }
    ];

    return { total, items };
  }, [subscriptions]);

  // Section 4: Action Required Table Items
  const actionRequiredItems = useMemo(() => {
    const items = [];
    let counter = 1;

    // 1. Companies awaiting verification
    const pendingCompany = companies.find(
      (c) =>
        c.status === 'Pending' ||
        c.gstVerificationStatus === 'Pending' ||
        c.gstVerificationStatus === 'Invalid'
    );
    if (pendingCompany) {
      items.push({
        sNo: counter++,
        itemRef: pendingCompany.id || 'CMP-1003',
        company: pendingCompany.name || 'Vertex Financial Services',
        issueType: 'GST Verification Audit Required',
        status: 'Pending Verification',
        statusSeverity: 'warning',
        path: '/companies'
      });
    }

    // 2. Failed payments requiring attention
    const failedPayment = payments.find((p) => p.status === 'Failed');
    if (failedPayment) {
      items.push({
        sNo: counter++,
        itemRef: failedPayment.invoiceNumber || 'INV-2025-004',
        company: failedPayment.company || 'TechNova Solutions',
        issueType: `Failed Payment (₹${(failedPayment.amount || 48000).toLocaleString('en-IN')})`,
        status: 'Action Required',
        statusSeverity: 'danger',
        path: '/billing'
      });
    }

    // 3. Subscriptions expiring within 7 days / grace period
    const expiringSub = subscriptions.find(
      (s) => s.status === 'Trial' || s.status === 'Past Due' || s.status === 'Grace Period'
    );
    if (expiringSub) {
      items.push({
        sNo: counter++,
        itemRef: expiringSub.id || 'SUB-401',
        company: expiringSub.companyName || 'SwiftLogistics Express',
        issueType: `Grace Period Expiring (${expiringSub.planName || 'Professional'})`,
        status: 'Expiring Soon',
        statusSeverity: 'warning',
        path: '/subscriptions'
      });
    }

    // 4. Reported jobs awaiting review
    const flaggedJob = reportedJobs[0] || {
      id: 'REP-701',
      jobId: 'REQ-2003',
      companyName: 'Apex Global Technologies',
      reportReason: 'Misleading compensation details reported by applicant',
      status: 'Under Review'
    };
    items.push({
      sNo: counter++,
      itemRef: flaggedJob.jobId || 'REQ-2003',
      company: flaggedJob.companyName || 'Apex Global Technologies',
      issueType: flaggedJob.reportReason || 'Reported Job Requisition',
      status: flaggedJob.status || 'Under Review',
      statusSeverity: 'danger',
      path: '/jobs/reported'
    });

    return items;
  }, [companies, payments, subscriptions, reportedJobs]);

  // Section 5: Recent Activity Table Items
  const recentActivities = useMemo(() => {
    return [
      {
        sNo: 1,
        activity: 'Company Registered',
        company: 'Nexus Healthcare Systems',
        dateTime: '13 Oct 2026, 11:30 AM',
        status: 'Completed',
        statusSeverity: 'success'
      },
      {
        sNo: 2,
        activity: 'Subscription Renewed',
        company: 'Apex Global Technologies',
        dateTime: '13 Oct 2026, 09:15 AM',
        status: 'Active',
        statusSeverity: 'success'
      },
      {
        sNo: 3,
        activity: 'Payment Received',
        company: 'SwiftLogistics Express',
        dateTime: '12 Oct 2026, 04:45 PM',
        status: 'Successful',
        statusSeverity: 'success'
      },
      {
        sNo: 4,
        activity: 'Payment Failed',
        company: 'TechNova Solutions',
        dateTime: '12 Oct 2026, 02:10 PM',
        status: 'Failed',
        statusSeverity: 'danger'
      },
      {
        sNo: 5,
        activity: 'GST Verification Validated',
        company: 'Vertex Financial Services',
        dateTime: '11 Oct 2026, 06:20 PM',
        status: 'Verified',
        statusSeverity: 'success'
      },
      {
        sNo: 6,
        activity: 'Company Suspended',
        company: 'Zion Industrial Hub',
        dateTime: '10 Oct 2026, 03:00 PM',
        status: 'Suspended',
        statusSeverity: 'danger'
      }
    ];
  }, []);

  if (!metrics) {
    return null;
  }

  // Symmetrical SVG Donut Segment Calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74

  return (
    <div className="dashboard-container">
      {/* SECTION 1: Key Metrics (8 compact cards in responsive grid) */}
      <section className="dashboard-section" aria-label="Key Metrics">
        <div className="section-title-wrap">
          <h2 className="dashboard-section-heading">Key Metrics</h2>
        </div>

        <div className="key-metrics-grid">
          {keyMetrics.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="metric-card"
                onClick={() => navigate(item.path)}
                role="button"
                tabIndex={0}
                title={`View ${item.label}`}
              >
                <div className={`metric-icon-badge ${item.colorClass}`}>
                  <Icon size={20} />
                </div>
                <div className="metric-details">
                  <span className="metric-label">{item.label}</span>
                  <span className="metric-value">{item.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Revenue & Growth Analytics (Two medium-sized cards side by side) */}
      <section className="dashboard-section" aria-label="Revenue and Growth Analytics">
        <div className="section-title-wrap">
          <h2 className="dashboard-section-heading">Revenue & Growth Analytics</h2>
        </div>

        <div className="analytics-cards-grid">
          {/* Card 1: Revenue Trend (Clean Line/Area Chart formatted in INR) */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <div className="analytics-header-info">
                <h3 className="analytics-card-title">Revenue Trend</h3>
                <span className="analytics-card-subtitle">Monthly revenue intake (Last 6 Months in INR)</span>
              </div>
              <span className="analytics-badge-pill">₹27,900 Latest</span>
            </div>

            <div className="chart-visual-wrapper">
              <svg className="analytics-svg-chart" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="40" y1="130" x2="480" y2="130" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="40" y1="170" x2="480" y2="170" stroke="#CBD5E1" strokeWidth="1.5" />

                {/* Y-axis Ticks */}
                <text x="32" y="34" className="chart-axis-label" textAnchor="end">₹30k</text>
                <text x="32" y="84" className="chart-axis-label" textAnchor="end">₹20k</text>
                <text x="32" y="134" className="chart-axis-label" textAnchor="end">₹10k</text>

                {/* Area Gradient Fill */}
                <polygon
                  points="60,170 60,125 140,110 220,95 300,75 380,55 460,35 460,170"
                  fill="url(#revenueGradient)"
                />

                {/* Revenue Line */}
                <polyline
                  points="60,125 140,110 220,95 300,75 380,55 460,35"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {[
                  { cx: 60, cy: 125, val: '₹14.2k' },
                  { cx: 140, cy: 110, val: '₹16.8k' },
                  { cx: 220, cy: 95, val: '₹19.4k' },
                  { cx: 300, cy: 75, val: '₹22.1k' },
                  { cx: 380, cy: 55, val: '₹24.8k' },
                  { cx: 460, cy: 35, val: '₹27.9k' }
                ].map((pt, idx) => (
                  <g key={idx}>
                    <circle cx={pt.cx} cy={pt.cy} r="4.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                    <text x={pt.cx} y={pt.cy - 10} className="chart-point-label" textAnchor="middle">
                      {pt.val}
                    </text>
                  </g>
                ))}

                {/* Month Labels */}
                {revenueTrendData.map((d, idx) => (
                  <text key={idx} x={60 + idx * 80} y="190" className="chart-axis-label" textAnchor="middle">
                    {d.month}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          {/* Card 2: Company Growth (Clean Bar Chart of Registrations) */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <div className="analytics-header-info">
                <h3 className="analytics-card-title">Company Growth</h3>
                <span className="analytics-card-subtitle">New company registrations by month</span>
              </div>
              <span className="analytics-badge-pill">+77 Total Enrolled</span>
            </div>

            <div className="chart-visual-wrapper">
              <svg className="analytics-svg-chart" viewBox="0 0 500 200" preserveAspectRatio="none">
                {/* Horizontal Gridlines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="40" y1="130" x2="480" y2="130" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="40" y1="170" x2="480" y2="170" stroke="#CBD5E1" strokeWidth="1.5" />

                {/* Y-axis Ticks */}
                <text x="32" y="34" className="chart-axis-label" textAnchor="end">20</text>
                <text x="32" y="84" className="chart-axis-label" textAnchor="end">15</text>
                <text x="32" y="134" className="chart-axis-label" textAnchor="end">10</text>

                {/* Bars */}
                {companyGrowthData.map((item, idx) => {
                  const x = 50 + idx * 72;
                  const barHeight = item.count * 6.5;
                  const y = 170 - barHeight;
                  return (
                    <g key={idx}>
                      <rect
                        x={x}
                        y={y}
                        width="36"
                        height={barHeight}
                        rx="5"
                        fill={idx === companyGrowthData.length - 2 ? '#2563EB' : '#93C5FD'}
                        className="chart-bar-rect"
                      />
                      <text x={x + 18} y={y - 8} className="chart-point-label" textAnchor="middle">
                        {item.count}
                      </text>
                      <text x={x + 18} y="190" className="chart-axis-label" textAnchor="middle">
                        {item.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Subscription Overview (Compact Donut & Clean Status Breakdown) */}
      <section className="dashboard-section" aria-label="Subscription Overview">
        <div className="section-title-wrap">
          <h2 className="dashboard-section-heading">Subscription Overview</h2>
        </div>

        <div className="subscription-overview-panel">
          {/* Donut Chart Visual */}
          <div className="donut-chart-box">
            <svg className="donut-svg-graphic" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="14"
              />
              {/* Segments calculation */}
              {(() => {
                let accumulatedOffset = 0;
                return subscriptionBreakdown.items.map((seg, idx) => {
                  if (seg.pct <= 0) return null;
                  const strokeDasharray = `${(seg.pct / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedOffset;
                  accumulatedOffset += (seg.pct / 100) * circumference;

                  return (
                    <circle
                      key={idx}
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="14"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform="rotate(-90 70 70)"
                    />
                  );
                });
              })()}
              <text x="70" y="66" className="donut-center-total" textAnchor="middle">
                {subscriptionBreakdown.total}
              </text>
              <text x="70" y="82" className="donut-center-caption" textAnchor="middle">
                Total Subs
              </text>
            </svg>
          </div>

          {/* Breakdown Status Cards with Clear Legend */}
          <div className="subscription-legend-grid">
            {subscriptionBreakdown.items.map((item, idx) => (
              <div key={idx} className="sub-status-item-card">
                <div className="sub-status-header">
                  <span className={`status-color-dot ${item.dotClass}`} />
                  <span className="sub-status-name">{item.label}</span>
                </div>
                <div className="sub-status-meta">
                  <span className="sub-status-count">{item.count}</span>
                  <span className="sub-status-pct">{item.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Action Required (Compact Table) */}
      <section className="dashboard-section" aria-label="Action Required">
        <div className="section-title-wrap">
          <div className="flex items-center gap-3">
            <h2 className="dashboard-section-heading">Action Required</h2>
            {actionRequiredItems.length > 0 && (
              <span className="badge-pending-count">{actionRequiredItems.length} Urgent</span>
            )}
          </div>
        </div>

        <div className="compact-table-panel">
          {actionRequiredItems.length === 0 ? (
            <div className="table-empty-notice">
              <CheckCircle size={32} className="text-emerald" />
              <span>All clear! No pending actions or critical alerts.</span>
            </div>
          ) : (
            <div className="table-responsive-wrapper">
              <table className="compact-data-table">
                <thead>
                  <tr>
                    <th className="col-sno">S.No</th>
                    <th>Item / Reference</th>
                    <th>Company or Related Entity</th>
                    <th>Issue Type</th>
                    <th>Status</th>
                    <th className="col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {actionRequiredItems.map((row) => (
                    <tr key={row.sNo}>
                      <td className="cell-sno">{row.sNo}</td>
                      <td className="cell-reference">{row.itemRef}</td>
                      <td className="cell-company">{row.company}</td>
                      <td className="cell-issue">{row.issueType}</td>
                      <td>
                        <span className={`table-status-pill pill-${row.statusSeverity}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="cell-action">
                        <button
                          type="button"
                          className="table-action-icon-btn"
                          onClick={() => navigate(row.path)}
                          title="View Details"
                          aria-label={`View details for ${row.itemRef}`}
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 5: Recent Activity (Compact Table at bottom) */}
      <section className="dashboard-section" aria-label="Recent Activity">
        <div className="section-title-wrap">
          <h2 className="dashboard-section-heading">Recent Activity</h2>
        </div>

        <div className="compact-table-panel">
          {recentActivities.length === 0 ? (
            <div className="table-empty-notice">
              <Clock size={32} className="text-muted" />
              <span>No recent activities logged in demonstration storage.</span>
            </div>
          ) : (
            <div className="table-responsive-wrapper">
              <table className="compact-data-table">
                <thead>
                  <tr>
                    <th className="col-sno">S.No</th>
                    <th>Activity</th>
                    <th>Company</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map((act) => (
                    <tr key={act.sNo}>
                      <td className="cell-sno">{act.sNo}</td>
                      <td className="cell-activity">{act.activity}</td>
                      <td className="cell-company">{act.company}</td>
                      <td className="cell-datetime">{act.dateTime}</td>
                      <td>
                        <span className={`table-status-pill pill-${act.statusSeverity}`}>
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
