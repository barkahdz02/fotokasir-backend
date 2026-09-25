import { AppDataSource } from './src/database/data-source';

async function addTables() {
  await AppDataSource.initialize();
  const q = AppDataSource.createQueryRunner();

  await q.query(`
    CREATE TABLE IF NOT EXISTS cash_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kasir_id INTEGER NOT NULL,
      waktu_buka DATETIME DEFAULT CURRENT_TIMESTAMP,
      waktu_tutup DATETIME,
      saldo_awal DECIMAL(14,2) DEFAULT 0,
      total_penjualan DECIMAL(14,2) DEFAULT 0,
      total_qris DECIMAL(14,2) DEFAULT 0,
      total_transfer DECIMAL(14,2) DEFAULT 0,
      saldo_akhir_sistem DECIMAL(14,2),
      saldo_akhir_aktual DECIMAL(14,2),
      selisih DECIMAL(14,2),
      catatan TEXT,
      status VARCHAR(20) DEFAULT 'buka',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ cash_sessions');

  await q.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_no VARCHAR(30) UNIQUE NOT NULL,
      kasir_id INTEGER NOT NULL,
      session_id INTEGER,
      subtotal DECIMAL(14,2) DEFAULT 0,
      diskon_total DECIMAL(14,2) DEFAULT 0,
      total DECIMAL(14,2) NOT NULL,
      metode_bayar VARCHAR(20) NOT NULL,
      bayar DECIMAL(14,2) DEFAULT 0,
      kembalian DECIMAL(14,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'selesai',
      catatan TEXT,
      pelanggan_nama VARCHAR(100),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ transactions');

  await q.query(`
    CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id INTEGER NOT NULL,
      product_id INTEGER,
      tipe VARCHAR(10) NOT NULL,
      nama_snapshot VARCHAR(200) NOT NULL,
      sku_snapshot VARCHAR(50),
      qty DECIMAL(14,2) NOT NULL,
      satuan VARCHAR(20) NOT NULL,
      qty_dasar DECIMAL(14,2) DEFAULT 0,
      harga_satuan DECIMAL(14,2) NOT NULL,
      diskon_item DECIMAL(14,2) DEFAULT 0,
      subtotal DECIMAL(14,2) NOT NULL,
      detail_jasa TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ transaction_items');

  await q.release();
  await AppDataSource.destroy();
  console.log('🎉 Selesai!');
}

addTables().catch(console.error);