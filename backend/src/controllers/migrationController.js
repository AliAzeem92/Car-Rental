import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

export const runMigrations = async (req, res) => {
  try {
    console.log('🔄 Running database migrations...');
    
    // Run prisma migrate deploy
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    
    console.log('✅ Migrations completed!');
    console.log(stdout);
    
    if (stderr) {
      console.error('Migration warnings:', stderr);
    }
    
    res.json({ 
      success: true, 
      message: 'Migrations completed successfully',
      output: stdout
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.stderr || error.stdout
    });
  }
};

export const seedDatabase = async (req, res) => {
  try {
    console.log('🌱 Seeding database...');
    
    const { stdout, stderr } = await execAsync('npm run prisma:seed');
    
    console.log('✅ Seeding completed!');
    
    res.json({ 
      success: true, 
      message: 'Database seeded successfully',
      output: stdout
    });
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
