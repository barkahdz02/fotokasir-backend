import { AppDataSource } from './src/database/data-source';

async function addTables() {
  await AppDataSource.initialize();
  const q = AppDataSource.createQueryRunner();

  await q.query(`
    CREATE TABLE IF NOT EXISTS service_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama VARCHAR(100) NOT NULL,
      category_id INTEGER,
      satuan VARCHAR(20) DEFAULT 'lembar',
      dimensi TEXT DEFAULT '[]',
      formula_harga VARCHAR(30) DEFAULT 'per_unit',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ service_types');

  await q.query(`
    CREATE TABLE IF NOT EXISTS service_attributes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dimensi VARCHAR(30) NOT NULL,
      nilai VARCHAR(50) NOT NULL,
      label VARCHAR(100) NOT NULL,
      urutan INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ service_attributes');

  await q.query(`
    CREATE TABLE IF NOT EXISTS service_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_type_id INTEGER NOT NULL,
      kombinasi TEXT NOT NULL,
      harga DECIMAL(14,2) NOT NULL,
      min_qty INTEGER DEFAULT 1,
      max_qty INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ service_prices');

  // Seed attributes
  await q.query(`
    INSERT OR IGNORE INTO service_attributes (dimensi, nilai, label, urutan) VALUES
    ('ukuran', 'A4', 'A4', 1),
    ('ukuran', 'F4', 'F4', 2),
    ('ukuran', 'A3', 'A3', 3),
    ('warna', 'hitam_putih', 'Hitam Putih', 1),
    ('warna', 'warna', 'Warna', 2),
    ('sisi', '1_sisi', '1 Sisi', 1),
    ('sisi', '2_sisi', '2 Sisi', 2),
    ('ketebalan', '100mic', '100 micron', 1),
    ('ketebalan', '125mic', '125 micron', 2),
    ('jenis', 'glossy', 'Glossy', 1),
    ('jenis', 'doff', 'Doff', 2)
  `);
  console.log('✅ attributes seeded');

  await q.release();
  await AppDataSource.destroy();
  console.log('🎉 Selesai!');
}

addTables().catch(console.error);