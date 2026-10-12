import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = String(status).toLowerCase().replace(/\s+/g, '-');
  
  let statusClass = 'status-active';

  if (['active', 'verified', 'valid', 'successful', 'resolved'].includes(normalized)) {
    statusClass = 'status-active';
  } else if (['pending', 'trial', 'grace-period', 'waiting', 'pending-payment'].includes(normalized)) {
    statusClass = 'status-pending';
  } else if (['suspended', 'blocked', 'failed', 'invalid', 'verification-failed', 'expired', 'cancelled'].includes(normalized)) {
    statusClass = 'status-suspended';
  } else if (['in-progress', 'past-due', 'draft'].includes(normalized)) {
    statusClass = 'status-in-progress';
  } else if (['closed', 'archived', 'inactive', 'not-found'].includes(normalized)) {
    statusClass = 'status-closed';
  } else if (['refunded'].includes(normalized)) {
    statusClass = 'status-refunded';
  }

  return (
    <span className={`status-badge ${statusClass}`}>
      <span className="status-dot"></span>
      {status}
    </span>
  );
};
