import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function migrate() {
  console.log('🔄 Starting migration to unified User model...');

  try {
    // Get all admins and customers
    const admins = await prisma.$queryRaw`SELECT * FROM admin`;
    const customers = await prisma.$queryRaw`SELECT * FROM customer`;

    console.log(`Found ${admins.length} admins and ${customers.length} customers`);

    // Migrate admins
    for (const admin of admins) {
      await prisma.$executeRaw`
        INSERT INTO user (email, password, role, createdAt)
        VALUES (${admin.email}, ${admin.password}, 'ADMIN', ${admin.createdAt})
      `;
      console.log(`✅ Migrated admin: ${admin.email}`);
    }

    // Migrate customers
    for (const customer of customers) {
      await prisma.$executeRaw`
        INSERT INTO user (email, password, role, firstName, lastName, phone, address, licenseNumber, licenseExpiryDate, idCardUrl, licenseUrl, isBlacklisted, createdAt)
        VALUES (${customer.email}, ${customer.password}, 'CUSTOMER', ${customer.firstName}, ${customer.lastName}, ${customer.phone}, ${customer.address}, ${customer.licenseNumber}, ${customer.licenseExpiryDate}, ${customer.idCardUrl}, ${customer.licenseUrl}, ${customer.isBlacklisted}, ${customer.createdAt})
      `;
      console.log(`✅ Migrated customer: ${customer.email}`);
    }

    // Update reservations to use userId
    await prisma.$executeRaw`
      UPDATE reservation r
      INNER JOIN customer c ON r.customerId = c.id
      INNER JOIN user u ON c.email = u.email
      SET r.userId = u.id
    `;

    console.log('✅ Updated reservations with new userId');
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
