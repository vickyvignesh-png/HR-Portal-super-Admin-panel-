import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Plus,
  Download,
  Eye,
  Edit2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Globe,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Briefcase
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
import {
  COMPANY_STATUSES,
  GST_VERIFICATION_STATUSES,
  GST_BUSINESS_STATUSES
} from '../../utils/constants';
import './CompanyDetails.css';

export const CompanyDetails = () => {
  const { dataVersion, triggerRefresh } = useApp();
  const { addToast } = useToast();

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [gstStatusFilter, setGstStatusFilter] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // In-page modal states (ZERO URL changes on View/Edit)
  const [viewingCompany, setViewingCompany] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Register New Company Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    businessType: 'Private Limited',
    industry: 'Information Technology',
    size: '50-100',
    website: '',
    email: '',
    mobile: '',
    contactPerson: '',
    contactDesignation: 'Director',
    registeredAddress: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560100',
    gstNumber: '',
    gstVerificationStatus: 'Valid',
    gstLegalName: '',
    gstBusinessStatus: 'Active',
    gstVerificationDate: new Date().toISOString().slice(0, 10),
    panCin: '',
    status: 'Active'
  });
  const [registerErrors, setRegisterErrors] = useState({});

  const companies = useMemo(() => {
    return storageService.getCompanies();
  }, [dataVersion]);

  // Unique options for filters
  const companyTypes = useMemo(() => {
    const set = new Set(companies.map((c) => c.businessType).filter(Boolean));
    return Array.from(set);
  }, [companies]);

  const industries = useMemo(() => {
    const set = new Set(companies.map((c) => c.industry).filter(Boolean));
    return Array.from(set);
  }, [companies]);

  // Filtering & Sorting logic
  const filteredData = useMemo(() => {
    let result = [...companies];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();
      result = result.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(lower)) ||
          (c.id && c.id.toLowerCase().includes(lower)) ||
          (c.email && c.email.toLowerCase().includes(lower)) ||
          (c.mobile && c.mobile.toLowerCase().includes(lower)) ||
          (c.gstNumber && c.gstNumber.toLowerCase().includes(lower))
      );
    }

    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (typeFilter) {
      result = result.filter((c) => c.businessType === typeFilter);
    }

    if (industryFilter) {
      result = result.filter((c) => c.industry === industryFilter);
    }

    if (gstStatusFilter) {
      result = result.filter((c) => c.gstVerificationStatus === gstStatusFilter);
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
  }, [companies, searchTerm, statusFilter, typeFilter, industryFilter, gstStatusFilter, sortColumn, sortDirection]);

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
    setStatusFilter('');
    setTypeFilter('');
    setIndustryFilter('');
    setGstStatusFilter('');
    setCurrentPage(1);
  };

  // View Modal Trigger (No URL change)
  const handleOpenView = (company) => {
    setViewingCompany(company);
  };

  const handleCloseView = () => {
    setViewingCompany(null);
  };

  // Edit Modal Trigger (No URL change)
  const handleOpenEdit = (company) => {
    setEditingCompany(company);
    setEditFormData({ ...company });
    setEditFormErrors({});
    setIsFormDirty(false);
  };

  const handleCloseEdit = () => {
    if (isFormDirty) {
      setShowUnsavedWarning(true);
    } else {
      setEditingCompany(null);
      setEditFormData(null);
    }
  };

  const handleConfirmDiscardEdit = () => {
    setShowUnsavedWarning(false);
    setEditingCompany(null);
    setEditFormData(null);
    setIsFormDirty(false);
  };

  const handleEditFieldChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    setIsFormDirty(true);
    if (editFormErrors[field]) {
      setEditFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editFormData) return;

    // Field validation
    const errors = {};
    if (!editFormData.name?.trim()) errors.name = 'Company Name is required';
    if (!editFormData.email?.trim()) {
      errors.email = 'Official Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!editFormData.contactPerson?.trim()) {
      errors.contactPerson = 'Contact Person is required';
    }

    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      addToast({
        type: 'error',
        title: 'Validation Failed',
        message: 'Please review required fields before saving.'
      });
      return;
    }

    const updated = {
      ...editFormData,
      lastUpdated: new Date().toISOString().slice(0, 10)
    };

    storageService.saveCompany(updated);
    triggerRefresh();

    // If viewing same company, update view details immediately
    if (viewingCompany && viewingCompany.id === updated.id) {
      setViewingCompany(updated);
    }

    setEditingCompany(null);
    setEditFormData(null);
    setIsFormDirty(false);

    addToast({
      type: 'success',
      title: 'Company Saved',
      message: `${updated.name} profile was saved and updated in the directory.`
    });
  };

  // Register Company Form
  const handleRegisterCompany = (e) => {
    e.preventDefault();
    const errors = {};
    if (!newCompany.name.trim()) errors.name = 'Company Name is required';
    if (!newCompany.email.trim()) errors.email = 'Official Email is required';
    if (!newCompany.contactPerson.trim()) errors.contactPerson = 'Contact Person is required';

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    storageService.saveCompany({
      ...newCompany,
      gstLegalName: newCompany.gstLegalName || newCompany.name
    });

    triggerRefresh();
    setIsRegisterModalOpen(false);
    setNewCompany({
      name: '',
      businessType: 'Private Limited',
      industry: 'Information Technology',
      size: '50-100',
      website: '',
      email: '',
      mobile: '',
      contactPerson: '',
      contactDesignation: 'Director',
      registeredAddress: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      gstNumber: '',
      gstVerificationStatus: 'Valid',
      gstLegalName: '',
      gstBusinessStatus: 'Active',
      gstVerificationDate: new Date().toISOString().slice(0, 10),
      panCin: '',
      status: 'Active'
    });
    setRegisterErrors({});

    addToast({
      type: 'success',
      title: 'Company Registered',
      message: `${newCompany.name} has been successfully registered.`
    });
  };

  const handleExportCSV = () => {
    const exportColumns = [
      { key: 'id', label: 'Company ID' },
      { key: 'name', label: 'Company Name' },
      { key: 'businessType', label: 'Company Type' },
      { key: 'industry', label: 'Industry' },
      { key: 'registeredAddress', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
      { key: 'pincode', label: 'Pincode' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'email', label: 'Email' },
      { key: 'gstNumber', label: 'GST Number' },
      { key: 'gstVerificationStatus', label: 'GST Verification Status' },
      { key: 'status', label: 'Status' }
    ];
    exportToCSV('companies_directory', filteredData, exportColumns);
    addToast({
      type: 'info',
      title: 'CSV Exported',
      message: `Exported ${filteredData.length} company records to CSV.`
    });
  };

  // Exact 7 Table Columns:
  // 1. S.No
  // 2. Company ID
  // 3. Company Name
  // 4. Company Type
  // 5. Address
  // 6. Status
  // 7. Action
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
      label: 'Company ID',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-primary">{row.id}</span>
      )
    },
    {
      key: 'name',
      label: 'Company Name',
      sortable: true,
      render: (row) => (
        <div className="company-name-vertical">
          <div className="company-logo-avatar-box">
            {row.logo || row.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="company-name-text-col">
            <span className="company-title-bold">{row.name}</span>
            <span className="company-sub-phone">{row.mobile || 'Not provided'}</span>
            <span className="company-sub-email">{row.email || 'Not provided'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'businessType',
      label: 'Company Type',
      sortable: true,
      render: (row) => (
        <span className="font-medium">{row.businessType || 'Private Limited'}</span>
      )
    },
    {
      key: 'address',
      label: 'Address',
      sortable: false,
      render: (row) => {
        const fullAddr = [row.registeredAddress, row.city, row.state, row.pincode]
          .filter(Boolean)
          .join(', ');
        return (
          <div className="company-address-cell" title={fullAddr || 'Not provided'}>
            {fullAddr || 'Not provided'}
          </div>
        );
      }
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
        <div className="company-action-icons">
          <button
            type="button"
            className="company-action-btn"
            title="View Company Details"
            aria-label="View Company Details"
            onClick={() => handleOpenView(row)}
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            className="company-action-btn"
            title="Edit Company Details"
            aria-label="Edit Company Details"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="company-details-container">
      <PageHeader
        title="Company Details"
        description="Oversee enterprise tenants, review corporate compliance, and regulate account records."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsRegisterModalOpen(true)}
            >
              Register Company
            </Button>
          </div>
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
            placeholder="Search by Company ID, company name, phone, email, or GSTIN..."
          />

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Company status filter"
          >
            <option value="">All Statuses</option>
            {COMPANY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Company type filter"
          >
            <option value="">All Company Types</option>
            {companyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={industryFilter}
            onChange={(e) => {
              setIndustryFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Industry filter"
          >
            <option value="">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={gstStatusFilter}
            onChange={(e) => {
              setGstStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="GST verification filter"
          >
            <option value="">All GST States</option>
            {GST_VERIFICATION_STATUSES.map((gst) => (
              <option key={gst} value={gst}>
                {gst}
              </option>
            ))}
          </select>

          {(searchTerm || statusFilter || typeFilter || industryFilter || gstStatusFilter) && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset all filters"
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
          emptyTitle="No companies found"
          emptyDescription="No registered enterprise matches the current filter criteria."
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

      {/* VIEW MODAL (Does not change URL) */}
      {viewingCompany && (
        <Modal
          isOpen={Boolean(viewingCompany)}
          onClose={handleCloseView}
          title={`Company Details — ${viewingCompany.name}`}
          size="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="secondary"
                icon={Edit2}
                onClick={() => {
                  const comp = viewingCompany;
                  handleCloseView();
                  handleOpenEdit(comp);
                }}
              >
                Edit Company
              </Button>
              <Button variant="primary" onClick={handleCloseView}>
                Close
              </Button>
            </div>
          }
        >
          <div className="company-view-sections">
            {/* 1. Basic Information */}
            <div className="company-section-block">
              <div className="company-section-header">
                <Building2 size={16} />
                <span>Basic Information</span>
              </div>
              <div className="company-section-grid">
                <div className="company-field-item">
                  <span className="company-field-label">Company ID</span>
                  <span className="company-field-value">{viewingCompany.id || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">Company Name</span>
                  <span className="company-field-value">{viewingCompany.name || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">Company Logo</span>
                  <span className="company-field-value">{viewingCompany.logo || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">Business Type</span>
                  <span className="company-field-value">{viewingCompany.businessType || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">Industry</span>
                  <span className="company-field-value">{viewingCompany.industry || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">Company Size</span>
                  <span className="company-field-value">{viewingCompany.size ? `${viewingCompany.size} employees` : 'Not provided'}</span>
                </div>
                <div className="company-field-item full-width">
                  <span className="company-field-label">Website</span>
                  <span className="company-field-value">
                    {viewingCompany.website ? (
                      <a href={viewingCompany.website} target="_blank" rel="noopener noreferrer">
                        {viewingCompany.website}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Contact Information */}
            <div className="company-section-block">
              <div className="company-section-header">
                <Mail size={16} />
                <span>Contact Information</span>
              </div>
              <div className="company-section-grid">
                <div className="company-field-item">
                  <span className="company-field-label">Company Email</span>
                  <span className="company-field-value">{viewingCompany.email || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">Company Mobile</span>
                  <span className="company-field-value">{viewingCompany.mobile || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">Contact Person</span>
                  <span className="company-field-value">{viewingCompany.contactPerson || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">Contact Designation</span>
                  <span className="company-field-value">{viewingCompany.contactDesignation || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* 3. Registered Address */}
            <div className="company-section-block">
              <div className="company-section-header">
                <MapPin size={16} />
                <span>Registered Address</span>
              </div>
              <div className="company-section-grid">
                <div className="company-field-item full-width">
                  <span className="company-field-label">Registered Address</span>
                  <span className="company-field-value">{viewingCompany.registeredAddress || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">City</span>
                  <span className="company-field-value">{viewingCompany.city || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">State</span>
                  <span className="company-field-value">{viewingCompany.state || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">Pincode</span>
                  <span className="company-field-value">{viewingCompany.pincode || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* 4. GST Verification */}
            <div className="company-section-block">
              <div className="company-section-header">
                <ShieldCheck size={16} />
                <span>GST Verification</span>
              </div>
              <div className="company-section-grid">
                <div className="company-field-item">
                  <span className="company-field-label">GST Number</span>
                  <span className="company-field-value">{viewingCompany.gstNumber || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">GST Verification Status</span>
                  <span className="company-field-value">
                    <StatusBadge status={viewingCompany.gstVerificationStatus || 'Pending'} />
                  </span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">GST Legal Name</span>
                  <span className="company-field-value">{viewingCompany.gstLegalName || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">GST Business Status</span>
                  <span className="company-field-value">
                    <StatusBadge status={viewingCompany.gstBusinessStatus || 'Active'} />
                  </span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">GST Verification Date</span>
                  <span className="company-field-value">{formatDate(viewingCompany.gstVerificationDate) || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* 5. Legal and Account Information */}
            <div className="company-section-block">
              <div className="company-section-header">
                <FileCheck2 size={16} />
                <span>Legal and Account Information</span>
              </div>
              <div className="company-section-grid">
                <div className="company-field-item">
                  <span className="company-field-label">PAN / CIN</span>
                  <span className="company-field-value">{viewingCompany.panCin || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">Company Status</span>
                  <span className="company-field-value">
                    <StatusBadge status={viewingCompany.status || 'Active'} />
                  </span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">Registration Date</span>
                  <span className="company-field-value">{formatDate(viewingCompany.registrationDate) || 'Not provided'}</span>
                </div>
                <div className="company-field-item">
                  <span className="company-field-label">Last Updated</span>
                  <span className="company-field-value">{formatDate(viewingCompany.lastUpdated) || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL (Does not change URL) */}
      {editingCompany && editFormData && (
        <Modal
          isOpen={Boolean(editingCompany)}
          onClose={handleCloseEdit}
          title={`Edit Company Details — ${editingCompany.name}`}
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
          <form onSubmit={handleSaveEdit} className="company-edit-form">
            <div className="form-section-title">Basic Information</div>
            <div className="form-two-cols">
              <Input
                label="Company ID"
                value={editFormData.id}
                disabled
              />
              <Input
                label="Company Name"
                required
                value={editFormData.name}
                onChange={(e) => handleEditFieldChange('name', e.target.value)}
                error={editFormErrors.name}
              />
              <Select
                label="Business Type"
                value={editFormData.businessType}
                onChange={(e) => handleEditFieldChange('businessType', e.target.value)}
                options={['Private Limited', 'Public Limited', 'Corporation', 'Partnership', 'Proprietorship']}
              />
              <Select
                label="Industry"
                value={editFormData.industry}
                onChange={(e) => handleEditFieldChange('industry', e.target.value)}
                options={[
                  'Information Technology',
                  'Healthcare',
                  'Financial Services',
                  'Logistics & Supply Chain',
                  'Retail & E-commerce',
                  'Biotechnology',
                  'Manufacturing'
                ]}
              />
              <Select
                label="Company Size"
                value={editFormData.size}
                onChange={(e) => handleEditFieldChange('size', e.target.value)}
                options={['1-10', '10-50', '50-100', '100-250', '250-500', '500-1000', '1000-5000', '5000+']}
              />
              <Input
                label="Website URL"
                value={editFormData.website || ''}
                onChange={(e) => handleEditFieldChange('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-section-title">Contact Information</div>
            <div className="form-two-cols">
              <Input
                label="Company Email"
                type="email"
                required
                value={editFormData.email}
                onChange={(e) => handleEditFieldChange('email', e.target.value)}
                error={editFormErrors.email}
              />
              <Input
                label="Company Mobile"
                value={editFormData.mobile || ''}
                onChange={(e) => handleEditFieldChange('mobile', e.target.value)}
                placeholder="+91 98450 12345"
              />
              <Input
                label="Contact Person"
                required
                value={editFormData.contactPerson}
                onChange={(e) => handleEditFieldChange('contactPerson', e.target.value)}
                error={editFormErrors.contactPerson}
              />
              <Input
                label="Contact Designation"
                value={editFormData.contactDesignation || ''}
                onChange={(e) => handleEditFieldChange('contactDesignation', e.target.value)}
              />
            </div>

            <div className="form-section-title">Registered Address</div>
            <div className="company-field-item full-width">
              <Input
                label="Registered Address"
                value={editFormData.registeredAddress || ''}
                onChange={(e) => handleEditFieldChange('registeredAddress', e.target.value)}
              />
            </div>
            <div className="form-two-cols">
              <Input
                label="City"
                value={editFormData.city || ''}
                onChange={(e) => handleEditFieldChange('city', e.target.value)}
              />
              <Input
                label="State"
                value={editFormData.state || ''}
                onChange={(e) => handleEditFieldChange('state', e.target.value)}
              />
              <Input
                label="Pincode"
                value={editFormData.pincode || ''}
                onChange={(e) => handleEditFieldChange('pincode', e.target.value)}
              />
            </div>

            <div className="form-section-title">GST Verification</div>
            <div className="form-two-cols">
              <Input
                label="GST Number (GSTIN)"
                value={editFormData.gstNumber || ''}
                onChange={(e) => handleEditFieldChange('gstNumber', e.target.value)}
                placeholder="15-digit GSTIN"
              />
              <Select
                label="GST Verification Status"
                value={editFormData.gstVerificationStatus || 'Valid'}
                onChange={(e) => handleEditFieldChange('gstVerificationStatus', e.target.value)}
                options={GST_VERIFICATION_STATUSES}
              />
              <Input
                label="GST Legal Name"
                value={editFormData.gstLegalName || ''}
                onChange={(e) => handleEditFieldChange('gstLegalName', e.target.value)}
              />
              <Select
                label="GST Business Status"
                value={editFormData.gstBusinessStatus || 'Active'}
                onChange={(e) => handleEditFieldChange('gstBusinessStatus', e.target.value)}
                options={GST_BUSINESS_STATUSES}
              />
              <Input
                label="GST Verification Date"
                type="date"
                value={editFormData.gstVerificationDate || ''}
                onChange={(e) => handleEditFieldChange('gstVerificationDate', e.target.value)}
              />
            </div>

            <div className="form-section-title">Legal & Account Information</div>
            <div className="form-two-cols">
              <Input
                label="PAN / CIN"
                value={editFormData.panCin || ''}
                onChange={(e) => handleEditFieldChange('panCin', e.target.value)}
              />
              <Select
                label="Company Status"
                value={editFormData.status || 'Active'}
                onChange={(e) => handleEditFieldChange('status', e.target.value)}
                options={COMPANY_STATUSES}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Unsaved Changes Confirmation Modal */}
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
            You have unsaved changes in this company profile. Are you sure you want to dismiss without saving?
          </p>
        </Modal>
      )}

      {/* Register New Company Modal */}
      {isRegisterModalOpen && (
        <Modal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          title="Register New Company"
          size="lg"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="secondary" onClick={() => setIsRegisterModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleRegisterCompany}>
                Register Company
              </Button>
            </div>
          }
        >
          <form onSubmit={handleRegisterCompany} className="company-edit-form">
            <div className="form-section-title">Basic Information</div>
            <div className="form-two-cols">
              <Input
                label="Company Name"
                required
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                error={registerErrors.name}
                placeholder="e.g. Tata Digital Innovations"
              />
              <Select
                label="Business Type"
                value={newCompany.businessType}
                onChange={(e) => setNewCompany({ ...newCompany, businessType: e.target.value })}
                options={['Private Limited', 'Public Limited', 'Corporation', 'Partnership', 'Proprietorship']}
              />
              <Select
                label="Industry"
                value={newCompany.industry}
                onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                options={[
                  'Information Technology',
                  'Healthcare',
                  'Financial Services',
                  'Logistics & Supply Chain',
                  'Retail & E-commerce',
                  'Biotechnology',
                  'Manufacturing'
                ]}
              />
              <Select
                label="Company Size"
                value={newCompany.size}
                onChange={(e) => setNewCompany({ ...newCompany, size: e.target.value })}
                options={['1-10', '10-50', '50-100', '100-250', '250-500', '500-1000', '1000-5000', '5000+']}
              />
              <Input
                label="Website URL"
                value={newCompany.website}
                onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                placeholder="https://tatadigital.example.com"
              />
            </div>

            <div className="form-section-title">Contact Information</div>
            <div className="form-two-cols">
              <Input
                label="Official Email"
                type="email"
                required
                value={newCompany.email}
                onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                error={registerErrors.email}
                placeholder="hr@tatadigital.example.com"
              />
              <Input
                label="Official Mobile"
                value={newCompany.mobile}
                onChange={(e) => setNewCompany({ ...newCompany, mobile: e.target.value })}
                placeholder="+91 98200 12345"
              />
              <Input
                label="Primary Contact Person"
                required
                value={newCompany.contactPerson}
                onChange={(e) => setNewCompany({ ...newCompany, contactPerson: e.target.value })}
                error={registerErrors.contactPerson}
                placeholder="Full Name"
              />
              <Input
                label="Contact Designation"
                value={newCompany.contactDesignation}
                onChange={(e) => setNewCompany({ ...newCompany, contactDesignation: e.target.value })}
                placeholder="HR Director"
              />
            </div>

            <div className="form-section-title">Registered Address</div>
            <div className="company-field-item full-width">
              <Input
                label="Registered Address"
                value={newCompany.registeredAddress}
                onChange={(e) => setNewCompany({ ...newCompany, registeredAddress: e.target.value })}
                placeholder="Tower B, Electronics City Phase 1"
              />
            </div>
            <div className="form-two-cols">
              <Input
                label="City"
                value={newCompany.city}
                onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
              />
              <Input
                label="State"
                value={newCompany.state}
                onChange={(e) => setNewCompany({ ...newCompany, state: e.target.value })}
              />
              <Input
                label="Pincode"
                value={newCompany.pincode}
                onChange={(e) => setNewCompany({ ...newCompany, pincode: e.target.value })}
              />
            </div>

            <div className="form-section-title">GST & Compliance</div>
            <div className="form-two-cols">
              <Input
                label="GST Number (GSTIN)"
                value={newCompany.gstNumber}
                onChange={(e) => setNewCompany({ ...newCompany, gstNumber: e.target.value })}
                placeholder="29AAACT1234P1Z5"
              />
              <Select
                label="GST Verification Status"
                value={newCompany.gstVerificationStatus}
                onChange={(e) => setNewCompany({ ...newCompany, gstVerificationStatus: e.target.value })}
                options={GST_VERIFICATION_STATUSES}
              />
              <Input
                label="PAN / CIN"
                value={newCompany.panCin}
                onChange={(e) => setNewCompany({ ...newCompany, panCin: e.target.value })}
                placeholder="U72200KA2024PTC998877"
              />
              <Select
                label="Account Status"
                value={newCompany.status}
                onChange={(e) => setNewCompany({ ...newCompany, status: e.target.value })}
                options={COMPANY_STATUSES}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CompanyDetails;
