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

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (licenseNumber) updateData.licenseNumber = licenseNumber;
    if (licenseExpiryDate) updateData.licenseExpiryDate = new Date(licenseExpiryDate);

    // Handle profile image upload
    if (req.files?.profileImage) {
      const { uploadToCloudinary } = await import('../utils/cloudinary.js');
      const imageUrl = await uploadToCloudinary(req.files.profileImage[0].buffer, 'profiles');
      updateData.profileImageUrl = imageUrl;
    }

    // Handle signature upload
    if (req.files?.signature) {
      const { uploadToCloudinary } = await import('../utils/cloudinary.js');
      const signatureUrl = await uploadToCloudinary(req.files.signature[0].buffer, 'signatures');
      updateData.signatureUrl = signatureUrl;
    }

    const customer = await prisma.user.update({
      where: { id },
      data: updateData
    });

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const { uploadToCloudinary } = await import('../utils/cloudinary.js');
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'profiles');

    const customer = await prisma.user.update({
      where: { id },
      data: { profileImageUrl: imageUrl }
    });

    res.json({ imageUrl, customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleBlacklist = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.user.findUnique({ where: { id } });
    
    const updated = await prisma.user.update({
      where: { id },
      data: { isBlacklisted: !customer.isBlacklisted }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
