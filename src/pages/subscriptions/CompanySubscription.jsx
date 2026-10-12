import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Download,
  Eye,
  Edit2,
  RotateCcw,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  ReceiptIndianRupee,
  Clock,
  Ban
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
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import { SUBSCRIPTION_STATUSES } from '../../utils/constants';
import './CompanySubscription.css';

export const CompanySubscription = () => {
  const { dataVersion, triggerRefresh } = useApp();
  const { addToast } = useToast();

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortColumn, setSortColumn] = useState('companyId');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // In-page View & Edit Modals (ZERO URL changes on View/Edit)
  const [viewingSub, setViewingSub] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const subscriptions = useMemo(() => {
    return storageService.getSubscriptions();
  }, [dataVersion]);

  // Unique plans for filter
  const planOptions = useMemo(() => {
    const set = new Set(subscriptions.map((s) => s.planName).filter(Boolean));
    return Array.from(set);
  }, [subscriptions]);

  // Filtering & Sorting
  const filteredData = useMemo(() => {
    let result = [...subscriptions];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();
      result = result.filter(
        (s) =>
          (s.id && s.id.toLowerCase().includes(lower)) ||
          (s.companyId && s.companyId.toLowerCase().includes(lower)) ||
          (s.companyName && s.companyName.toLowerCase().includes(lower)) ||
          (s.planName && s.planName.toLowerCase().includes(lower))
      );
    }

    if (planFilter) {
      result = result.filter((s) => s.planName === planFilter);
    }

    if (statusFilter) {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (dateFilter) {
      result = result.filter((s) => s.startDate && s.startDate.startsWith(dateFilter));
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
  }, [subscriptions, searchTerm, planFilter, statusFilter, dateFilter, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

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
    setPlanFilter('');
    setStatusFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  // View Modal Trigger (No URL change)
  const handleOpenView = (sub) => {
    setViewingSub(sub);
  };

  const handleCloseView = () => {
    setViewingSub(null);
  };

  // Edit Modal Trigger (No URL change)
  const handleOpenEdit = (sub) => {
    setEditingSub(sub);
    setEditFormData({ ...sub });
    setEditFormErrors({});
    setIsFormDirty(false);
  };

  const handleCloseEdit = () => {
    if (isFormDirty) {
      setShowUnsavedWarning(true);
    } else {
      setEditingSub(null);
      setEditFormData(null);
    }
  };

  const handleConfirmDiscardEdit = () => {
    setShowUnsavedWarning(false);
    setEditingSub(null);
    setEditFormData(null);
    setIsFormDirty(false);
  };

  const handleEditFieldChange = (field, value) => {
    setEditFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-recalculate totalAmount if planAmount, discount, or tax change
      if (field === 'planAmount' || field === 'discount' || field === 'tax') {
        const pAmt = parseFloat(field === 'planAmount' ? value : updated.planAmount) || 0;
        const disc = parseFloat(field === 'discount' ? value : updated.discount) || 0;
        const tx = parseFloat(field === 'tax' ? value : updated.tax) || 0;
        updated.totalAmount = Math.max(0, pAmt - disc + tx);
      }

      return updated;
    });
    setIsFormDirty(true);
    if (editFormErrors[field]) {
      setEditFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editFormData) return;

    const errors = {};
    if (!editFormData.planName?.trim()) errors.planName = 'Plan Name is required';
    if (!editFormData.startDate) errors.startDate = 'Start Date is required';
    if (!editFormData.endDate) errors.endDate = 'End Date is required';
    if (editFormData.planAmount === undefined || isNaN(editFormData.planAmount)) {
      errors.planAmount = 'Valid plan amount required';
    }

    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please review and fill in all required subscription values.'
      });
      return;
    }

    storageService.saveSubscription(editFormData);
    triggerRefresh();

    // If viewing same sub, update in-page view immediately
    if (viewingSub && viewingSub.id === editFormData.id) {
      setViewingSub(editFormData);
    }

    setEditingSub(null);
    setEditFormData(null);
    setIsFormDirty(false);

    addToast({
      type: 'success',
      title: 'Subscription Updated',
      message: `Subscription record ${editFormData.id} was successfully saved.`
    });
  };

  const handleExportCSV = () => {
    const cols = [
      { key: 'id', label: 'Subscription ID' },
      { key: 'companyId', label: 'Company ID' },
      { key: 'companyName', label: 'Company Name' },
      { key: 'planName', label: 'Plan' },
      { key: 'planVersion', label: 'Plan Version' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'status', label: 'Status' },
      { key: 'planAmount', label: 'Plan Amount' },
      { key: 'discount', label: 'Discount' },
      { key: 'tax', label: 'Tax' },
      { key: 'totalAmount', label: 'Total Amount' },
      { key: 'nextRenewalDate', label: 'Next Renewal Date' },
      { key: 'autoRenewal', label: 'Auto Renewal' }
    ];
    exportToCSV('company_subscriptions', filteredData, cols);
    addToast({
      type: 'info',
      title: 'CSV Exported',
      message: `Exported ${filteredData.length} subscription records.`
    });
  };

  // Exact 7 Table Columns:
  // 1. S.No
  // 2. Subscription ID
  // 3. Company ID
  // 4. Plan
  // 5. Start and End Date (combined in same column)
  // 6. Status
  // 7. Action (only Eye & Pencil icon buttons)
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
      key: 'id',
      label: 'Subscription ID',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-primary">{row.id}</span>
      )
    },
    {
      key: 'companyId',
      label: 'Company ID',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-primary">{row.companyId}</span>
          <div className="text-muted text-xs">{row.companyName}</div>
        </div>
      )
    },
    {
      key: 'planName',
      label: 'Plan',
      sortable: true,
      render: (row) => (
        <div className="plan-cell-box">
          <span className="plan-name-bold">{row.planName}</span>
          <span className="plan-version-tag">{row.planVersion || 'v1.0'}</span>
        </div>
      )
    },
    {
      key: 'dates',
      label: 'Start and End Date',
      sortable: false,
      render: (row) => (
        <div className="date-range-cell">
          <span className="date-start-text">{formatDate(row.startDate)}</span>
          <span className="date-end-muted">to {formatDate(row.endDate)}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      render: (row) => (
        <div className="subscription-action-icons">
          <button
            type="button"
            className="subscription-action-btn"
            title="View Subscription Details"
            aria-label="View Subscription Details"
            onClick={() => handleOpenView(row)}
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            className="subscription-action-btn"
            title="Edit Subscription Details"
            aria-label="Edit Subscription Details"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="subscriptions-container">
      <PageHeader
        title="Company Subscription"
        description="Monitor active subscription contracts, track billing periods, and regulate license plans."
        actions={
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
        }
      />

      {/* Separate Toolbar ABOVE the table — with a clear gap from table header */}
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search by Subscription ID or Company ID..."
          />

          <select
            className="filter-select"
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Plan filter"
          >
            <option value="">All Plans</option>
            {planOptions.map((p) => (
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
            aria-label="Subscription status filter"
          >
            <option value="">All Subscription Statuses</option>
            {SUBSCRIPTION_STATUSES.map((s) => (
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
            aria-label="Date filter by month"
            title="Filter by commencement month"
          />

          {(searchTerm || planFilter || statusFilter || dateFilter) && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset all subscription filters"
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="table-container">
        {/* Data Table with exact 7 columns */}
        <DataTable
          columns={tableColumns}
          data={paginatedData}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          currentPage={currentPage}
          pageSize={pageSize}
          emptyTitle="No subscriptions found"
          emptyDescription="No subscription records matching the specified criteria."
          emptyActionLabel="Clear Filters"
          onEmptyAction={handleResetFilters}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* VIEW MODAL (Organized into the 5 requested sections, zero URL change) */}
      {viewingSub && (
        <Modal
          isOpen={Boolean(viewingSub)}
          onClose={handleCloseView}
          title={`Subscription Details — ${viewingSub.id}`}
          size="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="secondary"
                icon={Edit2}
                onClick={() => {
                  const sub = viewingSub;
                  handleCloseView();
                  handleOpenEdit(sub);
                }}
              >
                Edit Subscription
              </Button>
              <Button variant="primary" onClick={handleCloseView}>
                Close
              </Button>
            </div>
          }
        >
          <div className="subscription-view-sections">
            {/* 1. Subscription Information */}
            <div className="subscription-section-block">
              <div className="subscription-section-header">
                <Layers size={16} />
                <span>1. Subscription Information</span>
              </div>
              <div className="subscription-section-grid">
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Subscription ID</span>
                  <span className="subscription-field-value">{viewingSub.id || 'Not applicable'}</span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Company ID</span>
                  <span className="subscription-field-value">
                    {viewingSub.companyId ? `${viewingSub.companyId} (${viewingSub.companyName || ''})` : 'Not applicable'}
                  </span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Plan</span>
                  <span className="subscription-field-value">{viewingSub.planName || 'Not applicable'}</span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Plan Version</span>
                  <span className="subscription-field-value">{viewingSub.planVersion || 'Not applicable'}</span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Subscription Status</span>
                  <span className="subscription-field-value">
                    <StatusBadge status={viewingSub.status || 'Active'} />
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Subscription Period */}
            <div className="subscription-section-block">
              <div className="subscription-section-header">
                <Calendar size={16} />
                <span>2. Subscription Period</span>
              </div>
              <div className="subscription-section-grid">
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Start Date</span>
                  <span className="subscription-field-value">{formatDate(viewingSub.startDate) || 'Not applicable'}</span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">End Date</span>
                  <span className="subscription-field-value">{formatDate(viewingSub.endDate) || 'Not applicable'}</span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Next Renewal Date</span>
                  <span className="subscription-field-value">{formatDate(viewingSub.nextRenewalDate) || 'Not applicable'}</span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Auto Renewal</span>
                  <span className="subscription-field-value">
                    {viewingSub.autoRenewal ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Trial End Date</span>
                  <span className="subscription-field-value">{formatDate(viewingSub.trialEndDate) || 'Not applicable'}</span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Grace Period End Date</span>
                  <span className="subscription-field-value">{formatDate(viewingSub.gracePeriodEndDate) || 'Not applicable'}</span>
                </div>
              </div>
            </div>

            {/* 3. Billing Summary (Indian Currency INR) */}
            <div className="subscription-section-block">
              <div className="subscription-section-header">
                <ReceiptIndianRupee size={16} />
                <span>3. Billing Summary</span>
              </div>
              <div className="subscription-section-grid">
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Plan Amount</span>
                  <span className="subscription-field-value">{formatCurrency(viewingSub.planAmount)}</span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Discount</span>
                  <span className="subscription-field-value">
                    {viewingSub.discount ? formatCurrency(viewingSub.discount) : '₹0'}
                  </span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Tax (GST)</span>
                  <span className="subscription-field-value">
                    {viewingSub.tax ? formatCurrency(viewingSub.tax) : '₹0'}
                  </span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Total Amount</span>
                  <span className="subscription-field-value amount-highlight">
                    {formatCurrency(viewingSub.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Renewal Information */}
            <div className="subscription-section-block">
              <div className="subscription-section-header">
                <Clock size={16} />
                <span>4. Renewal Information</span>
              </div>
              <div className="subscription-section-grid">
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Auto Renewal Mode</span>
                  <span className="subscription-field-value">
                    {viewingSub.autoRenewal ? 'Automatic Recurring Charge' : 'Manual Invoice Settlement'}
                  </span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Next Renewal Schedule</span>
                  <span className="subscription-field-value">{formatDate(viewingSub.nextRenewalDate) || 'Not applicable'}</span>
                </div>
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Grace Period Expiry</span>
                  <span className="subscription-field-value">{formatDate(viewingSub.gracePeriodEndDate) || 'Not applicable'}</span>
                </div>
              </div>
            </div>

            {/* 5. Cancellation Details */}
            <div className="subscription-section-block">
              <div className="subscription-section-header">
                <Ban size={16} />
                <span>5. Cancellation Details</span>
              </div>
              <div className="subscription-section-grid">
                <div className="subscription-field-item">
                  <span className="subscription-field-label">Cancellation Date</span>
                  <span className="subscription-field-value">{formatDate(viewingSub.cancellationDate) || 'Not applicable'}</span>
                </div>
                <div className="subscription-field-item full-width">
                  <span className="subscription-field-label">Cancellation Reason</span>
                  <span className="subscription-field-value">{viewingSub.cancellationReason || 'Not applicable'}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL (Zero URL change, validated inputs, localStorage saved) */}
      {editingSub && editFormData && (
        <Modal
          isOpen={Boolean(editingSub)}
          onClose={handleCloseEdit}
          title={`Edit Subscription — ${editingSub.id}`}
          size="lg"
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
          <form onSubmit={handleSaveEdit} className="subscription-edit-form">
            <div className="form-section-title">Subscription Information</div>
            <div className="form-two-cols">
              <Input
                label="Subscription ID"
                value={editFormData.id}
                disabled
              />
              <Input
                label="Company ID"
                value={editFormData.companyId}
                disabled
              />
              <Input
                label="Plan Name"
                required
                value={editFormData.planName}
                onChange={(e) => handleEditFieldChange('planName', e.target.value)}
                error={editFormErrors.planName}
              />
              <Input
                label="Plan Version"
                value={editFormData.planVersion || ''}
                onChange={(e) => handleEditFieldChange('planVersion', e.target.value)}
              />
              <Select
                label="Subscription Status"
                value={editFormData.status || 'Active'}
                onChange={(e) => handleEditFieldChange('status', e.target.value)}
                options={SUBSCRIPTION_STATUSES}
              />
            </div>

            <div className="form-section-title">Subscription Period & Dates</div>
            <div className="form-two-cols">
              <Input
                label="Start Date"
                type="date"
                required
                value={editFormData.startDate || ''}
                onChange={(e) => handleEditFieldChange('startDate', e.target.value)}
                error={editFormErrors.startDate}
              />
              <Input
                label="End Date"
                type="date"
                required
                value={editFormData.endDate || ''}
                onChange={(e) => handleEditFieldChange('endDate', e.target.value)}
                error={editFormErrors.endDate}
              />
              <Input
                label="Next Renewal Date"
                type="date"
                value={editFormData.nextRenewalDate || ''}
                onChange={(e) => handleEditFieldChange('nextRenewalDate', e.target.value)}
              />
              <Input
                label="Trial End Date"
                type="date"
                value={editFormData.trialEndDate || ''}
                onChange={(e) => handleEditFieldChange('trialEndDate', e.target.value)}
              />
              <Input
                label="Grace Period End Date"
                type="date"
                value={editFormData.gracePeriodEndDate || ''}
                onChange={(e) => handleEditFieldChange('gracePeriodEndDate', e.target.value)}
              />
              <div className="checkbox-control-row">
                <input
                  type="checkbox"
                  id="autoRenewalCheckbox"
                  checked={Boolean(editFormData.autoRenewal)}
                  onChange={(e) => handleEditFieldChange('autoRenewal', e.target.checked)}
                />
                <label htmlFor="autoRenewalCheckbox">Enable Auto-Renewal</label>
              </div>
            </div>

            <div className="form-section-title">Billing Summary (₹ INR)</div>
            <div className="form-two-cols">
              <Input
                label="Plan Amount (₹ INR)"
                type="number"
                min="0"
                step="0.01"
                required
                value={editFormData.planAmount}
                onChange={(e) => handleEditFieldChange('planAmount', parseFloat(e.target.value) || 0)}
                error={editFormErrors.planAmount}
              />
              <Input
                label="Discount (₹ INR)"
                type="number"
                min="0"
                step="0.01"
                value={editFormData.discount || 0}
                onChange={(e) => handleEditFieldChange('discount', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Tax (₹ INR)"
                type="number"
                min="0"
                step="0.01"
                value={editFormData.tax || 0}
                onChange={(e) => handleEditFieldChange('tax', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Total Amount (₹ INR)"
                type="number"
                disabled
                value={editFormData.totalAmount || 0}
              />
            </div>

            <div className="form-section-title">Cancellation Details</div>
            <div className="form-two-cols">
              <Input
                label="Cancellation Date"
                type="date"
                value={editFormData.cancellationDate || ''}
                onChange={(e) => handleEditFieldChange('cancellationDate', e.target.value)}
              />
              <div className="subscription-field-item full-width">
                <Input
                  label="Cancellation Reason"
                  value={editFormData.cancellationReason || ''}
                  onChange={(e) => handleEditFieldChange('cancellationReason', e.target.value)}
                  placeholder="e.g. Non-payment, customer requested discontinuation"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <Modal
          isOpen={showUnsavedWarning}
          onClose={() => setShowUnsavedWarning(false)}
          title="Unsaved Changes"
          size="sm"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="secondary" onClick={() => setShowUnsavedWarning(false)}>
                Stay on Form
              </Button>
              <Button variant="danger" onClick={handleConfirmDiscardEdit}>
                Discard Changes
              </Button>
            </div>
          }
        >
          <p className="text-secondary">
            You have unsaved changes in this subscription record. Are you sure you want to dismiss without saving?
          </p>
        </Modal>
      )}
    </div>
  );
};

export default CompanySubscription;
