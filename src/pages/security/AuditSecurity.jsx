import React, { useState, useMemo } from 'react';
import {
  Lock,
  Download,
  Eye,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { DataTable } from '../../components/common/DataTable';
import { SearchBar } from '../../components/common/SearchBar';
import { Pagination } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storageService } from '../../services/storageService';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatDateTime, exportToCSV } from '../../utils/formatters';
import './AuditSecurity.css';

export const AuditSecurity = () => {
  const { dataVersion } = useApp();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'security'
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // In-page audit / event detail modal (NO URL change)
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const auditLogs = useMemo(() => {
    return storageService.getAuditLogs();
  }, [dataVersion]);

  const securityEvents = useMemo(() => {
    return storageService.getSecurityEvents();
  }, [dataVersion]);

  // Filtering for Audit Logs
  const filteredAuditLogs = useMemo(() => {
    let result = [...auditLogs];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          (a.user && a.user.toLowerCase().includes(lower)) ||
          (a.module && a.module.toLowerCase().includes(lower)) ||
          (a.action && a.action.toLowerCase().includes(lower)) ||
          (a.companyReference && a.companyReference.toLowerCase().includes(lower)) ||
          (a.reason && a.reason.toLowerCase().includes(lower))
      );
    }

    if (moduleFilter) {
      result = result.filter((a) => a.module === moduleFilter);
    }

    return result;
  }, [auditLogs, searchTerm, moduleFilter]);

  // Filtering for Security Events
  const filteredSecurityEvents = useMemo(() => {
    let result = [...securityEvents];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          (e.id && e.id.toLowerCase().includes(lower)) ||
          (e.eventType && e.eventType.toLowerCase().includes(lower)) ||
          (e.user && e.user.toLowerCase().includes(lower)) ||
          (e.ipAddress && e.ipAddress.toLowerCase().includes(lower))
      );
    }

    return result;
  }, [securityEvents, searchTerm]);

  const currentDataset = activeTab === 'audit' ? filteredAuditLogs : filteredSecurityEvents;
  const totalPages = Math.ceil(currentDataset.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return currentDataset.slice(start, start + pageSize);
  }, [currentDataset, currentPage]);

  const handleExportCSV = () => {
    if (activeTab === 'audit') {
      const cols = [
        { key: 'id', label: 'Audit ID' },
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'user', label: 'User' },
        { key: 'module', label: 'Module' },
        { key: 'action', label: 'Action' },
        { key: 'companyReference', label: 'Target / Company' },
        { key: 'reason', label: 'Reason' }
      ];
      exportToCSV('superadmin_audit_logs', filteredAuditLogs, cols);
    } else {
      const cols = [
        { key: 'id', label: 'Event ID' },
        { key: 'eventType', label: 'Event Type' },
        { key: 'user', label: 'Target User' },
        { key: 'ipAddress', label: 'IP Address' },
        { key: 'location', label: 'Location' },
        { key: 'status', label: 'Status' },
        { key: 'timestamp', label: 'Timestamp' }
      ];
      exportToCSV('security_events_export', filteredSecurityEvents, cols);
    }

    addToast({
      type: 'info',
      title: 'CSV Exported',
      message: 'Exported security records to CSV file.'
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setModuleFilter('');
    setCurrentPage(1);
  };

  const auditColumns = [
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
      label: 'Audit ID / Time',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-primary">{row.id}</span>
          <div className="text-muted text-xs">{formatDateTime(row.timestamp)}</div>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Staff Member',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium">{row.user}</div>
          <span className="text-muted text-xs">{row.ipAddress}</span>
        </div>
      )
    },
    {
      key: 'module',
      label: 'Module / Action',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold">{row.module}</div>
          <span className="text-secondary text-xs">{row.action}</span>
        </div>
      )
    },
    {
      key: 'companyReference',
      label: 'Target Record',
      sortable: true,
      render: (row) => (
        <div>
          <div className="text-primary">{row.companyReference}</div>
          <span className="text-muted text-xs">{row.recordReference}</span>
        </div>
      )
    },
    {
      key: 'reason',
      label: 'Reason for Action',
      render: (row) => (
        <span className="text-secondary text-xs">
          {row.reason}
        </span>
      )
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      render: (row) => (
        <button
          type="button"
          className="audit-action-btn"
          onClick={() => setSelectedAudit(row)}
          title="Inspect Value Diff"
          aria-label="Inspect Value Diff"
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  const securityColumns = [
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
      label: 'Event ID',
      render: (row) => <span className="font-semibold text-primary">{row.id}</span>
    },
    {
      key: 'eventType',
      label: 'Event Type',
      render: (row) => (
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert size={16} className="text-blue" />
          <span>{row.eventType}</span>
        </div>
      )
    },
    {
      key: 'user',
      label: 'Initiator / Target',
      render: (row) => row.user
    },
    {
      key: 'ipAddress',
      label: 'IP & Geo Location',
      render: (row) => (
        <div>
          <div>{row.ipAddress}</div>
          <span className="text-muted text-xs">{row.location}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`status-badge ${row.status === 'Success' ? 'status-active' : 'status-suspended'}`}>
          <span className="status-dot"></span>
          {row.status}
        </span>
      )
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (row) => formatDateTime(row.timestamp)
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      render: (row) => (
        <button
          type="button"
          className="audit-action-btn"
          onClick={() => setSelectedEvent(row)}
          title="View Event Details"
          aria-label="View Event Details"
        >
          <Eye size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="audit-security-container">
      <PageHeader
        title="Audit & Security"
        actions={
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
        }
      />

      <Tabs
        tabs={[
          { id: 'audit', label: 'Operational Change Logs', icon: History, count: auditLogs.length },
          { id: 'security', label: 'Security & Auth Events', icon: ShieldCheck, count: securityEvents.length }
        ]}
        activeTab={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
      />

      {/* Separate Toolbar above table with clear gap */}
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

          {activeTab === 'audit' && (
            <select
              className="filter-select"
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by module"
            >
              <option value="">All Modules</option>
              <option value="Companies">Companies</option>
              <option value="Subscriptions">Subscriptions</option>
              <option value="Billing">Billing</option>
              <option value="Access">Access & Roles</option>
              <option value="Settings">Platform Settings</option>
            </select>
          )}

          {(searchTerm || moduleFilter) && (
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
        <DataTable
          columns={activeTab === 'audit' ? auditColumns : securityColumns}
          data={paginatedData}
          currentPage={currentPage}
          pageSize={pageSize}
          emptyTitle="No records found"
          emptyDescription="Try adjusting your search criteria."
          emptyActionLabel="Clear Filters"
          onEmptyAction={handleResetFilters}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={currentDataset.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* INSPECT AUDIT DIFF MODAL (No URL Change) */}
      {selectedAudit && (
        <Modal
          isOpen={Boolean(selectedAudit)}
          onClose={() => setSelectedAudit(null)}
          title={`Audit Record Inspection — ${selectedAudit.id}`}
          size="lg"
          footer={
            <div className="flex justify-end w-full">
              <Button variant="primary" onClick={() => setSelectedAudit(null)}>
                Dismiss
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="audit-detail-grid">
              <span className="audit-detail-key">Action Type:</span>
              <span className="audit-detail-val font-semibold">{selectedAudit.action}</span>

              <span className="audit-detail-key">Target Module:</span>
              <span className="audit-detail-val">{selectedAudit.module}</span>

              <span className="audit-detail-key">Initiating Staff:</span>
              <span className="audit-detail-val">{selectedAudit.user} ({selectedAudit.ipAddress})</span>

              <span className="audit-detail-key">Target Entity:</span>
              <span className="audit-detail-val text-primary font-medium">{selectedAudit.companyReference}</span>

              <span className="audit-detail-key">Timestamp:</span>
              <span className="audit-detail-val">{formatDateTime(selectedAudit.timestamp)}</span>

              <span className="audit-detail-key">Audit Justification:</span>
              <span className="audit-detail-val">{selectedAudit.reason}</span>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Payload State Comparison</h4>
              <div className="audit-diff-box">
                <div className="diff-col">
                  <span className="diff-label">Previous Value</span>
                  <div className="diff-old">{selectedAudit.oldValue || '—'}</div>
                </div>
                <div className="diff-col">
                  <span className="diff-label">New Modified Value</span>
                  <div className="diff-new">{selectedAudit.newValue || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* INSPECT SECURITY EVENT MODAL (No URL Change) */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title={`Security Telemetry — ${selectedEvent.id}`}
          size="md"
          footer={
            <div className="flex justify-end w-full">
              <Button variant="primary" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="audit-detail-grid">
            <span className="audit-detail-key">Event Type:</span>
            <span className="audit-detail-val font-semibold">{selectedEvent.eventType}</span>

            <span className="audit-detail-key">Account User:</span>
            <span className="audit-detail-val">{selectedEvent.user}</span>

            <span className="audit-detail-key">IP Address:</span>
            <span className="audit-detail-val">{selectedEvent.ipAddress}</span>

            <span className="audit-detail-key">Geographic Origin:</span>
            <span className="audit-detail-val">{selectedEvent.location}</span>

            <span className="audit-detail-key">Auth Status:</span>
            <span className="audit-detail-val">
              <span className={`status-badge ${selectedEvent.status === 'Success' ? 'status-active' : 'status-suspended'}`}>
                {selectedEvent.status}
              </span>
            </span>

            <span className="audit-detail-key">Recorded Time:</span>
            <span className="audit-detail-val">{formatDateTime(selectedEvent.timestamp)}</span>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuditSecurity;
