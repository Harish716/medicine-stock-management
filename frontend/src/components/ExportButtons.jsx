import { useState } from 'react';
import { FileDown, FileText, Loader2 } from 'lucide-react';
import { exportCSV, exportPDF } from '../utils/export';

export default function ExportButtons({ medicines, filters }) {
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleCSV = () => {
    exportCSV(medicines);
  };

  const handlePDF = async () => {
    setPdfLoading(true);
    // Yield to the browser to update the button state before the sync PDF work
    await new Promise((r) => setTimeout(r, 50));
    try {
      exportPDF(medicines, filters);
    } finally {
      setPdfLoading(false);
    }
  };

  const disabled = medicines.length === 0;

  return (
    <div className="export-group">
      <button
        id="export-csv-btn"
        className="btn btn-export"
        onClick={handleCSV}
        disabled={disabled}
        title={disabled ? 'No records to export' : 'Export as CSV / Excel'}
      >
        <FileDown size={14} />
        CSV
      </button>

      <button
        id="export-pdf-btn"
        className="btn btn-export"
        onClick={handlePDF}
        disabled={disabled || pdfLoading}
        title={disabled ? 'No records to export' : 'Export as PDF'}
      >
        {pdfLoading
          ? <Loader2 size={14} className="spin-icon" />
          : <FileText size={14} />}
        PDF
      </button>
    </div>
  );
}
