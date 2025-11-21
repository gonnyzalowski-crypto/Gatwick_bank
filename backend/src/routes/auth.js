import express from 'express';
import config from '../config/app.js';
import { verifyAuth } from '../middleware/auth.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserById,
  updateUserProfile,
  changePassword,
  refreshAccessToken,
} from '../services/authService.js';
import {
  generateBackupCodes,
  saveSecurityQuestions,
  verifySecurityAnswer,
  verifyBackupCode,
} from '../services/securityService.js';
import { logAction } from '../services/auditService.js';
import { SECURITY_QUESTIONS } from '../constants/securityQuestions.js';
import { validateRequest, registerSchema, loginSchema } from '../utils/validation.js';
import fs from 'fs';
import path from 'path';
import prisma from '../config/prisma.js';

const router = express.Router();

// Get available security questions
// GET /api/v1/auth/security-questions
router.get('/security-questions', (req, res) => {
  return res.json({ questions: SECURITY_QUESTIONS });
});

// Register a new user with security questions
// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  const validation = validateRequest(registerSchema, req.body);
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    securityQuestions,
    phone,
    dateOfBirth,
    address,
    city,
    state,
    zipCode,
    country,
    nationality,
    governmentIdType,
    governmentIdNumber
  } = req.body;

  try {
    // Validate security questions
    if (!securityQuestions || !Array.isArray(securityQuestions) || securityQuestions.length !== 3) {
      return res.status(400).json({ error: 'Must provide exactly 3 security questions' });
    }

    // Register user with additional data
    const result = await registerUser(email, password, firstName, lastName, {
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      address,
      city,
      state,
      zipCode,
      country,
      nationality,
      governmentIdType,
      governmentIdNumber
    });
    const userId = result.user.id;

    // Save security questions
    await saveSecurityQuestions(userId, securityQuestions);

    // Generate 100 backup codes
    const { pdfBuffer } = await generateBackupCodes(userId);

    // Save PDF to local storage
    const storageDir = `/app/storage/backup-codes/user_${userId}`;
    const pdfPath = path.join(storageDir, `gatwick-backup-codes-${firstName}-${lastName}.pdf`);
    
    fs.mkdirSync(storageDir, { recursive: true });
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Log registration
    await logAction(userId, 'REGISTER', req.ip, req.get('user-agent'), {
      email,
      name: `${firstName} ${lastName}`
    });

    return res.status(201).json({
      message: 'Registration successful. Admin will send your backup codes via email.',
      user: result.user,
      account: result.account,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(400).json({ error: error.message });
  }
});

// Step 1: Verify email and password
// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  const validation = validateRequest(loginSchema, req.body);
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  const { email, password } = validation.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const bcrypt = (await import('bcryptjs')).default;
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get user's security questions
    const questions = await prisma.securityQuestion.findMany({
      where: { userId: user.id },
      select: { id: true, question: true }
    });

    // Log login attempt
    await logAction(user.id, 'LOGIN_ATTEMPT', req.ip, req.get('user-agent'));

    // TEMPORARY: If user has no security questions, allow direct login (for unseeded users)
    if (questions.length === 0) {
      console.log(`⚠️ User ${email} has no security questions - allowing direct login`);
      
      const jwt = (await import('jsonwebtoken')).default;
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      await logAction(user.id, 'LOGIN_SUCCESS', req.ip, req.get('user-agent'));

      return res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          accountStatus: user.accountStatus,
          kycStatus: user.kycStatus,
          isAdmin: user.isAdmin
        }
      });
    }

    return res.json({
      requiresVerification: true,
      userId: user.id,
      securityQuestions: questions,
      loginPreference: user.loginPreference || 'question'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({ error: 'Login failed' });
  }
});

// Step 2: Verify security question OR backup code
// POST /api/v1/auth/login/verify
router.post('/login/verify', async (req, res) => {
  const { userId, method, questionId, answer, backupCode } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    let verified = false;

    if (method === 'security_question') {
      if (!questionId || !answer) {
        return res.status(400).json({ error: 'Question ID and answer are required' });
      }
      // Ensure answer is trimmed and lowercased for consistent comparison
      const cleanAnswer = answer.toLowerCase().trim();
      console.log(`🔐 Verifying security answer for user ${userId}, question ${questionId}`);
      verified = await verifySecurityAnswer(userId, questionId, cleanAnswer);
    } else if (method === 'backup_code') {
      if (!backupCode) {
        return res.status(400).json({ error: 'Backup code is required' });
      }
      verified = await verifyBackupCode(userId, backupCode);
    } else {
      return res.status(400).json({ error: 'Invalid verification method' });
    }

    if (!verified) {
      return res.status(401).json({ error: 'Verification failed' });
    }

    // Generate tokens
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const { generateToken, generateRefreshToken } = await import('../utils/jwt.js');
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    const redis = (await import('../config/redis.js')).default;
    await redis.setex(`refresh:${user.id}`, 86400, refreshToken);

    // Set cookie
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Log successful login
    await logAction(userId, 'LOGIN_SUCCESS', req.ip, req.get('user-agent'), {
      method
    });

    const { password: _, ...sanitizedUser } = user;

    return res.json({
      message: 'Login successful',
      user: sanitizedUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login verification error:', error);
    return res.status(401).json({ error: 'Verification failed' });
  }
});

// Logout user
// POST /api/v1/auth/logout
router.post('/logout', verifyAuth, async (req, res) => {
  try {
    const result = await logoutUser(req.token, req.user.userId);
    res.clearCookie('token');
    return res.status(200).json({ message: result.message });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user profile
// GET /api/v1/auth/me
router.get('/me', verifyAuth, async (req, res) => {
  try {
    const user = await getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

// Update user profile
// PUT /api/v1/auth/profile
router.put('/profile', verifyAuth, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;

    if (!firstName && !lastName) {
      return res.status(400).json({ error: 'At least one field is required' });
    }

    const user = await updateUserProfile(req.user.userId, { firstName, lastName });
    return res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change user password
// POST /api/v1/auth/change-password
router.post('/change-password', verifyAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    await changePassword(req.user.userId, currentPassword, newPassword);
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(400).json({ error: error.message });
  }
});

// Refresh access token
// POST /api/v1/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const result = await refreshAccessToken(refreshToken);
    return res.status(200).json({ accessToken: result.accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(400).json({ error: error.message });
  }
});

// Change password with security question verification
// POST /api/v1/auth/change-password
router.post('/change-password', verifyAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, questionId, answer } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!currentPassword || !newPassword || !questionId || !answer) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Verify current password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      await logAction(userId, 'PASSWORD_CHANGE_FAILED', req.ip, req.get('user-agent'), {
        reason: 'Invalid current password'
      });
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Verify security question answer
    const isAnswerValid = await verifySecurityAnswer(userId, questionId, answer);
    if (!isAnswerValid) {
      await logAction(userId, 'PASSWORD_CHANGE_FAILED', req.ip, req.get('user-agent'), {
        reason: 'Invalid security answer'
      });
      return res.status(401).json({ error: 'Security answer is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Log the action
    await logAction(userId, 'PASSWORD_CHANGED', req.ip, req.get('user-agent'));

    // Create notification
    await createNotification(
      userId,
      'security',
      'Password Changed',
      'Your password has been successfully changed.',
      { timestamp: new Date() }
    );

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get random security question for password change
// GET /api/v1/auth/random-security-question
router.get('/random-security-question', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all user's security questions
    const questions = await prisma.securityQuestion.findMany({
      where: { userId },
      select: {
        id: true,
        question: true
      }
    });

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No security questions found' });
    }

    // Select a random question
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    return res.status(200).json({
      questionId: randomQuestion.id,
      question: randomQuestion.question
    });
  } catch (error) {
    console.error('Get random security question error:', error);
    return res.status(500).json({ error: 'Failed to get security question' });
  }
});

// Update login preference
// PUT /api/v1/auth/login-preference
router.put('/login-preference', verifyAuth, async (req, res) => {
  try {
    const { preference } = req.body;
    const userId = req.user.userId;

    // Validate preference
    if (!['question', 'code'].includes(preference)) {
      return res.status(400).json({ error: 'Invalid preference. Must be "question" or "code"' });
    }

    // Update user preference
    await prisma.user.update({
      where: { id: userId },
      data: { loginPreference: preference }
    });

    // Log the action
    await logAction(userId, 'LOGIN_PREFERENCE_CHANGED', req.ip, req.get('user-agent'), {
      newPreference: preference
    });

    return res.status(200).json({ 
      message: 'Login preference updated successfully',
      preference 
    });
  } catch (error) {
    console.error('Update login preference error:', error);
    return res.status(500).json({ error: 'Failed to update login preference' });
  }
});

// Get user's login preference
// GET /api/v1/auth/login-preference
router.get('/login-preference', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { loginPreference: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ preference: user.loginPreference });
  } catch (error) {
    console.error('Get login preference error:', error);
    return res.status(500).json({ error: 'Failed to get login preference' });
  }
});

export default router;
