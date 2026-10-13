import React, { useState, useMemo } from 'react';
import {
  LifeBuoy,
  Download,
  Eye,
  Edit2,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  MessageSquare
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { storageService } from '../../services/storageService';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatDate, exportToCSV } from '../../utils/formatters';
import { TICKET_STATUSES, TICKET_PRIORITIES } from '../../utils/constants';
import './Support.css';

export const Support = () => {
  const { dataVersion, triggerRefresh } = useApp();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortColumn, setSortColumn] = useState('updatedDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // In-page modals (ZERO URL changes on View/Edit)
  const [viewingTicket, setViewingTicket] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  const tickets = useMemo(() => {
    return storageService.getTickets();
  }, [dataVersion]);

  // Filtering & Sorting
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();
      result = result.filter(
        (t) =>
          (t.id && t.id.toLowerCase().includes(lower)) ||
          (t.companyId && t.companyId.toLowerCase().includes(lower)) ||
          (t.companyName && t.companyName.toLowerCase().includes(lower)) ||
          (t.subject && t.subject.toLowerCase().includes(lower))
      );
    }

    if (priorityFilter) {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (dateFilter) {
      result = result.filter((t) => t.updatedDate && t.updatedDate.startsWith(dateFilter));
    }

    result.sort((a, b) => {
      let aVal = a[sortColumn] || '';
      let bVal = b[sortColumn] || '';
      if (typeof aVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [tickets, searchTerm, priorityFilter, statusFilter, dateFilter, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredTickets.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage]);

  const handleSort = (key) => {
    if (sortColumn === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setPriorityFilter('');
    setStatusFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  const handleOpenView = (ticket) => {
    setViewingTicket(ticket);
  };

  const handleOpenEdit = (ticket) => {
    setEditingTicket(ticket);
    setEditFormData({ ...ticket });
  };

  const handleCloseEdit = () => {
    setEditingTicket(null);
    setEditFormData(null);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editFormData) return;

    const updated = {
      ...editFormData,
      updatedDate: new Date().toISOString().slice(0, 10)
    };

    storageService.saveTicket(updated);
    triggerRefresh();

    if (viewingTicket && viewingTicket.id === updated.id) {
      setViewingTicket(updated);
    }

    handleCloseEdit();
    addToast({
      type: 'success',
      title: 'Ticket Updated',
      message: `Support ticket ${updated.id} resolution details were saved.`
    });
  };

  const handleExportCSV = () => {
    const cols = [
      { key: 'id', label: 'Ticket ID' },
      { key: 'companyId', label: 'Company ID' },
      { key: 'companyName', label: 'Company Name' },
      { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status' },
      { key: 'subject', label: 'Subject' },
      { key: 'assignedStaff', label: 'Assigned Staff' },
      { key: 'createdDate', label: 'Created Date' },
      { key: 'updatedDate', label: 'Updated Date' }
    ];
    exportToCSV('support_tickets_export', filteredTickets, cols);
    addToast({
      type: 'info',
      title: 'CSV Exported',
      message: `Exported ${filteredTickets.length} support ticket records.`
    });
  };

  // Exact Table Columns:
  // 1. S.No
  // 2. Company ID
  // 3. Company Name
  // 4. Priority
  // 5. Status
  // 6. Last Updated Date
  // 7. Action (Eye for View, Pencil for Edit)
  const tableColumns = [
    {
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
    },
    {
      key: 'companyId',
      label: 'Company ID',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-primary">{row.companyId}</span>
          <div className="text-muted text-xs">{row.id}</div>
        </div>
      )
    },
    {
      key: 'companyName',
      label: 'Company Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold">{row.companyName}</span>
          <div className="text-muted text-xs">{row.subject}</div>
        </div>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (row) => (
        <span className={`priority-badge priority-${row.priority.toLowerCase()}`}>
          {row.priority}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'updatedDate',
      label: 'Last Updated Date',
      sortable: true,
      render: (row) => formatDate(row.updatedDate || row.createdDate)
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      render: (row) => (
        <div className="support-action-icons">
          <button
            type="button"
            className="support-action-btn"
            title="View Ticket Details"
            aria-label="View Ticket Details"
            onClick={() => handleOpenView(row)}
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            className="support-action-btn"
            title="Edit Ticket"
            aria-label="Edit Ticket"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="support-container">
      <PageHeader
        title="Support"
        actions={
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
        }
      />

      {/* Separate Toolbar above the table with clear gap */}
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
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by priority"
          >
            <option value="">All Priorities</option>
            {TICKET_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
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
            aria-label="Filter by ticket status"
          >
            <option value="">All Statuses</option>
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
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
            aria-label="Filter by month"
          />

          {(searchTerm || priorityFilter || statusFilter || dateFilter) && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset ticket filters"
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="table-container">
        {/* Support Table */}
        <DataTable
          columns={tableColumns}
          data={paginatedData}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          currentPage={currentPage}
          pageSize={pageSize}
          emptyTitle="No support tickets found"
          emptyDescription="No tickets match the selected filter criteria."
          emptyActionLabel="Clear Filters"
          onEmptyAction={handleResetFilters}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTickets.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* VIEW TICKET MODAL (No URL Change) */}
      {viewingTicket && (
        <Modal
          isOpen={Boolean(viewingTicket)}
          onClose={() => setViewingTicket(null)}
          title={`Ticket Details — ${viewingTicket.id}: ${viewingTicket.subject}`}
          size="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="secondary"
                icon={Edit2}
                onClick={() => {
                  const t = viewingTicket;
                  setViewingTicket(null);
                  handleOpenEdit(t);
                }}
              >
                Update Ticket
              </Button>
              <Button variant="primary" onClick={() => setViewingTicket(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="support-detail-scroll">
            <div className="support-section-card">
              <div className="support-section-title">Ticket Information</div>
              <div className="support-grid-2">
                <div className="support-field-item">
                  <span className="support-field-label">Ticket ID</span>
                  <span className="support-field-val">{viewingTicket.id}</span>
                </div>
                <div className="support-field-item">
                  <span className="support-field-label">Company ID & Name</span>
                  <span className="support-field-val">{viewingTicket.companyId} — {viewingTicket.companyName}</span>
                </div>
                <div className="support-field-item">
                  <span className="support-field-label">Category</span>
                  <span className="support-field-val">{viewingTicket.category || 'General'}</span>
                </div>
                <div className="support-field-item">
                  <span className="support-field-label">Priority</span>
                  <span className="support-field-val">
                    <span className={`priority-badge priority-${viewingTicket.priority.toLowerCase()}`}>
                      {viewingTicket.priority}
                    </span>
                  </span>
                </div>
                <div className="support-field-item">
                  <span className="support-field-label">Status</span>
                  <span className="support-field-val">
                    <StatusBadge status={viewingTicket.status} />
                  </span>
                </div>
                <div className="support-field-item">
                  <span className="support-field-label">Assigned Staff</span>
                  <span className="support-field-val">{viewingTicket.assignedStaff || 'Unassigned'}</span>
                </div>
                <div className="support-field-item">
                  <span className="support-field-label">Created Date</span>
                  <span className="support-field-val">{formatDate(viewingTicket.createdDate)}</span>
                </div>
                <div className="support-field-item">
                  <span className="support-field-label">Last Updated Date</span>
                  <span className="support-field-val">{formatDate(viewingTicket.updatedDate)}</span>
                </div>
                <div className="support-field-item full-width">
                  <span className="support-field-label">Subject</span>
                  <span className="support-field-val">{viewingTicket.subject}</span>
                </div>
                <div className="support-field-item full-width">
                  <span className="support-field-label">Description</span>
                  <span className="support-field-val">{viewingTicket.description || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="support-section-card">
              <div className="support-section-title">Resolution & Audit History</div>
              <div className="flex flex-col gap-3">
                <div className="support-field-item">
                  <span className="support-field-label">Resolution Summary</span>
                  <span className="support-field-val">{viewingTicket.resolution || 'Pending formal resolution'}</span>
                </div>
                <div className="support-field-item">
                  <span className="support-field-label">Internal Engineering Notes</span>
                  <span className="support-field-val">{viewingTicket.internalNotes || 'No internal notes recorded.'}</span>
                </div>
                <div className="support-field-item">
                  <span className="support-field-label">Ticket History</span>
                  <span className="support-field-val text-xs text-muted">
                    Ticket opened on {formatDate(viewingTicket.createdDate)} by {viewingTicket.raisedBy || viewingTicket.companyName}.
                    Last action processed on {formatDate(viewingTicket.updatedDate)}.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT TICKET MODAL (No URL Change) */}
      {editingTicket && editFormData && (
        <Modal
          isOpen={Boolean(editingTicket)}
          onClose={handleCloseEdit}
          title={`Update Ticket — ${editingTicket.id}`}
          size="md"
          footer={
            <div className="flex justify-between w-full">
              <Button variant="secondary" onClick={handleCloseEdit}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <Select
                value={editFormData.priority}
                onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                options={TICKET_PRIORITIES}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ticket Status</label>
              <Select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                options={TICKET_STATUSES}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Support Staff</label>
              <Input
                value={editFormData.assignedStaff || ''}
                onChange={(e) => setEditFormData({ ...editFormData, assignedStaff: e.target.value })}
                placeholder="e.g. Marcus Vance, Support Specialist"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Resolution Notes</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={editFormData.resolution || ''}
                onChange={(e) => setEditFormData({ ...editFormData, resolution: e.target.value })}
                placeholder="Details of fix or troubleshooting advice given..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Internal Engineering Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={editFormData.internalNotes || ''}
                onChange={(e) => setEditFormData({ ...editFormData, internalNotes: e.target.value })}
                placeholder="Confidential staff comments..."
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Support;
