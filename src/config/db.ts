import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { User, Submission } from '../types';
import bcrypt from 'bcrypt';

interface DbSchema {
  users: User[];
  submissions: Submission[];
}

const createDefaultUsers = async () => {
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedUserPassword = await bcrypt.hash('user123', 10);

  return [
    {
      id: '1',
      username: 'admin',
      password: hashedAdminPassword,
      role: 'admin' as const,
      createdAt: new Date()
    },
    {
      id: '2',
      username: 'user',
      password: hashedUserPassword,
      role: 'user' as const,
      createdAt: new Date()
    }
  ];
};

const file = join(__dirname, '../../db.json');
const adapter = new JSONFile<DbSchema>(file);
const db = new Low<DbSchema>(adapter, { users: [], submissions: [] });

// Initialize database with default data
export const initializeDb = async () => {
  await db.read();
  
  // Nếu chưa có dữ liệu users, thêm users mặc định
  if (!db.data.users || db.data.users.length === 0) {
    db.data.users = await createDefaultUsers();
  }
  
  // Đảm bảo có mảng submissions
  if (!db.data.submissions) {
    db.data.submissions = [];
  }
  
  await db.write();
};

export default db; 