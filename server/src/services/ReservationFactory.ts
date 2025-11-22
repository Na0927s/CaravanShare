import { Reservation } from '../models/Reservation';

export class ReservationFactory {
  createReservation(
    caravanId: string,
    guestId: string,
    startDate: string,
    endDate: string,
    totalPrice: number,
    status: Reservation['status'] = 'pending'
  ): Reservation {
    return {
      id: crypto.randomUUID(),
      caravanId,
      guestId,
      startDate,
      endDate,
      status,
      totalPrice,
    };
  }
}
