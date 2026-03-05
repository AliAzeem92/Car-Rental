import { CheckInOutService } from '../services/checkInOutService.js';

export const createCheckOut = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.userId;

    const checkout = await CheckInOutService.createCheckOut(
      parseInt(reservationId),
      userId
    );

    res.status(201).json(checkout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createCheckIn = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { mileageIn, damageReport, extraCharges } = req.body;
    const userId = req.userId;

    const result = await CheckInOutService.createCheckIn(
      parseInt(reservationId),
      mileageIn,
      damageReport,
      extraCharges,
      userId
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getCheckInOut = async (req, res) => {
  try {
    const { reservationId } = req.params;

    const reservation = await CheckInOutService.getCheckInOut(
      parseInt(reservationId)
    );

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCheckIn = async (req, res) => {
  try {
    const { checkinId } = req.params;
    const userId = req.userId;

    const updatedCheckin = await CheckInOutService.updateCheckIn(
      parseInt(checkinId),
      req.body,
      userId
    );

    res.json(updatedCheckin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};