// Quick script to test database connection and check users
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testUsers() {
  console.log('🔍 Testing Database Connection and Users...\n');

  try {
    // Test 1: Check if users exist
    console.log('1️⃣ Checking if users exist...');
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['brokardwilliams@gmail.com', 'jonod@gmail.com']
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
        accountStatus: true,
        password: true
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found! Database might be empty.');
      console.log('💡 Run: npm run seed');
      return;
    }

    console.log(`✅ Found ${users.length} users:\n`);
    users.forEach(user => {
      console.log(`   📧 ${user.email}`);
      console.log(`   👤 ${user.firstName} ${user.lastName}`);
      console.log(`   🔐 Admin: ${user.isAdmin}`);
      console.log(`   📊 Status: ${user.accountStatus}`);
      console.log(`   🔑 Password hash length: ${user.password?.length || 0}`);
      console.log('');
    });

    // Test 2: Verify password hashing
    console.log('2️⃣ Testing password verification...');
    const testPassword = 'Password123!';
    
    for (const user of users) {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`   ${user.email}: ${isValid ? '✅ Password matches' : '❌ Password does NOT match'}`);
    }
    console.log('');

    // Test 3: Check security questions
    console.log('3️⃣ Checking security questions...');
    for (const user of users) {
      const questions = await prisma.securityQuestion.findMany({
        where: { userId: user.id },
        select: { id: true, question: true, answerHash: true }
      });
      
      console.log(`   ${user.email}: ${questions.length} security questions`);
      questions.forEach((q, idx) => {
        console.log(`      ${idx + 1}. ${q.question}`);
        console.log(`         Hash length: ${q.answerHash?.length || 0}`);
      });
      console.log('');
    }

    // Test 4: Test security answer verification
    console.log('4️⃣ Testing security answer verification...');
    const testAnswers = ['fluffy', 'london', 'smith'];
    
    for (const user of users) {
      const questions = await prisma.securityQuestion.findMany({
        where: { userId: user.id }
      });
      
      if (questions.length > 0) {
        console.log(`   ${user.email}:`);
        for (const answer of testAnswers) {
          let matched = false;
          for (const q of questions) {
            const isValid = await bcrypt.compare(answer.toLowerCase(), q.answerHash);
            if (isValid) {
              console.log(`      ✅ "${answer}" matches question: "${q.question}"`);
              matched = true;
              break;
            }
          }
          if (!matched) {
            console.log(`      ❌ "${answer}" does not match any question`);
          }
        }
        console.log('');
      }
    }

    console.log('✅ Database test complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testUsers();
