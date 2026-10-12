import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange
}) => {
  if (totalPages <= 1 && totalItems <= pageSize) {
    return (
      <div className="pagination-container">
        <span className="pagination-info">Showing {totalItems} of {totalItems} entries</span>
      </div>
    );
  }

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-container">
      <span className="pagination-info">
        Showing {totalItems > 0 ? startIdx : 0} to {endIdx} of {totalItems} entries
      </span>
      <div className="pagination-controls">
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            className={`page-btn ${currentPage === p ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          className="page-btn"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
