import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export const customerRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, licenseNumber, licenseExpiryDate, password } = req.body;

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        licenseNumber,
        licenseExpiryDate: new Date(licenseExpiryDate),
        password: hashedPassword
      }
    });

    const token = jwt.sign({ id: customer.id, type: 'customer' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.cookie('customerToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ customer: { id: customer.id, email: customer.email, firstName: customer.firstName } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !customer.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (customer.isBlacklisted) {
      return res.status(403).json({ error: 'Account suspended. Contact support.' });
    }

    const isValid = await bcrypt.compare(password, customer.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: customer.id, type: 'customer' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.cookie('customerToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ customer: { id: customer.id, email: customer.email, firstName: customer.firstName } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const customerLogout = (req, res) => {
  res.clearCookie('customerToken', { path: '/' });
  res.json({ message: 'Logout successful' });
};

export const getCustomerProfile = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.customerId },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, address: true, licenseNumber: true, licenseExpiryDate: true }
    });
    res.json({ customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
