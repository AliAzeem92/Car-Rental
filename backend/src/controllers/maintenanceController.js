import prisma from '../config/prisma.js';
import { MaintenanceService } from '../services/maintenanceService.js';

export const markComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MaintenanceService.markComplete(id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Maintenance record not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Maintenance already marked as complete') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMaintenance = async (req, res) => {
  try {
    const { vehicleId } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ success: false, message: 'Vehicle ID is required' });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(vehicleId) } });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    await MaintenanceService.updateMaintenanceForVehicle(vehicleId, req.body);

    res.json({ success: true, message: 'Maintenance updated successfully' });
  } catch (error) {
    console.error('Maintenance update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSchedules = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const result = await MaintenanceService.updateMaintenanceSchedules(vehicleId, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAlerts = async (req, res) => {
  try {
    const alerts = await MaintenanceService.getActiveAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
