import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const ds = new DataSource({
  type: 'better-sqlite3',
  database: process.env.DB_PATH || 'data/fotokasir.db',
  entities: [],
  synchronize: false,
  logging: false,
});

(async () => {
  await ds.initialize();
  console.log('✅ DB connected\n');

  const rows: any[] = await ds.query(`
    SELECT 
      p.id,
      p.nama,
      p.stok_qty,
      p.harga_beli AS harga_beli_lama,
      pi.qty AS qty_beli,
      pi.qty_dasar AS qty_dasar_beli,
      pi.harga_beli AS harga_beli_asli
    FROM products p
    LEFT JOIN purchase_items pi ON pi.product_id = p.id
    WHERE p.tipe = 'produk'
    GROUP BY p.id
  `);

  for (const r of rows) {
    if (!r.harga_beli_asli) {
      console.log(`⏭️  Skip ${r.nama} (tidak ada purchase history)`);
      continue;
    }
    const faktor = Number(r.qty_dasar_beli) / Number(r.qty_beli);
    const hargaPerDasar = Number(r.harga_beli_asli) / faktor;

    console.log(`📦 ${r.nama}`);
    console.log(`   Stok       : ${r.stok_qty}`);
    console.log(`   Faktor     : ${faktor} (${r.qty_beli} -> ${r.qty_dasar_beli})`);
    console.log(`   Harga lama : Rp ${r.harga_beli_lama}`);
    console.log(`   Harga baru : Rp ${hargaPerDasar} (per satuan dasar)`);

    await ds.query(`UPDATE products SET harga_beli = ? WHERE id = ?`, [hargaPerDasar, r.id]);
    console.log(`   ✅ Updated\n`);
  }

  await ds.destroy();
  console.log('🎉 Selesai!');
})();