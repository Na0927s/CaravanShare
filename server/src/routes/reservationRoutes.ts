import { Router } from 'express';
import { createReservation, getMyReservations, getHostReservations, updateReservationStatus, confirmPayment, getPaymentHistory } from '../controllers/reservationController';

const router = Router();

router.post('/', createReservation);
router.get('/my-reservations', getMyReservations);
router.get('/host-reservations', getHostReservations);
router.put('/:id/status', updateReservationStatus);
router.put('/:id/pay', confirmPayment);
router.get('/payment-history/:userId', getPaymentHistory); // New route for payment history

export default router;
