// Temporary route to fix user passwords - DELETE AFTER USE
import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma.js';

const router = express.Router();

const DEFAULT_SECURITY_QUESTIONS = [
  { question: "What was the name of your first pet?", answer: 'fluffy' },
  { question: "In what city were you born?", answer: 'london' },
  { question: "What is your mother's maiden name?", answer: 'smith' }
];

// POST /api/v1/fix-users (ONE-TIME USE ONLY)
router.post('/fix-users', async (req, res) => {
  try {
    console.log('🔧 FIXING USERS...');
    
    const results = [];
    
    // Fix both users
    const emails = ['jonod@gmail.com', 'brokardwilliams@gmail.com'];
    
    for (const email of emails) {
      const user = await prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        results.push({ email, status: 'NOT_FOUND' });
        continue;
      }
      
      // Update password and status
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: bcrypt.hashSync('Password123!', 10),
          accountStatus: 'ACTIVE'
        }
      });
      
      // Delete old security questions
      await prisma.securityQuestion.deleteMany({
        where: { userId: user.id }
      });
      
      // Create new security questions
      const questions = DEFAULT_SECURITY_QUESTIONS.map((item) => ({
        id: uuidv4(),
        userId: user.id,
        question: item.question,
        answerHash: bcrypt.hashSync(item.answer.toLowerCase(), 10),
        createdAt: new Date()
      }));
      
      await prisma.securityQuestion.createMany({ data: questions });
      
      results.push({
        email,
        status: 'FIXED',
        passwordUpdated: true,
        securityQuestions: questions.length
      });
      
      console.log(`✅ Fixed ${email}`);
    }
    
    console.log('✅ ALL USERS FIXED');
    
    res.json({
      success: true,
      message: 'Users fixed successfully',
      results
    });
    
  } catch (error) {
    console.error('❌ Error fixing users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
