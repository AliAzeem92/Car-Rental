import prisma from '../config/prisma.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { MaintenanceService } from '../services/maintenanceService.js';

export const getVehicles = async (req, res) => {
  try {
    const { status, category } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: { vehicleimage: true, maintenance: true, _count: { select: { reservation: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVehicle = async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { vehicleimage: true, maintenance: true }
    });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createVehicle = async (req, res) => {
  try {
    const { 
      brand, model, year, licensePlate, category, color, seats, 
      transmission, fuelType, status, description, features,
      dailyPrice, deposit, mileage,
      insuranceExpiry, nextOilChange, nextService
    } = req.body;
    
    console.log('Maintenance data received:', { insuranceExpiry, nextOilChange, nextService });
    
    const existing = await prisma.vehicle.findUnique({ where: { licensePlate } });
    if (existing) {
      return res.status(400).json({ error: 'License plate already exists' });
    }

    const vehicleData = {
      brand,
      model,
      licensePlate,
      category,
      dailyPrice: parseFloat(dailyPrice),
      deposit: deposit ? parseFloat(deposit) : 0,
      currentMileage: mileage ? parseInt(mileage) : 0
    };

    if (year) vehicleData.year = parseInt(year);
    if (color) vehicleData.color = color;
    if (seats) vehicleData.seats = parseInt(seats);
    if (transmission) vehicleData.transmission = transmission;
    if (fuelType) vehicleData.fuelType = fuelType;
    if (status) vehicleData.status = status;
    if (description) vehicleData.description = description;
    if (features) vehicleData.features = features;
    if (nextOilChange) vehicleData.nextOilChangeMileage = parseInt(nextOilChange);

    const vehicle = await prisma.vehicle.create({ data: vehicleData });

    // Create maintenance records using service
    if (insuranceExpiry || nextOilChange || nextService) {
      await MaintenanceService.createMaintenanceForVehicle(vehicle.id, {
        insuranceExpiry,
        nextOilChange,
        nextService
      });
    }

    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'vehicles'))
      );
      
      await prisma.vehicleimage.createMany({
        data: imageUrls.map(url => ({ vehicleId: vehicle.id, imageUrl: url }))
      });
    }

    const vehicleWithImages = await prisma.vehicle.findUnique({
      where: { id: vehicle.id },
      include: { vehicleimage: true, maintenance: true }
    });

    res.status(201).json(vehicleWithImages);
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { existingImageIds, insuranceExpiry, nextOilChange, nextService, ...updateData } = req.body;

    console.log('Update vehicle data received:', updateData);
    console.log('Maintenance dates received:', { nextServiceDate: updateData.nextServiceDate, insuranceExpiryDate: updateData.insuranceExpiryDate });

    if (updateData.licensePlate) {
      const existing = await prisma.vehicle.findFirst({
        where: { licensePlate: updateData.licensePlate, id: { not: parseInt(id) } }
      });
      if (existing) {
        return res.status(400).json({ error: 'License plate already exists' });
      }
    }

    const vehicleData = {};
    if (updateData.brand) vehicleData.brand = updateData.brand;
    if (updateData.model) vehicleData.model = updateData.model;
    if (updateData.licensePlate) vehicleData.licensePlate = updateData.licensePlate;
    if (updateData.category) vehicleData.category = updateData.category;
    if (updateData.dailyPrice) vehicleData.dailyPrice = parseFloat(updateData.dailyPrice);
    if (updateData.deposit !== undefined) vehicleData.deposit = parseFloat(updateData.deposit);
    if (updateData.currentMileage !== undefined && updateData.currentMileage !== '') {
      vehicleData.currentMileage = parseInt(updateData.currentMileage);
    }
    if (updateData.nextOilChangeMileage !== undefined) {
      vehicleData.nextOilChangeMileage = updateData.nextOilChangeMileage ? parseInt(updateData.nextOilChangeMileage) : null;
    }
    if (nextOilChange !== undefined) {
      vehicleData.nextOilChangeMileage = nextOilChange ? parseInt(nextOilChange) : null;
    }
    if (updateData.nextServiceDate !== undefined) {
      vehicleData.nextServiceDate = updateData.nextServiceDate ? new Date(updateData.nextServiceDate) : null;
    }
    if (updateData.insuranceExpiryDate !== undefined) {
      vehicleData.insuranceExpiryDate = updateData.insuranceExpiryDate ? new Date(updateData.insuranceExpiryDate) : null;
    }
    if (nextService !== undefined) {
      vehicleData.nextServiceDate = nextService ? new Date(nextService) : null;
    }
    if (insuranceExpiry !== undefined) {
      vehicleData.insuranceExpiryDate = insuranceExpiry ? new Date(insuranceExpiry) : null;
    }
    if (updateData.status) vehicleData.status = updateData.status;
    if (updateData.year) vehicleData.year = parseInt(updateData.year);
    if (updateData.color) vehicleData.color = updateData.color;
    if (updateData.seats) vehicleData.seats = parseInt(updateData.seats);
    if (updateData.transmission) vehicleData.transmission = updateData.transmission;
    if (updateData.fuelType) vehicleData.fuelType = updateData.fuelType;
    if (updateData.description !== undefined) vehicleData.description = updateData.description;
    if (updateData.features !== undefined) vehicleData.features = updateData.features;

    console.log('Processed vehicle data:', vehicleData);

    // Update maintenance using service (replaces delete-then-create pattern)
    if (insuranceExpiry !== undefined || nextOilChange !== undefined || nextService !== undefined) {
      await MaintenanceService.upsertMaintenanceForVehicle(id, {
        insuranceExpiry,
        nextOilChange,
        nextService
      });
    }

    if (existingImageIds) {
      const currentImages = await prisma.vehicleimage.findMany({
        where: { vehicleId: parseInt(id) }
      });
      const idsToKeep = JSON.parse(existingImageIds);
      const imagesToDelete = currentImages.filter(img => !idsToKeep.includes(img.id));
      
      for (const img of imagesToDelete) {
        await prisma.vehicleimage.delete({ where: { id: img.id } });
      }
    }

    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer, 'vehicles'))
      );
      
      await prisma.vehicleimage.createMany({
        data: imageUrls.map(url => ({ vehicleId: parseInt(id), imageUrl: url }))
      });
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: parseInt(id) },
      data: vehicleData,
      include: { vehicleimage: true, maintenance: true }
    });

    // Generate alerts immediately after vehicle update
    await MaintenanceService.generateAlertsForVehicle(parseInt(id));

    console.log('Updated vehicle:', vehicle);
    res.json(vehicle);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message });
  }
};
export const deleteVehicle = async (req, res) => {
  try {
    await prisma.vehicle.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getVehicleHistory = async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { vehicleId: parseInt(req.params.id) },
      include: { user: true, checkin: true, checkout: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
