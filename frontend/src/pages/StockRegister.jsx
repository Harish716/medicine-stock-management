import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import SearchFilter from '../components/SearchFilter';
import MedicineTable from '../components/MedicineTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ExportButtons from '../components/ExportButtons';
import { getMedicines, deleteMedicine } from '../services/api';

export default function StockRegister() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('All');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMedicines = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await getMedicines({
        search: search || undefined,
        status: status !== 'All' ? status : undefined,
        sort: sortField,
        order: sortOrder,
      });
      setMedicines(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [search, status, sortField, sortOrder]);

  useEffect(() => {
    const debounce = setTimeout(fetchMedicines, 300);
    return () => clearTimeout(debounce);
  }, [fetchMedicines]);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortOrder('asc'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteMedicine(id);
      showToast(`"${name}" deleted successfully`);
      fetchMedicines();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete record', 'error');
    }
  };

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Stock Register</h1>
          <p>All medicine stock entries — search, filter, and manage records</p>
        </div>
        <Link to="/add" className="btn btn-primary">
          <PlusCircle size={16} /> Add Entry
        </Link>
      </div>

      <SearchFilter
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        resultCount={medicines.length}
      />

      <ExportButtons
        medicines={medicines}
        filters={{ search, status }}
      />

      {loading && <LoadingSpinner message="Loading stock records…" />}
      {!loading && error && <ErrorMessage message={error} onRetry={fetchMedicines} />}
      {!loading && !error && (
        <MedicineTable
          medicines={medicines}
          onDelete={handleDelete}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
