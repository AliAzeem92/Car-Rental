import express from 'express';
import prisma from '../config/prisma.js';

const router = express.Router();

router.get('/admin-contact', async (req, res) => {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: {
        phone: true,
        email: true
      }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Contact information not available' });
    }

    res.json({
      phoneNumber: admin.phone || null,
      email: admin.email || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact information' });
  }
});

export default router;
