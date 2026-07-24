import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, Clock, XCircle, PlusCircle, ArrowRight } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import AlertBanner from '../components/AlertBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getMedicines, getAlerts } from '../services/api';
import { formatDate, statusBadgeClass } from '../utils/calculations';

export default function Dashboard() {
  const [stats, setStats]     = useState({ total: 0, lowStock: 0, expiringSoon: 0, expired: 0 });
  const [alerts, setAlerts]   = useState([]);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [allRes, alertsRes] = await Promise.all([
        getMedicines({ sort: 'date', order: 'desc' }),
        getAlerts(),
      ]);
      const all = allRes.data.data;
      setStats({
        total:       all.length,
        lowStock:    all.filter((m) => m.status === 'Low Stock').length,
        expiringSoon:all.filter((m) => m.status === 'Expiring Soon').length,
        expired:     all.filter((m) => m.status === 'Expired').length,
      });
      setAlerts(alertsRes.data.data);
      setRecent(all.slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="page-wrapper"><LoadingSpinner message="Loading dashboard…" /></div>;

  return (
    <div className="page-wrapper fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Primary Health Centre — Medicine Stock Overview</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchData} />}

      {!error && (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <StatsCard label="Total Medicines"   value={stats.total}        icon={Package}       color="#3b82f6" iconBg="rgba(59,130,246,0.12)" />
            <StatsCard label="Low Stock"         value={stats.lowStock}     icon={AlertTriangle} color="#f59e0b" iconBg="rgba(245,158,11,0.12)"  />
            <StatsCard label="Expiring Soon"     value={stats.expiringSoon} icon={Clock}         color="#f97316" iconBg="rgba(249,115,22,0.12)"  />
            <StatsCard label="Expired"           value={stats.expired}      icon={XCircle}       color="#ef4444" iconBg="rgba(239,68,68,0.12)"   />
          </div>

          {/* Alert Banner */}
          <AlertBanner alerts={alerts} />

          {/* Recent Entries */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div className="section-title" style={{ flex: 1, marginBottom: 0 }}>Recent Entries</div>
            <Link to="/stock" className="btn btn-ghost btn-sm" style={{ marginLeft: '16px' }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: '48px' }}>
              No records yet.{' '}
              <Link to="/add" style={{ color: 'var(--clr-primary)' }}>Add your first entry</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="medicine-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Batch</th>
                    <th>Balance</th>
                    <th>Expiry</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((med) => (
                    <tr key={med._id}>
                      <td data-label="Medicine"><span className="cell-name">{med.medicine_name}</span></td>
                      <td data-label="Batch" className="muted"><span className="cell-batch">{med.batch_no || '—'}</span></td>
                      <td data-label="Balance"><span className="cell-balance">{med.balance}</span></td>
                      <td data-label="Expiry" className="muted">{formatDate(med.expiry_date)}</td>
                      <td data-label="Status">
                        <span className={`badge ${statusBadgeClass(med.status)}`}>{med.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick Add Button */}
          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
            <Link to="/add" className="btn btn-primary btn-lg">
              <PlusCircle size={18} /> Add New Medicine Entry
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
