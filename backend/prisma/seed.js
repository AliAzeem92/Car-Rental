import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@carrental.com' },
    update: {},
    create: {
      email: 'admin@carrental.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin created:', admin.email);

  const customer = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      password: hashedPassword,
      role: 'CUSTOMER',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      address: '123 Main St, City',
      licenseNumber: 'DL123456',
      licenseExpiryDate: new Date('2025-12-31'),
      isBlacklisted: false
    }
  });

  console.log('✅ Customer created:', customer.email);

  const vehicle1 = await prisma.vehicle.create({
    data: {
      brand: 'Toyota',
      model: 'Camry',
      licensePlate: 'ABC-1234',
      category: 'Sedan',
      dailyPrice: 50,
      deposit: 200,
      mileage: 15000,
      status: 'AVAILABLE'
    }
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      brand: 'Honda',
      model: 'CR-V',
      licensePlate: 'XYZ-5678',
      category: 'SUV',
      dailyPrice: 75,
      deposit: 300,
      mileage: 20000,
      status: 'AVAILABLE'
    }
  });

  console.log('✅ Vehicles created');

  await prisma.maintenance.create({
    data: {
      vehicleId: vehicle1.id,
      type: 'OIL_CHANGE',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isCompleted: false
    }
  });

  console.log('✅ Maintenance alert created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });