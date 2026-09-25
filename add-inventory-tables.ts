import { AppDataSource } from './src/database/data-source';

async function addTables() {
  await AppDataSource.initialize();
  const q = AppDataSource.createQueryRunner();

  await q.query(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      tipe VARCHAR(20) NOT NULL,
      qty DECIMAL(14,2) NOT NULL,
      satuan VARCHAR(20),
      stok_sebelum DECIMAL(14,2) DEFAULT 0,
      stok_sesudah DECIMAL(14,2) DEFAULT 0,
      referensi_id INTEGER,
      keterangan TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ stock_movements');

  await q.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_no VARCHAR(30) UNIQUE NOT NULL,
      supplier_id INTEGER,
      supplier_nama VARCHAR(150),
      tanggal DATETIME DEFAULT CURRENT_TIMESTAMP,
      total DECIMAL(14,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'diterima',
      catatan TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ purchases');

  await q.query(`
    CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty DECIMAL(14,2) NOT NULL,
      satuan VARCHAR(20),
      qty_dasar DECIMAL(14,2) DEFAULT 0,
      harga_beli DECIMAL(14,2) NOT NULL,
      subtotal DECIMAL(14,2) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ purchase_items');

  await q.release();
  await AppDataSource.destroy();
  console.log('🎉 Selesai!');
}

addTables().catch(console.error);