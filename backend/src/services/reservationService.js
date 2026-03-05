import prisma from '../config/prisma.js';
import { 
  canTransitionReservation, 
  canTransitionPayment,
  isTerminalReservationStatus,
  isTerminalPaymentStatus
} from './stateMachine.js';
import { CheckInOutService } from './checkInOutService.js';

export class ReservationService {
  
  static async updateReservationStatus(reservationId, newStatus, userId) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { vehicle: true, user: true, checkout: true, checkin: true }
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    console.log('🔍 Validating transition:', {
      currentStatus: reservation.status,
      newStatus,
      isValid: canTransitionReservation(reservation.status, newStatus)
    });

    // Validate transition
    if (!canTransitionReservation(reservation.status, newStatus)) {
      const error = new Error('You cannot move a reservation back once it has progressed.');
      error.statusCode = 400;
      throw error;
    }

    // Handle automatic check-out when moving to ONGOING
    if (newStatus === 'ONGOING' && !reservation.checkout) {
      await CheckInOutService.createCheckOut(reservationId, userId);
    }

    // Update reservation with history tracking
    const updated = await prisma.$transaction(async (tx) => {
      // Update reservation
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: { status: newStatus },
        include: { vehicle: true, user: true, checkout: true, checkin: true }
      });

      // Create history record
      await tx.reservationstatushistory.create({
        data: {
          reservationId,
          fromStatus: reservation.status,
          toStatus: newStatus,
          changedBy: userId,
          reason: `Status changed from ${reservation.status} to ${newStatus}`
        }
      });

      return updatedReservation;
    });

    // Update vehicle status based on reservation status
    await this.updateVehicleStatus(reservation.vehicleId, newStatus);

    return updated;
  }

  static async updatePaymentStatus(reservationId, newPaymentStatus, userId) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    console.log('🔍 Validating payment transition:', {
      currentStatus: reservation.paymentStatus,
      newStatus: newPaymentStatus,
      isValid: canTransitionPayment(reservation.paymentStatus, newPaymentStatus)
    });

    // Validate transition
    if (!canTransitionPayment(reservation.paymentStatus, newPaymentStatus)) {
      const error = new Error('You cannot move a reservation back once it has progressed.');
      error.statusCode = 400;
      throw error;
    }

    // Update with history
    const updated = await prisma.$transaction(async (tx) => {
      const updatedReservation = await tx.reservation.update({
        where: { id: reservationId },
        data: { paymentStatus: newPaymentStatus },
        include: { vehicle: true, user: true }
      });

      await tx.paymentstatushistory.create({
        data: {
          reservationId,
          fromStatus: reservation.paymentStatus,
          toStatus: newPaymentStatus,
          changedBy: userId,
          reason: `Payment status changed from ${reservation.paymentStatus} to ${newPaymentStatus}`
        }
      });

      return updatedReservation;
    });

    return updated;
  }

  static async updateVehicleStatus(vehicleId, reservationStatus) {
    const statusMap = {
      PENDING: 'AVAILABLE',
      CONFIRMED: 'RESERVED',
      ONGOING: 'RENTED',
      COMPLETED: 'AVAILABLE',
      CANCELLED: 'AVAILABLE'
    };

    const vehicleStatus = statusMap[reservationStatus];
    if (vehicleStatus) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: vehicleStatus }
      });
    }
  }
}
