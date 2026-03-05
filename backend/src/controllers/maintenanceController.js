import prisma from '../config/prisma.js';

export const markComplete = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenance = await prisma.maintenance.findUnique({
      where: { id: parseInt(id) }
    });

    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    if (maintenance.isCompleted) {
      return res.status(400).json({ success: false, message: 'Maintenance already marked as complete' });
    }

    await prisma.maintenance.update({
      where: { id: parseInt(id) },
      data: { isCompleted: true }
    });

    res.json({ success: true, message: 'Maintenance marked as complete' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMaintenance = async (req, res) => {
  try {
    const { vehicleId, insuranceId, insuranceExpiry, oilChangeId, nextOilChange, serviceId, nextService } = req.body;

    console.log('Maintenance Update Payload:', req.body);

    if (!vehicleId) {
      return res.status(400).json({ success: false, message: 'Vehicle ID is required' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(vehicleId) } });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Handle Insurance
    if (insuranceExpiry !== undefined) {
      if (insuranceExpiry && insuranceExpiry !== '') {
        if (insuranceId) {
          await prisma.maintenance.update({
            where: { id: parseInt(insuranceId) },
            data: { dueDate: new Date(insuranceExpiry) }
          });
        } else {
          await prisma.maintenance.create({
            data: { vehicleId: parseInt(vehicleId), type: 'INSURANCE', dueDate: new Date(insuranceExpiry) }
          });
        }
      } else if (insuranceId) {
        await prisma.maintenance.update({
          where: { id: parseInt(insuranceId) },
          data: { isCompleted: true }
        });
      }
    }

    // Handle Oil Change
    if (nextOilChange !== undefined) {
      const oilKm = Number(nextOilChange);
      if (oilKm && oilKm > 0) {
        if (oilChangeId) {
          await prisma.maintenance.update({
            where: { id: parseInt(oilChangeId) },
            data: { 
              dueMileage: oilKm,
              dueDate: new Date()
            }
          });
        } else {
          await prisma.maintenance.create({
            data: { 
              vehicleId: parseInt(vehicleId), 
              type: 'OIL_CHANGE', 
              dueDate: new Date(), 
              dueMileage: oilKm 
            }
          });
        }
      } else if (oilChangeId) {
        await prisma.maintenance.update({
          where: { id: parseInt(oilChangeId) },
          data: { isCompleted: true }
        });
      }
    }

    // Handle Service
    if (nextService !== undefined) {
      if (nextService && nextService !== '') {
        if (serviceId) {
          await prisma.maintenance.update({
            where: { id: parseInt(serviceId) },
            data: { dueDate: new Date(nextService) }
          });
        } else {
          await prisma.maintenance.create({
            data: { vehicleId: parseInt(vehicleId), type: 'SERVICE', dueDate: new Date(nextService) }
          });
        }
      } else if (serviceId) {
        await prisma.maintenance.update({
          where: { id: parseInt(serviceId) },
          data: { isCompleted: true }
        });
      }
    }

    res.json({ success: true, message: 'Maintenance updated successfully' });
  } catch (error) {
    console.error('Maintenance update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
