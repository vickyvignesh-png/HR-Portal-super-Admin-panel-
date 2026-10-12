import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  ReceiptIndianRupee,
  RotateCcw,
  Ban,
  CheckCircle2,
  Building2,
  Percent
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { storageService } from '../../services/storageService';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import '../../styles/subscriptions.css';

export const SubscriptionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dataVersion, triggerRefresh } = useApp();
  const { addToast } = useToast();

  const [sub, setSub] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const found = storageService.getSubscriptionById(id);
    if (found) {
      setSub(found);
    }
  }, [id, dataVersion]);

  if (!sub) {
    return (
      <div className="card">
        <div className="empty-state">
          <h3>Subscription Record Not Found</h3>
          <p>No active subscription matching ID {id} was located.</p>
          <Button variant="primary" onClick={() => navigate('/subscriptions')}>
            Return to Subscriptions
          </Button>
        </div>
      </div>
    );
  }

  const handleCancel = () => {
    const updated = {
      ...sub,
      status: 'Cancelled',
      cancellationDate: new Date().toISOString().slice(0, 10),
      cancellationReason: cancelReason || 'Cancelled by Super Admin compliance request'
    };
    storageService.saveSubscription(updated);
    triggerRefresh();
    setIsCancelModalOpen(false);
    addToast({
      type: 'warning',
      title: 'Subscription Cancelled',
      message: `Subscription for ${sub.companyName} is now marked as Cancelled.`
    });
  };

  const handleReactivate = () => {
    const updated = {
      ...sub,
      status: 'Active',
      nextRenewalDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    };
    storageService.saveSubscription(updated);
    triggerRefresh();
    addToast({
      type: 'success',
      title: 'Subscription Reactivated',
      message: `Subscription for ${sub.companyName} renewed and active.`
    });
  };

  return (
    <div className="dashboard-container">
      <PageHeader
        title={`${sub.companyName} — Subscription`}
        description={`Subscription ${sub.id} • ${sub.planName} (${sub.planVersion})`}
        badge={<StatusBadge status={sub.status} />}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              icon={ArrowLeft}
              onClick={() => navigate('/subscriptions')}
            >
              Back to Subscriptions
            </Button>

            {sub.status === 'Active' ? (
              <Button
                variant="dangerOutline"
                icon={Ban}
                onClick={() => setIsCancelModalOpen(true)}
              >
                Cancel Subscription
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={RotateCcw}
                onClick={handleReactivate}
              >
                Reactivate Subscription
              </Button>
            )}
          </div>
        }
      />

      {(sub.status === 'Past Due' || sub.status === 'Grace Period') && (
        <div className="renewal-warning-banner">
          <AlertTriangle size={18} />
          <div>
            <strong>Renewal Alert:</strong> This subscription is currently in {sub.status} status. Grace period expires on {formatDate(sub.gracePeriodEndDate)}.
          </div>
        </div>
      )}

      <div className="subscription-details-grid">
        {/* Left Column: Plan and Lifecycle Info */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Subscription Lifecycle & Terms</h3>
            </div>
            <div className="company-info-grid">
              <div className="info-item">
                <span className="info-label">Subscription ID</span>
                <span className="info-value">{sub.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Associated Company</span>
                <span className="info-value">
                  <Link to={`/companies/${sub.companyId}`}>{sub.companyName}</Link>
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Plan Tier</span>
                <span className="info-value">{sub.planName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Plan Version</span>
                <span className="info-value">{sub.planVersion}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Term Start Date</span>
                <span className="info-value">{formatDate(sub.startDate)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Term End Date</span>
                <span className="info-value">{formatDate(sub.endDate)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Next Renewal Date</span>
                <span className="info-value">{formatDate(sub.nextRenewalDate)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Auto-Renewal</span>
                <span className="info-value">{sub.autoRenewal ? 'Enabled (Automatic debit)' : 'Disabled'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Trial Period End</span>
                <span className="info-value">{formatDate(sub.trialEndDate)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Grace Period Deadline</span>
                <span className="info-value">{formatDate(sub.gracePeriodEndDate)}</span>
              </div>
            </div>

            {sub.cancellationDate && (
              <div className="audit-diff-box">
                <div className="diff-col">
                  <span className="diff-label">Cancellation Date</span>
                  <span className="diff-old">{formatDate(sub.cancellationDate)}</span>
                </div>
                <div className="diff-col">
                  <span className="diff-label">Reason Stated</span>
                  <span className="diff-old">{sub.cancellationReason || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Billing Breakdown */}
        <div className="billing-breakdown-card">
          <h3 className="card-title">Billing & Fee Breakdown</h3>
          <p className="card-subtitle">Monthly recurred platform rate</p>

          <div className="billing-line-item">
            <span>Base Plan Rate</span>
            <span>{formatCurrency(sub.planAmount)}</span>
          </div>

          <div className="billing-line-item">
            <span>Applied Promotional Discount</span>
            <span className="text-success">-{formatCurrency(sub.discount)}</span>
          </div>

          <div className="billing-line-item">
            <span>Estimated Taxes (18% GST / VAT)</span>
            <span>+{formatCurrency(sub.tax)}</span>
          </div>

          <div className="billing-line-item total">
            <span>Total Recurring Charge</span>
            <span className="text-blue">{formatCurrency(sub.totalAmount)}</span>
          </div>

          <div className="w-full flex flex-col gap-2 mt-4">
            <Link to="/billing" className="btn btn-primary btn-sm">
              <ReceiptIndianRupee size={14} />
              View Invoices & Receipts
            </Link>
            <Link to="/plans" className="btn btn-secondary btn-sm">
              <CreditCard size={14} />
              Browse Other Plans
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Subscription"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)}>
              Back
            </Button>
            <Button variant="danger" onClick={handleCancel}>
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-secondary">
            Are you sure you want to cancel the subscription for <strong>{sub.companyName}</strong>?
            This will record an audit entry and transition status to Cancelled.
          </p>
          <div className="form-group">
            <label className="form-label">
              Cancellation Reason <span className="required-star">*</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="State reason for records..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
