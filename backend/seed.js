import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create an Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@carrental.com' },
    update: {},
    create: {
      email: 'admin@carrental.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Admin',
    },
  });
  console.log('✅ Admin user created: admin@carrental.com / admin123');

  // 2. Create a Test Vehicle
  const vehicle = await prisma.vehicle.create({
    data: {
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      licensePlate: 'ABC-1234',
      category: 'SEDAN',
      dailyPrice: 50.0,
      deposit: 200.0,
      currentMileage: 1200,
      status: 'AVAILABLE',
      isAvailable: true,
      vehicleimage: {
        create: [
          { imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&q=80&w=800' }
        ]
      }
    },
  });
  console.log('✅ Test vehicle created with REAL ID:', vehicle.id);

  console.log('\n🚀 SEED COMPLETE! You can now log in and book this car.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
