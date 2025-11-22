import { Payment } from '../entities/Payment'; // Import the TypeORM Payment entity
import { Reservation } from '../entities/Reservation'; // Import the TypeORM Reservation entity
import { PaymentRepository } from '../repositories/PaymentRepository';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { BadRequestError, NotFoundError, ConflictError } from '../exceptions';
import { In } from 'typeorm'; // Import In operator

export class PaymentService {
  private paymentRepository: PaymentRepository;
  private reservationRepository: ReservationRepository;

  constructor(
    paymentRepository: PaymentRepository,
    reservationRepository: ReservationRepository
  ) {
    this.paymentRepository = paymentRepository;
    this.reservationRepository = reservationRepository;
  }

  async processPayment(reservationId: string): Promise<Payment> {
    if (!reservationId) {
      throw new BadRequestError('Reservation ID is required to process payment.');
    }

    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw new NotFoundError('Reservation not found.');
    }

    if (reservation.status !== 'awaiting_payment') {
      throw new BadRequestError('Payment can only be processed for reservations awaiting payment.');
    }

    // Create new payment using TypeORM entity properties
    const newPayment = await this.paymentRepository.create({
      reservation_id: reservation.id, // Use reservation.id
      amount: reservation.total_price, // Use reservation.total_price
      status: 'completed', // Simulate successful payment
      transaction_id: `txn_${crypto.randomUUID()}`, // Use transaction_id
    });

    // Update reservation status to confirmed
    const updatedReservation = await this.reservationRepository.update(reservation.id, { status: 'confirmed' });
    if (!updatedReservation) {
      throw new Error('Failed to update reservation status to confirmed after payment.');
    }

    return newPayment;
  }

  async getPaymentByReservationId(reservationId: string): Promise<Payment> {
    if (!reservationId) {
      throw new BadRequestError('Reservation ID is required.');
    }
    const payment = await this.paymentRepository.findByReservationId(reservationId);
    if (!payment) {
      throw new NotFoundError('Payment not found for this reservation.');
    }
    return payment;
  }

  async getPaymentHistoryByUserId(userId: string): Promise<Payment[]> {
    if (!userId) {
      throw new BadRequestError('User ID is required.');
    }

    // Leverage TypeORM relations for efficiency
    // Find all reservations for the user
    const userReservations = await this.reservationRepository.findByGuestId(userId);

    // Extract reservation IDs
    const userReservationIds = userReservations.map(res => res.id);

    if (userReservationIds.length === 0) {
      return []; // No reservations, no payments
    }

    // Find payments associated with these reservation IDs using the new method
    return this.paymentRepository.findByReservationIds(userReservationIds);
  }
}
