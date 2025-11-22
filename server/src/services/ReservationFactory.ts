import { Reservation } from '../entities/Reservation'; // Use the TypeORM entity for correct property names

export class ReservationFactory {
  createReservation(
    caravan_id: string,
    guest_id: string,
    startDateString: string,
    endDateString: string,
    total_price: number,
    status: Reservation['status'] = 'pending'
  ): Partial<Reservation> { // Changed return type to Partial<Reservation>
    const start_date = new Date(startDateString);
    const end_date = new Date(endDateString);

    return {
      id: crypto.randomUUID(),
      caravan_id,
      guest_id,
      start_date,
      end_date,
      status,
      total_price,
      created_at: new Date(), // Explicitly set creation date
      updated_at: new Date(), // Explicitly set update date
      // Omit 'caravan', 'guest', 'payment' as they are relations typically managed by TypeORM or set after creation
    };
  }
}
