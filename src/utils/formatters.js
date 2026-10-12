export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const hasDecimals = Number(amount) % 1 !== 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * Returns a CSS class name like 'w-pct-75' rounded to nearest 5% step,
 * satisfying strict "NO inline style={{ ... }}" requirement!
 */
export const getProgressWidthClass = (pct) => {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const step = Math.round(clamped / 5) * 5;
  return `w-pct-${step}`;
};

export const exportToCSV = (filename, data, headers) => {
  if (!data || !data.length) return;
  
  const headerKeys = headers ? headers.map(h => h.key) : Object.keys(data[0]);
  const headerLabels = headers ? headers.map(h => h.label) : Object.keys(data[0]);
  
  const csvRows = [];
  csvRows.push(headerLabels.join(','));
  
  for (const row of data) {
    const values = headerKeys.map(key => {
      let val = row[key];
      if (val === null || val === undefined) val = '';
      val = String(val).replace(/"/g, '""');
      if (val.includes(',') || val.includes('\n') || val.includes('"')) {
        val = `"${val}"`;
      }
      return val;
    });
    csvRows.push(values.join(','));
  }
  
  const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(csvBlob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
