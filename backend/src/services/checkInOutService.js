import prisma from '../config/prisma.js';
import { MaintenanceService } from './maintenanceService.js';

export class CheckInOutService {
  
  static async createCheckOut(reservationId, userId) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { vehicle: true }
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.checkout) {
      throw new Error('Vehicle already checked out');
    }

    const checkout = await prisma.checkout.create({
      data: {
        reservationId,
        vehicleId: reservation.vehicleId,
        mileageOut: reservation.vehicle.currentMileage,
        createdBy: userId
      },
      include: { vehicle: true, reservation: true }
    });

    return checkout;
  }

  static async createCheckIn(reservationId, mileageIn, damageReport, extraCharges, userId) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { vehicle: true, checkout: true }
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (!reservation.checkout) {
      throw new Error('Vehicle must be checked out first');
    }

    if (reservation.checkin) {
      throw new Error('Vehicle already checked in');
    }

    if (mileageIn < reservation.checkout.mileageOut) {
      throw new Error('Check-in mileage cannot be less than check-out mileage');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create check-in record
      const checkin = await tx.checkin.create({
        data: {
          reservationId,
          vehicleId: reservation.vehicleId,
          mileageIn: parseInt(mileageIn),
          damageReport,
          extraCharges: parseFloat(extraCharges || 0),
          createdBy: userId
        }
      });

      // Update vehicle mileage
      const updatedVehicle = await tx.vehicle.update({
        where: { id: reservation.vehicleId },
        data: { currentMileage: parseInt(mileageIn) }
      });

      return { checkin, vehicle: updatedVehicle };
    });

    // Generate maintenance alerts after mileage update
    await this.checkMaintenanceAlerts(reservation.vehicleId);

    return result;
  }

  static async checkMaintenanceAlerts(vehicleId) {
    // Use the centralized alert generation method
    await MaintenanceService.generateAlertsForVehicle(vehicleId);
  }

  static async getCheckInOut(reservationId) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        checkin: { include: { user: { select: { firstName: true, lastName: true } } } },
        checkout: { include: { user: { select: { firstName: true, lastName: true } } } },
        vehicle: true
      }
    });

    return reservation;
  }

  static async updateCheckIn(checkinId, data, userId) {
    const checkin = await prisma.checkin.findUnique({
      where: { id: checkinId },
      include: { reservation: { include: { vehicle: true, checkout: true } } }
    });

    if (!checkin) {
      throw new Error('Check-in record not found');
    }

    const { mileageIn, damageReport, extraCharges } = data;

    if (mileageIn && mileageIn < checkin.reservation.checkout.mileageOut) {
      throw new Error('Check-in mileage cannot be less than check-out mileage');
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedCheckin = await tx.checkin.update({
        where: { id: checkinId },
        data: {
          ...(mileageIn && { mileageIn: parseInt(mileageIn) }),
          ...(damageReport !== undefined && { damageReport }),
          ...(extraCharges !== undefined && { extraCharges: parseFloat(extraCharges) })
        }
      });

      // Update vehicle mileage if changed
      if (mileageIn) {
        const updatedVehicle = await tx.vehicle.update({
          where: { id: checkin.reservation.vehicleId },
          data: { currentMileage: parseInt(mileageIn) }
        });

        // Check for oil change alert
        if (updatedVehicle.nextOilChangeMileage && 
            updatedVehicle.currentMileage >= updatedVehicle.nextOilChangeMileage) {
          
          const existingAlert = await tx.maintenance.findFirst({
            where: {
              vehicleId: checkin.reservation.vehicleId,
              type: 'OIL_CHANGE',
              isCompleted: false,
              dueMileage: updatedVehicle.nextOilChangeMileage
            }
          });

          if (!existingAlert) {
            await tx.maintenance.create({
              data: {
                vehicleId: checkin.reservation.vehicleId,
                type: 'OIL_CHANGE',
                dueDate: new Date(),
                dueMileage: updatedVehicle.nextOilChangeMileage,
                isCompleted: false
              }
            });
          }
        }
      }

      return updatedCheckin;
    });

    return result;
  }
}