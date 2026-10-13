import React, { useState, useMemo } from 'react';
import {
  Eye,
  ShieldAlert,
  ShieldCheck,
  History,
  RotateCcw,
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  AlertTriangle,
  Clock,
  ExternalLink
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
import './CandidateManagement.css';

const ACCOUNT_STATUS_OPTIONS = ['All Statuses', 'Active', 'Blocked', 'Inactive'];

export const CandidateManagement = () => {
  const { dataVersion, triggerRefresh } = useApp();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [sortColumn, setSortColumn] = useState('registrationDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modals (state-controlled, zero URL change)
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [blockCandidateTarget, setBlockCandidateTarget] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [historyCandidate, setHistoryCandidate] = useState(null);

  const candidatesList = useMemo(() => {
    return storageService.getCandidates();
  }, [dataVersion]);

  // Filtering & Search
  const filteredCandidates = useMemo(() => {
    let result = [...candidatesList];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();
      result = result.filter((c) => {
        const idMatch = (c.id || '').toLowerCase().includes(lower);
        const nameMatch = (c.name || '').toLowerCase().includes(lower);
        const emailMatch = (c.email || '').toLowerCase().includes(lower);
        const phoneMatch = (c.phone || '').toLowerCase().includes(lower);
        return idMatch || nameMatch || emailMatch || phoneMatch;
      });
    }

    if (statusFilter !== 'All Statuses') {
      result = result.filter(
        (c) => (c.accountStatus || c.status) === statusFilter
      );
    }

    if (dateFilter) {
      result = result.filter(
        (c) => c.registrationDate && c.registrationDate.startsWith(dateFilter)
      );
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
  }, [candidatesList, searchTerm, statusFilter, dateFilter, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;
  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [filteredCandidates, currentPage]);

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
    setDateFilter('');
    setCurrentPage(1);
  };

  const handleOpenBlockConfirm = (candidate) => {
    setBlockCandidateTarget(candidate);
    setActionReason('');
  };

  const handleConfirmBlockToggle = (e) => {
    e.preventDefault();
    if (!blockCandidateTarget) return;

    if (!actionReason.trim()) {
      addToast({
        type: 'error',
        title: 'Action Reason Required',
        message: 'Please provide a valid administrative reason for this account action.'
      });
      return;
    }

    const isCurrentlyBlocked = (blockCandidateTarget.accountStatus || blockCandidateTarget.status) === 'Blocked';
    storageService.toggleBlockCandidate(blockCandidateTarget.id, {
      reason: actionReason.trim(),
      adminUser: 'Marcus Vance (Super Admin)'
    });

    triggerRefresh();

    addToast({
      type: 'success',
      title: isCurrentlyBlocked ? 'Candidate Unblocked' : 'Candidate Blocked',
      message: `Account for ${blockCandidateTarget.name} (${blockCandidateTarget.id}) is now ${isCurrentlyBlocked ? 'Active' : 'Blocked'}.`
    });

    setBlockCandidateTarget(null);
    setActionReason('');
  };

  // Table columns in exact specified order:
  // 1. S.No
  // 2. Candidate ID
  // 3. Candidate Name
  // 4. Email
  // 5. Phone Number
  // 6. Registration Date
  // 7. Account Status
  // 8. Last Login
  // 9. Action
  const tableColumns = useMemo(
    () => [
      {
        key: 'sNo',
        label: 'S.No',
        sortable: false
      },
      {
        key: 'id',
        label: 'Candidate ID',
        sortable: true,
        render: (row) => <span className="candidate-id-badge">{row.id}</span>
      },
      {
        key: 'name',
        label: 'Candidate Name',
        sortable: true,
        render: (row) => (
          <div className="candidate-name-cell">
            <span className="candidate-name-text">{row.name}</span>
            {row.profileDetails?.primaryRole && (
              <span className="candidate-subtext">{row.profileDetails.primaryRole}</span>
            )}
          </div>
        )
      },
      {
        key: 'email',
        label: 'Email',
        sortable: true,
        render: (row) => <span className="candidate-contact-cell">{row.email}</span>
      },
      {
        key: 'phone',
        label: 'Phone Number',
        sortable: true,
        render: (row) => <span className="candidate-contact-cell">{row.phone || 'N/A'}</span>
      },
      {
        key: 'registrationDate',
        label: 'Registration Date',
        sortable: true,
        render: (row) => formatDate(row.registrationDate)
      },
      {
        key: 'accountStatus',
        label: 'Account Status',
        sortable: true,
        render: (row) => <StatusBadge status={row.accountStatus || row.status || 'Active'} />
      },
      {
        key: 'lastLogin',
        label: 'Last Login',
        sortable: true,
        render: (row) => <span className="candidate-subtext">{row.lastLogin || 'Never'}</span>
      },
      {
        key: 'action',
        label: 'Action',
        sortable: false,
        render: (row) => {
          const isBlocked = (row.accountStatus || row.status) === 'Blocked';
          return (
            <div className="candidate-action-icons">
              <button
                type="button"
                className="candidate-icon-btn"
                title="View Candidate Profile"
                aria-label={`View Candidate Profile for ${row.name}`}
                onClick={() => setViewingCandidate(row)}
              >
                <Eye size={15} />
              </button>
              <button
                type="button"
                className={`candidate-icon-btn ${isBlocked ? 'btn-success' : 'btn-danger'}`}
                title={isBlocked ? 'Unblock Candidate Account' : 'Block Candidate Account'}
                aria-label={isBlocked ? `Unblock ${row.name}` : `Block ${row.name}`}
                onClick={() => handleOpenBlockConfirm(row)}
              >
                {isBlocked ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
              </button>
              <button
                type="button"
                className="candidate-icon-btn btn-history"
                title="View Account Action History"
                aria-label={`View Action History for ${row.name}`}
                onClick={() => setHistoryCandidate(row)}
              >
                <History size={15} />
              </button>
            </div>
          );
        }
      }
    ],
    []
  );

  return (
    <div className="candidate-container">
      <PageHeader title="Candidate Management" />

      {/* Toolbar Above the Table */}
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
            aria-label="Filter by Account Status"
          >
            {ACCOUNT_STATUS_OPTIONS.map((st) => (
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
            aria-label="Filter by Registration Date"
          />

          {(searchTerm || statusFilter !== 'All Statuses' || dateFilter) && (
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
        data={paginatedCandidates}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        currentPage={currentPage}
        pageSize={pageSize}
        emptyTitle="No Candidates Found"
        emptyDescription="No candidate records match your current search or active filter settings."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredCandidates.length}
        pageSize={pageSize}
      />

      {/* Candidate Details Modal (URL remains /candidates) */}
      {viewingCandidate && (
        <Modal
          isOpen={true}
          onClose={() => setViewingCandidate(null)}
          title={`Candidate Profile — ${viewingCandidate.id}`}
          size="lg"
          footer={
            <div className="flex gap-2">
              <Button
                variant={
                  (viewingCandidate.accountStatus || viewingCandidate.status) === 'Blocked'
                    ? 'success'
                    : 'danger'
                }
                onClick={() => {
                  const target = viewingCandidate;
                  setViewingCandidate(null);
                  handleOpenBlockConfirm(target);
                }}
              >
                {(viewingCandidate.accountStatus || viewingCandidate.status) === 'Blocked'
                  ? 'Unblock Account'
                  : 'Block Account'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const target = viewingCandidate;
                  setViewingCandidate(null);
                  setHistoryCandidate(target);
                }}
              >
                View History
              </Button>
              <Button variant="secondary" onClick={() => setViewingCandidate(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="candidate-profile-modal-content">
            {/* Candidate Information */}
            <div className="candidate-profile-section">
              <div className="candidate-section-header">
                <User size={16} />
                <span>Candidate Information</span>
              </div>
              <div className="candidate-field-grid">
                <div className="candidate-field-item">
                  <span className="candidate-field-label">Candidate ID</span>
                  <span className="candidate-field-value">{viewingCandidate.id}</span>
                </div>
                <div className="candidate-field-item">
                  <span className="candidate-field-label">Candidate Name</span>
                  <span className="candidate-field-value">{viewingCandidate.name}</span>
                </div>
                <div className="candidate-field-item">
                  <span className="candidate-field-label">Email Address</span>
                  <span className="candidate-field-value">{viewingCandidate.email}</span>
                </div>
                <div className="candidate-field-item">
                  <span className="candidate-field-label">Phone Number</span>
                  <span className="candidate-field-value">{viewingCandidate.phone || 'N/A'}</span>
                </div>
                <div className="candidate-field-item">
                  <span className="candidate-field-label">Registration Date</span>
                  <span className="candidate-field-value">{formatDate(viewingCandidate.registrationDate)}</span>
                </div>
                <div className="candidate-field-item">
                  <span className="candidate-field-label">Account Status</span>
                  <div>
                    <StatusBadge status={viewingCandidate.accountStatus || viewingCandidate.status || 'Active'} />
                  </div>
                </div>
                <div className="candidate-field-item">
                  <span className="candidate-field-label">Last Login</span>
                  <span className="candidate-field-value">{viewingCandidate.lastLogin || 'Never recorded'}</span>
                </div>
                <div className="candidate-field-item">
                  <span className="candidate-field-label">Resume Document</span>
                  <div>
                    {viewingCandidate.hasResume ? (
                      <button
                        type="button"
                        className="resume-download-btn"
                        onClick={() => {
                          addToast({
                            type: 'info',
                            title: 'Resume Accessed',
                            message: `Opening stored demonstration resume for ${viewingCandidate.name} (${viewingCandidate.resumeName || 'Resume.pdf'}).`
                          });
                        }}
                      >
                        <FileText size={14} />
                        <span>View / Download Resume</span>
                      </button>
                    ) : (
                      <span className="resume-unavailable-text">Not available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details (Organised education, skills, experience) */}
            <div className="candidate-profile-section">
              <div className="candidate-section-header">
                <Briefcase size={16} />
                <span>Profile Details</span>
              </div>
              <div className="candidate-field-grid">
                <div className="candidate-field-full">
                  <span className="candidate-field-label">Experience</span>
                  <span className="candidate-field-value">
                    {viewingCandidate.profileDetails?.experience ||
                      viewingCandidate.experience ||
                      'No experience details provided'}
                  </span>
                </div>

                <div className="candidate-field-full">
                  <span className="candidate-field-label">Skills & Technical Competencies</span>
                  <div className="candidate-skills-list">
                    {Array.isArray(viewingCandidate.profileDetails?.skills) ? (
                      viewingCandidate.profileDetails.skills.map((skill) => (
                        <span key={skill} className="candidate-skill-tag">
                          {skill}
                        </span>
                      ))
                    ) : viewingCandidate.skills ? (
                      viewingCandidate.skills.split(',').map((s) => (
                        <span key={s.trim()} className="candidate-skill-tag">
                          {s.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="candidate-subtext">No skills recorded</span>
                    )}
                  </div>
                </div>

                <div className="candidate-field-full">
                  <span className="candidate-field-label">Educational Background</span>
                  <span className="candidate-field-value">
                    {viewingCandidate.profileDetails?.education ||
                      viewingCandidate.education ||
                      'No educational records available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Action Information */}
            <div className="candidate-profile-section">
              <div className="candidate-section-header">
                <AlertTriangle size={16} />
                <span>Account Action Information</span>
              </div>
              <div className="candidate-field-grid">
                <div className="candidate-field-full">
                  <span className="candidate-field-label">Action Reason</span>
                  <span className="candidate-field-value">
                    {viewingCandidate.actionReason || 'Standard platform operational status'}
                  </span>
                </div>
                <div className="candidate-field-item">
                  <span className="candidate-field-label">Action Taken By</span>
                  <span className="candidate-field-value">
                    {viewingCandidate.actionTakenBy || 'Marcus Vance (Super Admin)'}
                  </span>
                </div>
                <div className="candidate-field-item">
                  <span className="candidate-field-label">Action Date</span>
                  <span className="candidate-field-value">
                    {viewingCandidate.actionDate
                      ? formatDate(viewingCandidate.actionDate)
                      : formatDate(viewingCandidate.registrationDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Block / Unblock Confirmation Modal */}
      {blockCandidateTarget && (
        <Modal
          isOpen={true}
          onClose={() => setBlockCandidateTarget(null)}
          title={
            (blockCandidateTarget.accountStatus || blockCandidateTarget.status) === 'Blocked'
              ? `Unblock Candidate Account — ${blockCandidateTarget.id}`
              : `Block Candidate Account — ${blockCandidateTarget.id}`
          }
          size="md"
          footer={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setBlockCandidateTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant={
                  (blockCandidateTarget.accountStatus || blockCandidateTarget.status) === 'Blocked'
                    ? 'success'
                    : 'danger'
                }
                onClick={handleConfirmBlockToggle}
              >
                {(blockCandidateTarget.accountStatus || blockCandidateTarget.status) === 'Blocked'
                  ? 'Confirm Unblock'
                  : 'Confirm Block'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleConfirmBlockToggle} className="block-confirm-dialog">
            <div
              className={`block-warning-banner ${
                (blockCandidateTarget.accountStatus || blockCandidateTarget.status) === 'Blocked'
                  ? ''
                  : 'banner-danger'
              }`}
            >
              <AlertTriangle size={20} />
              <div>
                {(blockCandidateTarget.accountStatus || blockCandidateTarget.status) === 'Blocked' ? (
                  <span>
                    You are restoring account access for <strong>{blockCandidateTarget.name}</strong>. Their demonstration status will revert to Active.
                  </span>
                ) : (
                  <span>
                    You are blocking account access for <strong>{blockCandidateTarget.name}</strong>. This candidate will be marked as Blocked in the demonstration directory.
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Action Reason <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Specify the operational reason for this account action (e.g. Terms violation, Identity verified, Requested suspension)..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                required
              />
            </div>

            <div className="demo-notice-text">
              Note: Frontend demonstration simulates account permissions and updates demonstration localStorage state. It does not alter production authentication servers.
            </div>
          </form>
        </Modal>
      )}

      {/* Action History Modal */}
      {historyCandidate && (
        <Modal
          isOpen={true}
          onClose={() => setHistoryCandidate(null)}
          title={`Account Action History — ${historyCandidate.name} (${historyCandidate.id})`}
          size="lg"
          footer={
            <Button variant="secondary" onClick={() => setHistoryCandidate(null)}>
              Close
            </Button>
          }
        >
          <div className="action-history-wrapper">
            {historyCandidate.actionHistory && historyCandidate.actionHistory.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Action Taken</th>
                    <th>Action Reason</th>
                    <th>Action Taken By</th>
                    <th>Action Date</th>
                  </tr>
                </thead>
                <tbody>
                  {historyCandidate.actionHistory.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td>
                        <span className="history-action-badge">{item.action}</span>
                      </td>
                      <td>{item.reason || 'N/A'}</td>
                      <td>{item.takenBy || 'Marcus Vance (Super Admin)'}</td>
                      <td>{item.date || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-6 text-muted">
                No prior account actions recorded for this candidate.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CandidateManagement;
