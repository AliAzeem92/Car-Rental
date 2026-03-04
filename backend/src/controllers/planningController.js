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
    const alerts = await prisma.maintenance.findMany({
      where: {
        isCompleted: false
      },
      include: { vehicle: true },
      orderBy: { dueDate: 'asc' }
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
