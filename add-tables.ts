import { AppDataSource } from './src/database/data-source';

async function addTables() {
  try {
    console.log('🔄 Connecting...');
    await AppDataSource.initialize();
    console.log('✅ Connected');

    const q = AppDataSource.createQueryRunner();

    // Categories
    await q.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama VARCHAR(100) NOT NULL,
        tipe VARCHAR(10) NOT NULL,
        deskripsi TEXT,
        urutan INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ categories');

    // Units
    await q.query(`
      CREATE TABLE IF NOT EXISTS units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama VARCHAR(20) UNIQUE NOT NULL,
        singkatan VARCHAR(10),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ units');

    // Products
    await q.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku VARCHAR(50) UNIQUE,
        barcode VARCHAR(50),
        nama VARCHAR(200) NOT NULL,
        category_id INTEGER NOT NULL,
        tipe VARCHAR(10) NOT NULL,
        satuan_dasar_id INTEGER,
        stok_qty DECIMAL(14,2) DEFAULT 0,
        stok_minimum DECIMAL(14,2) DEFAULT 0,
        harga_beli DECIMAL(14,2),
        satuan_jasa VARCHAR(30),
        harga_jual DECIMAL(14,2) NOT NULL,
        deskripsi TEXT,
        metadata TEXT DEFAULT '{}',
        is_active INTEGER DEFAULT 1,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ products');

    // Service Tables
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
    console.log('✅ service tables');

    // Seed attributes
    await q.query(`
      INSERT OR IGNORE INTO service_attributes (dimensi, nilai, label, urutan) VALUES
      ('ukuran', 'A4', 'A4', 1),
      ('ukuran', 'F4', 'F4', 2),
      ('ukuran', 'A3', 'A3', 3),
      ('warna', 'hitam_putih', 'Hitam Putih', 1),
      ('warna', 'warna', 'Warna', 2),
      ('sisi', '1_sisi', '1 Sisi', 1),
      ('sisi', '2_sisi', '2 Sisi', 2)
    `);
    console.log('✅ attributes seeded');

    await q.release();
    await AppDataSource.destroy();
    console.log('🎉 Selesai!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addTables();