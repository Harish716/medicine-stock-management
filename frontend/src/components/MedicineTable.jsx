import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { formatDate, statusBadgeClass, balanceClass } from '../utils/calculations';
import EmptyState from './EmptyState';

function SortIcon({ field, sortField, sortOrder }) {
  if (sortField !== field) return <ChevronsUpDown size={12} style={{ opacity: 0.4 }} />;
  return sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
}

export default function MedicineTable({ medicines, onDelete, onSort, sortField, sortOrder }) {
  if (medicines.length === 0) {
    return (
      <EmptyState
        title="No medicines found"
        description="Try clearing your search or filter, or add a new entry."
      />
    );
  }

  const th = (label, field) => (
    <th
      className={sortField === field ? 'sorted' : ''}
      onClick={() => onSort(field)}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {label} <SortIcon field={field} sortField={sortField} sortOrder={sortOrder} />
      </span>
    </th>
  );

  return (
    <div className="table-wrapper fade-in">
      <table className="medicine-table">
        <thead>
          <tr>
            {th('Entry ID',    'entry_id')}
            {th('Medicine',    'medicine_name')}
            {th('Batch No.',   'batch_no')}
            {th('Qty In',      'quantity_in')}
            {th('Qty Out',     'quantity_out')}
            {th('Balance',     'balance')}
            {th('Expiry Date', 'expiry_date')}
            {th('Entry Date',  'date')}
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((med) => {
            const expiryClass =
              med.days_to_expiry !== null && med.days_to_expiry <= 0 ? 'expiry-expired'
              : med.days_to_expiry !== null && med.days_to_expiry <= 30 ? 'expiry-soon'
              : 'expiry-ok';

            return (
              <tr key={med._id}>
                <td data-label="Entry ID" className="muted" style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                  {med.entry_id}
                </td>
                <td data-label="Medicine">
                  <span className="cell-name">{med.medicine_name}</span>
                </td>
                <td data-label="Batch No." className="muted">
                  <span className="cell-batch">{med.batch_no || '—'}</span>
                </td>
                <td data-label="Qty In" className="muted">{med.quantity_in}</td>
                <td data-label="Qty Out" className="muted">{med.quantity_out}</td>
                <td data-label="Balance">
                  <span className={`cell-balance ${balanceClass(med.balance, med.reorder_level)}`}>
                    {med.balance}
                  </span>
                </td>
                <td data-label="Expiry Date">
                  <span className={expiryClass}>{formatDate(med.expiry_date)}</span>
                  {med.days_to_expiry !== null && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-dim)' }}>
                      {med.days_to_expiry <= 0
                        ? `${Math.abs(med.days_to_expiry)}d ago`
                        : `${med.days_to_expiry}d left`}
                    </div>
                  )}
                </td>
                <td data-label="Entry Date" className="muted">{formatDate(med.date)}</td>
                <td data-label="Status">
                  <span className={`badge ${statusBadgeClass(med.status)}`}>{med.status}</span>
                </td>
                <td data-label="Actions">
                  <div className="actions-cell">
                    <Link to={`/edit/${med._id}`} className="btn btn-ghost btn-sm" title="Edit">
                      <Pencil size={13} />
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      title="Delete"
                      onClick={() => onDelete(med._id, med.medicine_name)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
