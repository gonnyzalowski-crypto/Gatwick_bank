import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import redis from '../config/redis.js';
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';

// Helper to strip sensitive fields from user
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

export const registerUser = async (email, password, firstName, lastName) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
    },
  });

  const account = await prisma.account.create({
    data: {
      userId: user.id,
      accountType: 'checking',
      accountNumber: `CHK-${user.id.slice(0, 8).toUpperCase()}`,
      balance: 0,
      currency: 'USD',
      isActive: true,
    },
  });

  return {
    user: sanitizeUser(user),
    account,
  };
};

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new Error('Invalid email or password');
  }

  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // store refresh token for this user (24h TTL)
  await redis.setex(`refresh:${user.id}`, 86400, refreshToken);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

export const logoutUser = async (token, userId) => {
  if (!token) return { message: 'Logged out' };

  const decoded = verifyToken(token);
  let ttlSeconds = 86400; // default 24h

  if (decoded && decoded.exp) {
    const now = Math.floor(Date.now() / 1000);
    ttlSeconds = Math.max(decoded.exp - now, 0);
  }

  if (ttlSeconds > 0) {
    await redis.setex(`blacklist:${token}`, ttlSeconds, '1');
  }

  if (userId) {
    await redis.del(`refresh:${userId}`);
  }

  return { message: 'Logged out successfully' };
};

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }
  return sanitizeUser(user);
};

export const updateUserProfile = async (userId, data) => {
  const { firstName, lastName } = data;
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
    },
  });
  return sanitizeUser(updated);
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    throw new Error('Current password is incorrect');
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  return { message: 'Password changed successfully' };
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  const decoded = verifyToken(refreshToken);
  if (!decoded || decoded.type !== 'refresh' || !decoded.userId) {
    throw new Error('Invalid refresh token');
  }

  const stored = await redis.get(`refresh:${decoded.userId}`);
  if (!stored || stored !== refreshToken) {
    throw new Error('Session expired, please login again');
  }

  const newAccessToken = generateToken(decoded.userId);
  return { accessToken: newAccessToken };
};
