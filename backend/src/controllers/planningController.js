import prisma from '../config/prisma.js';

export const getCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let startDate, endDate;
    if (month && year) {
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0);
    } else {
      startDate = new Date();
      startDate.setDate(1);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        status: { in: ['CONFIRMED', 'ONGOING'] },
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } }
        ]
      },
      include: {
        vehicle: { include: { vehicleimage: true } },
        user: true
      },
      orderBy: { startDate: 'asc' }
    });

    const maintenance = await prisma.maintenance.findMany({
      where: {
        isCompleted: false,
        dueDate: { gte: startDate, lte: endDate }
      },
      include: { vehicle: true }
    });

    res.json({ reservations, maintenance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMaintenanceAlerts = async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Get date-based alerts (INSURANCE, SERVICE)
    const dateBasedAlerts = await prisma.maintenance.findMany({
      where: {
        isCompleted: false,
        type: { in: ['INSURANCE', 'SERVICE'] },
        dueDate: { lte: currentDate }
      },
      include: { vehicle: true },
      orderBy: { dueDate: 'asc' }
    });

    // Get mileage-based alerts (OIL_CHANGE)
    // Note: Cannot filter by mileage in Prisma query due to cross-table comparison
    const oilChangeRecords = await prisma.maintenance.findMany({
      where: {
        isCompleted: false,
        type: 'OIL_CHANGE',
        dueMileage: { not: null }
      },
      include: { vehicle: true },
      orderBy: { dueDate: 'asc' }
    });

    // Filter oil changes by mileage (must be done in JavaScript)
    const oilChangeAlerts = oilChangeRecords.filter(maintenance => 
      maintenance.vehicle.mileage >= maintenance.dueMileage
    );

    // Combine and sort all alerts
    const alerts = [...dateBasedAlerts, ...oilChangeAlerts]
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
