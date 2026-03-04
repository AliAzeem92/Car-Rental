import prisma from '../config/prisma.js';
import { ReservationService } from '../services/reservationService.js';
import { generateContractPDF } from '../utils/pdfGenerator.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { streamContractPDF } from '../utils/pdfStream.js';

const generateContractNumber = () => {
  return `CNT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

const checkAvailability = async (vehicleId, startDate, endDate, excludeReservationId = null) => {
  const where = {
    vehicleId,
    status: { in: ['CONFIRMED', 'ONGOING'] },
    OR: [
      { startDate: { lte: endDate }, endDate: { gte: startDate } }
    ]
  };

  if (excludeReservationId) {
    where.id = { not: excludeReservationId };
  }

  const conflicts = await prisma.reservation.findMany({ where });
  return conflicts.length === 0;
};

export const getReservations = async (req, res) => {
  try {
    const { status, vehicleId, userId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (vehicleId) where.vehicleId = parseInt(vehicleId);
    if (userId) where.userId = parseInt(userId);

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        vehicle: { include: { vehicleimage: true } },
        user: true,
        checkin: true,
        checkout: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createReservation = async (req, res) => {
  try {
    const { vehicleId, userId, startDate, endDate, totalPrice, depositPaid } = req.body;

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isBlacklisted) {
      return res.status(403).json({ error: 'User is blacklisted' });
    }

    const licenseExpiry = new Date(user.licenseExpiryDate);
    if (licenseExpiry < new Date()) {
      return res.status(400).json({ error: 'License has expired' });
    }

    const isAvailable = await checkAvailability(parseInt(vehicleId), new Date(startDate), new Date(endDate));
    if (!isAvailable) {
      return res.status(409).json({ error: 'Vehicle not available for selected dates' });
    }

    const reservation = await prisma.reservation.create({
      data: {
        vehicleId: parseInt(vehicleId),
        userId: parseInt(userId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice: parseFloat(totalPrice),
        depositPaid: parseFloat(depositPaid),
        contractNumber: generateContractNumber()
      },
      include: { vehicle: true, user: true }
    });

    await prisma.vehicle.update({
      where: { id: parseInt(vehicleId) },
      data: { status: 'RESERVED' }
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    console.log('📥 Update Reservation Status Request:', {
      reservationId: id,
      requestedStatus: status,
      userId
    });

    const reservation = await ReservationService.updateReservationStatus(
      parseInt(id),
      status,
      userId
    );

    // Generate PDF on CONFIRMED
    if (status === 'CONFIRMED' && !reservation.contractPdfUrl) {
      try {
        const contractPdfUrl = await generateContractPDF(
          reservation,
          reservation.vehicle,
          reservation.user
        );
        await prisma.reservation.update({
          where: { id: parseInt(id) },
          data: { contractPdfUrl }
        });
        reservation.contractPdfUrl = contractPdfUrl;
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError.message);
      }
    }

    console.log('✅ Status updated successfully');
    res.json(reservation);
  } catch (error) {
    console.error('❌ Status update failed:', error.message);
    res.status(error.statusCode || 400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const userId = req.userId;

    console.log('📥 Update Payment Status Request:', {
      reservationId: id,
      requestedPaymentStatus: paymentStatus,
      userId
    });

    const reservation = await ReservationService.updatePaymentStatus(
      parseInt(id),
      paymentStatus,
      userId
    );

    console.log('✅ Payment status updated successfully');
    res.json(reservation);
  } catch (error) {
    console.error('❌ Payment status update failed:', error.message);
    res.status(error.statusCode || 400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const checkIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { mileageStart, photos } = req.body;

    let signatureUrl = null;
    if (req.file) {
      signatureUrl = await uploadToCloudinary(req.file.buffer, 'signatures');
    }

    const checkIn = await prisma.checkin.create({
      data: {
        reservationId: parseInt(id),
        mileageStart: parseInt(mileageStart),
        photos,
        signatureUrl
      }
    });

    await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { status: 'ONGOING' }
    });

    await prisma.vehicle.update({
      where: { id: (await prisma.reservation.findUnique({ where: { id: parseInt(id) } })).vehicleId },
      data: { status: 'RENTED' }
    });

    res.status(201).json(checkIn);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { mileageEnd, damageReport, extraCharges } = req.body;

    let signatureUrl = null;
    if (req.file) {
      signatureUrl = await uploadToCloudinary(req.file.buffer, 'signatures');
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: { checkIn: true }
    });

    const checkOut = await prisma.checkout.create({
      data: {
        reservationId: parseInt(id),
        mileageEnd: parseInt(mileageEnd),
        damageReport,
        extraCharges: parseFloat(extraCharges || 0),
        signatureUrl
      }
    });

    await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { status: 'COMPLETED' }
    });

    await prisma.vehicle.update({
      where: { id: reservation.vehicleId },
      data: {
        status: 'AVAILABLE',
        mileage: parseInt(mileageEnd)
      }
    });

    res.status(201).json(checkOut);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadContract = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: { vehicle: true, user: true }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    streamContractPDF(reservation, reservation.vehicle, reservation.user, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
