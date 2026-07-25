import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './calculations';

// ─── Shared column config ─────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'entry_id',      label: 'Entry ID'     },
  { key: 'medicine_name', label: 'Medicine'      },
  { key: 'batch_no',      label: 'Batch No.'     },
  { key: 'quantity_in',   label: 'Qty In'        },
  { key: 'quantity_out',  label: 'Qty Out'       },
  { key: 'balance',       label: 'Balance'       },
  { key: 'expiry_date',   label: 'Expiry Date'   },
  { key: 'date',          label: 'Entry Date'    },
  { key: 'status',        label: 'Status'        },
];

// ─── CSV Export ───────────────────────────────────────────────────────────────
export function exportCSV(medicines, filename = 'stock-register') {
  const headers = COLUMNS.map((c) => `"${c.label}"`).join(',');

  const rows = medicines.map((m) =>
    COLUMNS.map(({ key }) => {
      let val = m[key];
      if (key === 'expiry_date' || key === 'date') val = formatDate(val);
      if (val === null || val === undefined) val = '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csv = [headers, ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${filename}-${today()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF Export ───────────────────────────────────────────────────────────────
export function exportPDF(medicines, filters = {}, filename = 'stock-register') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header block
  doc.setFillColor(17, 24, 39);          // dark bg
  doc.rect(0, 0, 297, 22, 'F');

  doc.setTextColor(241, 245, 249);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MedStock — Medicine Stock Register', 14, 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(139, 154, 177);
  doc.text('Primary Health Centre', 14, 16);

  // Right-side meta
  const meta = [
    `Generated: ${new Date().toLocaleString('en-IN')}`,
    filters.search ? `Search: "${filters.search}"` : '',
    filters.status && filters.status !== 'All' ? `Status: ${filters.status}` : '',
    `Records: ${medicines.length}`,
  ].filter(Boolean).join('   |   ');
  doc.text(meta, 283, 10, { align: 'right' });

  // Summary stats bar
  const stats = buildStats(medicines);
  const statY = 26;
  const boxes = [
    { label: 'Total',         val: stats.total,        color: [59, 130, 246]  },
    { label: 'OK',            val: stats.ok,           color: [16, 185, 129]  },
    { label: 'Low Stock',     val: stats.lowStock,     color: [245, 158, 11]  },
    { label: 'Expiring Soon', val: stats.expiringSoon, color: [249, 115, 22]  },
    { label: 'Expired',       val: stats.expired,      color: [239, 68, 68]   },
  ];
  const boxW = 40, boxH = 12, startX = 14;
  boxes.forEach(({ label, val, color }, i) => {
    const x = startX + i * (boxW + 4);
    doc.setFillColor(...color, 0.15);
    doc.setDrawColor(...color);
    doc.roundedRect(x, statY, boxW, boxH, 2, 2, 'FD');
    doc.setTextColor(...color);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(String(val), x + boxW / 2, statY + 5, { align: 'center' });
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x + boxW / 2, statY + 10, { align: 'center' });
  });

  // Table
  autoTable(doc, {
    startY: statY + boxH + 6,
    head: [COLUMNS.map((c) => c.label)],
    body: medicines.map((m) =>
      COLUMNS.map(({ key }) => {
        if (key === 'expiry_date' || key === 'date') return formatDate(m[key]);
        if (m[key] === null || m[key] === undefined) return '—';
        return String(m[key]);
      })
    ),
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      textColor: [241, 245, 249],
      lineColor: [31, 45, 69],
      lineWidth: 0.3,
      fillColor: [17, 24, 39],
    },
    headStyles: {
      fillColor: [26, 34, 53],
      textColor: [139, 154, 177],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [17, 24, 39],
    },
    bodyStyles: {
      fillColor: [20, 28, 44],
    },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 8) {
        const status = data.cell.raw;
        const colors = {
          'OK':            [16, 185, 129],
          'Low Stock':     [245, 158, 11],
          'Expiring Soon': [249, 115, 22],
          'Expired':       [239, 68, 68],
        };
        if (colors[status]) data.cell.styles.textColor = colors[status];
      }
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(74, 90, 114);
    doc.text(
      `Page ${i} of ${pageCount}  —  MedStock PHC Stock Register`,
      148.5, 207, { align: 'center' }
    );
  }

  doc.save(`${filename}-${today()}.pdf`);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10);
}

function buildStats(medicines) {
  return {
    total:        medicines.length,
    ok:           medicines.filter((m) => m.status === 'OK').length,
    lowStock:     medicines.filter((m) => m.status === 'Low Stock').length,
    expiringSoon: medicines.filter((m) => m.status === 'Expiring Soon').length,
    expired:      medicines.filter((m) => m.status === 'Expired').length,
  };
}
