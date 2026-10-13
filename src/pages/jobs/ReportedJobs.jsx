import React, { useState, useMemo } from 'react';
import {
  Eye,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Building2,
  Calendar,
  FileText,
  User,
  Clock,
  ShieldAlert,
  AlertCircle,
  Check
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
import { formatDate } from '../../utils/formatters';
import './ReportedJobs.css';

const REPORT_STATUS_OPTIONS = ['All Statuses', 'Open', 'Under Review', 'Resolved', 'Dismissed'];
const ACTION_TAKEN_OPTIONS = ['All Actions', 'No Action', 'Warning', 'Job Deactivated'];
const REPORT_REASONS = [
  'All Reasons',
  'Scam / Fraud',
  'Misleading Information',
  'Discriminatory Content',
  'Expired / Inactive Job',
  'Spam / Duplicate'
];

export const ReportedJobs = () => {
  const { dataVersion, triggerRefresh } = useApp();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [reasonFilter, setReasonFilter] = useState('All Reasons');
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [sortColumn, setSortColumn] = useState('reportedDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modals (state-controlled, zero URL changes)
  const [viewingReport, setViewingReport] = useState(null);
  const [resolvingReport, setResolvingReport] = useState(null);
  const [resolveActionTaken, setResolveActionTaken] = useState('No Action');
  const [resolveAdminRemarks, setResolveAdminRemarks] = useState('');

  const [dismissingReport, setDismissingReport] = useState(null);
  const [dismissReason, setDismissReason] = useState('');

  const reportsList = useMemo(() => {
    return storageService.getReportedJobs();
  }, [dataVersion]);

  // Filtering & Search
  const filteredReports = useMemo(() => {
    let result = [...reportsList];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();
      result = result.filter(
        (rep) =>
          (rep.id || '').toLowerCase().includes(lower) ||
          (rep.jobTitle || '').toLowerCase().includes(lower) ||
          (rep.companyName || rep.company || '').toLowerCase().includes(lower) ||
          (rep.reportedBy || '').toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== 'All Statuses') {
      result = result.filter(
        (rep) => (rep.reportStatus || rep.status) === statusFilter
      );
    }

    if (reasonFilter !== 'All Reasons') {
      result = result.filter((rep) => rep.reportReason === reasonFilter);
    }

    if (actionFilter !== 'All Actions') {
      result = result.filter((rep) => rep.actionTaken === actionFilter);
    }

    if (dateFilter) {
      result = result.filter((rep) => {
        const d = rep.reportedDate || rep.reportDate;
        return d && d.startsWith(dateFilter);
      });
    }

    if (sortColumn) {
      result.sort((a, b) => {
        let valA = a[sortColumn] || '';
        let valB = b[sortColumn] || '';
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [reportsList, searchTerm, statusFilter, reasonFilter, actionFilter, dateFilter, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredReports.length / pageSize) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, currentPage]);

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All Statuses');
    setReasonFilter('All Reasons');
    setActionFilter('All Actions');
    setDateFilter('');
    setCurrentPage(1);
  };

  // Open Resolve Modal
  const handleOpenResolve = (report) => {
    setResolvingReport(report);
    setResolveActionTaken(report.actionTaken || 'No Action');
    setResolveAdminRemarks(report.adminRemarks || '');
  };

  // Submit Resolve
  const handleConfirmResolve = (e) => {
    e.preventDefault();
    if (!resolvingReport) return;

    if (!resolveAdminRemarks.trim()) {
      addToast({
        type: 'error',
        title: 'Admin Remarks Required',
        message: 'Please provide administrator review remarks prior to resolving this report.'
      });
      return;
    }

    storageService.resolveReport(resolvingReport.id, {
      actionTaken: resolveActionTaken,
      adminRemarks: resolveAdminRemarks.trim(),
      adminUser: 'Marcus Vance (Super Admin)'
    });

    triggerRefresh();

    addToast({
      type: 'success',
      title: 'Report Resolved',
      message: `Report ${resolvingReport.id} resolved with action "${resolveActionTaken}".`
    });

    setResolvingReport(null);
    setResolveActionTaken('No Action');
    setResolveAdminRemarks('');
  };

  // Open Dismiss Modal
  const handleOpenDismiss = (report) => {
    setDismissingReport(report);
    setDismissReason('');
  };

  // Submit Dismiss
  const handleConfirmDismiss = (e) => {
    e.preventDefault();
    if (!dismissingReport) return;

    if (!dismissReason.trim()) {
      addToast({
        type: 'error',
        title: 'Dismissal Reason Required',
        message: 'Please provide a valid dismissal reason or administrative remarks.'
      });
      return;
    }

    storageService.dismissReport(dismissingReport.id, {
      dismissalReason: dismissReason.trim(),
      adminUser: 'Marcus Vance (Super Admin)'
    });

    triggerRefresh();

    addToast({
      type: 'info',
      title: 'Report Dismissed',
      message: `Report ${dismissingReport.id} has been marked as Dismissed.`
    });

    setDismissingReport(null);
    setDismissReason('');
  };

  // Helper for rendering Action Taken Badges
  const renderActionTakenBadge = (action) => {
    if (!action || action === 'No Action') {
      return (
        <span className="action-taken-badge badge-no-action">
          No Action
        </span>
      );
    }
    if (action === 'Warning') {
      return (
        <span className="action-taken-badge badge-warning">
          <AlertTriangle size={12} />
          Warning
        </span>
      );
    }
    if (action === 'Job Deactivated') {
      return (
        <span className="action-taken-badge badge-deactivated">
          <ShieldAlert size={12} />
          Job Deactivated
        </span>
      );
    }
    return <span className="action-taken-badge badge-no-action">{action}</span>;
  };

  // Table columns in exact specified order:
  // 1. S.No
  // 2. Report ID
  // 3. Job Title
  // 4. Company Name
  // 5. Reported By
  // 6. Report Reason
  // 7. Reported Date
  // 8. Report Status
  // 9. Action Taken
  // 10. Action
  const tableColumns = useMemo(
    () => [
      {
        key: 'sNo',
        label: 'S.No',
        sortable: false
      },
      {
        key: 'id',
        label: 'Report ID',
        sortable: true,
        render: (row) => <span className="report-id-badge">{row.id}</span>
      },
      {
        key: 'jobTitle',
        label: 'Job Title',
        sortable: true,
        render: (row) => (
          <div className="reported-job-cell">
            <span className="reported-job-title">{row.jobTitle}</span>
            {row.jobId && <span className="reported-job-id">{row.jobId}</span>}
          </div>
        )
      },
      {
        key: 'companyName',
        label: 'Company Name',
        sortable: true,
        render: (row) => (
          <span className="font-medium text-primary">{row.companyName || row.company}</span>
        )
      },
      {
        key: 'reportedBy',
        label: 'Reported By',
        sortable: true,
        render: (row) => <span className="report-reporter-text">{row.reportedBy || 'Candidate'}</span>
      },
      {
        key: 'reportReason',
        label: 'Report Reason',
        sortable: true,
        render: (row) => <span className="report-reason-badge">{row.reportReason}</span>
      },
      {
        key: 'reportedDate',
        label: 'Reported Date',
        sortable: true,
        render: (row) => formatDate(row.reportedDate || row.reportDate)
      },
      {
        key: 'reportStatus',
        label: 'Report Status',
        sortable: true,
        render: (row) => (
          <StatusBadge status={row.reportStatus || row.status || 'Open'} />
        )
      },
      {
        key: 'actionTaken',
        label: 'Action Taken',
        sortable: true,
        render: (row) => renderActionTakenBadge(row.actionTaken)
      },
      {
        key: 'action',
        label: 'Action',
        sortable: false,
        render: (row) => {
          const isResolved = (row.reportStatus || row.status) === 'Resolved';
          const isDismissed = (row.reportStatus || row.status) === 'Dismissed';

          return (
            <div className="reported-action-icons">
              {/* View Report (Eye icon) */}
              <button
                type="button"
                className="report-icon-btn"
                title="View Report Details"
                aria-label={`View Details for ${row.id}`}
                onClick={() => setViewingReport(row)}
              >
                <Eye size={15} />
              </button>

              {/* Resolve Report (Check Circle icon) */}
              <button
                type="button"
                className="report-icon-btn btn-resolve"
                title={isResolved ? 'Report already resolved' : 'Resolve Report'}
                aria-label={isResolved ? `Report ${row.id} already resolved` : `Resolve Report ${row.id}`}
                onClick={() => handleOpenResolve(row)}
              >
                <CheckCircle size={15} />
              </button>

              {/* Dismiss Report (X Circle icon) */}
              <button
                type="button"
                className="report-icon-btn btn-dismiss"
                title={isDismissed ? 'Report already dismissed' : 'Dismiss Report'}
                aria-label={isDismissed ? `Report ${row.id} already dismissed` : `Dismiss Report ${row.id}`}
                onClick={() => handleOpenDismiss(row)}
              >
                <XCircle size={15} />
              </button>
            </div>
          );
        }
      }
    ],
    []
  );

  return (
    <div className="reported-jobs-container">
      <PageHeader title="Reported Jobs" />

      {/* Filter and Search Controls Above Table */}
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

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Report Status"
          >
            {REPORT_STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={reasonFilter}
            onChange={(e) => {
              setReasonFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Report Reason"
          >
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Action Taken"
          >
            {ACTION_TAKEN_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <input
            type="month"
            className="filter-select"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Reported Month"
          />

          {(searchTerm ||
            statusFilter !== 'All Statuses' ||
            reasonFilter !== 'All Reasons' ||
            actionFilter !== 'All Actions' ||
            dateFilter) && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={tableColumns}
        data={paginatedReports}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        currentPage={currentPage}
        pageSize={pageSize}
        emptyTitle="No Reported Jobs Found"
        emptyDescription="There are currently no job reports matching your search or filter parameters."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredReports.length}
        pageSize={pageSize}
      />

      {/* View Report Details Modal (URL remains /jobs/reported) */}
      {viewingReport && (
        <Modal
          isOpen={true}
          onClose={() => setViewingReport(null)}
          title={`Report Incident — ${viewingReport.id}`}
          size="lg"
          footer={
            <div className="flex gap-2">
              <Button
                variant="success"
                onClick={() => {
                  const rep = viewingReport;
                  setViewingReport(null);
                  handleOpenResolve(rep);
                }}
              >
                Resolve Report
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  const rep = viewingReport;
                  setViewingReport(null);
                  handleOpenDismiss(rep);
                }}
              >
                Dismiss Report
              </Button>
              <Button variant="secondary" onClick={() => setViewingReport(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="report-modal-details">
            {/* Core Report Fields */}
            <div className="report-detail-card">
              <div className="report-detail-card-title">
                <AlertTriangle size={16} />
                <span>Report Specifications</span>
              </div>
              <div className="report-detail-grid">
                <div className="report-detail-item">
                  <span className="report-detail-label">Report ID</span>
                  <span className="report-detail-value">{viewingReport.id}</span>
                </div>
                <div className="report-detail-item">
                  <span className="report-detail-label">Report Status</span>
                  <div>
                    <StatusBadge status={viewingReport.reportStatus || viewingReport.status || 'Open'} />
                  </div>
                </div>
                <div className="report-detail-item">
                  <span className="report-detail-label">Job Title</span>
                  <span className="report-detail-value">{viewingReport.jobTitle}</span>
                </div>
                <div className="report-detail-item">
                  <span className="report-detail-label">Company Name</span>
                  <span className="report-detail-value">{viewingReport.companyName || viewingReport.company}</span>
                </div>
                <div className="report-detail-item">
                  <span className="report-detail-label">Reported By</span>
                  <span className="report-detail-value">{viewingReport.reportedBy || 'Candidate'}</span>
                </div>
                <div className="report-detail-item">
                  <span className="report-detail-label">Report Reason</span>
                  <span className="report-detail-value">{viewingReport.reportReason}</span>
                </div>
                <div className="report-detail-item">
                  <span className="report-detail-label">Reported Date</span>
                  <span className="report-detail-value">
                    {formatDate(viewingReport.reportedDate || viewingReport.reportDate)}
                  </span>
                </div>
                <div className="report-detail-item">
                  <span className="report-detail-label">Action Taken</span>
                  <div>{renderActionTakenBadge(viewingReport.actionTaken)}</div>
                </div>
              </div>
            </div>

            {/* Candidate Statement / Description */}
            <div className="report-detail-card">
              <div className="report-detail-card-title">
                <FileText size={16} />
                <span>Candidate Statement</span>
              </div>
              <p className="report-detail-text">
                {viewingReport.description || 'No additional statement provided.'}
              </p>
            </div>

            {/* Resolution Information & Admin Remarks */}
            <div className="report-detail-card">
              <div className="report-detail-card-title">
                <Clock size={16} />
                <span>Resolution Audit</span>
              </div>
              <div className="report-detail-grid">
                <div className="report-detail-item">
                  <span className="report-detail-label">Resolved Date</span>
                  <span className="report-detail-value">
                    {viewingReport.resolvedDate
                      ? formatDate(viewingReport.resolvedDate)
                      : 'Pending Resolution'}
                  </span>
                </div>
                <div className="report-detail-item">
                  <span className="report-detail-label">Reviewing Super Admin</span>
                  <span className="report-detail-value">Marcus Vance (Super Admin)</span>
                </div>
                <div className="report-detail-item-full">
                  <span className="report-detail-label">Admin Remarks</span>
                  <p className="report-detail-text">
                    {viewingReport.adminRemarks || viewingReport.resolutionNotes || 'No administrator remarks recorded yet.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Incident Action History */}
            {viewingReport.actionHistory && viewingReport.actionHistory.length > 0 && (
              <div className="report-detail-card">
                <div className="report-detail-card-title">
                  <Clock size={16} />
                  <span>Incident Action History</span>
                </div>
                <table className="history-mini-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Reason / Remarks</th>
                      <th>Taken By</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingReport.actionHistory.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td>
                          <strong>{item.action}</strong>
                        </td>
                        <td>{item.reason || 'N/A'}</td>
                        <td>{item.takenBy || 'Super Admin'}</td>
                        <td>{item.date || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Resolve Report Modal */}
      {resolvingReport && (
        <Modal
          isOpen={true}
          onClose={() => setResolvingReport(null)}
          title={`Resolve Report — ${resolvingReport.id}`}
          size="md"
          footer={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setResolvingReport(null)}>
                Cancel
              </Button>
              <Button variant="success" onClick={handleConfirmResolve}>
                Submit Resolution
              </Button>
            </div>
          }
        >
          <form onSubmit={handleConfirmResolve} className="report-modal-form">
            <div className="report-banner banner-resolve">
              <CheckCircle size={20} />
              <div>
                Resolving incident for job <strong>"{resolvingReport.jobTitle}"</strong> posted by{' '}
                <strong>{resolvingReport.companyName || resolvingReport.company}</strong>.
              </div>
            </div>

            <div className="report-form-group">
              <label className="form-label">
                Select Action Taken <span className="text-danger">*</span>
              </label>
              <div className="radio-action-group">
                <label
                  className={`radio-action-label ${
                    resolveActionTaken === 'No Action' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="actionTaken"
                    className="radio-input"
                    value="No Action"
                    checked={resolveActionTaken === 'No Action'}
                    onChange={(e) => setResolveActionTaken(e.target.value)}
                  />
                  <div className="radio-text-box">
                    <span className="radio-title">No Action</span>
                    <span className="radio-desc">Investigation completed; no policy violation detected. Job remains active.</span>
                  </div>
                </label>

                <label
                  className={`radio-action-label ${
                    resolveActionTaken === 'Warning' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="actionTaken"
                    className="radio-input"
                    value="Warning"
                    checked={resolveActionTaken === 'Warning'}
                    onChange={(e) => setResolveActionTaken(e.target.value)}
                  />
                  <div className="radio-text-box">
                    <span className="radio-title">Warning</span>
                    <span className="radio-desc">Record compliance warning in audit history regarding listing terms.</span>
                  </div>
                </label>

                <label
                  className={`radio-action-label ${
                    resolveActionTaken === 'Job Deactivated' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="actionTaken"
                    className="radio-input"
                    value="Job Deactivated"
                    checked={resolveActionTaken === 'Job Deactivated'}
                    onChange={(e) => setResolveActionTaken(e.target.value)}
                  />
                  <div className="radio-text-box">
                    <span className="radio-title">Job Deactivated</span>
                    <span className="radio-desc">Automatically deactivates the associated job from candidate discovery.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="report-form-group">
              <label className="form-label">
                Admin Remarks <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Enter mandatory resolution notes, findings, or tenant compliance communications..."
                value={resolveAdminRemarks}
                onChange={(e) => setResolveAdminRemarks(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Dismiss Report Modal */}
      {dismissingReport && (
        <Modal
          isOpen={true}
          onClose={() => setDismissingReport(null)}
          title={`Dismiss Report — ${dismissingReport.id}`}
          size="md"
          footer={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setDismissingReport(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDismiss}>
                Confirm Dismissal
              </Button>
            </div>
          }
        >
          <form onSubmit={handleConfirmDismiss} className="report-modal-form">
            <div className="report-banner banner-dismiss">
              <AlertTriangle size={20} />
              <div>
                You are dismissing the incident report filed by <strong>{dismissingReport.reportedBy || 'Candidate'}</strong> regarding{' '}
                <strong>"{dismissingReport.jobTitle}"</strong>.
              </div>
            </div>

            <div className="report-form-group">
              <label className="form-label">
                Dismissal Reason / Admin Remarks <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="State the justification for dismissing this report (e.g. Unsubstantiated complaint, verified compliant requisition)..."
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ReportedJobs;
