/**
 * Export JSON array data to Excel readable CSV file with BOM UTF-8
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header definitions [{ label: 'Nama', key: 'name' }]
 * @param {String} filename - Output filename without extension
 */
export const exportToExcel = (data, headers, filename = 'Laporan_Kinderfun') => {
  if (!data || !data.length) return;

  // Build header row
  const headerRow = headers.map(h => `"${h.label}"`).join(',');

  // Build content rows
  const bodyRows = data.map(item => {
    return headers.map(h => {
      let val = item[h.key] ?? '';
      if (typeof val === 'string') {
        val = val.replace(/"/g, '""'); // Escape double quotes
      }
      return `"${val}"`;
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headerRow, ...bodyRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
