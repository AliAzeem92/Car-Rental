import prisma from '../config/prisma.js';

export const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: { _count: { select: { reservation: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address, licenseNumber, licenseExpiryDate } = req.body;

    const customer = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        licenseNumber,
        licenseExpiryDate: new Date(licenseExpiryDate)
      }
    });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleBlacklist = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isBlacklisted: !customer.isBlacklisted }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
