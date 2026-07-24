const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// ─── Validation helper ────────────────────────────────────────────────────────
function validateMedicineInput(body) {
  const errors = [];
  const { medicine_name, quantity_in, quantity_out, expiry_date, date } = body;

  if (!medicine_name || medicine_name.trim() === '')
    errors.push('Medicine name is required');
  if (medicine_name && medicine_name.length > 100)
    errors.push('Medicine name must be 100 characters or fewer');
  if (quantity_in === undefined || quantity_in === null || quantity_in === '')
    errors.push('Quantity In is required');
  if (Number(quantity_in) < 0)
    errors.push('Quantity In cannot be negative');
  if (quantity_out === undefined || quantity_out === null || quantity_out === '')
    errors.push('Quantity Out is required');
  if (Number(quantity_out) < 0)
    errors.push('Quantity Out cannot be negative');
  if (Number(quantity_out) > Number(quantity_in))
    errors.push('Quantity Out cannot exceed Quantity In (balance would go negative)');
  if (!expiry_date)
    errors.push('Expiry date is required');
  if (!date)
    errors.push('Entry date is required');

  return errors;
}

// ─── GET /api/medicines/alerts ────────────────────────────────────────────────
// Must be before /:id route to avoid conflict
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await Medicine.find({
      status: { $in: ['Low Stock', 'Expiring Soon', 'Expired'] },
    }).sort({ status: 1, days_to_expiry: 1 });
    res.json({ success: true, data: alerts, count: alerts.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ─── GET /api/medicines ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, status, sort, order } = req.query;
    let query = {};

    // Search by medicine_name or batch_no
    if (search) {
      query.$or = [
        { medicine_name: { $regex: search, $options: 'i' } },
        { batch_no: { $regex: search, $options: 'i' } },
        { entry_id: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Sort
    const sortField = sort || 'date';
    const sortOrder = order === 'asc' ? 1 : -1;

    const medicines = await Medicine.find(query).sort({ [sortField]: sortOrder });
    res.json({ success: true, data: medicines, count: medicines.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ─── GET /api/medicines/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, data: medicine });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ─── POST /api/medicines ──────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const errors = validateMedicineInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const medicine = new Medicine({
      entry_id: req.body.entry_id,
      medicine_name: req.body.medicine_name,
      batch_no: req.body.batch_no || null,
      quantity_in: Number(req.body.quantity_in),
      quantity_out: Number(req.body.quantity_out),
      expiry_date: new Date(req.body.expiry_date),
      date: new Date(req.body.date),
      reorder_level: req.body.reorder_level ? Number(req.body.reorder_level) : 10,
    });

    const saved = await medicine.save();
    res.status(201).json({ success: true, data: saved, message: 'Record created successfully' });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A record with this ${field === 'entry_id' ? 'Entry ID' : field} already exists`,
      });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/medicines/:id ───────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const errors = validateMedicineInput(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    const updateData = {
      medicine_name: req.body.medicine_name,
      batch_no: req.body.batch_no || null,
      quantity_in: Number(req.body.quantity_in),
      quantity_out: Number(req.body.quantity_out),
      expiry_date: new Date(req.body.expiry_date),
      date: new Date(req.body.date),
      reorder_level: req.body.reorder_level ? Number(req.body.reorder_level) : 10,
    };

    // Compute derived fields before saving
    updateData.balance = updateData.quantity_in - updateData.quantity_out;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(updateData.expiry_date);
    exp.setHours(0, 0, 0, 0);
    updateData.days_to_expiry = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

    if (updateData.days_to_expiry <= 0) updateData.status = 'Expired';
    else if (updateData.days_to_expiry <= 30) updateData.status = 'Expiring Soon';
    else if (updateData.balance <= updateData.reorder_level) updateData.status = 'Low Stock';
    else updateData.status = 'OK';

    const updated = await Medicine.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.json({ success: true, data: updated, message: 'Record updated successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/medicines/:id ────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Medicine.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
