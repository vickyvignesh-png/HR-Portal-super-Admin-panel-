import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import {
  ReceiptIndianRupee,
  Download,
  Eye,
  FileText,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Printer,
  Ban,
  ArrowRight
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
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';
import { PAYMENT_STATUSES } from '../../utils/constants';
import './PaymentsInvoices.css';

export const PaymentsInvoices = () => {
  const { dataVersion, triggerRefresh } = useApp();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortColumn, setSortColumn] = useState('paymentDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // In-page modals (ZERO URL changes on View/Invoice/Refund)
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [invoicePayment, setInvoicePayment] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  const payments = useMemo(() => {
    return storageService.getPayments();
  }, [dataVersion]);

  // Methods list for filter
  const methodOptions = useMemo(() => {
    const set = new Set(payments.map((p) => p.gateway || p.method).filter(Boolean));
    return Array.from(set);
  }, [payments]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const successful = payments.filter((p) => p.status === 'Successful');
    const failed = payments.filter((p) => p.status === 'Failed');
    const refunded = payments.filter((p) => p.status === 'Refunded');

    const totalSuccessfulVolume = successful.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalRefundedVolume = refunded.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      todayRevenue: 14500, // Today's revenue in INR
      monthlyRevenue: totalSuccessfulVolume > 0 ? totalSuccessfulVolume + 85000 : 98500,
      successfulCount: successful.length,
      failedCount: failed.length,
      refundedAmount: totalRefundedVolume > 0 ? totalRefundedVolume : 199
    };
  }, [payments]);

  // Filtering & Sorting
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.id && p.id.toLowerCase().includes(lower)) ||
          (p.companyName && p.companyName.toLowerCase().includes(lower)) ||
          (p.companyId && p.companyId.toLowerCase().includes(lower)) ||
          (p.subscriptionId && p.subscriptionId.toLowerCase().includes(lower)) ||
          (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(lower))
      );
    }

    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (methodFilter) {
      result = result.filter(
        (p) => p.gateway === methodFilter || p.method === methodFilter
      );
    }

    if (dateFilter) {
      result = result.filter((p) => p.paymentDate && p.paymentDate.startsWith(dateFilter));
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
  }, [payments, searchTerm, statusFilter, methodFilter, dateFilter, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage]);

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
    setMethodFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  const handleOpenDetails = (payment) => {
    setSelectedPayment(payment);
  };

  const handleOpenInvoice = (payment) => {
    setInvoicePayment(payment);
  };

  const handleConfirmRefund = () => {
    if (!refundTarget) return;

    storageService.refundPayment(refundTarget.id, refundReason || 'Requested via Super Admin Demo Console');
    triggerRefresh();

    addToast({
      type: 'success',
      title: 'Refund Simulated',
      message: `Simulated refund of ${formatCurrency(refundTarget.amount)} for payment ${refundTarget.id}.`
    });

    setRefundTarget(null);
    setRefundReason('');
  };

  const handleDownloadPDF = (payment) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235);
      doc.text('HR PORTAL — TAX INVOICE', 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Invoice No: ${payment.invoiceNumber}`, 14, 30);
      doc.text(`Invoice Date: ${formatDate(payment.invoiceDate || payment.paymentDate)}`, 14, 36);
      doc.text(`Payment Status: ${payment.status}`, 14, 42);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 48, 196, 48);

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('BILLED TO:', 14, 56);
      doc.text(payment.companyName, 14, 62);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Company ID: ${payment.companyId}`, 14, 68);
      doc.text(`Subscription ID: ${payment.subscriptionId}`, 14, 74);

      // Amount Breakdown
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('Subscription Platform Services', 14, 90);
      doc.text(`INR ${payment.amount.toFixed(2)}`, 150, 90);

      doc.line(14, 98, 196, 98);
      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235);
      doc.text(`Total Settled: INR ${payment.amount.toFixed(2)}`, 14, 110);

      doc.save(`${payment.invoiceNumber || payment.id}.pdf`);
      addToast({
        type: 'success',
        title: 'PDF Exported',
        message: `Saved ${payment.invoiceNumber || payment.id}.pdf to device.`
      });
    } catch {
      window.print();
    }
  };

  const handleExportCSV = () => {
    const cols = [
      { key: 'id', label: 'Payment ID' },
      { key: 'companyName', label: 'Company' },
      { key: 'companyId', label: 'Company ID' },
      { key: 'subscriptionId', label: 'Subscription ID' },
      { key: 'amount', label: 'Amount' },
      { key: 'method', label: 'Payment Method' },
      { key: 'gateway', label: 'Gateway' },
      { key: 'paymentDate', label: 'Payment Date' },
      { key: 'status', label: 'Status' },
      { key: 'invoiceNumber', label: 'Invoice No' }
    ];
    exportToCSV('payments_billing_records', filteredPayments, cols);
    addToast({
      type: 'info',
      title: 'CSV Exported',
      message: `Exported ${filteredPayments.length} billing records.`
    });
  };

  // Exact Main Table Columns:
  // 1. S.No
  // 2. Payment ID
  // 3. Company
  // 4. Subscription ID
  // 5. Amount (INR)
  // 6. Payment Method
  // 7. Payment Date
  // 8. Status
  // 9. Action (Eye for Details, Receipt for Invoice Preview)
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
      label: 'Payment ID',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-primary">{row.id}</span>
      )
    },
    {
      key: 'companyName',
      label: 'Company',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-primary">{row.companyName}</span>
          <div className="text-muted text-xs">{row.companyId}</div>
        </div>
      )
    },
    {
      key: 'subscriptionId',
      label: 'Subscription ID',
      sortable: true,
      render: (row) => (
        <span className="text-secondary">{row.subscriptionId}</span>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-primary">{formatCurrency(row.amount)}</span>
      )
    },
    {
      key: 'method',
      label: 'Payment Method',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium">{row.gateway || 'Corporate'}</span>
          <div className="text-muted text-xs">{row.method}</div>
        </div>
      )
    },
    {
      key: 'paymentDate',
      label: 'Payment Date',
      sortable: true,
      render: (row) => formatDate(row.paymentDate)
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
        <div className="billing-action-icons">
          <button
            type="button"
            className="billing-action-btn"
            title="View Payment Details"
            aria-label="View Payment Details"
            onClick={() => handleOpenDetails(row)}
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            className="billing-action-btn"
            title="Invoice Preview"
            aria-label="Invoice Preview"
            onClick={() => handleOpenInvoice(row)}
          >
            <ReceiptIndianRupee size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="billing-container">
      <PageHeader
        title="Payments & Invoices"
        actions={
          <Button variant="secondary" icon={Download} onClick={handleExportCSV}>
            Export CSV
          </Button>
        }
      />

      {/* Summary Section (All in Indian Rupees INR) */}
      <div className="billing-summary-grid">
        <div className="billing-summary-card">
          <span className="summary-card-title">Today's Revenue</span>
          <span className="summary-card-value text-blue">
            {formatCurrency(summaryMetrics.todayRevenue)}
          </span>
        </div>
        <div className="billing-summary-card">
          <span className="summary-card-title">Monthly Revenue</span>
          <span className="summary-card-value text-blue">
            {formatCurrency(summaryMetrics.monthlyRevenue)}
          </span>
        </div>
        <div className="billing-summary-card">
          <span className="summary-card-title">Successful Payments</span>
          <span className="summary-card-value text-green">
            {summaryMetrics.successfulCount}
          </span>
        </div>
        <div className="billing-summary-card">
          <span className="summary-card-title">Failed Payments</span>
          <span className="summary-card-value text-red">
            {summaryMetrics.failedCount}
          </span>
        </div>
        <div className="billing-summary-card">
          <span className="summary-card-title">Refunded Amount</span>
          <span className="summary-card-value text-purple">
            {formatCurrency(summaryMetrics.refundedAmount)}
          </span>
        </div>
      </div>

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

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Payment status filter"
          >
            <option value="">All Statuses</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Payment method filter"
          >
            <option value="">All Payment Methods</option>
            {methodOptions.map((m) => (
              <option key={m} value={m}>
                {m}
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

          {(searchTerm || statusFilter || methodFilter || dateFilter) && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset billing filters"
            >
              <RotateCcw size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="table-container">
        {/* Main Table with exact columns */}
        <DataTable
          columns={tableColumns}
          data={paginatedData}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          currentPage={currentPage}
          pageSize={pageSize}
          emptyTitle="No payment records found"
          emptyDescription="No transaction matches the current filter settings."
          emptyActionLabel="Clear Filters"
          onEmptyAction={handleResetFilters}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPayments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* PAYMENT DETAILS MODAL (No URL Change) */}
      {selectedPayment && (
        <Modal
          isOpen={Boolean(selectedPayment)}
          onClose={() => setSelectedPayment(null)}
          title={`Payment Details — ${selectedPayment.id}`}
          size="lg"
          footer={
            <div className="flex justify-between w-full">
              {selectedPayment.status === 'Successful' ? (
                <Button
                  variant="dangerOutline"
                  icon={RotateCcw}
                  onClick={() => {
                    const p = selectedPayment;
                    setSelectedPayment(null);
                    setRefundTarget(p);
                  }}
                >
                  Simulate Refund
                </Button>
              ) : (
                <div></div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  icon={ReceiptIndianRupee}
                  onClick={() => {
                    const p = selectedPayment;
                    setSelectedPayment(null);
                    setInvoicePayment(p);
                  }}
                >
                  View Invoice
                </Button>
                <Button variant="primary" onClick={() => setSelectedPayment(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="billing-detail-scroll">
            <div className="billing-section-card">
              <div className="billing-section-title">Transaction Information</div>
              <div className="billing-grid-2">
                <div className="billing-field-item">
                  <span className="billing-field-label">Payment ID</span>
                  <span className="billing-field-val">{selectedPayment.id}</span>
                </div>
                <div className="billing-field-item">
                  <span className="billing-field-label">Transaction Reference</span>
                  <span className="billing-field-val">{selectedPayment.transactionId || 'N/A'}</span>
                </div>
                <div className="billing-field-item">
                  <span className="billing-field-label">Company Name</span>
                  <span className="billing-field-val">{selectedPayment.companyName} ({selectedPayment.companyId})</span>
                </div>
                <div className="billing-field-item">
                  <span className="billing-field-label">Subscription ID</span>
                  <span className="billing-field-val">{selectedPayment.subscriptionId}</span>
                </div>
                <div className="billing-field-item">
                  <span className="billing-field-label">Settled Amount</span>
                  <span className="billing-field-val text-blue font-bold">
                    {formatCurrency(selectedPayment.amount)}
                  </span>
                </div>
                <div className="billing-field-item">
                  <span className="billing-field-label">Payment Status</span>
                  <span className="billing-field-val">
                    <StatusBadge status={selectedPayment.status} />
                  </span>
                </div>
              </div>
            </div>

            <div className="billing-section-card">
              <div className="billing-section-title">Gateway & Settlement</div>
              <div className="billing-grid-2">
                <div className="billing-field-item">
                  <span className="billing-field-label">Payment Gateway</span>
                  <span className="billing-field-val">{selectedPayment.gateway || 'Stripe Corporate'}</span>
                </div>
                <div className="billing-field-item">
                  <span className="billing-field-label">Payment Method</span>
                  <span className="billing-field-val">{selectedPayment.method}</span>
                </div>
                <div className="billing-field-item">
                  <span className="billing-field-label">Payment Date & Time</span>
                  <span className="billing-field-val">{formatDate(selectedPayment.paymentDate)}</span>
                </div>
                <div className="billing-field-item">
                  <span className="billing-field-label">Invoice Number</span>
                  <span className="billing-field-val">{selectedPayment.invoiceNumber || 'INV-2025-001'}</span>
                </div>
                {selectedPayment.failureReason && (
                  <div className="billing-field-item full-width">
                    <span className="billing-field-label">Reason / Log</span>
                    <span className="billing-field-val text-red">{selectedPayment.failureReason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* INVOICE PREVIEW MODAL (Print & PDF download on same URL) */}
      {invoicePayment && (
        <Modal
          isOpen={Boolean(invoicePayment)}
          onClose={() => setInvoicePayment(null)}
          title={`Invoice Preview — ${invoicePayment.invoiceNumber || invoicePayment.id}`}
          size="lg"
          footer={
            <div className="flex justify-between w-full">
              <Button
                variant="secondary"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  icon={Download}
                  onClick={() => handleDownloadPDF(invoicePayment)}
                >
                  Download PDF
                </Button>
                <Button variant="primary" onClick={() => setInvoicePayment(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="invoice-card">
            <div className="invoice-header-row">
              <div>
                <h3 className="invoice-title">HR PORTAL</h3>
                <p className="text-muted text-xs">Enterprise Super Admin Cloud Services</p>
                <p className="text-muted text-xs">Tax Invoice & Billing Receipt</p>
              </div>
              <div className="invoice-meta-info">
                <div className="font-bold">{invoicePayment.invoiceNumber || 'INV-2025-001'}</div>
                <div className="text-muted text-xs">Date: {formatDate(invoicePayment.invoiceDate || invoicePayment.paymentDate)}</div>
                <div className="mt-1">
                  <StatusBadge status={invoicePayment.status} />
                </div>
              </div>
            </div>

            <div className="invoice-parties">
              <div className="party-box">
                <span className="party-title">Billed To</span>
                <span className="font-bold">{invoicePayment.companyName}</span>
                <span className="text-secondary text-xs">{invoicePayment.companyId}</span>
              </div>
              <div className="party-box">
                <span className="party-title">Settlement Info</span>
                <span className="text-secondary text-xs">Gateway: {invoicePayment.gateway}</span>
                <span className="text-secondary text-xs">Method: {invoicePayment.method}</span>
                <span className="text-secondary text-xs">Ref: {invoicePayment.transactionId || 'TXN-998811'}</span>
              </div>
            </div>

            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>HR Portal Subscription Platform Licensing</td>
                  <td className="font-semibold">{formatCurrency(invoicePayment.amount)}</td>
                </tr>
              </tbody>
            </table>

            <div className="invoice-summary-box">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(invoicePayment.amount)}</span>
              </div>
              <div className="summary-row total">
                <span>Total Settled</span>
                <span className="text-blue">{formatCurrency(invoicePayment.amount)}</span>
              </div>
            </div>

            <div className="simulation-note mt-6">
              <strong>Simulated Demo Invoice:</strong> Generated locally in browser. No live banking transaction was executed.
            </div>
          </div>
        </Modal>
      )}

      {/* SIMULATED REFUND CONFIRMATION MODAL */}
      {refundTarget && (
        <Modal
          isOpen={Boolean(refundTarget)}
          onClose={() => setRefundTarget(null)}
          title={`Simulate Refund — ${refundTarget.id}`}
          size="md"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="secondary" onClick={() => setRefundTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmRefund}>
                Confirm Refund
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            <p className="text-secondary">
              You are simulating a refund of <strong>{formatCurrency(refundTarget.amount)}</strong> for{' '}
              <strong>{refundTarget.companyName}</strong> ({refundTarget.id}).
            </p>
            <div className="form-group">
              <label className="form-label">
                Refund Reason / Audit Note <span className="required-star">*</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Demonstration refund request, billing dispute resolution..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentsInvoices;
