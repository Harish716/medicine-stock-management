import { AlertTriangle } from 'lucide-react';
import { statusBadgeClass, formatDate } from '../utils/calculations';

export default function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="alert-banner fade-in">
      <div className="alert-banner-header">
        <AlertTriangle size={16} />
        {alerts.length} item{alerts.length !== 1 ? 's' : ''} require{alerts.length === 1 ? 's' : ''} immediate attention
      </div>
      <div className="alert-list">
        {alerts.map((item) => (
          <div className="alert-item" key={item._id}>
            <span className="alert-item-name">{item.medicine_name}</span>
            <span className="alert-item-detail">
              {item.batch_no ? `Batch: ${item.batch_no}` : 'No batch'}
            </span>
            <span className="alert-item-detail">Balance: {item.balance}</span>
            <span className="alert-item-detail">Expires: {formatDate(item.expiry_date)}</span>
            <span className={`badge ${statusBadgeClass(item.status)}`}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
