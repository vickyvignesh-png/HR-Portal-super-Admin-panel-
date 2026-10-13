import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Eye,
  Edit2,
  RotateCcw,
  CheckCircle,
  XCircle,
  IndianRupee,
  Shield,
  Briefcase,
  Users
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
import { formatCurrency, formatNumber } from '../../utils/formatters';
import './SubscriptionPlans.css';

export const SubscriptionPlans = () => {
  const { dataVersion, triggerRefresh } = useApp();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cycleFilter, setCycleFilter] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // In-page modals (ZERO URL changes)
  const [viewingPlan, setViewingPlan] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const plans = useMemo(() => {
    return storageService.getPlans();
  }, [dataVersion]);

  const subscriptions = useMemo(() => {
    return storageService.getSubscriptions();
  }, [dataVersion]);

  // Calculate dynamic company count for each plan from subscriptions
  const planCompanyCountMap = useMemo(() => {
    const map = {};
    subscriptions.forEach((s) => {
      if (s.planId) {
        map[s.planId] = (map[s.planId] || 0) + 1;
      }
      if (s.planName) {
        map[s.planName] = (map[s.planName] || 0) + 1;
      }
    });
    return map;
  }, [subscriptions]);

  const filteredPlans = useMemo(() => {
    let result = [...plans];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(lower)) ||
          (p.id && p.id.toLowerCase().includes(lower))
      );
    }

    if (statusFilter) {
      result = result.filter((p) => {
        const displayStatus = p.status === 'Active' ? 'Active' : 'Inactive';
        return displayStatus === statusFilter;
      });
    }

    if (cycleFilter) {
      result = result.filter((p) => p.billingCycle === cycleFilter);
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
  }, [plans, searchTerm, statusFilter, cycleFilter, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredPlans.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPlans.slice(start, start + pageSize);
  }, [filteredPlans, currentPage]);

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
    setStatusFilter('');
    setCycleFilter('');
    setCurrentPage(1);
  };

  const handleOpenView = (plan) => {
    setViewingPlan(plan);
  };

  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setPlanForm({
      id: '',
      name: '',
      description: '',
      price: 999,
      billingCycle: 'Monthly',
      trialPeriod: 14,
      status: 'Active',
      adminUsersLimit: 5,
      jobLimit: 25,
      candidateAlertLimit: 500,
      resumeAccessLimit: 250,
      screeningLimit: 100,
      interviewLimit: 50,
      storageLimit: '10 GB',
      mobileAppAccess: true,
      reportsAccess: true,
      addonAccess: false
    });
    setFormErrors({});
  };

  const handleOpenEdit = (plan) => {
    setIsCreatingNew(false);
    setEditingPlan(plan);
    setPlanForm({ ...plan });
    setFormErrors({});
  };

  const handleCloseForm = () => {
    setIsCreatingNew(false);
    setEditingPlan(null);
    setPlanForm(null);
  };

  const handleFormFieldChange = (field, value) => {
    setPlanForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!planForm) return;

    const errors = {};
    if (!planForm.name?.trim()) errors.name = 'Plan Name is required';
    if (planForm.price === undefined || isNaN(planForm.price) || planForm.price < 0) {
      errors.price = 'Valid price required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    storageService.savePlan(planForm);
    triggerRefresh();

    if (viewingPlan && viewingPlan.id === planForm.id) {
      setViewingPlan(planForm);
    }

    handleCloseForm();
    addToast({
      type: 'success',
      title: isCreatingNew ? 'Plan Created' : 'Plan Updated',
      message: `${planForm.name} specifications have been saved.`
    });
  };

  // Exact Table Columns:
  // 1. S.No
  // 2. Plan Name
  // 3. Amount (INR)
  // 4. Company Count (calculated from subscription data)
  // 5. Status (Active / Inactive)
  // 6. Action (Eye and Pencil icon buttons only)
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
      key: 'name',
      label: 'Plan Name',
      sortable: true,
      render: (row) => (
        <div className="plan-table-name">
          <span className="plan-title-bold">{row.name}</span>
          <span className="plan-code-muted">{row.id} • {row.billingCycle}</span>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Amount',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-primary">{formatCurrency(row.price)}</span>
      )
    },
    {
      key: 'companyCount',
      label: 'Company Count',
      sortable: false,
      render: (row) => {
        const count = planCompanyCountMap[row.id] || planCompanyCountMap[row.name] || 0;
        return (
          <span className="font-medium">{count} {count === 1 ? 'company' : 'companies'}</span>
        );
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const displayStatus = row.status === 'Active' ? 'Active' : 'Inactive';
        return <StatusBadge status={displayStatus} />;
      }
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      render: (row) => (
        <div className="plan-action-icons">
          <button
            type="button"
            className="plan-action-btn"
            title="View Plan Details"
            aria-label="View Plan Details"
            onClick={() => handleOpenView(row)}
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            className="plan-action-btn"
            title="Edit Plan"
            aria-label="Edit Plan"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="plans-container">
      <PageHeader
        title="Subscription Plans"
        actions={
          <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
            Create Plan
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            className="filter-select"
            value={cycleFilter}
            onChange={(e) => {
              setCycleFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by billing cycle"
          >
            <option value="">All Billing Cycles</option>
            <option value="Monthly">Monthly</option>
            <option value="Annual">Annual</option>
            <option value="Quarterly">Quarterly</option>
          </select>

          {(searchTerm || statusFilter || cycleFilter) && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset plan filters"
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="table-container">
        {/* Plans Table */}
        <DataTable
          columns={tableColumns}
          data={paginatedData}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          currentPage={currentPage}
          pageSize={pageSize}
          emptyTitle="No subscription plans found"
          emptyDescription="No plan matches the selected criteria."
          emptyActionLabel="Clear Filters"
          onEmptyAction={handleResetFilters}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPlans.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* VIEW PLAN MODAL (No URL Change) */}
      {viewingPlan && (
        <Modal
          isOpen={Boolean(viewingPlan)}
          onClose={() => setViewingPlan(null)}
          title={`Plan Details — ${viewingPlan.name}`}
          size="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="secondary"
                icon={Edit2}
                onClick={() => {
                  const p = viewingPlan;
                  setViewingPlan(null);
                  handleOpenEdit(p);
                }}
              >
                Edit Plan
              </Button>
              <Button variant="primary" onClick={() => setViewingPlan(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="plan-modal-scroll">
            {/* Section 1: Core Specifications */}
            <div className="plan-section-card">
              <div className="plan-section-title">Core Specifications</div>
              <div className="plan-grid-2">
                <div className="plan-field-item">
                  <span className="plan-field-label">Plan ID</span>
                  <span className="plan-field-val">{viewingPlan.id}</span>
                </div>
                <div className="plan-field-item">
                  <span className="plan-field-label">Plan Name</span>
                  <span className="plan-field-val">{viewingPlan.name}</span>
                </div>
                <div className="plan-field-item full-width">
                  <span className="plan-field-label">Plan Description</span>
                  <span className="plan-field-val">{viewingPlan.description || 'Not provided'}</span>
                </div>
                <div className="plan-field-item">
                  <span className="plan-field-label">Plan Price</span>
                  <span className="plan-field-val">{formatCurrency(viewingPlan.price)}</span>
                </div>
                <div className="plan-field-item">
                  <span className="plan-field-label">Billing Cycle</span>
                  <span className="plan-field-val">{viewingPlan.billingCycle}</span>
                </div>
                <div className="plan-field-item">
                  <span className="plan-field-label">Trial Period</span>
                  <span className="plan-field-val">{viewingPlan.trialPeriod} days</span>
                </div>
                <div className="plan-field-item">
                  <span className="plan-field-label">Plan Status</span>
                  <span className="plan-field-val">
                    <StatusBadge status={viewingPlan.status === 'Active' ? 'Active' : 'Inactive'} />
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Quotas and Limits */}
            <div className="plan-section-card">
              <div className="plan-section-title">Operational Quotas & Limits</div>
              <div className="plan-grid-2">
                <div className="plan-field-item">
                  <span className="plan-field-label">Company Admin Users</span>
                  <span className="plan-field-val">{viewingPlan.adminUsersLimit || 5}</span>
                </div>
                <div className="plan-field-item">
                  <span className="plan-field-label">Job Limit</span>
                  <span className="plan-field-val">{viewingPlan.jobLimit || 25}</span>
                </div>
                <div className="plan-field-item">
                  <span className="plan-field-label">Candidate Alert Limit</span>
                  <span className="plan-field-val">{formatNumber(viewingPlan.candidateAlertLimit)}</span>
                </div>
                <div className="plan-field-item">
                  <span className="plan-field-label">Resume Access Limit</span>
                  <span className="plan-field-val">{formatNumber(viewingPlan.resumeAccessLimit)}</span>
                </div>
                <div className="plan-field-item">
                  <span className="plan-field-label">Screening Limit</span>
                  <span className="plan-field-val">{formatNumber(viewingPlan.screeningLimit)}</span>
                </div>
                <div className="plan-field-item">
                  <span className="plan-field-label">Interview Limit</span>
                  <span className="plan-field-val">{formatNumber(viewingPlan.interviewLimit)}</span>
                </div>
                <div className="plan-field-item">
                  <span className="plan-field-label">Storage Limit</span>
                  <span className="plan-field-val">{viewingPlan.storageLimit || '10 GB'}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Feature Entitlements */}
            <div className="plan-section-card">
              <div className="plan-section-title">Feature Entitlements</div>
              <div className="plan-grid-2">
                <div className="plan-field-item">
                  <span className="plan-field-label">Mobile App Access</span>
                  <span className="plan-field-val">{viewingPlan.mobileAppAccess ? 'Included' : 'Not Included'}</span>
                </div>
                <div className="plan-field-item">
                  <span className="plan-field-label">Platform Reports</span>
                  <span className="plan-field-val">{viewingPlan.reportsAccess ? 'Included' : 'Not Included'}</span>
                </div>
                <div className="plan-field-item">
                  <span className="plan-field-label">Add-on Access</span>
                  <span className="plan-field-val">{viewingPlan.addonAccess ? 'Included' : 'Not Included'}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE & EDIT PLAN MODAL (No URL Change) */}
      {planForm && (
        <Modal
          isOpen={Boolean(planForm)}
          onClose={handleCloseForm}
          title={isCreatingNew ? 'Create Subscription Plan' : `Edit Plan — ${planForm.name}`}
          size="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button variant="secondary" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSavePlan}>
                {isCreatingNew ? 'Create Plan' : 'Save Changes'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSavePlan} className="plan-edit-form">
            <div className="form-section-title">Plan Specifications</div>
            <div className="form-two-cols">
              <Input
                label="Plan Name"
                required
                value={planForm.name}
                onChange={(e) => handleFormFieldChange('name', e.target.value)}
                error={formErrors.name}
                placeholder="e.g. Growth Professional"
              />
              <Input
                label="Plan Price (₹ INR)"
                type="number"
                min="0"
                step="1"
                required
                value={planForm.price}
                onChange={(e) => handleFormFieldChange('price', parseFloat(e.target.value) || 0)}
                error={formErrors.price}
              />
              <Select
                label="Billing Cycle"
                value={planForm.billingCycle}
                onChange={(e) => handleFormFieldChange('billingCycle', e.target.value)}
                options={['Monthly', 'Annual', 'Quarterly']}
              />
              <Select
                label="Plan Status"
                value={planForm.status === 'Active' ? 'Active' : 'Inactive'}
                onChange={(e) => handleFormFieldChange('status', e.target.value)}
                options={['Active', 'Inactive']}
              />
              <Input
                label="Trial Period (Days)"
                type="number"
                min="0"
                value={planForm.trialPeriod}
                onChange={(e) => handleFormFieldChange('trialPeriod', parseInt(e.target.value) || 0)}
              />
              <Input
                label="Storage Limit"
                value={planForm.storageLimit || '10 GB'}
                onChange={(e) => handleFormFieldChange('storageLimit', e.target.value)}
              />
            </div>

            <div className="plan-field-item full-width">
              <Input
                label="Plan Description"
                value={planForm.description || ''}
                onChange={(e) => handleFormFieldChange('description', e.target.value)}
                placeholder="Short summary of target audience and features"
              />
            </div>

            <div className="form-section-title">Quotas & Limits</div>
            <div className="form-two-cols">
              <Input
                label="Company Admin Users"
                type="number"
                min="1"
                value={planForm.adminUsersLimit || 5}
                onChange={(e) => handleFormFieldChange('adminUsersLimit', parseInt(e.target.value) || 1)}
              />
              <Input
                label="Job Limit"
                type="number"
                min="1"
                value={planForm.jobLimit || 25}
                onChange={(e) => handleFormFieldChange('jobLimit', parseInt(e.target.value) || 1)}
              />
              <Input
                label="Candidate Alert Limit"
                type="number"
                min="0"
                value={planForm.candidateAlertLimit || 500}
                onChange={(e) => handleFormFieldChange('candidateAlertLimit', parseInt(e.target.value) || 0)}
              />
              <Input
                label="Resume Access Limit"
                type="number"
                min="0"
                value={planForm.resumeAccessLimit || 250}
                onChange={(e) => handleFormFieldChange('resumeAccessLimit', parseInt(e.target.value) || 0)}
              />
              <Input
                label="Screening Limit"
                type="number"
                min="0"
                value={planForm.screeningLimit || 100}
                onChange={(e) => handleFormFieldChange('screeningLimit', parseInt(e.target.value) || 0)}
              />
              <Input
                label="Interview Limit"
                type="number"
                min="0"
                value={planForm.interviewLimit || 50}
                onChange={(e) => handleFormFieldChange('interviewLimit', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="form-section-title">Entitlements</div>
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="mobileAppAccess"
                checked={Boolean(planForm.mobileAppAccess)}
                onChange={(e) => handleFormFieldChange('mobileAppAccess', e.target.checked)}
              />
              <label htmlFor="mobileAppAccess">Include Mobile App Access</label>
            </div>
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="reportsAccess"
                checked={Boolean(planForm.reportsAccess)}
                onChange={(e) => handleFormFieldChange('reportsAccess', e.target.checked)}
              />
              <label htmlFor="reportsAccess">Include Platform Reports</label>
            </div>
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="addonAccess"
                checked={Boolean(planForm.addonAccess)}
                onChange={(e) => handleFormFieldChange('addonAccess', e.target.checked)}
              />
              <label htmlFor="addonAccess">Include Add-on Marketplace Access</label>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SubscriptionPlans;
