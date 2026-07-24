import { PackageSearch } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty-state fade-in">
      <div className="empty-icon">
        <PackageSearch size={32} />
      </div>
      <h3>{title || 'No records found'}</h3>
      <p>{description || 'Nothing here yet.'}</p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary" style={{ marginTop: '8px' }}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-secondary" style={{ marginTop: '8px' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
