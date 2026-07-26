/**
 * Direct Print Helper Utility
 * Triggers clean direct print of HTML element/content via isolated iframe
 * preventing raw browser window.print dialog overlays or messy headers/footers.
 */

export const directPrint = ({ title, contentHtml }) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title || 'Cetak Dokumen Kinderfun'}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #ea580c;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .header-logo {
            height: 48px;
            width: auto;
            object-fit: contain;
            display: block;
            margin-bottom: 4px;
          }
          .header-subtitle {
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
          }
          .badge {
            display: inline-block;
            padding: 4px 8px;
            background: #fff7ed;
            color: #c2410c;
            border: 1px solid #ffedd5;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th {
            background-color: #f8fafc;
            color: #334155;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 10px;
            border-bottom: 1px solid #cbd5e1;
            padding: 8px 10px;
            text-align: left;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 11px;
          }
          tr:nth-child(even) td {
            background-color: #f8fafc;
          }
          .summary-cards {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
          }
          .card {
            flex: 1;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            background-color: #f8fafc;
          }
          .card-label {
            font-size: 10px;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
          }
          .card-value {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <img src="/kinderfun.jpg" class="header-logo" alt="Kinderfun Logo" />
            <div class="header-subtitle">${title}</div>
          </div>
          <div class="badge">Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        ${contentHtml}
        <div class="footer">
          <div>Kinderfun Playground System - Dokumen Laporan Resmi</div>
          <div>Halaman 1 dari 1</div>
        </div>
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 300);
};
