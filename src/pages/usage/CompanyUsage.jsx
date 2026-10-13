import React, { useState, useMemo } from 'react';
import {
  Activity,
  Download,
  Eye,
  Edit2,
  RotateCcw,
  Briefcase,
  BellRing,
  FileSearch,
  HardDrive
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { storageService } from '../../services/storageService';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatNumber, exportToCSV, getProgressWidthClass } from '../../utils/formatters';
import './CompanyUsage.css';

export const CompanyUsage = () => {
  const { dataVersion, triggerRefresh } = useApp();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [rangeFilter, setRangeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // In-page modals (ZERO URL changes)
  const [viewingUsage, setViewingUsage] = useState(null);
  const [editingUsage, setEditingUsage] = useState(null);
  const [usageForm, setUsageForm] = useState(null);

  const rawUsageList = useMemo(() => {
    return storageService.getUsage();
  }, [dataVersion]);

  // Compute usage percentage and ALWAYS sort by Usage Percentage DESCENDING
  const processedUsage = useMemo(() => {
    const list = rawUsageList.map((item) => {
      const active = item.activeJobs || 0;
      const posted = item.jobsLimit || 50;
      const pct = posted > 0 ? Math.min(100, Math.round((active / posted) * 100)) : 0;
      return {
        ...item,
        usagePercentage: pct
      };
    });

    // Mandatory rule: Sort by Usage Percentage in DESCENDING order (highest first)
    list.sort((a, b) => b.usagePercentage - a.usagePercentage);
    return list;
  }, [rawUsageList]);

  // Filters
  const filteredData = useMemo(() => {
    let result = [...processedUsage];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();
      result = result.filter(
        (u) =>
          (u.companyName && u.companyName.toLowerCase().includes(lower)) ||
          (u.companyId && u.companyId.toLowerCase().includes(lower))
      );
    }

    if (rangeFilter === 'high') {
      result = result.filter((u) => u.usagePercentage >= 80);
    } else if (rangeFilter === 'medium') {
      result = result.filter((u) => u.usagePercentage >= 50 && u.usagePercentage < 80);
    } else if (rangeFilter === 'low') {
      result = result.filter((u) => u.usagePercentage < 50);
    }

    return result;
  }, [processedUsage, searchTerm, rangeFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setRangeFilter('');
    setCurrentPage(1);
  };

  const handleOpenView = (item) => {
    setViewingUsage(item);
  };

  const handleOpenEdit = (item) => {
    setEditingUsage(item);
    setUsageForm({ ...item });
  };

  const handleCloseEdit = () => {
    setEditingUsage(null);
    setUsageForm(null);
  };

  const handleSaveUsage = (e) => {
    e.preventDefault();
    if (!usageForm) return;

    storageService.saveUsage(usageForm);
    triggerRefresh();

    if (viewingUsage && viewingUsage.companyId === usageForm.companyId) {
      const active = usageForm.activeJobs || 0;
      const posted = usageForm.jobsLimit || 50;
      const pct = posted > 0 ? Math.min(100, Math.round((active / posted) * 100)) : 0;
      setViewingUsage({ ...usageForm, usagePercentage: pct });
    }

    handleCloseEdit();
    addToast({
      type: 'success',
      title: 'Usage Quotas Saved',
      message: `Usage metrics for ${usageForm.companyName} were updated.`
    });
  };

  const handleExportCSV = () => {
    const cols = [
      { key: 'companyId', label: 'Company ID' },
      { key: 'companyName', label: 'Company Name' },
      { key: 'activeJobs', label: 'Active Jobs' },
      { key: 'jobsLimit', label: 'Posted Jobs Limit' },
      { key: 'usagePercentage', label: 'Usage Percentage (%)' },
      { key: 'candidateAlertsUsed', label: 'Alerts Used' },
      { key: 'resumeAccessUsed', label: 'Resumes Used' },
      { key: 'storageUsedGb', label: 'Storage Used (GB)' }
    ];
    exportToCSV('company_usage_quotas', filteredData, cols);
    addToast({
      type: 'info',
      title: 'CSV Exported',
      message: `Exported ${filteredData.length} company usage records.`
    });
  };

  // Exact Table Columns:
  // 1. S.No
  // 2. Company ID
  // 3. Company Name
  // 4. Active Jobs
  // 5. Posted Jobs
  // 6. Usage Percentage (Percentage & Compact Progress Bar)
  // 7. Action (Eye for View, Pencil for Edit - icon only)
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
      sortable: false,
      render: (row) => (
        <span className="font-semibold text-primary">{row.companyId}</span>
      )
    },
    {
      key: 'companyName',
      label: 'Company Name',
      sortable: false,
      render: (row) => (
        <span className="font-semibold">{row.companyName}</span>
      )
    },
    {
      key: 'activeJobs',
      label: 'Active Jobs',
      sortable: false,
      render: (row) => (
        <span className="font-medium">{formatNumber(row.activeJobs || 0)}</span>
      )
    },
    {
      key: 'jobsLimit',
      label: 'Posted Jobs',
      sortable: false,
      render: (row) => (
        <span className="font-medium">{formatNumber(row.jobsLimit || 50)}</span>
      )
    },
    {
      key: 'usagePercentage',
      label: 'Usage Percentage',
      sortable: false,
      render: (row) => {
        const pct = row.usagePercentage;
        let barColor = 'bar-success';
        let textColor = 'text-green';

        if (pct >= 85) {
          barColor = 'bar-danger';
          textColor = 'text-red';
        } else if (pct >= 65) {
          barColor = 'bar-warning';
          textColor = 'text-yellow';
        }

        const widthClass = getProgressWidthClass(pct);

        return (
          <div className="usage-progress-cell">
            <div className="usage-progress-meta">
              <span className={`font-bold ${textColor}`}>{pct}%</span>
              <span className="text-muted text-xs">
                {row.activeJobs} / {row.jobsLimit}
              </span>
            </div>
            <div className="usage-progress-bar-track">
              <div className={`progress-bar-fill ${barColor} ${widthClass}`}></div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      render: (row) => (
        <div className="usage-action-icons">
          <button
            type="button"
            className="usage-action-btn"
            title="View Usage Quotas"
            aria-label="View Usage Quotas"
            onClick={() => handleOpenView(row)}
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            className="usage-action-btn"
            title="Edit Usage"
            aria-label="Edit Usage"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="usage-container">
      <PageHeader
        title="Company Usage"
        actions={
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
        }
      />

      {/* Separate Toolbar above the table */}
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
            value={rangeFilter}
            onChange={(e) => {
              setRangeFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by usage range"
          >
            <option value="">All Usage Ranges</option>
            <option value="high">Critical (≥ 80%)</option>
            <option value="medium">Moderate (50% - 79%)</option>
            <option value="low">Standard (&lt; 50%)</option>
          </select>

          {(searchTerm || rangeFilter) && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset usage filters"
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="table-container">
        {/* Data Table with exact columns and priority descending sort */}
        <DataTable
          columns={tableColumns}
          data={paginatedData}
          currentPage={currentPage}
          pageSize={pageSize}
          emptyTitle="No usage records found"
          emptyDescription="No tenant usage matches the selected criteria."
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

      {/* VIEW USAGE MODAL (No URL Change) */}
      {viewingUsage && (
        <Modal
          isOpen={Boolean(viewingUsage)}
          onClose={() => setViewingUsage(null)}
          title={`Quota Usage Details — ${viewingUsage.companyName}`}
          size="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="secondary"
                icon={Edit2}
                onClick={() => {
                  const u = viewingUsage;
                  setViewingUsage(null);
                  handleOpenEdit(u);
                }}
              >
                Edit Quotas
              </Button>
              <Button variant="primary" onClick={() => setViewingUsage(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="usage-detail-scroll">
            <div className="usage-section-card">
              <div className="usage-section-title">Tenant Overview</div>
              <div className="usage-grid-2">
                <div className="usage-field-item">
                  <span className="usage-field-label">Company ID</span>
                  <span className="usage-field-val">{viewingUsage.companyId}</span>
                </div>
                <div className="usage-field-item">
                  <span className="usage-field-label">Company Name</span>
                  <span className="usage-field-val">{viewingUsage.companyName}</span>
                </div>
                <div className="usage-field-item">
                  <span className="usage-field-label">Current Billing Term</span>
                  <span className="usage-field-val">{viewingUsage.billingPeriod || 'Active Term'}</span>
                </div>
                <div className="usage-field-item">
                  <span className="usage-field-label">Usage Saturation</span>
                  <span className="usage-field-val text-blue font-bold">{viewingUsage.usagePercentage}%</span>
                </div>
              </div>
            </div>

            <div className="usage-section-card">
              <div className="usage-section-title">Allocation & Consumption Breakdown</div>
              <div className="usage-grid-2">
                <div className="usage-field-item">
                  <span className="usage-field-label">Active Jobs</span>
                  <span className="usage-field-val">{formatNumber(viewingUsage.activeJobs)} / {formatNumber(viewingUsage.jobsLimit)}</span>
                </div>
                <div className="usage-field-item">
                  <span className="usage-field-label">Candidate Alerts Dispatched</span>
                  <span className="usage-field-val">{formatNumber(viewingUsage.candidateAlertsUsed)} / {formatNumber(viewingUsage.candidateAlertsLimit)}</span>
                </div>
                <div className="usage-field-item">
                  <span className="usage-field-label">Resume Sourcing Views</span>
                  <span className="usage-field-val">{formatNumber(viewingUsage.resumeAccessUsed)} / {formatNumber(viewingUsage.resumeAccessLimit)}</span>
                </div>
                <div className="usage-field-item">
                  <span className="usage-field-label">Cloud Storage</span>
                  <span className="usage-field-val">{viewingUsage.storageUsedGb} GB / {viewingUsage.storageLimitGb} GB</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT USAGE MODAL (No URL Change) */}
      {editingUsage && usageForm && (
        <Modal
          isOpen={Boolean(editingUsage)}
          onClose={handleCloseEdit}
          title={`Edit Quotas — ${editingUsage.companyName}`}
          size="md"
          footer={
            <div className="flex justify-between w-full">
              <Button variant="secondary" onClick={handleCloseEdit}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveUsage}>
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveUsage} className="usage-edit-form">
            <div className="form-group">
              <label className="form-label">Active Jobs</label>
              <Input
                type="number"
                min="0"
                value={usageForm.activeJobs || 0}
                onChange={(e) => setUsageForm({ ...usageForm, activeJobs: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Posted Jobs Limit</label>
              <Input
                type="number"
                min="1"
                value={usageForm.jobsLimit || 50}
                onChange={(e) => setUsageForm({ ...usageForm, jobsLimit: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Candidate Alerts Used</label>
              <Input
                type="number"
                min="0"
                value={usageForm.candidateAlertsUsed || 0}
                onChange={(e) => setUsageForm({ ...usageForm, candidateAlertsUsed: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Resume Access Used</label>
              <Input
                type="number"
                min="0"
                value={usageForm.resumeAccessUsed || 0}
                onChange={(e) => setUsageForm({ ...usageForm, resumeAccessUsed: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Storage Used (GB)</label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={usageForm.storageUsedGb || 0}
                onChange={(e) => setUsageForm({ ...usageForm, storageUsedGb: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CompanyUsage;
