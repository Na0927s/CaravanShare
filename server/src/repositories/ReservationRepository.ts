import { Reservation } from '../models/Reservation';
import { JsonFileRepository } from './JsonFileRepository';

export class ReservationRepository extends JsonFileRepository<Reservation> {
  constructor() {
    super('reservations.json');
  }

  async findOverlappingReservations(
    caravanId: string,
    newStartDate: Date,
    newEndDate: Date
  ): Promise<Reservation[]> {
    const allReservations = await this.getAll();
    return allReservations.filter(r => {
      // Only consider confirmed or pending reservations
      if (r.caravanId !== caravanId || !['confirmed', 'pending', 'awaiting_payment'].includes(r.status)) {
        return false;
      }

      const existingStart = new Date(r.startDate);
      const existingEnd = new Date(r.endDate);

      // Check for overlap: new reservation overlaps if it starts before existing ends AND ends after existing starts
      return newStartDate < existingEnd && newEndDate > existingStart;
    });
  }

  async findByGuestId(guestId: string): Promise<Reservation[]> {
    const allReservations = await this.getAll();
    return allReservations.filter(r => r.guestId === guestId);
  }

  async findByCaravanIds(caravanIds: string[]): Promise<Reservation[]> {
    const allReservations = await this.getAll();
    return allReservations.filter(r => caravanIds.includes(r.caravanId));
  }
}
