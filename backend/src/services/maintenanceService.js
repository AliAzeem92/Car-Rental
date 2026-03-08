import prisma from '../config/prisma.js';

export class MaintenanceService {
  
  /**
   * Create maintenance records for a vehicle during creation
   */
  static async createMaintenanceForVehicle(vehicleId, maintenanceData) {
    const { insuranceExpiry, nextOilChange, nextService } = maintenanceData;
    const operations = [];

    if (insuranceExpiry && insuranceExpiry.trim() && insuranceExpiry !== '') {
      operations.push(
        prisma.maintenance.create({
          data: {
            vehicleId,
            type: 'INSURANCE',
            dueDate: new Date(insuranceExpiry),
            isCompleted: false
          }
        })
      );
    }

    if (nextOilChange && String(nextOilChange).trim() !== '') {
      operations.push(
        prisma.maintenance.create({
          data: {
            vehicleId,
            type: 'OIL_CHANGE',
            dueDate: new Date(),
            dueMileage: parseInt(nextOilChange),
            isCompleted: false
          }
        })
      );
    }

    if (nextService && nextService.trim() && nextService !== '') {
      operations.push(
        prisma.maintenance.create({
          data: {
            vehicleId,
            type: 'SERVICE',
            dueDate: new Date(nextService),
            isCompleted: false
          }
        })
      );
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }
  }

  /**
   * Update maintenance records for a vehicle (single source of truth)
   */
  static async updateMaintenanceForVehicle(vehicleId, updates) {
    const { 
      insuranceId, insuranceExpiry, 
      oilChangeId, nextOilChange, 
      serviceId, nextService 
    } = updates;

    const operations = [];

    // Handle Insurance
    if (insuranceExpiry !== undefined) {
      if (insuranceExpiry && insuranceExpiry !== '') {
        if (insuranceId) {
          operations.push(
            prisma.maintenance.update({
              where: { id: parseInt(insuranceId) },
              data: { dueDate: new Date(insuranceExpiry), isCompleted: false }
            })
          );
        } else {
          operations.push(
            prisma.maintenance.create({
              data: { 
                vehicleId: parseInt(vehicleId), 
                type: 'INSURANCE', 
                dueDate: new Date(insuranceExpiry),
                isCompleted: false
              }
            })
          );
        }
      } else if (insuranceId) {
        operations.push(
          prisma.maintenance.update({
            where: { id: parseInt(insuranceId) },
            data: { isCompleted: true }
          })
        );
      }
    }

    // Handle Oil Change
    if (nextOilChange !== undefined) {
      const oilKm = Number(nextOilChange);
      if (oilKm && oilKm > 0) {
        if (oilChangeId) {
          operations.push(
            prisma.maintenance.update({
              where: { id: parseInt(oilChangeId) },
              data: { 
                dueMileage: oilKm,
                dueDate: new Date(),
                isCompleted: false
              }
            })
          );
        } else {
          operations.push(
            prisma.maintenance.create({
              data: { 
                vehicleId: parseInt(vehicleId), 
                type: 'OIL_CHANGE', 
                dueDate: new Date(), 
                dueMileage: oilKm,
                isCompleted: false
              }
            })
          );
        }
      } else if (oilChangeId) {
        operations.push(
          prisma.maintenance.update({
            where: { id: parseInt(oilChangeId) },
            data: { isCompleted: true }
          })
        );
      }
    }

    // Handle Service
    if (nextService !== undefined) {
      if (nextService && nextService !== '') {
        if (serviceId) {
          operations.push(
            prisma.maintenance.update({
              where: { id: parseInt(serviceId) },
              data: { dueDate: new Date(nextService), isCompleted: false }
            })
          );
        } else {
          operations.push(
            prisma.maintenance.create({
              data: { 
                vehicleId: parseInt(vehicleId), 
                type: 'SERVICE', 
                dueDate: new Date(nextService),
                isCompleted: false
              }
            })
          );
        }
      } else if (serviceId) {
        operations.push(
          prisma.maintenance.update({
            where: { id: parseInt(serviceId) },
            data: { isCompleted: true }
          })
        );
      }
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }
  }

  /**
   * Mark maintenance as complete
   */
  static async markComplete(maintenanceId) {
    const maintenance = await prisma.maintenance.findUnique({
      where: { id: parseInt(maintenanceId) }
    });

    if (!maintenance) {
      throw new Error('Maintenance record not found');
    }

    if (maintenance.isCompleted) {
      throw new Error('Maintenance already marked as complete');
    }

    await prisma.maintenance.update({
      where: { id: parseInt(maintenanceId) },
      data: { isCompleted: true }
    });

    return { success: true, message: 'Maintenance marked as complete' };
  }

  /**
   * Get active maintenance alerts (SINGLE SOURCE OF TRUTH)
   */
  static async getActiveAlerts() {
    const currentDate = new Date();
    
    // Get all vehicles with current mileage
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        brand: true,
        model: true,
        licensePlate: true,
        currentMileage: true
      }
    });

    // Get all active maintenance records
    const maintenanceRecords = await prisma.maintenance.findMany({
      where: { isCompleted: false },
      include: { vehicle: true }
    });

    const alerts = [];

    for (const maintenance of maintenanceRecords) {
      let isOverdue = false;

      if (maintenance.type === 'OIL_CHANGE') {
        // Check if current mileage >= due mileage
        if (maintenance.dueMileage && maintenance.vehicle.currentMileage >= maintenance.dueMileage) {
          isOverdue = true;
        }
      } else {
        // Check if current date >= due date
        if (maintenance.dueDate <= currentDate) {
          isOverdue = true;
        }
      }

      if (isOverdue) {
        alerts.push(maintenance);
      }
    }

    return alerts.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  /**
   * Generate alerts for a specific vehicle (SINGLE SOURCE OF TRUTH)
   */
  static async generateAlertsForVehicle(vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, currentMileage: true }
    });

    if (!vehicle) return;

    const currentDate = new Date();

    // Get active maintenance records for this vehicle
    const maintenanceRecords = await prisma.maintenance.findMany({
      where: {
        vehicleId: vehicleId,
        isCompleted: false
      }
    });

    // Check oil change based on current mileage
    const oilChange = maintenanceRecords.find(m => m.type === 'OIL_CHANGE');
    if (oilChange && oilChange.dueMileage && vehicle.currentMileage >= oilChange.dueMileage) {
      // Alert already exists, no action needed
      console.log(`Oil change alert active for vehicle ${vehicleId}`);
    }

    // Check service date
    const service = maintenanceRecords.find(m => m.type === 'SERVICE');
    if (service && service.dueDate <= currentDate) {
      console.log(`Service alert active for vehicle ${vehicleId}`);
    }

    // Check insurance expiry
    const insurance = maintenanceRecords.find(m => m.type === 'INSURANCE');
    if (insurance && insurance.dueDate <= currentDate) {
      console.log(`Insurance alert active for vehicle ${vehicleId}`);
    }
  }

  /**
   * Update maintenance schedules
   */
  static async updateMaintenanceSchedules(vehicleId, data) {
    const { nextOilChangeMileage, nextServiceDate, insuranceExpiryDate } = data;
    
    // Get existing active maintenance records
    const existing = await prisma.maintenance.findMany({
      where: { vehicleId: parseInt(vehicleId), isCompleted: false, isDeleted: false }
    });

    const operations = [];

    // Handle OIL_CHANGE
    const existingOil = existing.find(m => m.type === 'OIL_CHANGE');
    if (nextOilChangeMileage) {
      if (existingOil) {
        operations.push(
          prisma.maintenance.update({
            where: { id: existingOil.id },
            data: { dueMileage: parseInt(nextOilChangeMileage), dueDate: new Date() }
          })
        );
      } else {
        operations.push(
          prisma.maintenance.create({
            data: {
              vehicleId: parseInt(vehicleId),
              type: 'OIL_CHANGE',
              dueDate: new Date(),
              dueMileage: parseInt(nextOilChangeMileage),
              isCompleted: false
            }
          })
        );
      }
    } else if (existingOil) {
      operations.push(
        prisma.maintenance.update({
          where: { id: existingOil.id },
          data: { isCompleted: true }
        })
      );
    }

    // Handle SERVICE
    const existingService = existing.find(m => m.type === 'SERVICE');
    if (nextServiceDate) {
      if (existingService) {
        operations.push(
          prisma.maintenance.update({
            where: { id: existingService.id },
            data: { dueDate: new Date(nextServiceDate) }
          })
        );
      } else {
        operations.push(
          prisma.maintenance.create({
            data: {
              vehicleId: parseInt(vehicleId),
              type: 'SERVICE',
              dueDate: new Date(nextServiceDate),
              isCompleted: false
            }
          })
        );
      }
    } else if (existingService) {
      operations.push(
        prisma.maintenance.update({
          where: { id: existingService.id },
          data: { isCompleted: true }
        })
      );
    }

    // Handle INSURANCE
    const existingInsurance = existing.find(m => m.type === 'INSURANCE');
    if (insuranceExpiryDate) {
      if (existingInsurance) {
        operations.push(
          prisma.maintenance.update({
            where: { id: existingInsurance.id },
            data: { dueDate: new Date(insuranceExpiryDate) }
          })
        );
      } else {
        operations.push(
          prisma.maintenance.create({
            data: {
              vehicleId: parseInt(vehicleId),
              type: 'INSURANCE',
              dueDate: new Date(insuranceExpiryDate),
              isCompleted: false
            }
          })
        );
      }
    } else if (existingInsurance) {
      operations.push(
        prisma.maintenance.update({
          where: { id: existingInsurance.id },
          data: { isCompleted: true }
        })
      );
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }
    return { success: true, message: 'Maintenance schedules updated successfully' };
  }
}
