import { Payment } from '../models/Payment';
import { Reservation } from '../models/Reservation';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { BadRequestError, NotFoundError, ConflictError } from '../exceptions';

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

    // Simulate payment processing
    const newPayment: Payment = {
      id: crypto.randomUUID(),
      reservationId: reservation.id,
      amount: reservation.totalPrice,
      paymentDate: new Date().toISOString(),
      status: 'completed', // Simulate successful payment
      transactionId: `txn_${crypto.randomUUID()}`,
    };

    await this.paymentRepository.create(newPayment);

    // Update reservation status to confirmed
    await this.reservationRepository.update(reservation.id, { status: 'confirmed' });

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
    // This requires fetching all reservations for the user, then finding related payments.
    // This might be inefficient for large datasets and a proper DB query would be better.
    // For JSON file based, we fetch all reservations then filter.
    const userReservations = await this.reservationRepository.findByGuestId(userId);
    const userReservationIds = userReservations.map(res => res.id);

    const allPayments = await this.paymentRepository.findAll();
    const userPayments = allPayments.filter(payment => userReservationIds.includes(payment.reservationId));
    
    return userPayments;
  }
}
