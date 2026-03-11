import prisma from '../config/prisma.js';
import { ReservationService } from '../services/reservationService.js';
import { generateContractPDF } from '../utils/pdfGenerator.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { streamContractPDF } from '../utils/pdfStream.js';
import { sendBookingConfirmation, sendReservationConfirmed, sendCarReturned, sendPaymentReceived, sendReservationCancelled } from '../config/email.js';

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
    
    // If userId is 'current', use the authenticated user's ID
    if (userId === 'current' && req.userId) {
      where.userId = req.userId;
    } else if (userId) {
      where.userId = parseInt(userId);
    }
    
    if (status) where.status = status;
    if (vehicleId) where.vehicleId = parseInt(vehicleId);

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
    
    // Transform vehicle images for frontend
    const transformedReservations = reservations.map(reservation => ({
      ...reservation,
      vehicle: {
        ...reservation.vehicle,
        imageUrl: reservation.vehicle.vehicleimage?.[0]?.imageUrl || null
      }
    }));
    
    res.json(transformedReservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createReservation = async (req, res) => {
  try {
    console.log('📥 Create Reservation Request:', req.body); // Debug log
    
    const { vehicleId, userId, startDate, endDate, destination, totalPrice, depositPaid } = req.body;

    // Validate required fields
    if (!vehicleId || !userId || !startDate || !endDate || !totalPrice) {
      console.log('❌ Missing required fields:', { vehicleId, userId, startDate, endDate, totalPrice });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate destination length
    if (destination && destination.length > 200) {
      return res.status(400).json({ error: 'Destination must not exceed 200 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admins from creating customer reservations
    if (user.role === 'ADMIN') {
      return res.status(403).json({ error: 'Admins cannot create customer reservations' });
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
        destination: destination || null,
        totalPrice: parseFloat(totalPrice),
        depositPaid: parseFloat(depositPaid),
        contractNumber: generateContractNumber()
      },
      include: { 
        vehicle: { include: { vehicleimage: true } }, 
        user: true 
      }
    });

    await prisma.vehicle.update({
      where: { id: parseInt(vehicleId) },
      data: { status: 'RESERVED' }
    });

    // Send booking confirmation email
    const vehicleName = `${reservation.vehicle.brand} ${reservation.vehicle.model}`;
    await sendBookingConfirmation(
      user.email,
      `${user.firstName} ${user.lastName}`,
      vehicleName,
      reservation.startDate,
      reservation.endDate,
      reservation.contractNumber
    );

    console.log('✅ Reservation created successfully:', reservation.id);
    res.status(201).json(reservation);
  } catch (error) {
    console.error('❌ Reservation creation failed:', error);
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

        // Send reservation confirmed email
        const vehicleName = `${reservation.vehicle.brand} ${reservation.vehicle.model}`;
        await sendReservationConfirmed(
          reservation.user.email,
          `${reservation.user.firstName} ${reservation.user.lastName}`,
          vehicleName,
          reservation.startDate,
          reservation.endDate,
          reservation.contractNumber
        );
      } catch (pdfError) {
        console.error('PDF generation failed:', pdfError.message);
      }
    }

    // Send car returned email on COMPLETED
    if (status === 'COMPLETED') {
      const vehicleName = `${reservation.vehicle.brand} ${reservation.vehicle.model}`;
      const checkin = await prisma.checkin.findUnique({ where: { reservationId: parseInt(id) } });
      await sendCarReturned(
        reservation.user.email,
        `${reservation.user.firstName} ${reservation.user.lastName}`,
        vehicleName,
        reservation.contractNumber,
        checkin?.extraCharges || 0
      );
    }

    // Send cancellation email on CANCELLED
    if (status === 'CANCELLED') {
      const vehicleName = `${reservation.vehicle.brand} ${reservation.vehicle.model}`;
      await sendReservationCancelled(
        reservation.user.email,
        `${reservation.user.firstName} ${reservation.user.lastName}`,
        vehicleName,
        reservation.startDate,
        reservation.endDate,
        reservation.contractNumber
      );
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

    // Send payment received email
    if (paymentStatus === 'PAID' || paymentStatus === 'PARTIAL') {
      const vehicleName = `${reservation.vehicle.brand} ${reservation.vehicle.model}`;
      await sendPaymentReceived(
        reservation.user.email,
        `${reservation.user.firstName} ${reservation.user.lastName}`,
        vehicleName,
        reservation.contractNumber,
        paymentStatus
      );
    }

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
