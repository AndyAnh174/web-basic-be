import { Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../config/db';
import { AuthRequest, User } from '../types';

export const createUser = async (req: AuthRequest, res: Response) => {
  const { username, password, role } = req.body;

  try {
    await db.read();

    // Kiểm tra username đã tồn tại chưa
    if (db.data?.users.some((u) => u.username === username)) {
      return res.status(400).json({ message: 'Username đã tồn tại' });
    }

    // Kiểm tra các trường bắt buộc
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    // Kiểm tra role hợp lệ
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ message: 'Role không hợp lệ' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      role,
      createdAt: new Date()
    };

    db.data?.users.push(newUser);
    await db.write();

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    await db.read();
    const users = db.data?.users.map(({ password, ...user }) => user) || [];
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await db.read();
    const user = db.data?.users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  try {
    await db.read();
    const userIndex = db.data?.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra username đã tồn tại chưa (nếu thay đổi username)
    if (username && username !== db.data?.users[userIndex].username) {
      const existingUser = db.data?.users.find((u) => u.username === username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username đã tồn tại' });
      }
    }

    // Cập nhật thông tin người dùng
    if (db.data?.users[userIndex]) {
      const updatedUser = {
        ...db.data.users[userIndex],
        username: username || db.data.users[userIndex].username,
        role: role || db.data.users[userIndex].role,
      };

      // Cập nhật password nếu có
      if (password) {
        updatedUser.password = await bcrypt.hash(password, 10);
      }

      db.data.users[userIndex] = updatedUser;
      await db.write();

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await db.read();
    const userIndex = db.data?.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Không cho phép xóa admin cuối cùng
    const adminCount = db.data?.users.filter((u) => u.role === 'admin').length || 0;
    if (db.data?.users[userIndex].role === 'admin' && adminCount <= 1) {
      return res.status(400).json({ message: 'Không thể xóa admin cuối cùng' });
    }

    db.data?.users.splice(userIndex, 1);
    await db.write();

    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 