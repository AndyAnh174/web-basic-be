import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Tạo khóa ngẫu nhiên dựa trên ngày
const generateDailyKey = (baseSecret: string, days: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  return crypto
    .createHmac('sha256', baseSecret)
    .update(dateString)
    .digest('hex');
};

// Lấy khóa access token cho ngày hiện tại
export const getAccessTokenSecret = () => {
  const baseSecret = process.env.ACCESS_TOKEN_SECRET || 'access-token-secret';
  return generateDailyKey(baseSecret);
};

// Lấy khóa refresh token cho 30 ngày
export const getRefreshTokenSecret = () => {
  const baseSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret';
  const currentDay = new Date().getDate();
  // Tạo khóa dựa trên ngày trong tháng (1-31)
  return generateDailyKey(baseSecret, currentDay % 30);
};

// Tạo tokens
export const generateTokens = (user: { id: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    getAccessTokenSecret(),
    { expiresIn: '1d' } // 1 ngày
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    getRefreshTokenSecret(),
    { expiresIn: '30d' } // 30 ngày
  );

  return { accessToken, refreshToken };
};

// Verify access token
export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, getAccessTokenSecret()) as { id: string; role: string };
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string) => {
  try {
    // Thử verify với khóa của 30 ngày gần nhất
    for (let i = 0; i < 30; i++) {
      const baseSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh-token-secret';
      const secret = generateDailyKey(baseSecret, i);
      try {
        return jwt.verify(token, secret) as { id: string };
      } catch {
        continue;
      }
    }
    throw new Error('Invalid refresh token');
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}; 