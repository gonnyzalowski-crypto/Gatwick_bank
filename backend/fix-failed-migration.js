import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFailedMigration() {
  try {
    console.log('Fixing failed migration...');
    
    // Delete the failed migration record
    const result = await prisma.$executeRawUnsafe(`
      DELETE FROM "_prisma_migrations" 
      WHERE migration_name = '20251119_add_performance_indexes' 
      AND finished_at IS NULL;
    `);
    
    console.log(`✅ Deleted ${result} failed migration record(s)`);
    console.log('Migration table cleaned. You can now run prisma migrate deploy.');
    
  } catch (error) {
    console.error('❌ Error fixing migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixFailedMigration();
