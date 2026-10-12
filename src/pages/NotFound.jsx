import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="card max-w-560 mx-auto text-center mt-8">
      <div className="empty-state">
        <div className="stat-icon-wrapper stat-icon-red icon-lg mx-auto">
          <AlertTriangle size={32} />
        </div>
        <h2 className="empty-state-title text-lg-title mt-3">
          404 — Page Not Found
        </h2>
        <p className="empty-state-description">
          The Super Admin module or endpoint you requested does not exist or has been relocated.
        </p>
        <Button
          variant="primary"
          icon={Home}
          onClick={() => navigate('/')}
          className="mt-4"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
