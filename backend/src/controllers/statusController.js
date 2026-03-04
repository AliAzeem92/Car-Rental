import prisma from '../config/prisma.js';
import { 
  getAvailableReservationTransitions, 
  getAvailablePaymentTransitions 
} from '../services/stateMachine.js';

export const getAvailableStatusTransitions = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      select: { status: true, paymentStatus: true }
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json({
      availableReservationStatuses: getAvailableReservationTransitions(reservation.status),
      availablePaymentStatuses: getAvailablePaymentTransitions(reservation.paymentStatus),
      currentReservationStatus: reservation.status,
      currentPaymentStatus: reservation.paymentStatus
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
