import React from 'react';
import {
  TrendingUp,
  Building2,
  CreditCard,
  IndianRupee,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import './DashboardCharts.css';

export const DashboardCharts = ({ metrics, trends }) => {
  const companyTrends = trends?.companyRegistrationsTrend || [
    { month: 'Sep', count: 8 },
    { month: 'Oct', count: 12 },
    { month: 'Nov', count: 15 },
    { month: 'Dec', count: 10 },
    { month: 'Jan', count: 18 },
    { month: 'Feb', count: 14 }
  ];

  const revenueTrends = trends?.revenueTrend || [
    { month: 'Sep', revenue: 14200 },
    { month: 'Oct', revenue: 16800 },
    { month: 'Nov', revenue: 19400 },
    { month: 'Dec', revenue: 22100 },
    { month: 'Jan', revenue: 24800 },
    { month: 'Feb', revenue: 27900 }
  ];

  // Subscription Overview Donut Data
  const subSummary = metrics?.subscriptionSummary || {
    activeSubscriptions: 4,
    trials: 1,
    renewalsDue: 2,
    expiredSubscriptions: 1,
    cancelledSubscriptions: 1
  };

  const totalSubs = Math.max(
    1,
    subSummary.activeSubscriptions +
      subSummary.trials +
      subSummary.expiredSubscriptions +
      subSummary.cancelledSubscriptions
  );

  const activePct = Math.round((subSummary.activeSubscriptions / totalSubs) * 100);
  const trialPct = Math.round((subSummary.trials / totalSubs) * 100);
  const expiredPct = Math.round((subSummary.expiredSubscriptions / totalSubs) * 100);
  const cancelledPct = Math.max(0, 100 - activePct - trialPct - expiredPct);

  // SVG Donut Calculations (Circumference ~= 263.89)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const activeLength = (activePct / 100) * circumference;
  const trialLength = (trialPct / 100) * circumference;
  const expiredLength = (expiredPct / 100) * circumference;
  const cancelledLength = (cancelledPct / 100) * circumference;

  const activeOffset = 0;
  const trialOffset = -activeLength;
  const expiredOffset = -(activeLength + trialLength);
  const cancelledOffset = -(activeLength + trialLength + expiredLength);

  // Platform Usage Data
  const usage = metrics?.platformUsage || {
    totalJobs: 2456,
    totalAlerts: 48220,
    totalCandidateRegistrations: 124500,
    totalInterviews: 8450,
    totalHires: 2890
  };

  const usageItems = [
    { label: 'Candidate Registrations', count: usage.totalCandidateRegistrations, max: 130000 },
    { label: 'Candidate Alerts Dispatched', count: usage.totalAlerts, max: 130000 },
    { label: 'Completed Interviews', count: usage.totalInterviews, max: 130000 },
    { label: 'Successful Placements (Hires)', count: usage.totalHires, max: 130000 },
    { label: 'Active Job Requisitions', count: usage.totalJobs, max: 130000 }
  ];

  return (
    <div className="dashboard-charts-grid">
      {/* Chart 1: Company Growth Over Time (Area Chart) */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title-area">
            <h3 className="chart-title">Company Growth</h3>
            <p className="chart-subtitle">Monthly corporate enterprise onboarding</p>
          </div>
          <span className="chart-badge">+24% vs last period</span>
        </div>

        <div className="chart-content-wrapper">
          <svg className="svg-chart-container" viewBox="0 0 460 180">
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="40" y1="30" x2="430" y2="30" className="chart-grid-line" />
            <line x1="40" y1="75" x2="430" y2="75" className="chart-grid-line" />
            <line x1="40" y1="120" x2="430" y2="120" className="chart-grid-line" />
            <line x1="40" y1="150" x2="430" y2="150" className="chart-grid-line" />

            {/* Y Axis labels */}
            <text x="15" y="34" className="chart-axis-text">20</text>
            <text x="15" y="79" className="chart-axis-text">15</text>
            <text x="15" y="124" className="chart-axis-text">10</text>
            <text x="15" y="154" className="chart-axis-text">0</text>

            {/* Area and Line Path */}
            <path
              d="M 60 126 C 97 112, 115 105, 134 98 C 171 88, 189 80, 208 77 C 245 88, 263 105, 282 112 C 319 84, 337 63, 356 56 C 393 70, 411 77, 430 84 L 430 150 L 60 150 Z"
              className="chart-area-path"
            />
            <path
              d="M 60 126 C 97 112, 115 105, 134 98 C 171 88, 189 80, 208 77 C 245 88, 263 105, 282 112 C 319 84, 337 63, 356 56 C 393 70, 411 77, 430 84"
              className="chart-line-path"
            />

            {/* Data points */}
            <circle cx="60" cy="126" r="4" className="chart-data-point" />
            <circle cx="134" cy="98" r="4" className="chart-data-point" />
            <circle cx="208" cy="77" r="4" className="chart-data-point" />
            <circle cx="282" cy="112" r="4" className="chart-data-point" />
            <circle cx="356" cy="56" r="5" className="chart-data-point" />
            <circle cx="430" cy="84" r="4" className="chart-data-point" />

            {/* Month labels */}
            <text x="50" y="170" className="chart-axis-text">Sep</text>
            <text x="124" y="170" className="chart-axis-text">Oct</text>
            <text x="198" y="170" className="chart-axis-text">Nov</text>
            <text x="272" y="170" className="chart-axis-text">Dec</text>
            <text x="346" y="170" className="chart-axis-text">Jan</text>
            <text x="420" y="170" className="chart-axis-text">Feb</text>
          </svg>

          <div className="peak-pill">
            <ArrowUpRight size={12} />
            <span>Highest (Jan: 18)</span>
          </div>
        </div>
      </div>

      {/* Chart 2: Subscription Overview (Donut Chart) */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title-area">
            <h3 className="chart-title">Subscription Overview</h3>
            <p className="chart-subtitle">Distribution by account subscription tier</p>
          </div>
          <span className="chart-badge">{subSummary.activeSubscriptions} Active</span>
        </div>

        <div className="chart-content-wrapper">
          <div className="donut-chart-container">
            <div className="donut-svg-wrapper">
              <svg width="150" height="150" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="14"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#2563EB"
                  strokeWidth="14"
                  strokeDasharray={`${activeLength} ${circumference}`}
                  strokeDashoffset={activeOffset}
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#38BDF8"
                  strokeWidth="14"
                  strokeDasharray={`${trialLength} ${circumference}`}
                  strokeDashoffset={trialOffset}
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="14"
                  strokeDasharray={`${expiredLength} ${circumference}`}
                  strokeDashoffset={expiredOffset}
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#EF4444"
                  strokeWidth="14"
                  strokeDasharray={`${cancelledLength} ${circumference}`}
                  strokeDashoffset={cancelledOffset}
                  strokeLinecap="round"
                />
              </svg>

              <div className="donut-center-text">
                <span className="donut-center-val">{activePct}%</span>
                <span className="donut-center-label">Active</span>
              </div>
            </div>

            {/* Legend with CSS class dots */}
            <div className="donut-legend-list">
              <div className="donut-legend-item">
                <div className="donut-legend-left">
                  <span className="donut-color-dot dot-blue" />
                  <span>Active Accounts</span>
                </div>
                <span className="donut-legend-pct">{activePct}% ({subSummary.activeSubscriptions})</span>
              </div>

              <div className="donut-legend-item">
                <div className="donut-legend-left">
                  <span className="donut-color-dot dot-sky" />
                  <span>Trial Subscriptions</span>
                </div>
                <span className="donut-legend-pct">{trialPct}% ({subSummary.trials})</span>
              </div>

              <div className="donut-legend-item">
                <div className="donut-legend-left">
                  <span className="donut-color-dot dot-amber" />
                  <span>Expired / Grace</span>
                </div>
                <span className="donut-legend-pct">{expiredPct}% ({subSummary.expiredSubscriptions})</span>
              </div>

              <div className="donut-legend-item">
                <div className="donut-legend-left">
                  <span className="donut-color-dot dot-red" />
                  <span>Cancelled / Terminated</span>
                </div>
                <span className="donut-legend-pct">{cancelledPct}% ({subSummary.cancelledSubscriptions})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart 3: Revenue Overview (Monthly in INR with SVG column chart) */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title-area">
            <h3 className="chart-title">Revenue Overview (INR)</h3>
            <p className="chart-subtitle">Monthly transaction intake formatted in ₹</p>
          </div>
          <span className="chart-badge">
            ₹{(metrics?.paymentSummary?.monthlyRevenue || 98500).toLocaleString('en-IN')} Current Month
          </span>
        </div>

        <div className="chart-content-wrapper">
          <svg className="revenue-svg-container" viewBox="0 0 460 180">
            <defs>
              <linearGradient id="revBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="revPeakGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            {/* Grid baseline */}
            <line x1="20" y1="150" x2="440" y2="150" className="chart-grid-line" />

            {revenueTrends.map((item, idx) => {
              const xPos = 40 + idx * 68;
              const barWidth = 34;
              const maxRev = 30000;
              const barHeight = Math.round((item.revenue / maxRev) * 110);
              const yPos = 150 - barHeight;
              const isPeak = idx === revenueTrends.length - 1;

              return (
                <g key={item.month}>
                  {/* Background pillar */}
                  <rect
                    x={xPos}
                    y={35}
                    width={barWidth}
                    height={115}
                    rx={6}
                    className="revenue-bar-bg"
                  />
                  {/* Fill column */}
                  <rect
                    x={xPos}
                    y={yPos}
                    width={barWidth}
                    height={barHeight}
                    rx={6}
                    className={`revenue-bar-rect ${isPeak ? 'peak-bar' : ''}`}
                  />
                  {/* Amount label */}
                  <text
                    x={xPos + barWidth / 2}
                    y={yPos - 6}
                    className="revenue-label-val"
                  >
                    ₹{(item.revenue / 1000).toFixed(1)}k
                  </text>
                  {/* Month label */}
                  <text
                    x={xPos + barWidth / 2}
                    y={166}
                    className="revenue-label-month"
                  >
                    {item.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Chart 4: Platform Usage Breakdown (Responsive SVG Bars) */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title-area">
            <h3 className="chart-title">Platform Usage Metrics</h3>
            <p className="chart-subtitle">Aggregate system utilization across tenant requisitions</p>
          </div>
          <span className="chart-badge">1.2L+ Candidates</span>
        </div>

        <div className="chart-content-wrapper">
          <svg className="usage-svg-container" viewBox="0 0 460 190">
            <defs>
              <linearGradient id="usageBarGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
            </defs>

            {usageItems.map((item, idx) => {
              const yPos = 10 + idx * 36;
              const trackWidth = 430;
              const fillWidth = Math.round((item.count / item.max) * trackWidth);

              return (
                <g key={item.label}>
                  <text x="15" y={yPos + 10} className="usage-row-label">
                    {item.label}
                  </text>
                  <text x="445" y={yPos + 10} className="usage-row-val">
                    {item.count.toLocaleString('en-IN')}
                  </text>
                  <rect
                    x="15"
                    y={yPos + 16}
                    width={trackWidth}
                    height="8"
                    rx="4"
                    className="usage-track-rect"
                  />
                  <rect
                    x="15"
                    y={yPos + 16}
                    width={fillWidth}
                    height="8"
                    rx="4"
                    className="usage-fill-rect"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
