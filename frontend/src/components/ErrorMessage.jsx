import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-state fade-in">
      <div className="error-state-icon">
        <AlertCircle size={20} />
      </div>
      <div>
        <div className="error-state-title">Something went wrong</div>
        <div className="error-state-msg">{message || 'An unexpected error occurred.'}</div>
        {onRetry && (
          <button className="btn btn-ghost btn-sm" onClick={onRetry} style={{ marginTop: '12px' }}>
            <RefreshCw size={14} /> Try again
          </button>
        )}
      </div>
    </div>
  );
}
