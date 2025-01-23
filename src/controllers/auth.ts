import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../config/db';
import { User } from '../types';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    await db.read();
    const user = db.data?.users.find((u: User) => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Thông tin đăng nhập không chính xác' });
    }

    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      role: user.role,
    });

    // Lưu refresh token vào cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token không tồn tại' });
  }

  try {
    const decoded = refreshToken(refreshToken);
    await db.read();
    
    const user = db.data?.users.find((u: User) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại' });
    }

    const tokens = generateTokens({
      id: user.id,
      role: user.role,
    });

    // Cập nhật refresh token mới
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      accessToken: tokens.accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token không hợp lệ' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Đăng xuất thành công' });
};

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    await db.read();
    
    if (db.data?.users.some((u: User) => u.username === username)) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date()
    };

    db.data?.users.push(newUser);
    await db.write();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; 