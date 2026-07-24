// ─── Format date for display ──────────────────────────────────────────────────
export function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Format date for <input type="date"> ─────────────────────────────────────
export function toInputDate(date) {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
}

// ─── Derive balance ───────────────────────────────────────────────────────────
export function calcBalance(qIn, qOut) {
  return Number(qIn || 0) - Number(qOut || 0);
}

// ─── Days to expiry from today ────────────────────────────────────────────────
export function calcDaysToExpiry(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const exp   = new Date(expiryDate); exp.setHours(0, 0, 0, 0);
  return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
}

// ─── Derive status ────────────────────────────────────────────────────────────
export function calcStatus(balance, daysToExpiry, reorderLevel = 10) {
  if (daysToExpiry !== null && daysToExpiry <= 0) return 'Expired';
  if (daysToExpiry !== null && daysToExpiry <= 30)  return 'Expiring Soon';
  if (balance <= reorderLevel)                       return 'Low Stock';
  return 'OK';
}

// ─── Status → badge class ─────────────────────────────────────────────────────
export function statusBadgeClass(status) {
  return { OK: 'badge-ok', 'Low Stock': 'badge-low', 'Expiring Soon': 'badge-expiring', Expired: 'badge-expired' }[status] || 'badge-ok';
}

// ─── Balance → color class ────────────────────────────────────────────────────
export function balanceClass(balance, reorderLevel = 10) {
  if (balance <= 0)             return 'critical';
  if (balance <= reorderLevel)  return 'warning';
  return 'ok';
}
