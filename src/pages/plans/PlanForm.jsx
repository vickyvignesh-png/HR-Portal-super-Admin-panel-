import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Layers } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { storageService } from '../../services/storageService';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PLAN_STATUSES } from '../../utils/constants';
import '../../styles/plans.css';

export const PlanForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { triggerRefresh } = useApp();
  const { addToast } = useToast();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 199,
    billingCycle: 'Monthly',
    trialPeriod: 14,
    status: 'Active',
    adminUsersLimit: 5,
    jobLimit: 25,
    candidateAlertLimit: 500,
    resumeAccessLimit: 250,
    screeningLimit: 150,
    interviewLimit: 100,
    storageLimit: '15 GB',
    mobileAppAccess: true,
    reportsAccess: true,
    addonAccess: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      const existing = storageService.getPlanById(id);
      if (existing) {
        setFormData(existing);
      } else {
        navigate('/plans');
      }
    }
  }, [id, isEdit, navigate]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!formData.name.trim()) errs.name = 'Plan Name is required';
    if (!formData.description.trim()) errs.description = 'Plan Description is required';
    if (formData.price < 0) errs.price = 'Price must be 0 or positive';
    if (formData.jobLimit <= 0) errs.jobLimit = 'Job limit must be at least 1';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    storageService.savePlan(formData);
    triggerRefresh();

    addToast({
      type: 'success',
      title: isEdit ? 'Plan Updated' : 'Plan Created',
      message: `${formData.name} was successfully saved into demo catalog.`
    });

    navigate('/plans');
  };

  return (
    <div className="dashboard-container">
      <PageHeader
        title={isEdit ? `Edit Plan: ${formData.name}` : 'Create Subscription Plan'}
        actions={
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/plans')}>
            Back to Plans
          </Button>
        }
      />

      <div className="card max-w-860 mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="card-header">
            <h3 className="card-title">General Plan Details</h3>
          </div>

          <div className="company-info-grid">
            <Input
              label="Plan Name"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={errors.name}
              placeholder="e.g. Enterprise Accelerator"
            />

            <Select
              label="Billing Cycle"
              value={formData.billingCycle}
              onChange={(e) => handleChange('billingCycle', e.target.value)}
              options={['Monthly', 'Annual', 'Quarterly']}
            />

            <Input
              label="Price (₹ INR)"
              type="number"
              required
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              error={errors.price}
              min="0"
              step="1"
            />

            <Input
              label="Free Trial Period (Days)"
              type="number"
              value={formData.trialPeriod}
              onChange={(e) => handleChange('trialPeriod', parseInt(e.target.value, 10) || 0)}
            />

            <Select
              label="Plan Status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={PLAN_STATUSES}
            />

            <Input
              label="Encrypted Storage Limit"
              value={formData.storageLimit}
              onChange={(e) => handleChange('storageLimit', e.target.value)}
              placeholder="e.g. 50 GB"
            />
          </div>

          <div className="form-group mt-4">
            <label className="form-label">
              Plan Description <span className="required-star">*</span>
            </label>
            <textarea
              className={`form-textarea ${errors.description ? 'has-error' : ''}`}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Summary of this tier's target audience and business benefits..."
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="card-header mt-6">
            <h3 className="card-title">Recruitment Operational Quotas</h3>
          </div>

          <div className="company-info-grid">
            <Input
              label="Job Postings Limit"
              type="number"
              required
              value={formData.jobLimit}
              onChange={(e) => handleChange('jobLimit', parseInt(e.target.value, 10) || 0)}
              error={errors.jobLimit}
            />

            <Input
              label="Candidate Alert Limit"
              type="number"
              value={formData.candidateAlertLimit}
              onChange={(e) => handleChange('candidateAlertLimit', parseInt(e.target.value, 10) || 0)}
            />

            <Input
              label="Resume Access Limit"
              type="number"
              value={formData.resumeAccessLimit}
              onChange={(e) => handleChange('resumeAccessLimit', parseInt(e.target.value, 10) || 0)}
            />

            <Input
              label="Candidate Screening Limit"
              type="number"
              value={formData.screeningLimit}
              onChange={(e) => handleChange('screeningLimit', parseInt(e.target.value, 10) || 0)}
            />

            <Input
              label="Interview Limit"
              type="number"
              value={formData.interviewLimit}
              onChange={(e) => handleChange('interviewLimit', parseInt(e.target.value, 10) || 0)}
            />

            <Input
              label="Admin User Seats"
              type="number"
              value={formData.adminUsersLimit}
              onChange={(e) => handleChange('adminUsersLimit', parseInt(e.target.value, 10) || 0)}
            />
          </div>

          <div className="card-header mt-6">
            <h3 className="card-title">Feature Entitlements</h3>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={formData.mobileAppAccess}
                onChange={(e) => handleChange('mobileAppAccess', e.target.checked)}
              />
              <span>Enable Employer Mobile App Access for hiring managers</span>
            </label>

            <label className="form-checkbox-label">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={formData.reportsAccess}
                onChange={(e) => handleChange('reportsAccess', e.target.checked)}
              />
              <span>Enable Advanced Platform Reports & Analytics exports</span>
            </label>

            <label className="form-checkbox-label">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={formData.addonAccess}
                onChange={(e) => handleChange('addonAccess', e.target.checked)}
              />
              <span>Allow Purchase of Custom Add-ons & Quota Top-ups</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="secondary" onClick={() => navigate('/plans')}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={Save}>
              Save Subscription Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
