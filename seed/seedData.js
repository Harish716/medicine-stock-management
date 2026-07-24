const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Medicine = require('../models/Medicine');

dotenv.config({ path: '../.env' });

const today = new Date();

// Helper: days offset from today
const daysFromToday = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d;
};

const sampleData = [
  // ── Normal records ──────────────────────────────────────────────
  {
    entry_id: 'MED-001',
    medicine_name: 'Paracetamol 500mg',
    batch_no: 'BATCH-PC-2024-01',
    quantity_in: 500,
    quantity_out: 120,
    expiry_date: daysFromToday(365),
    date: new Date('2024-01-10'),
    reorder_level: 50,
  },
  {
    entry_id: 'MED-002',
    medicine_name: 'Amoxicillin 250mg',
    batch_no: 'BATCH-AM-2024-02',
    quantity_in: 300,
    quantity_out: 80,
    expiry_date: daysFromToday(200),
    date: new Date('2024-02-05'),
    reorder_level: 30,
  },
  {
    entry_id: 'MED-003',
    medicine_name: 'Metformin 500mg',
    batch_no: 'BATCH-MF-2024-03',
    quantity_in: 600,
    quantity_out: 210,
    expiry_date: daysFromToday(180),
    date: new Date('2024-03-12'),
    reorder_level: 60,
  },
  {
    entry_id: 'MED-004',
    medicine_name: 'Amlodipine 5mg',
    batch_no: 'BATCH-AL-2024-04',
    quantity_in: 250,
    quantity_out: 60,
    expiry_date: daysFromToday(400),
    date: new Date('2024-04-01'),
    reorder_level: 25,
  },
  {
    entry_id: 'MED-005',
    medicine_name: 'Omeprazole 20mg',
    batch_no: 'BATCH-OM-2024-05',
    quantity_in: 400,
    quantity_out: 150,
    expiry_date: daysFromToday(90),
    date: new Date('2024-04-18'),
    reorder_level: 40,
  },
  {
    entry_id: 'MED-006',
    medicine_name: 'Cetirizine 10mg',
    batch_no: 'BATCH-CT-2024-06',
    quantity_in: 200,
    quantity_out: 45,
    expiry_date: daysFromToday(500),
    date: new Date('2024-05-03'),
    reorder_level: 20,
  },
  {
    entry_id: 'MED-007',
    medicine_name: 'Ibuprofen 400mg',
    batch_no: 'BATCH-IB-2024-07',
    quantity_in: 350,
    quantity_out: 100,
    expiry_date: daysFromToday(280),
    date: new Date('2024-05-20'),
    reorder_level: 35,
  },
  {
    entry_id: 'MED-008',
    medicine_name: 'Atorvastatin 10mg',
    batch_no: 'BATCH-AT-2024-08',
    quantity_in: 180,
    quantity_out: 30,
    expiry_date: daysFromToday(600),
    date: new Date('2024-06-08'),
    reorder_level: 20,
  },
  // ── EDGE CASE: quantity_out = 0 (new stock, never dispensed) ────
  {
    entry_id: 'MED-009',
    medicine_name: 'Vitamin D3 60000 IU',
    batch_no: 'BATCH-VD-2024-09',
    quantity_in: 120,
    quantity_out: 0,
    expiry_date: daysFromToday(730),
    date: new Date('2024-06-25'),
    reorder_level: 10,
  },
  // ── EDGE CASE: missing batch_no (null) ───────────────────────────
  {
    entry_id: 'MED-010',
    medicine_name: 'ORS Powder',
    batch_no: null,
    quantity_in: 100,
    quantity_out: 35,
    expiry_date: daysFromToday(150),
    date: new Date('2024-07-01'),
    reorder_level: 10,
  },
  // ── EDGE CASE: balance below reorder level (Low Stock) ──────────
  {
    entry_id: 'MED-011',
    medicine_name: 'Folic Acid 5mg',
    batch_no: 'BATCH-FA-2024-11',
    quantity_in: 80,
    quantity_out: 74,
    expiry_date: daysFromToday(300),
    date: new Date('2024-07-10'),
    reorder_level: 10,
  },
  // ── EDGE CASE: expiry within 30 days (Expiring Soon) ────────────
  {
    entry_id: 'MED-012',
    medicine_name: 'Azithromycin 500mg',
    batch_no: 'BATCH-AZ-2024-12',
    quantity_in: 150,
    quantity_out: 40,
    expiry_date: daysFromToday(15),
    date: new Date('2024-07-15'),
    reorder_level: 20,
  },
  // ── EDGE CASE: already expired ───────────────────────────────────
  {
    entry_id: 'MED-013',
    medicine_name: 'Cotrimoxazole 480mg',
    batch_no: 'BATCH-CO-2023-13',
    quantity_in: 200,
    quantity_out: 60,
    expiry_date: daysFromToday(-30),
    date: new Date('2023-06-01'),
    reorder_level: 25,
  },
  // ── EDGE CASE: duplicate medicine name, different batch ──────────
  {
    entry_id: 'MED-014',
    medicine_name: 'Paracetamol 500mg',
    batch_no: 'BATCH-PC-2024-14',
    quantity_in: 300,
    quantity_out: 90,
    expiry_date: daysFromToday(270),
    date: new Date('2024-08-01'),
    reorder_level: 50,
  },
  // ── EDGE CASE: unusually old entry date ─────────────────────────
  {
    entry_id: 'MED-015',
    medicine_name: 'Chloroquine 250mg',
    batch_no: 'BATCH-CQ-2020-15',
    quantity_in: 400,
    quantity_out: 395,
    expiry_date: daysFromToday(60),
    date: new Date('2020-03-15'),
    reorder_level: 20,
  },
  // ── EDGE CASE: another duplicate name (Amoxicillin) ─────────────
  {
    entry_id: 'MED-016',
    medicine_name: 'Amoxicillin 250mg',
    batch_no: 'BATCH-AM-2024-16',
    quantity_in: 250,
    quantity_out: 0,
    expiry_date: daysFromToday(310),
    date: new Date('2024-08-12'),
    reorder_level: 30,
  },
  // ── Normal ───────────────────────────────────────────────────────
  {
    entry_id: 'MED-017',
    medicine_name: 'Ranitidine 150mg',
    batch_no: 'BATCH-RN-2024-17',
    quantity_in: 320,
    quantity_out: 110,
    expiry_date: daysFromToday(420),
    date: new Date('2024-08-20'),
    reorder_level: 30,
  },
  {
    entry_id: 'MED-018',
    medicine_name: 'Losartan 50mg',
    batch_no: 'BATCH-LS-2024-18',
    quantity_in: 200,
    quantity_out: 55,
    expiry_date: daysFromToday(550),
    date: new Date('2024-09-01'),
    reorder_level: 20,
  },
  {
    entry_id: 'MED-019',
    medicine_name: 'Salbutamol Inhaler',
    batch_no: 'BATCH-SB-2024-19',
    quantity_in: 60,
    quantity_out: 22,
    expiry_date: daysFromToday(240),
    date: new Date('2024-09-10'),
    reorder_level: 10,
  },
  {
    entry_id: 'MED-020',
    medicine_name: 'Diclofenac 50mg',
    batch_no: 'BATCH-DC-2024-20',
    quantity_in: 400,
    quantity_out: 130,
    expiry_date: daysFromToday(390),
    date: new Date('2024-09-18'),
    reorder_level: 40,
  },
];

async function seedDatabase() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/medicine_stock';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Medicine.deleteMany({});
    console.log('🗑️  Cleared existing records');

    // Insert all records
    await Medicine.insertMany(sampleData);
    console.log(`🌱 Seeded ${sampleData.length} medicine records`);

    console.log('\n📋 Edge cases included:');
    console.log('  MED-009 → quantity_out = 0 (new stock)');
    console.log('  MED-010 → batch_no = null (missing)');
    console.log('  MED-011 → balance below reorder level (Low Stock)');
    console.log('  MED-012 → expiry in 15 days (Expiring Soon)');
    console.log('  MED-013 → already expired');
    console.log('  MED-014 → duplicate name: Paracetamol 500mg');
    console.log('  MED-015 → unusually old entry date (2020)');
    console.log('  MED-016 → duplicate name: Amoxicillin 250mg');

    mongoose.connection.close();
    console.log('\n🎉 Seed complete!');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();
