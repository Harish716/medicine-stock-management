import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, AlertCircle, FlaskConical } from 'lucide-react';
import { createMedicine, updateMedicine } from '../services/api';
import { calcBalance, calcDaysToExpiry, calcStatus, statusBadgeClass, toInputDate } from '../utils/calculations';

const EMPTY_FORM = {
  entry_id: '', medicine_name: '', batch_no: '',
  quantity_in: '', quantity_out: '', expiry_date: '',
  date: new Date().toISOString().slice(0, 10), reorder_level: '10',
};

export default function MedicineForm({ existing }) {
  const navigate = useNavigate();
  const [form, setForm]       = useState(existing ? {
    ...existing,
    expiry_date: toInputDate(existing.expiry_date),
    date: toInputDate(existing.date),
  } : EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Live derived preview
  const previewBalance = form.quantity_in !== '' && form.quantity_out !== ''
    ? calcBalance(form.quantity_in, form.quantity_out) : null;
  const previewDTE = form.expiry_date ? calcDaysToExpiry(form.expiry_date) : null;
  const previewStatus = previewBalance !== null
    ? calcStatus(previewBalance, previewDTE, Number(form.reorder_level) || 10) : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.entry_id.trim())       errs.entry_id      = 'Entry ID is required';
    if (!form.medicine_name.trim())  errs.medicine_name = 'Medicine name is required';
    if (form.quantity_in === '')     errs.quantity_in   = 'Quantity In is required';
    if (Number(form.quantity_in) < 0) errs.quantity_in  = 'Cannot be negative';
    if (form.quantity_out === '')    errs.quantity_out  = 'Quantity Out is required';
    if (Number(form.quantity_out) < 0) errs.quantity_out = 'Cannot be negative';
    if (Number(form.quantity_out) > Number(form.quantity_in))
      errs.quantity_out = 'Cannot exceed Quantity In';
    if (!form.expiry_date)           errs.expiry_date   = 'Expiry date is required';
    if (!form.date)                  errs.date          = 'Entry date is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      if (existing) {
        await updateMedicine(existing._id, form);
      } else {
        await createMedicine(form);
      }
      navigate('/stock');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save. Please check your connection.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (id, label, type = 'text', required = false, hint = '') => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        id={id} name={id} type={type}
        className={`form-input ${errors[id] ? 'error' : ''}`}
        value={form[id]}
        onChange={handleChange}
        placeholder={hint}
        step={type === 'number' ? '1' : undefined}
        min={type === 'number' ? '0' : undefined}
      />
      {errors[id] && <span className="form-error-msg">{errors[id]}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {apiError && (
        <div className="inline-error">
          <AlertCircle size={15} /> {apiError}
        </div>
      )}

      <div className="form-grid">
        {field('entry_id',      'Entry ID',          'text',   true, 'e.g. MED-021')}
        {field('medicine_name', 'Medicine Name',      'text',   true, 'e.g. Paracetamol 500mg')}
        {field('batch_no',      'Batch Number',       'text',   false,'e.g. BATCH-PC-2024-01')}
        {field('quantity_in',   'Quantity In',        'number', true, '0')}
        {field('quantity_out',  'Quantity Out',       'number', true, '0')}
        {field('reorder_level', 'Reorder Level',      'number', false,'10')}
        {field('expiry_date',   'Expiry Date',        'date',   true)}
        {field('date',          'Entry Date',         'date',   true)}

        {/* Live derived preview */}
        {previewBalance !== null && (
          <div className="derived-preview">
            <div className="derived-item">
              <span className="derived-label">Balance (auto)</span>
              <span className="derived-value" style={{ color: previewBalance <= 0 ? 'var(--clr-danger)' : previewBalance <= 10 ? 'var(--clr-warning)' : 'var(--clr-success)' }}>
                {previewBalance}
              </span>
            </div>
            {previewDTE !== null && (
              <div className="derived-item">
                <span className="derived-label">Days to Expiry (auto)</span>
                <span className="derived-value" style={{ color: previewDTE <= 0 ? 'var(--clr-danger)' : previewDTE <= 30 ? 'var(--clr-orange)' : 'var(--clr-text-muted)' }}>
                  {previewDTE <= 0 ? `${Math.abs(previewDTE)}d ago` : `${previewDTE}d`}
                </span>
              </div>
            )}
            {previewStatus && (
              <div className="derived-item">
                <span className="derived-label">Status (auto)</span>
                <span className={`badge ${statusBadgeClass(previewStatus)}`} style={{ marginTop: '4px' }}>
                  {previewStatus}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
          <X size={15} /> Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <Save size={15} />
          {loading ? 'Saving…' : existing ? 'Update Record' : 'Save Record'}
        </button>
      </div>
    </form>
  );
}
