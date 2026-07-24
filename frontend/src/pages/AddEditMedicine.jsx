import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MedicineForm from '../components/MedicineForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getMedicine } from '../services/api';

export default function AddEditMedicine() {
  const { id } = useParams();
  const isEdit  = Boolean(id);

  const [existing, setExisting] = useState(null);
  const [loading, setLoading]   = useState(isEdit);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!isEdit) return;
    const fetch = async () => {
      setLoading(true); setError('');
      try {
        const res = await getMedicine(id);
        setExisting(res.data.data);
      } catch (err) {
        const status = err.response?.status;
        setError(
          status === 404
            ? 'Record not found. It may have been deleted.'
            : err.response?.data?.message || 'Failed to load record.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <Link to="/stock" className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }}>
          <ArrowLeft size={14} /> Back to Stock Register
        </Link>
        <h1>{isEdit ? 'Edit Medicine Record' : 'Add New Medicine Entry'}</h1>
        <p>
          {isEdit
            ? 'Update the record below. Balance, status and days-to-expiry are calculated automatically.'
            : 'Fill in the details below. Balance, status and days-to-expiry are calculated automatically.'}
        </p>
      </div>

      <div className="form-card">
        {loading && <LoadingSpinner message="Loading record…" />}
        {!loading && error && (
          <>
            <ErrorMessage message={error} />
            <div style={{ marginTop: '16px' }}>
              <Link to="/stock" className="btn btn-secondary">← Back to Stock Register</Link>
            </div>
          </>
        )}
        {!loading && !error && <MedicineForm existing={isEdit ? existing : null} />}
      </div>
    </div>
  );
}
