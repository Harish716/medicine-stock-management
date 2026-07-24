import { Search, Filter } from 'lucide-react';

const STATUSES = ['All', 'OK', 'Low Stock', 'Expiring Soon', 'Expired'];

export default function SearchFilter({ search, status, onSearchChange, onStatusChange, resultCount }) {
  return (
    <div className="filter-bar">
      <div className="search-wrapper">
        <Search size={16} className="search-icon" />
        <input
          id="search-input"
          type="text"
          className="search-input"
          placeholder="Search by medicine name, batch no, or entry ID…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        id="status-filter"
        className="filter-select"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
        ))}
      </select>

      {(search || status !== 'All') && (
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { onSearchChange(''); onStatusChange('All'); }}
        >
          Clear
        </button>
      )}

      <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.8rem', marginLeft: 'auto' }}>
        {resultCount} record{resultCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
