const mongoose = require('mongoose');

// ─── Helper: compute derived fields ───────────────────────────────────────────
function computeDerivedFields(doc) {
  // 1. Balance
  doc.balance = (doc.quantity_in || 0) - (doc.quantity_out || 0);

  // 2. Days to expiry (from today)
  if (doc.expiry_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(doc.expiry_date);
    exp.setHours(0, 0, 0, 0);
    doc.days_to_expiry = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  } else {
    doc.days_to_expiry = null;
  }

  // 3. Status (priority: Expired > Expiring Soon > Low Stock > OK)
  if (doc.days_to_expiry !== null && doc.days_to_expiry <= 0) {
    doc.status = 'Expired';
  } else if (doc.days_to_expiry !== null && doc.days_to_expiry <= 30) {
    doc.status = 'Expiring Soon';
  } else if (doc.balance <= (doc.reorder_level || 10)) {
    doc.status = 'Low Stock';
  } else {
    doc.status = 'OK';
  }
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const medicineSchema = new mongoose.Schema(
  {
    entry_id: {
      type: String,
      required: [true, 'Entry ID is required'],
      unique: true,
      trim: true,
    },
    medicine_name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      maxlength: [100, 'Medicine name must be 100 characters or fewer'],
    },
    batch_no: {
      type: String,
      trim: true,
      default: null, // nullable — edge case from Task 1
    },
    quantity_in: {
      type: Number,
      required: [true, 'Quantity In is required'],
      min: [0, 'Quantity In cannot be negative'],
    },
    quantity_out: {
      type: Number,
      required: [true, 'Quantity Out is required'],
      min: [0, 'Quantity Out cannot be negative'],
    },
    // ── Derived fields (auto-calculated, never set by client) ──
    balance: { type: Number, default: 0 },
    days_to_expiry: { type: Number, default: null },
    status: {
      type: String,
      enum: ['OK', 'Low Stock', 'Expiring Soon', 'Expired'],
      default: 'OK',
    },
    // ─────────────────────────────────────────────────────────
    expiry_date: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    date: {
      type: Date,
      required: [true, 'Entry date is required'],
    },
    reorder_level: {
      type: Number,
      default: 10,
      min: [0, 'Reorder level cannot be negative'],
    },
  },
  { timestamps: true }
);

// ─── Pre-save hook: auto-calculate derived fields ────────────────────────────
medicineSchema.pre('save', function (next) {
  // Validate: quantity_out cannot exceed quantity_in
  if (this.quantity_out > this.quantity_in) {
    return next(
      new Error('Quantity Out cannot exceed Quantity In (balance would go negative)')
    );
  }
  computeDerivedFields(this);
  next();
});

// Pre-update hook for findOneAndUpdate / updateOne
medicineSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const data = update.$set || update;

  // Pull current doc values + merged update values for computation
  // We recompute on the merged object
  const merged = {
    quantity_in: data.quantity_in,
    quantity_out: data.quantity_out,
    expiry_date: data.expiry_date,
    reorder_level: data.reorder_level,
  };

  if (
    merged.quantity_in !== undefined &&
    merged.quantity_out !== undefined &&
    merged.quantity_out > merged.quantity_in
  ) {
    return next(
      new Error('Quantity Out cannot exceed Quantity In (balance would go negative)')
    );
  }

  if (merged.quantity_in !== undefined && merged.quantity_out !== undefined) {
    data.balance = merged.quantity_in - merged.quantity_out;
  }

  if (merged.expiry_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(merged.expiry_date);
    exp.setHours(0, 0, 0, 0);
    data.days_to_expiry = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  }

  // Status
  const rl = merged.reorder_level !== undefined ? merged.reorder_level : 10;
  const balance = data.balance;
  const dte = data.days_to_expiry;

  if (dte !== undefined) {
    if (dte <= 0) data.status = 'Expired';
    else if (dte <= 30) data.status = 'Expiring Soon';
    else if (balance !== undefined && balance <= rl) data.status = 'Low Stock';
    else data.status = 'OK';
  }

  if (update.$set) {
    update.$set = data;
  }
  next();
});

module.exports = mongoose.model('Medicine', medicineSchema);
