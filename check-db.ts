import { AppDataSource } from './src/database/data-source';

async function check() {
  await AppDataSource.initialize();
  
  const users = await AppDataSource.query('SELECT id, nama, username, is_super_admin FROM users');
  const roles = await AppDataSource.query('SELECT id, kode, nama FROM roles');
  const userRoles = await AppDataSource.query('SELECT * FROM user_roles');
  const permissions = await AppDataSource.query('SELECT COUNT(*) as total FROM permissions');
  
  console.log('=== USERS ===');
  console.log(JSON.stringify(users, null, 2));
  console.log('');
  console.log('=== ROLES ===');
  console.log(JSON.stringify(roles, null, 2));
  console.log('');
  console.log('=== USER_ROLES ===');
  console.log(JSON.stringify(userRoles, null, 2));
  console.log('');
  console.log('=== PERMISSIONS ===');
  console.log(JSON.stringify(permissions, null, 2));
  
  await AppDataSource.destroy();
}

check().catch(console.error);