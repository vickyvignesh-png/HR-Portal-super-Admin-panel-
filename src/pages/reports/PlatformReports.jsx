import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Eye,
  RotateCcw,
  Calendar,
  Building2,
  CreditCard,
  IndianRupee,
  Activity,
  Users,
  TrendingUp,
  FileText
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storageService } from '../../services/storageService';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate, formatNumber, exportToCSV } from '../../utils/formatters';
import './PlatformReports.css';

export const PlatformReports = () => {
  const { dataVersion, activeReportType } = useApp();
  const { addToast } = useToast();

  const selectedReportType = activeReportType || 'Company Reports';
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Reset page and filters when selected report type changes from sidebar
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setDateFilter('');
  }, [selectedReportType]);

  // In-page View Modal (ZERO URL changes)
  const [viewingRecord, setViewingRecord] = useState(null);

  const companies = useMemo(() => storageService.getCompanies(), [dataVersion]);
  const subscriptions = useMemo(() => storageService.getSubscriptions(), [dataVersion]);
  const payments = useMemo(() => storageService.getPayments(), [dataVersion]);
  const usageList = useMemo(() => storageService.getUsage(), [dataVersion]);

  // Demo datasets for Candidate Reports and Platform Trend
  const candidateReportsData = [
    { period: '2025-Q1', totalRegistrations: 42500, activeJobSeekers: 31200, growth: '+14.2%' },
    { period: '2024-Q4', totalRegistrations: 37200, activeJobSeekers: 27800, growth: '+11.8%' },
    { period: '2024-Q3', totalRegistrations: 33400, activeJobSeekers: 24500, growth: '+9.4%' },
    { period: '2024-Q2', totalRegistrations: 30500, activeJobSeekers: 22100, growth: '+8.1%' },
    { period: '2024-Q1', totalRegistrations: 28200, activeJobSeekers: 19800, growth: '+7.5%' }
  ];

  const platformTrendData = [
    { period: 'Feb 2025', newCompanies: 8, activeSubscriptions: 78, revenue: 148500, jobs: 2450, candidateRegistrations: 14200 },
    { period: 'Jan 2025', newCompanies: 11, activeSubscriptions: 74, revenue: 139200, jobs: 2280, candidateRegistrations: 13800 },
    { period: 'Dec 2024', newCompanies: 9, activeSubscriptions: 69, revenue: 126000, jobs: 2120, candidateRegistrations: 12900 },
    { period: 'Nov 2024', newCompanies: 7, activeSubscriptions: 64, revenue: 118400, jobs: 1980, candidateRegistrations: 11600 },
    { period: 'Oct 2024', newCompanies: 12, activeSubscriptions: 60, revenue: 112000, jobs: 1840, candidateRegistrations: 10400 }
  ];

  // Resolve dataset based on selected report type
  const activeDataset = useMemo(() => {
    let data = [];
    if (selectedReportType === 'Company Reports') {
      data = companies;
    } else if (selectedReportType === 'Subscription Reports') {
      data = subscriptions;
    } else if (selectedReportType === 'Revenue Reports') {
      data = payments;
    } else if (selectedReportType === 'Usage Reports') {
      data = usageList;
    } else if (selectedReportType === 'Candidate Reports') {
      data = candidateReportsData;
    } else if (selectedReportType === 'Platform Trend') {
      data = platformTrendData;
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();
      data = data.filter((item) => {
        return Object.values(item).some((val) =>
          String(val).toLowerCase().includes(lower)
        );
      });
    }

    if (dateFilter) {
      data = data.filter((item) => {
        const dateVal =
          item.registrationDate ||
          item.startDate ||
          item.paymentDate ||
          item.period;
        return dateVal ? String(dateVal).startsWith(dateFilter) : true;
      });
    }

    return data;
  }, [
    selectedReportType,
    companies,
    subscriptions,
    payments,
    usageList,
    searchTerm,
    dateFilter
  ]);

  const totalPages = Math.ceil(activeDataset.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return activeDataset.slice(start, start + pageSize);
  }, [activeDataset, currentPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    exportToCSV(`${selectedReportType.toLowerCase().replace(/\s+/g, '_')}_export`, activeDataset);
    addToast({
      type: 'info',
      title: 'Report Exported',
      message: `Exported ${activeDataset.length} rows from ${selectedReportType} to CSV.`
    });
  };

  // Specific column definitions for each report type
  const tableColumns = useMemo(() => {
    const actionCol = {
      key: 'action',
      label: 'Action',
      sortable: false,
      render: (row) => (
        <div className="reports-action-icons">
          <button
            type="button"
            className="reports-action-btn"
            title="View Record Details"
            aria-label="View Record Details"
            onClick={() => setViewingRecord(row)}
          >
            <Eye size={16} />
          </button>
        </div>
      )
    };

    const sNoCol = {
      key: 'sNo',
      label: 'S.No',
      sortable: false,
      render: (_, index, sNo) => (
        <span className="font-medium text-secondary">
          {typeof sNo === 'number' && !isNaN(sNo)
            ? sNo
            : (Number(currentPage || 1) - 1) * Number(pageSize || 10) + (typeof index === 'number' && !isNaN(index) ? index : 0) + 1}
        </span>
      )
    };

    if (selectedReportType === 'Company Reports') {
      return [
        sNoCol,
        { key: 'id', label: 'Company ID', render: (r) => <span className="font-semibold text-primary">{r.id}</span> },
        { key: 'name', label: 'Company Name', render: (r) => <span className="font-medium">{r.name}</span> },
        { key: 'registrationDate', label: 'Registration Date', render: (r) => formatDate(r.registrationDate) },
        { key: 'status', label: 'Company Status', render: (r) => <StatusBadge status={r.status} /> },
        { key: 'gstVerificationStatus', label: 'GST Status', render: (r) => <StatusBadge status={r.gstVerificationStatus} /> },
        actionCol
      ];
    }

    if (selectedReportType === 'Subscription Reports') {
      return [
        sNoCol,
        { key: 'id', label: 'Subscription ID', render: (r) => <span className="font-semibold text-primary">{r.id}</span> },
        { key: 'companyId', label: 'Company ID', render: (r) => <span className="font-medium text-primary">{r.companyId}</span> },
        { key: 'planName', label: 'Plan', render: (r) => <span className="font-medium">{r.planName}</span> },
        { key: 'status', label: 'Subscription Status', render: (r) => <StatusBadge status={r.status} /> },
        { key: 'nextRenewalDate', label: 'Renewal Date', render: (r) => formatDate(r.nextRenewalDate || r.endDate) },
        actionCol
      ];
    }

    if (selectedReportType === 'Revenue Reports') {
      return [
        sNoCol,
        { key: 'id', label: 'Transaction/Payment ID', render: (r) => <span className="font-semibold text-primary">{r.id}</span> },
        { key: 'companyName', label: 'Company', render: (r) => <span className="font-medium">{r.companyName}</span> },
        { key: 'amount', label: 'Revenue Amount', render: (r) => <span className="font-bold text-primary">{formatCurrency(r.amount)}</span> },
        { key: 'tax', label: 'Tax', render: (r) => formatCurrency(r.tax || 0) },
        { key: 'refundAmount', label: 'Refund Amount', render: (r) => (r.status === 'Refunded' ? formatCurrency(r.amount) : '₹0') },
        { key: 'status', label: 'Payment Status', render: (r) => <StatusBadge status={r.status} /> },
        actionCol
      ];
    }

    if (selectedReportType === 'Usage Reports') {
      return [
        sNoCol,
        { key: 'companyId', label: 'Company ID', render: (r) => <span className="font-semibold text-primary">{r.companyId}</span> },
        { key: 'companyName', label: 'Company Name', render: (r) => <span className="font-medium">{r.companyName}</span> },
        { key: 'activeJobs', label: 'Jobs Used', render: (r) => `${formatNumber(r.activeJobs)} / ${r.jobsLimit}` },
        { key: 'candidateAlertsUsed', label: 'Alerts Used', render: (r) => formatNumber(r.candidateAlertsUsed) },
        { key: 'screeningLimit', label: 'Screening Used', render: (r) => formatNumber(r.screeningLimit || 80) },
        { key: 'resumeAccessUsed', label: 'Resume Access Used', render: (r) => formatNumber(r.resumeAccessUsed) },
        {
          key: 'usagePercentage',
          label: 'Usage Percentage',
          render: (r) => {
            const pct = Math.min(100, Math.round(((r.activeJobs || 0) / (r.jobsLimit || 50)) * 100));
            return <span className="font-bold text-blue">{pct}%</span>;
          }
        },
        actionCol
      ];
    }

    if (selectedReportType === 'Candidate Reports') {
      return [
        sNoCol,
        { key: 'period', label: 'Report Period', render: (r) => <span className="font-semibold">{r.period}</span> },
        { key: 'totalRegistrations', label: 'Total Candidate Registrations', render: (r) => formatNumber(r.totalRegistrations) },
        { key: 'activeJobSeekers', label: 'Active Job Seekers', render: (r) => formatNumber(r.activeJobSeekers) },
        { key: 'growth', label: 'Registration Growth', render: (r) => <span className="text-green font-bold">{r.growth}</span> },
        actionCol
      ];
    }

    if (selectedReportType === 'Platform Trend') {
      return [
        sNoCol,
        { key: 'period', label: 'Period', render: (r) => <span className="font-semibold">{r.period}</span> },
        { key: 'newCompanies', label: 'New Companies', render: (r) => r.newCompanies },
        { key: 'activeSubscriptions', label: 'Active Subscriptions', render: (r) => r.activeSubscriptions },
        { key: 'revenue', label: 'Revenue', render: (r) => <span className="font-bold text-primary">{formatCurrency(r.revenue)}</span> },
        { key: 'jobs', label: 'Jobs', render: (r) => formatNumber(r.jobs) },
        { key: 'candidateRegistrations', label: 'Candidate Registrations', render: (r) => formatNumber(r.candidateRegistrations) },
        actionCol
      ];
    }

    return [];
  }, [selectedReportType, currentPage, pageSize]);

  return (
    <div className="reports-container">
      <PageHeader
        title={`Platform Reports — ${selectedReportType}`}
        actions={
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export Current Report
          </Button>
        }
      />

      {/* Toolbar above table */}
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search"
          />

          <input
            type="month"
            className="filter-select"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by period or month"
          />

          {(searchTerm || dateFilter) && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset filters"
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="table-container">
        {/* Data Table */}
        <DataTable
          columns={tableColumns}
          data={paginatedData}
          currentPage={currentPage}
          pageSize={pageSize}
          emptyTitle="No report entries found"
          emptyDescription="No records matching the selected report filters."
          emptyActionLabel="Clear Filters"
          onEmptyAction={handleResetFilters}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={activeDataset.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* VIEW RECORD MODAL (No URL Change) */}
      {viewingRecord && (
        <Modal
          isOpen={Boolean(viewingRecord)}
          onClose={() => setViewingRecord(null)}
          title={`Report Inspection — ${selectedReportType}`}
          size="md"
          footer={
            <div className="flex justify-end w-full">
              <Button variant="primary" onClick={() => setViewingRecord(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="report-detail-modal-body">
            <div className="report-detail-grid">
              {Object.entries(viewingRecord).map(([key, val]) => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-xs text-muted uppercase font-medium">{key}</span>
                  <span className="text-sm font-semibold">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PlatformReports;
