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

export const printThermalReceipt = (receipt) => {
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

  const formatPrice = (val) => {
    return 'Rp ' + Number(val).toLocaleString('id-ID');
  };

  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Struk Tiket ${receipt.trx_code}</title>
        <style>
          @page {
            size: 58mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            color: #000;
            margin: 0;
            padding: 2mm 3mm;
            font-size: 10px;
            line-height: 1.3;
            width: 52mm;
            box-sizing: border-box;
          }
          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
          }
          .bold {
            font-weight: bold;
          }
          .header-logo {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            object-fit: contain;
            margin-bottom: 4px;
            border: 1px solid #000;
          }
          .store-name {
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 0.5px;
          }
          .slogan {
            font-size: 8px;
            margin-top: 1px;
            margin-bottom: 2px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 5px 0;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
          }
          .info-table td {
            padding: 1px 0;
            font-size: 9px;
            vertical-align: top;
          }
          .footer-msg {
            font-size: 8px;
            margin-top: 6px;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="text-center">
          <img src="/kinderfun.jpg" class="header-logo" alt="Logo" />
          <div class="store-name">KINDERFUN PLAYGROUND</div>
          <div class="slogan">Fun for kids, peace of mind for parents</div>
        </div>
        
        <div class="divider"></div>
        
        <table class="info-table">
          <tr>
            <td>No. Tiket:</td>
            <td class="text-right bold">${receipt.trx_code}</td>
          </tr>
          <tr>
            <td>Waktu:</td>
            <td class="text-right">${receipt.date}</td>
          </tr>
        </table>
        
        <div class="divider"></div>
        
        <table class="info-table">
          <tr>
            <td colspan="2" class="bold">PELANGGAN:</td>
          </tr>
          <tr>
            <td colspan="2">${receipt.customer_name}</td>
          </tr>
        </table>
        
        <div class="divider"></div>
        
        <table class="info-table">
          <tr>
            <td class="bold">${receipt.package_name}</td>
            <td class="text-right bold">${formatPrice(receipt.amount)}</td>
          </tr>
          <tr>
            <td colspan="2" style="font-size: 8px;">
              ${receipt.is_weekend ? 'Tarif Weekend / Libur' : 'Tarif Hari Kerja (Weekday)'}
            </td>
          </tr>
        </table>
        
        <div class="divider"></div>
        
        <table class="info-table">
          <tr>
            <td>Metode Bayar:</td>
            <td class="text-right uppercase bold">${receipt.payment_method}</td>
          </tr>
          <tr>
            <td class="bold">Total:</td>
            <td class="text-right bold" style="font-size: 11px;">${formatPrice(receipt.amount)}</td>
          </tr>
        </table>
        
        <div class="divider"></div>
        
        <div class="text-center bold" style="font-size: 9px;">
          Poin Kunjungan: +${receipt.points_earned} Poin
        </div>
        
        <div class="divider"></div>
        
        <div class="text-center footer-msg">
          Terima kasih atas kunjungan Anda!<br>
          Selamat bermain! Harap selalu mengawasi si kecil.
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

