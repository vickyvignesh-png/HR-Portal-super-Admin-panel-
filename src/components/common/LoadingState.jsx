import React from 'react';

export const LoadingState = ({ message = 'Loading records...' }) => {
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};
