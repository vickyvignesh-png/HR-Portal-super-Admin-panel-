import React, { useState, useMemo } from 'react';
import {
  Eye,
  Lock,
  Ban,
  RotateCcw,
  Building2,
  Calendar,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  ShieldAlert,
  Power
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
import './PostedJobs.css';

const JOB_TYPES = ['All Types', 'Full-time', 'Part-time', 'Contract', 'Internship'];
const JOB_STATUS_OPTIONS = ['All Statuses', 'Active', 'Expired', 'Closed'];

export const PostedJobs = () => {
  const { dataVersion, triggerRefresh } = useApp();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [sortColumn, setSortColumn] = useState('postedDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modals (state-controlled, zero URL changes)
  const [viewingJob, setViewingJob] = useState(null);
  const [closeJobTarget, setCloseJobTarget] = useState(null);
  const [deactivateJobTarget, setDeactivateJobTarget] = useState(null);
  const [deactivationReason, setDeactivationReason] = useState('');

  const jobsList = useMemo(() => {
    return storageService.getPostedJobs();
  }, [dataVersion]);

  // Unique locations for filter
  const uniqueLocations = useMemo(() => {
    const locs = new Set();
    jobsList.forEach((j) => {
      if (j.location) locs.add(j.location);
    });
    return ['All Locations', ...Array.from(locs).sort()];
  }, [jobsList]);

  // Filtering & Search
  const filteredJobs = useMemo(() => {
    let result = [...jobsList];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();
      result = result.filter(
        (job) =>
          (job.id || '').toLowerCase().includes(lower) ||
          (job.title || '').toLowerCase().includes(lower) ||
          (job.companyName || job.company || '').toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== 'All Statuses') {
      result = result.filter(
        (job) => (job.jobStatus || job.status) === statusFilter
      );
    }

    if (typeFilter !== 'All Types') {
      result = result.filter((job) => job.jobType === typeFilter);
    }

    if (locationFilter !== 'All Locations') {
      result = result.filter((job) => job.location === locationFilter);
    }

    if (dateFilter) {
      result = result.filter((job) => {
        const postedMatch = job.postedDate && job.postedDate.startsWith(dateFilter);
        const expiryMatch = job.expiryDate && job.expiryDate.startsWith(dateFilter);
        return postedMatch || expiryMatch;
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
  }, [jobsList, searchTerm, statusFilter, typeFilter, locationFilter, dateFilter, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage]);

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
    setTypeFilter('All Types');
    setLocationFilter('All Locations');
    setDateFilter('');
    setCurrentPage(1);
  };

  // Close Job Action
  const handleConfirmCloseJob = () => {
    if (!closeJobTarget) return;

    storageService.closeJob(closeJobTarget.id, {
      reason: 'Requisition closed by Super Admin',
      adminUser: 'Marcus Vance (Super Admin)'
    });

    triggerRefresh();
    addToast({
      type: 'success',
      title: 'Job Closed',
      message: `Job ${closeJobTarget.id} ("${closeJobTarget.title}") has been marked as Closed.`
    });

    setCloseJobTarget(null);
  };

  // Deactivate / Reactivate Job Action
  const handleConfirmDeactivate = (e) => {
    e.preventDefault();
    if (!deactivateJobTarget) return;

    const willDeactivate = !deactivateJobTarget.isDeactivated;
    if (willDeactivate && !deactivationReason.trim()) {
      addToast({
        type: 'error',
        title: 'Deactivation Reason Required',
        message: 'Please provide a justification for administrative job deactivation.'
      });
      return;
    }

    storageService.toggleDeactivateJob(deactivateJobTarget.id, {
      reason: deactivationReason.trim() || 'Super Admin operational review',
      adminUser: 'Marcus Vance (Super Admin)'
    });

    triggerRefresh();
    addToast({
      type: 'success',
      title: willDeactivate ? 'Job Deactivated' : 'Job Reactivated',
      message: willDeactivate
        ? `Job ${deactivateJobTarget.id} availability has been administratively deactivated.`
        : `Job ${deactivateJobTarget.id} availability has been restored.`
    });

    setDeactivateJobTarget(null);
    setDeactivationReason('');
  };

  // Table Columns in exact order:
  // 1. S.No
  // 2. Job ID
  // 3. Job Title
  // 4. Company Name
  // 5. Job Type
  // 6. Location
  // 7. Posted Date
  // 8. Expiry Date
  // 9. Job Status
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
        label: 'Job ID',
        sortable: true,
        render: (row) => <span className="job-id-badge">{row.id}</span>
      },
      {
        key: 'title',
        label: 'Job Title',
        sortable: true,
        render: (row) => (
          <div className="job-title-cell">
            <span className="job-title-text">{row.title}</span>
            {row.isDeactivated && (
              <span className="deactivated-tag">
                <AlertTriangle size={12} />
                <span>Deactivated by Admin</span>
              </span>
            )}
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
        key: 'jobType',
        label: 'Job Type',
        sortable: true,
        render: (row) => <span className="job-type-badge">{row.jobType}</span>
      },
      {
        key: 'location',
        label: 'Location',
        sortable: true,
        render: (row) => <span className="job-location-text">{row.location || 'Remote'}</span>
      },
      {
        key: 'postedDate',
        label: 'Posted Date',
        sortable: true,
        render: (row) => formatDate(row.postedDate)
      },
      {
        key: 'expiryDate',
        label: 'Expiry Date',
        sortable: true,
        render: (row) => formatDate(row.expiryDate)
      },
      {
        key: 'jobStatus',
        label: 'Job Status',
        sortable: true,
        render: (row) => (
          <StatusBadge status={row.jobStatus || row.status || 'Active'} />
        )
      },
      {
        key: 'action',
        label: 'Action',
        sortable: false,
        render: (row) => {
          const isClosed = (row.jobStatus || row.status) === 'Closed';
          const isDeactivated = Boolean(row.isDeactivated);

          return (
            <div className="jobs-action-icons">
              {/* View Job (Eye icon) */}
              <button
                type="button"
                className="job-icon-btn"
                title="View Job Details"
                aria-label={`View Job Details for ${row.id}`}
                onClick={() => setViewingJob(row)}
              >
                <Eye size={15} />
              </button>

              {/* Close Job (Lock icon) */}
              <button
                type="button"
                className="job-icon-btn btn-close-job"
                title={isClosed ? 'Job is already closed' : 'Close Job'}
                aria-label={isClosed ? `Job ${row.id} is already closed` : `Close Job ${row.id}`}
                disabled={isClosed}
                onClick={() => setCloseJobTarget(row)}
              >
                <Lock size={15} />
              </button>

              {/* Deactivate / Reactivate Job (Ban / Power icon) */}
              <button
                type="button"
                className={`job-icon-btn ${isDeactivated ? 'btn-reactivate' : 'btn-deactivate'}`}
                title={isDeactivated ? 'Reactivate Job' : 'Deactivate Job'}
                aria-label={isDeactivated ? `Reactivate Job ${row.id}` : `Deactivate Job ${row.id}`}
                onClick={() => {
                  setDeactivateJobTarget(row);
                  setDeactivationReason(row.deactivationReason || '');
                }}
              >
                {isDeactivated ? <Power size={15} /> : <Ban size={15} />}
              </button>
            </div>
          );
        }
      }
    ],
    []
  );

  return (
    <div className="jobs-container">
      <PageHeader title="Posted Jobs" />

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
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Job Type"
          >
            {JOB_TYPES.map((jt) => (
              <option key={jt} value={jt}>
                {jt}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Location"
          >
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by Job Status"
          >
            {JOB_STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
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
            aria-label="Filter by Posted / Expiry Month"
          />

          {(searchTerm ||
            statusFilter !== 'All Statuses' ||
            typeFilter !== 'All Types' ||
            locationFilter !== 'All Locations' ||
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
        data={paginatedJobs}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        currentPage={currentPage}
        pageSize={pageSize}
        emptyTitle="No Posted Jobs Found"
        emptyDescription="No company job requisitions match your current search or filter criteria."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredJobs.length}
        pageSize={pageSize}
      />

      {/* View Job Details Modal (URL remains /jobs/posted) */}
      {viewingJob && (
        <Modal
          isOpen={true}
          onClose={() => setViewingJob(null)}
          title={`Job Specification — ${viewingJob.id}`}
          size="lg"
          footer={
            <div className="flex gap-2">
              {!(viewingJob.jobStatus === 'Closed' || viewingJob.status === 'Closed') && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    const j = viewingJob;
                    setViewingJob(null);
                    setCloseJobTarget(j);
                  }}
                >
                  Close Job
                </Button>
              )}
              <Button
                variant={viewingJob.isDeactivated ? 'success' : 'danger'}
                onClick={() => {
                  const j = viewingJob;
                  setViewingJob(null);
                  setDeactivateJobTarget(j);
                  setDeactivationReason(j.deactivationReason || '');
                }}
              >
                {viewingJob.isDeactivated ? 'Reactivate Job' : 'Deactivate Job'}
              </Button>
              <Button variant="secondary" onClick={() => setViewingJob(null)}>
                Close Window
              </Button>
            </div>
          }
        >
          <div className="job-modal-details">
            {/* Core Requisition Fields */}
            <div className="job-detail-card">
              <div className="job-detail-card-title">
                <Briefcase size={16} />
                <span>Job Information</span>
              </div>
              <div className="job-detail-grid">
                <div className="job-detail-item">
                  <span className="job-detail-label">Job ID</span>
                  <span className="job-detail-value">{viewingJob.id}</span>
                </div>
                <div className="job-detail-item">
                  <span className="job-detail-label">Job Title</span>
                  <span className="job-detail-value">{viewingJob.title}</span>
                </div>
                <div className="job-detail-item">
                  <span className="job-detail-label">Company Name</span>
                  <span className="job-detail-value">{viewingJob.companyName || viewingJob.company}</span>
                </div>
                <div className="job-detail-item">
                  <span className="job-detail-label">Job Type</span>
                  <span className="job-detail-value">{viewingJob.jobType}</span>
                </div>
                <div className="job-detail-item">
                  <span className="job-detail-label">Location</span>
                  <span className="job-detail-value">{viewingJob.location || 'Remote'}</span>
                </div>
                <div className="job-detail-item">
                  <span className="job-detail-label">Job Status</span>
                  <div>
                    <StatusBadge status={viewingJob.jobStatus || viewingJob.status || 'Active'} />
                  </div>
                </div>
                <div className="job-detail-item">
                  <span className="job-detail-label">Posted Date</span>
                  <span className="job-detail-value">{formatDate(viewingJob.postedDate)}</span>
                </div>
                <div className="job-detail-item">
                  <span className="job-detail-label">Expiry Date</span>
                  <span className="job-detail-value">{formatDate(viewingJob.expiryDate)}</span>
                </div>
              </div>
            </div>

            {/* Administrative Availability State */}
            <div className="job-detail-card">
              <div className="job-detail-card-title">
                <ShieldAlert size={16} />
                <span>Administrative Availability</span>
              </div>
              <div className="job-detail-grid">
                <div className="job-detail-item">
                  <span className="job-detail-label">Super Admin Availability</span>
                  <span className="job-detail-value">
                    {viewingJob.isDeactivated ? (
                      <span className="text-danger font-semibold">Deactivated by Super Admin</span>
                    ) : (
                      <span className="text-success font-semibold">Active & Discoverable</span>
                    )}
                  </span>
                </div>
                <div className="job-detail-item">
                  <span className="job-detail-label">Deactivation Reason</span>
                  <span className="job-detail-value">
                    {viewingJob.deactivationReason || 'N/A (No deactivation restriction applied)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Compensation & Additional Details */}
            <div className="job-detail-card">
              <div className="job-detail-card-title">
                <DollarSign size={16} />
                <span>Compensation & Hiring Metrics</span>
              </div>
              <div className="job-detail-grid">
                <div className="job-detail-item">
                  <span className="job-detail-label">Experience Required</span>
                  <span className="job-detail-value">{viewingJob.experience || 'Not Specified'}</span>
                </div>
                <div className="job-detail-item">
                  <span className="job-detail-label">Offered Compensation</span>
                  <span className="job-detail-value">{viewingJob.salary || 'Competitive'}</span>
                </div>
                <div className="job-detail-item">
                  <span className="job-detail-label">Open Headcount</span>
                  <span className="job-detail-value">{viewingJob.openings || 1}</span>
                </div>
                <div className="job-detail-item">
                  <span className="job-detail-label">Total Applicants</span>
                  <span className="job-detail-value">{viewingJob.applicantsCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Description & Requirements */}
            <div className="job-detail-card">
              <div className="job-detail-card-title">
                <FileText size={16} />
                <span>Job Description & Requirements</span>
              </div>
              <div className="job-detail-grid">
                <div className="job-detail-item-full">
                  <span className="job-detail-label">Description</span>
                  <p className="job-detail-text">{viewingJob.description || 'No description provided.'}</p>
                </div>
                <div className="job-detail-item-full">
                  <span className="job-detail-label">Key Requirements</span>
                  <p className="job-detail-text">{viewingJob.requirements || 'Standard requirements apply.'}</p>
                </div>
              </div>
            </div>

            {/* Action History */}
            {viewingJob.actionHistory && viewingJob.actionHistory.length > 0 && (
              <div className="job-detail-card">
                <div className="job-detail-card-title">
                  <Clock size={16} />
                  <span>Administrative Action History</span>
                </div>
                <table className="history-mini-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Reason</th>
                      <th>Taken By</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingJob.actionHistory.map((item, idx) => (
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

      {/* Close Job Confirmation Dialog */}
      {closeJobTarget && (
        <Modal
          isOpen={true}
          onClose={() => setCloseJobTarget(null)}
          title={`Confirm Job Closure — ${closeJobTarget.id}`}
          size="md"
          footer={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCloseJobTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmCloseJob}>
                Confirm Close Job
              </Button>
            </div>
          }
        >
          <div className="job-action-dialog-content">
            <div className="job-action-warning-banner">
              <AlertTriangle size={20} />
              <div>
                Are you sure you want to close job <strong>"{closeJobTarget.title}"</strong> for{' '}
                <strong>{closeJobTarget.companyName || closeJobTarget.company}</strong>?
              </div>
            </div>
            <p className="text-sm text-secondary">
              Closing this job changes its public status to <strong>Closed</strong>. This prevents additional candidate applications while preserving requisition history.
            </p>
          </div>
        </Modal>
      )}

      {/* Deactivate / Reactivate Job Modal */}
      {deactivateJobTarget && (
        <Modal
          isOpen={true}
          onClose={() => setDeactivateJobTarget(null)}
          title={
            deactivateJobTarget.isDeactivated
              ? `Reactivate Job — ${deactivateJobTarget.id}`
              : `Deactivate Job — ${deactivateJobTarget.id}`
          }
          size="md"
          footer={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setDeactivateJobTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant={deactivateJobTarget.isDeactivated ? 'success' : 'danger'}
                onClick={handleConfirmDeactivate}
              >
                {deactivateJobTarget.isDeactivated ? 'Confirm Reactivation' : 'Confirm Deactivation'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleConfirmDeactivate} className="job-action-dialog-content">
            <div
              className={`job-action-warning-banner ${
                deactivateJobTarget.isDeactivated ? '' : 'banner-danger'
              }`}
            >
              <AlertTriangle size={20} />
              <div>
                {deactivateJobTarget.isDeactivated ? (
                  <span>
                    You are restoring demonstration availability for <strong>"{deactivateJobTarget.title}"</strong>. The job will be reinstated as discoverable.
                  </span>
                ) : (
                  <span>
                    You are administratively deactivating <strong>"{deactivateJobTarget.title}"</strong>. Candidates will not be able to interact with this requisition while deactivated.
                  </span>
                )}
              </div>
            </div>

            {!deactivateJobTarget.isDeactivated && (
              <div className="form-group">
                <label className="form-label">
                  Administrative Reason <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Specify reason for administrative deactivation (e.g. Under investigation following incident report, Compliance audit hold)..."
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                  required
                />
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PostedJobs;
