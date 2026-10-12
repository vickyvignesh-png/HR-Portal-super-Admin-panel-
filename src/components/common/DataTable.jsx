import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';

export const DataTable = ({
  columns = [],
  data = [],
  sortColumn,
  sortDirection = 'asc',
  onSort,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  currentPage = 1,
  pageSize = 10
}) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  const handleHeaderClick = (col) => {
    if (col.sortable && onSort) {
      onSort(col.key);
    }
  };

  const renderSortIcon = (colKey) => {
    if (sortColumn !== colKey) {
      return <ArrowUpDown size={13} className="text-muted" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={13} className="text-blue" />
    ) : (
      <ArrowDown size={13} className="text-blue" />
    );
  };

  // Safe numerical calculations for S.No
  const safePage = Number(currentPage) > 0 ? Number(currentPage) : 1;
  const safeSize = Number(pageSize) > 0 ? Number(pageSize) : (data.length || 10);

  return (
    <div className="table-scroll-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? 'sortable' : ''}
                onClick={() => handleHeaderClick(col)}
              >
                <div className="th-content">
                  <span>{col.label}</span>
                  {col.sortable && renderSortIcon(col.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => {
            const rowIndex = typeof idx === 'number' && !isNaN(idx) ? idx : 0;
            const calculatedSNo = (safePage - 1) * safeSize + rowIndex + 1;

            return (
              <tr key={row.id || idx}>
                {columns.map((col) => {
                  let cellContent;

                  if (col.key === 'sNo' || col.key === 'sno') {
                    // Central S.No calculation: (safePage - 1) * safeSize + rowIndex + 1
                    // Strictly guaranteed never to be NaN or undefined!
                    if (col.render) {
                      cellContent = col.render(row, rowIndex, calculatedSNo);
                    } else {
                      cellContent = (
                        <span className="font-medium text-secondary">
                          {calculatedSNo}
                        </span>
                      );
                    }
                  } else if (col.render) {
                    cellContent = col.render(row, rowIndex, calculatedSNo);
                  } else {
                    cellContent = row[col.key];
                  }

                  return <td key={col.key}>{cellContent}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
