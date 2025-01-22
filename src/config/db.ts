import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { User, Submission } from '../types';

interface DbSchema {
  users: User[];
  submissions: Submission[];
}

const file = join(__dirname, '../../db.json');
const adapter = new JSONFile<DbSchema>(file);
const db = new Low<DbSchema>(adapter);

// Initialize database with default data
export const initializeDb = async () => {
  await db.read();
  db.data ||= { users: [], submissions: [] };
  await db.write();
};

export default db; 