import { ReservationRepository } from '../repositories/ReservationRepository';
import { BadRequestError, ConflictError } from '../exceptions';
import { Reservation } from '../models/Reservation'; // Import Reservation model for type safety

export class ReservationValidator {
  private reservationRepository: ReservationRepository;

  constructor(reservationRepository: ReservationRepository) {
    this.reservationRepository = reservationRepository;
  }

  validateReservationDates(startDate: string, endDate: string): void {
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    if (newStart >= newEnd) {
      throw new BadRequestError('End date must be after start date');
    }
    // Add any other date related validations here (e.g., future dates only)
  }

  async checkOverlappingReservations(
    caravanId: string,
    startDate: string,
    endDate: string
  ): Promise<void> {
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    const overlappingReservations = await this.reservationRepository.findOverlappingReservations(
      caravanId,
      newStart,
      newEnd
    );

    if (overlappingReservations.length > 0) {
      throw new ConflictError('The selected dates are not available for this caravan.');
    }
  }
}