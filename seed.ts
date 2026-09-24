import { AppDataSource } from './src/database/data-source';
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    console.log('🔄 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const queryRunner = AppDataSource.createQueryRunner();

    // 1. Seed Roles
    console.log('🔄 Seeding roles...');
    await queryRunner.query(`
      INSERT OR IGNORE INTO roles (kode, nama, deskripsi, warna, urutan) VALUES
      ('admin', 'Admin', 'Akses penuh semua modul', '#1E40AF', 1),
      ('kasir', 'Kasir', 'Transaksi dan sesi kas', '#10B981', 2),
      ('operator', 'Operator Cetak', 'File queue dan print queue', '#8B5CF6', 3),
      ('gudang', 'Gudang', 'Inventory dan stok', '#F59E0B', 4)
    `);
    console.log('✅ Roles seeded');

    // 2. Seed Permissions
    console.log('🔄 Seeding permissions...');
    await queryRunner.query(`
      INSERT OR IGNORE INTO permissions (kode, nama, modul) VALUES
      ('kasir.transaksi.create', 'Buat Transaksi', 'kasir'),
      ('kasir.transaksi.void', 'Void Transaksi', 'kasir'),
      ('kasir.sesi.open', 'Buka Sesi Kas', 'kasir'),
      ('kasir.sesi.close', 'Tutup Sesi Kas', 'kasir'),
      ('file_queue.view', 'Lihat File Queue', 'file_queue'),
      ('file_queue.create', 'Terima File', 'file_queue'),
      ('file_queue.print', 'Cetak File', 'file_queue'),
      ('inventory.produk.view', 'Lihat Produk', 'inventory'),
      ('inventory.produk.create', 'Tambah Produk', 'inventory'),
      ('inventory.produk.edit', 'Edit Produk', 'inventory'),
      ('inventory.stok.in', 'Stok Masuk', 'inventory'),
      ('inventory.stok.out', 'Stok Keluar', 'inventory'),
      ('laporan.view', 'Lihat Laporan', 'laporan'),
      ('pengaturan.harga', 'Kelola Harga', 'pengaturan'),
      ('pengaturan.users', 'Kelola Users', 'pengaturan')
    `);
    console.log('✅ Permissions seeded');

    // 3. Assign permissions ke roles
    console.log('🔄 Assigning permissions to roles...');

    // Admin: semua permission
    await queryRunner.query(`
      INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p WHERE r.kode = 'admin'
    `);

    // Kasir: transaksi + sesi + file queue view
    await queryRunner.query(`
      INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.kode = 'kasir' AND p.kode IN (
        'kasir.transaksi.create', 'kasir.transaksi.void',
        'kasir.sesi.open', 'kasir.sesi.close',
        'file_queue.view', 'file_queue.print'
      )
    `);

    // Operator: file queue
    await queryRunner.query(`
      INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.kode = 'operator' AND p.kode IN (
        'file_queue.view', 'file_queue.create', 'file_queue.print'
      )
    `);

    // Gudang: inventory
    await queryRunner.query(`
      INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.kode = 'gudang' AND p.kode IN (
        'inventory.produk.view', 'inventory.produk.create', 'inventory.produk.edit',
        'inventory.stok.in', 'inventory.stok.out'
      )
    `);
    console.log('✅ Permissions assigned to roles');

    // 4. Seed Super Admin User
    console.log('🔄 Seeding super admin...');
    const hash = await bcrypt.hash('admin123', 10);
    await queryRunner.query(
      `INSERT OR IGNORE INTO users (nama, username, password_hash, is_super_admin, is_active)
       VALUES (?, ?, ?, 1, 1)`,
      ['Super Admin', 'admin', hash],
    );
    console.log('✅ Super admin seeded');

    // 5. Seed Multi-Role User (Bu Sari)
    console.log('🔄 Seeding multi-role user...');
    const hash2 = await bcrypt.hash('sari123', 10);
    await queryRunner.query(
      `INSERT OR IGNORE INTO users (nama, username, password_hash, is_super_admin, is_active)
       VALUES (?, ?, ?, 0, 1)`,
      ['Bu Sari', 'sari', hash2],
    );

    // Assign roles ke Sari: admin, kasir, gudang
    await queryRunner.query(`
      INSERT OR IGNORE INTO user_roles (user_id, role_id, is_active)
      SELECT u.id, r.id, 1 FROM users u, roles r
      WHERE u.username = 'sari' AND r.kode IN ('admin', 'kasir', 'gudang')
    `);
    console.log('✅ Multi-role user seeded');

    await queryRunner.release();
    await AppDataSource.destroy();
    console.log('🎉 Seed completed successfully!');
    console.log('');
    console.log('📋 Akun untuk login:');
    console.log('   Super Admin: admin / admin123');
    console.log('   Multi-Role : sari / sari123');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();