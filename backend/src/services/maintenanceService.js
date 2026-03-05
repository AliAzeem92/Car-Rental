import prisma from '../config/prisma.js';

export class MaintenanceService {
  
  /**
   * Create maintenance records for a vehicle during creation
   */
  static async createMaintenanceForVehicle(vehicleId, maintenanceData) {
    const { insuranceExpiry, nextOilChange, nextService } = maintenanceData;
    const operations = [];

    // Insurance maintenance
    if (insuranceExpiry && insuranceExpiry.trim() && insuranceExpiry !== '') {
      operations.push(
        prisma.maintenance.create({
          data: {
            vehicleId,
            type: 'INSURANCE',
            dueDate: new Date(insuranceExpiry)
          }
        })
      );
    }

    // Oil change maintenance
    if (nextOilChange && String(nextOilChange).trim() !== '') {
      operations.push(
        prisma.maintenance.create({
          data: {
            vehicleId,
            type: 'OIL_CHANGE',
            dueDate: new Date(),
            dueMileage: parseInt(nextOilChange)
          }
        })
      );
    }

    // Service maintenance
    if (nextService && nextService.trim() && nextService !== '') {
      operations.push(
        prisma.maintenance.create({
          data: {
            vehicleId,
            type: 'SERVICE',
            dueDate: new Date(nextService)
          }
        })
      );
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }
  }

  /**
   * Update maintenance records for a vehicle (used by both controllers)
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
              data: { dueDate: new Date(insuranceExpiry) }
            })
          );
        } else {
          operations.push(
            prisma.maintenance.create({
              data: { 
                vehicleId: parseInt(vehicleId), 
                type: 'INSURANCE', 
                dueDate: new Date(insuranceExpiry) 
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
                dueDate: new Date()
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
                dueMileage: oilKm 
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
              data: { dueDate: new Date(nextService) }
            })
          );
        } else {
          operations.push(
            prisma.maintenance.create({
              data: { 
                vehicleId: parseInt(vehicleId), 
                type: 'SERVICE', 
                dueDate: new Date(nextService) 
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
   * Update maintenance using upsert pattern for vehicle updates
   */
  static async upsertMaintenanceForVehicle(vehicleId, maintenanceData) {
    const { insuranceExpiry, nextOilChange, nextService } = maintenanceData;
    const operations = [];

    // Insurance upsert
    if (insuranceExpiry !== undefined) {
      if (insuranceExpiry && insuranceExpiry.trim() && insuranceExpiry !== '') {
        operations.push(
          prisma.maintenance.upsert({
            where: {
              vehicleId_type: {
                vehicleId: parseInt(vehicleId),
                type: 'INSURANCE'
              }
            },
            update: {
              dueDate: new Date(insuranceExpiry),
              isCompleted: false
            },
            create: {
              vehicleId: parseInt(vehicleId),
              type: 'INSURANCE',
              dueDate: new Date(insuranceExpiry)
            }
          })
        );
      } else {
        // Mark as completed if exists
        operations.push(
          prisma.maintenance.updateMany({
            where: { 
              vehicleId: parseInt(vehicleId), 
              type: 'INSURANCE',
              isCompleted: false
            },
            data: { isCompleted: true }
          })
        );
      }
    }

    // Oil change upsert
    if (nextOilChange !== undefined) {
      if (nextOilChange && String(nextOilChange).trim() !== '') {
        operations.push(
          prisma.maintenance.upsert({
            where: {
              vehicleId_type: {
                vehicleId: parseInt(vehicleId),
                type: 'OIL_CHANGE'
              }
            },
            update: {
              dueMileage: parseInt(nextOilChange),
              dueDate: new Date(),
              isCompleted: false
            },
            create: {
              vehicleId: parseInt(vehicleId),
              type: 'OIL_CHANGE',
              dueDate: new Date(),
              dueMileage: parseInt(nextOilChange)
            }
          })
        );
      } else {
        operations.push(
          prisma.maintenance.updateMany({
            where: { 
              vehicleId: parseInt(vehicleId), 
              type: 'OIL_CHANGE',
              isCompleted: false
            },
            data: { isCompleted: true }
          })
        );
      }
    }

    // Service upsert
    if (nextService !== undefined) {
      if (nextService && nextService.trim() && nextService !== '') {
        operations.push(
          prisma.maintenance.upsert({
            where: {
              vehicleId_type: {
                vehicleId: parseInt(vehicleId),
                type: 'SERVICE'
              }
            },
            update: {
              dueDate: new Date(nextService),
              isCompleted: false
            },
            create: {
              vehicleId: parseInt(vehicleId),
              type: 'SERVICE',
              dueDate: new Date(nextService)
            }
          })
        );
      } else {
        operations.push(
          prisma.maintenance.updateMany({
            where: { 
              vehicleId: parseInt(vehicleId), 
              type: 'SERVICE',
              isCompleted: false
            },
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
   * Get active maintenance alerts with proper filtering
   */
  static async getActiveAlerts() {
    const currentDate = new Date();
    
    // Get all vehicles with their maintenance records
    const vehicles = await prisma.vehicle.findMany({
      include: {
        maintenance: {
          where: { isCompleted: false }
        }
      }
    });

    const alerts = [];

    for (const vehicle of vehicles) {
      // Check oil change based on current mileage vs nextOilChangeMileage
      if (vehicle.nextOilChangeMileage && vehicle.currentMileage >= vehicle.nextOilChangeMileage) {
        // Find or create oil change maintenance record
        let oilMaintenance = vehicle.maintenance.find(m => m.type === 'OIL_CHANGE');
        if (!oilMaintenance) {
          oilMaintenance = await prisma.maintenance.create({
            data: {
              vehicleId: vehicle.id,
              type: 'OIL_CHANGE',
              dueDate: new Date(),
              dueMileage: vehicle.nextOilChangeMileage
            }
          });
        }
        alerts.push({ ...oilMaintenance, vehicle });
      }

      // Check service date
      if (vehicle.nextServiceDate && vehicle.nextServiceDate <= currentDate) {
        let serviceMaintenance = vehicle.maintenance.find(m => m.type === 'SERVICE');
        if (!serviceMaintenance) {
          serviceMaintenance = await prisma.maintenance.create({
            data: {
              vehicleId: vehicle.id,
              type: 'SERVICE',
              dueDate: vehicle.nextServiceDate
            }
          });
        }
        alerts.push({ ...serviceMaintenance, vehicle });
      }

      // Check insurance expiry
      if (vehicle.insuranceExpiryDate && vehicle.insuranceExpiryDate <= currentDate) {
        let insuranceMaintenance = vehicle.maintenance.find(m => m.type === 'INSURANCE');
        if (!insuranceMaintenance) {
          insuranceMaintenance = await prisma.maintenance.create({
            data: {
              vehicleId: vehicle.id,
              type: 'INSURANCE',
              dueDate: vehicle.insuranceExpiryDate
            }
          });
        }
        alerts.push({ ...insuranceMaintenance, vehicle });
      }
    }

    return alerts.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  /**
   * Update maintenance schedules and generate alerts
   */
  static async updateMaintenanceSchedules(vehicleId, data) {
    const { nextOilChangeMileage, nextServiceDate, insuranceExpiryDate } = data;
    const operations = [];

    // Update vehicle fields
    const vehicleUpdate = {};
    if (nextOilChangeMileage !== undefined) vehicleUpdate.nextOilChangeMileage = nextOilChangeMileage ? parseInt(nextOilChangeMileage) : null;
    if (nextServiceDate !== undefined) vehicleUpdate.nextServiceDate = nextServiceDate ? new Date(nextServiceDate) : null;
    if (insuranceExpiryDate !== undefined) vehicleUpdate.insuranceExpiryDate = insuranceExpiryDate ? new Date(insuranceExpiryDate) : null;

    if (Object.keys(vehicleUpdate).length > 0) {
      operations.push(
        prisma.vehicle.update({
          where: { id: parseInt(vehicleId) },
          data: vehicleUpdate
        })
      );
    }

    // Mark existing maintenance as complete
    operations.push(
      prisma.maintenance.updateMany({
        where: { vehicleId: parseInt(vehicleId), isCompleted: false },
        data: { isCompleted: true }
      })
    );

    // Create new maintenance records
    if (nextOilChangeMileage) {
      operations.push(
        prisma.maintenance.create({
          data: {
            vehicleId: parseInt(vehicleId),
            type: 'OIL_CHANGE',
            dueDate: new Date(),
            dueMileage: parseInt(nextOilChangeMileage)
          }
        })
      );
    }

    if (nextServiceDate) {
      operations.push(
        prisma.maintenance.create({
          data: {
            vehicleId: parseInt(vehicleId),
            type: 'SERVICE',
            dueDate: new Date(nextServiceDate)
          }
        })
      );
    }

    if (insuranceExpiryDate) {
      operations.push(
        prisma.maintenance.create({
          data: {
            vehicleId: parseInt(vehicleId),
            type: 'INSURANCE',
            dueDate: new Date(insuranceExpiryDate)
          }
        })
      );
    }

    await prisma.$transaction(operations);
    return { success: true, message: 'Maintenance schedules updated successfully' };
  }

  /**
   * Generate alerts for a specific vehicle
   */
  static async generateAlertsForVehicle(vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        maintenance: {
          where: { isCompleted: false }
        }
      }
    });

    if (!vehicle) return;

    const currentDate = new Date();
    const operations = [];

    // Check oil change based on current mileage vs nextOilChangeMileage
    if (vehicle.nextOilChangeMileage && vehicle.currentMileage >= vehicle.nextOilChangeMileage) {
      const existingOilAlert = vehicle.maintenance.find(m => m.type === 'OIL_CHANGE');
      if (!existingOilAlert) {
        operations.push(
          prisma.maintenance.create({
            data: {
              vehicleId: vehicle.id,
              type: 'OIL_CHANGE',
              dueDate: new Date(),
              dueMileage: vehicle.nextOilChangeMileage
            }
          })
        );
      }
    }

    // Check service date
    if (vehicle.nextServiceDate && vehicle.nextServiceDate <= currentDate) {
      const existingServiceAlert = vehicle.maintenance.find(m => m.type === 'SERVICE');
      if (!existingServiceAlert) {
        operations.push(
          prisma.maintenance.create({
            data: {
              vehicleId: vehicle.id,
              type: 'SERVICE',
              dueDate: vehicle.nextServiceDate
            }
          })
        );
      }
    }

    // Check insurance expiry
    if (vehicle.insuranceExpiryDate && vehicle.insuranceExpiryDate <= currentDate) {
      const existingInsuranceAlert = vehicle.maintenance.find(m => m.type === 'INSURANCE');
      if (!existingInsuranceAlert) {
        operations.push(
          prisma.maintenance.create({
            data: {
              vehicleId: vehicle.id,
              type: 'INSURANCE',
              dueDate: vehicle.insuranceExpiryDate
            }
          })
        );
      }
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }
  }

  /**
   * Validate maintenance data
   */
  static validateMaintenanceData(type, data) {
    if (type === 'OIL_CHANGE') {
      if (!data.dueMileage || data.dueMileage <= 0) {
        throw new Error('Oil change requires valid dueMileage');
      }
    } else {
      if (!data.dueDate) {
        throw new Error(`${type} requires dueDate`);
      }
    }
  }
}