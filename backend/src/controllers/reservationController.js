import prisma from "../config/prisma.js";
import { ReservationService } from "../services/reservationService.js";
import { generateContractPDF } from "../utils/pdfGenerator.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { streamContractPDF } from "../utils/pdfStream.js";
import {
  sendBookingConfirmation,
  sendReservationConfirmed,
  sendCarReturned,
  sendPaymentReceived,
  sendReservationCancelled,
} from "../config/email.js";

const generateContractNumber = () => {
  return `CNT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

const checkAvailability = async (
  vehicleId,
  startDate,
  endDate,
  excludeReservationId = null,
) => {
  const where = {
    vehicleId,
    status: { in: ["CONFIRMED", "ONGOING"] },
    OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
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
    if (userId === "current" && req.userId) {
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
        checkout: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform vehicle images for frontend
    const transformedReservations = reservations.map((reservation) => ({
      ...reservation,
      vehicle: {
        ...reservation.vehicle,
        imageUrl: reservation.vehicle.vehicleimage?.[0]?.imageUrl || null,
      },
    }));

    res.json(transformedReservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createReservation = async (req, res) => {
  try {
    console.log("📥 Create Reservation Request:", req.body); // Debug log

    const {
      vehicleId,
      userId,
      startDate,
      endDate,
      destination,
      totalPrice,
      depositPaid,
      pickup_location,
      return_location,
      pickup_date,
      return_date,
    } = req.body;

    const actualStartDate = pickup_date || startDate;
    const actualEndDate = return_date || endDate;
    const actualPickupLocation = pickup_location || destination;
    const actualReturnLocation = return_location || destination;

    // Validate required fields
    if (
      !vehicleId ||
      !userId ||
      !actualStartDate ||
      !actualEndDate ||
      !totalPrice
    ) {
      console.log("❌ Missing required fields:", {
        vehicleId,
        userId,
        startDate: actualStartDate,
        endDate: actualEndDate,
        totalPrice,
      });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate destination length
    if (actualPickupLocation && actualPickupLocation.length > 200) {
      return res
        .status(400)
        .json({ error: "Pickup Location must not exceed 200 characters" });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent admins from creating customer reservations
    if (user.role === "ADMIN") {
      return res
        .status(403)
        .json({ error: "Admins cannot create customer reservations" });
    }

    if (user.isBlacklisted) {
      return res.status(403).json({ error: "User is blacklisted" });
    }

    const licenseExpiry = new Date(user.licenseExpiryDate);
    if (licenseExpiry < new Date()) {
      return res.status(400).json({ error: "License has expired" });
    }

    const isAvailable = await checkAvailability(
      parseInt(vehicleId),
      new Date(actualStartDate),
      new Date(actualEndDate),
    );
    if (!isAvailable) {
      return res
        .status(409)
        .json({ error: "Vehicle not available for selected dates" });
    }

    const reservation = await prisma.reservation.create({
      data: {
        vehicleId: parseInt(vehicleId),
        userId: parseInt(userId),
        startDate: new Date(actualStartDate),
        endDate: new Date(actualEndDate),
        destination: actualPickupLocation || null, // Keeping for backward compatibility
        pickupLocation: actualPickupLocation || null,
        returnLocation: actualReturnLocation || null,
        totalPrice: parseFloat(totalPrice),
        depositPaid: parseFloat(depositPaid),
        contractNumber: generateContractNumber(),
      },
      include: {
        vehicle: { include: { vehicleimage: true } },
        user: true,
      },
    });

    await prisma.vehicle.update({
      where: { id: parseInt(vehicleId) },
      data: { status: "RESERVED" },
    });

    // Send booking confirmation email (non-blocking)
    const vehicleName = `${reservation.vehicle.brand} ${reservation.vehicle.model}`;
    sendBookingConfirmation(
      user.email,
      `${user.firstName} ${user.lastName}`,
      vehicleName,
      reservation.startDate,
      reservation.endDate,
      reservation.contractNumber,
    ).catch(e => console.error("Email error:", e));

    console.log("✅ Reservation created successfully:", reservation.id);
    res.status(201).json(reservation);
  } catch (error) {
    console.error("❌ Reservation creation failed:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    console.log("📥 Update Reservation Status Request:", {
      reservationId: id,
      requestedStatus: status,
      userId,
      userRole,
    });

    // Fetch the reservation first
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: { vehicle: true, user: true },
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    // Role-based validation
    if (userRole === "CUSTOMER") {
      // Customer can only cancel their own reservation
      if (reservation.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only cancel your own reservation",
        });
      }

      // Customer can only set status to CANCELLED
      if (status !== "CANCELLED") {
        return res.status(403).json({
          success: false,
          message: "Customers can only cancel reservations",
        });
      }

      // Check if reservation can be cancelled
      if (
        reservation.status === "ONGOING" ||
        reservation.status === "COMPLETED"
      ) {
        return res.status(400).json({
          success: false,
          message: "This reservation can no longer be cancelled",
        });
      }

      // Already cancelled
      if (reservation.status === "CANCELLED") {
        return res.status(400).json({
          success: false,
          message: "This reservation is already cancelled",
        });
      }
    }
    // ADMIN has no restrictions - can update to any status

    const updatedReservation = await ReservationService.updateReservationStatus(
      parseInt(id),
      status,
      userId,
    );

    // Generate PDF on CONFIRMED
    if (status === "CONFIRMED" && !updatedReservation.contractPdfUrl) {
      try {
        const contractPdfUrl = await generateContractPDF(
          updatedReservation,
          updatedReservation.vehicle,
          updatedReservation.user,
        );
        await prisma.reservation.update({
          where: { id: parseInt(id) },
          data: { contractPdfUrl },
        });
        updatedReservation.contractPdfUrl = contractPdfUrl;

        // Send reservation confirmed email (non-blocking)
        const vehicleName = `${updatedReservation.vehicle.brand} ${updatedReservation.vehicle.model}`;
        sendReservationConfirmed(
          updatedReservation.user.email,
          `${updatedReservation.user.firstName} ${updatedReservation.user.lastName}`,
          vehicleName,
          updatedReservation.startDate,
          updatedReservation.endDate,
          updatedReservation.contractNumber,
        ).catch(e => console.error("Email error:", e));
      } catch (pdfError) {
        console.error("PDF generation failed:", pdfError.message);
      }
    }

    // Send car returned email on COMPLETED
    if (status === "COMPLETED") {
      // Send car returned email (non-blocking)
      const vehicleName = `${updatedReservation.vehicle.brand} ${updatedReservation.vehicle.model}`;
      const checkin = await prisma.checkin.findUnique({
        where: { reservationId: parseInt(id) },
      });
      sendCarReturned(
        updatedReservation.user.email,
        `${updatedReservation.user.firstName} ${updatedReservation.user.lastName}`,
        vehicleName,
        updatedReservation.contractNumber,
        checkin?.extraCharges || 0,
      ).catch(e => console.error("Email error:", e));
    }

    // Send cancellation email on CANCELLED
    if (status === "CANCELLED") {
      const vehicleName = `${updatedReservation.vehicle.brand} ${updatedReservation.vehicle.model}`;
      const wasConfirmed = reservation.status === "CONFIRMED";

      // Send email to customer (non-blocking)
      sendReservationCancelled(
        updatedReservation.user.email,
        `${updatedReservation.user.firstName} ${updatedReservation.user.lastName}`,
        vehicleName,
        updatedReservation.startDate,
        updatedReservation.endDate,
        updatedReservation.contractNumber,
      ).catch(e => console.error("Email error:", e));

      // If reservation was confirmed and cancelled by customer, notify admin (non-blocking)
      if (wasConfirmed && userRole === "CUSTOMER") {
        prisma.user.findFirst({
          where: { role: "ADMIN" },
          select: { email: true, firstName: true },
        }).then(admin => {
          if (admin) {
            return sendAdminCancellationNotification(
              admin.email,
              admin.firstName,
              `${updatedReservation.user.firstName} ${updatedReservation.user.lastName}`,
              vehicleName,
              updatedReservation.startDate,
              updatedReservation.endDate,
              updatedReservation.contractNumber,
              updatedReservation.id,
            );
          }
        }).catch(emailError => {
          console.error("Failed to send admin notification:", emailError);
        });
      }
    }

    console.log("✅ Status updated successfully");
    res.json(updatedReservation);
  } catch (error) {
    console.error("❌ Status update failed:", error.message);
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function for admin notification
const sendAdminCancellationNotification = async (
  adminEmail,
  adminName,
  customerName,
  vehicleName,
  startDate,
  endDate,
  contractNumber,
  reservationId,
) => {
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: adminEmail,
    subject: "Customer Cancelled a Confirmed Reservation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #EF4444;">Customer Cancelled a Confirmed Reservation</h2>
        <p>Hello ${adminName},</p>
        <p>The following reservation has been cancelled by the customer.</p>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Vehicle:</strong> ${vehicleName}</p>
          <p style="margin: 8px 0;"><strong>Reservation ID:</strong> ${reservationId}</p>
          <p style="margin: 8px 0;"><strong>Customer Name:</strong> ${customerName}</p>
          <p style="margin: 8px 0;"><strong>Pickup Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
          <p style="margin: 8px 0;"><strong>Return Date:</strong> ${new Date(endDate).toLocaleDateString()}</p>
        </div>
        <p>Please review the reservation in the admin panel.</p>
      </div>
    `,
  });
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const userId = req.userId;

    console.log("📥 Update Payment Status Request:", {
      reservationId: id,
      requestedPaymentStatus: paymentStatus,
      userId,
    });

    const reservation = await ReservationService.updatePaymentStatus(
      parseInt(id),
      paymentStatus,
      userId,
    );

    // Send payment received email (non-blocking)
    if (paymentStatus === "PAID" || paymentStatus === "PARTIAL") {
      const vehicleName = `${reservation.vehicle.brand} ${reservation.vehicle.model}`;
      sendPaymentReceived(
        reservation.user.email,
        `${reservation.user.firstName} ${reservation.user.lastName}`,
        vehicleName,
        reservation.contractNumber,
        paymentStatus,
      ).catch(e => console.error("Email error:", e));
    }

    console.log("✅ Payment status updated successfully");
    res.json(reservation);
  } catch (error) {
    console.error("❌ Payment status update failed:", error.message);
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkIn = async (req, res) => {
  try {
    const { id } = req.params;
    const { mileageStart, photos } = req.body;

    let signatureUrl = null;
    if (req.file) {
      signatureUrl = await uploadToCloudinary(req.file.buffer, "signatures");
    }

    const checkIn = await prisma.checkin.create({
      data: {
        reservationId: parseInt(id),
        mileageStart: parseInt(mileageStart),
        photos,
        signatureUrl,
      },
    });

    await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { status: "ONGOING" },
    });

    await prisma.vehicle.update({
      where: {
        id: (
          await prisma.reservation.findUnique({ where: { id: parseInt(id) } })
        ).vehicleId,
      },
      data: { status: "RENTED" },
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
      signatureUrl = await uploadToCloudinary(req.file.buffer, "signatures");
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: { checkIn: true },
    });

    const checkOut = await prisma.checkout.create({
      data: {
        reservationId: parseInt(id),
        mileageEnd: parseInt(mileageEnd),
        damageReport,
        extraCharges: parseFloat(extraCharges || 0),
        signatureUrl,
      },
    });

    await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { status: "COMPLETED" },
    });

    await prisma.vehicle.update({
      where: { id: reservation.vehicleId },
      data: {
        status: "AVAILABLE",
        mileage: parseInt(mileageEnd),
      },
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
      include: { vehicle: true, user: true },
    });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    streamContractPDF(reservation, reservation.vehicle, reservation.user, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
