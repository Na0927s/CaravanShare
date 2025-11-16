import { Router } from 'express';
import { createReservation, getMyReservations, getHostReservations, updateReservationStatus, confirmPayment } from '../controllers/reservationController';

const router = Router();

router.post('/', createReservation);
router.get('/my-reservations', getMyReservations);
router.get('/host-reservations', getHostReservations);
router.put('/:id/status', updateReservationStatus);
router.put('/:id/pay', confirmPayment);

export default router;
