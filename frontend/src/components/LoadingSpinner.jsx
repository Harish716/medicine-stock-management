export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-wrapper">
      <div className="spinner" />
      <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>{message}</span>
    </div>
  );
}
