import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthTables1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tabel roles
    await queryRunner.query(`
      CREATE TABLE roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kode VARCHAR(30) UNIQUE NOT NULL,
        nama VARCHAR(50) NOT NULL,
        deskripsi TEXT,
        warna VARCHAR(7),
        urutan INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabel users
    await queryRunner.query(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        no_hp VARCHAR(20),
        is_active INTEGER DEFAULT 1,
        is_super_admin INTEGER DEFAULT 0,
        default_role VARCHAR(30),
        last_login_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabel permissions
    await queryRunner.query(`
      CREATE TABLE permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kode VARCHAR(100) UNIQUE NOT NULL,
        nama VARCHAR(100) NOT NULL,
        modul VARCHAR(50) NOT NULL,
        deskripsi TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabel user_roles
    await queryRunner.query(`
      CREATE TABLE user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role_id INTEGER NOT NULL,
        is_active INTEGER DEFAULT 1,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        assigned_by INTEGER,
        UNIQUE(user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id)
      );
    `);

    // Tabel role_permissions
    await queryRunner.query(`
      CREATE TABLE role_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        UNIQUE(role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      );
    `);

    // Tabel user_sessions
    await queryRunner.query(`
      CREATE TABLE user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role_aktif VARCHAR(30) NOT NULL,
        token_jti VARCHAR(100) UNIQUE,
        login_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        logout_at DATETIME,
        expires_at DATETIME NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        device_info TEXT,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Tabel role_switch_logs
    await queryRunner.query(`
      CREATE TABLE role_switch_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        dari_role VARCHAR(30),
        ke_role VARCHAR(30) NOT NULL,
        waktu DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        catatan TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Index
    await queryRunner.query(`CREATE INDEX idx_users_username ON users(username);`);
    await queryRunner.query(`CREATE INDEX idx_user_roles_user ON user_roles(user_id);`);
    await queryRunner.query(`CREATE INDEX idx_sessions_user ON user_sessions(user_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS role_switch_logs;`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_sessions;`);
    await queryRunner.query(`DROP TABLE IF EXISTS role_permissions;`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_roles;`);
    await queryRunner.query(`DROP TABLE IF EXISTS permissions;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles;`);
  }
}