import { Reservation } from '../entities/Reservation'; // Import the TypeORM Reservation entity
import { Caravan } from '../entities/Caravan'; // Import the TypeORM Caravan entity
import { ReservationRepository } from '../repositories/ReservationRepository';
import { CaravanRepository } from '../repositories/CaravanRepository';
import { UserService } from './UserService';
import { PaymentService } from './PaymentService';
import { ReservationValidator } from './ReservationValidator';
import { ReservationFactory } from './ReservationFactory';
import { DiscountStrategy } from './DiscountStrategy';
import { ConcreteSubject } from '../utils/ObserverPattern';
import { NotificationService } from './NotificationService';
import { BadRequestError, NotFoundError, ConflictError } from '../exceptions/index';
import { Payment } from '../entities/Payment'; // Keep Payment model for getPaymentHistory return type

// Define the event structure for reservation events
interface ReservationEvent {
  type: 'status_change' | 'new_reservation' | 'payment_confirmed';
  reservationId: string;
  userId?: string; // Guest or Host ID
  newStatus?: Reservation['status'];
  message?: string;
}

export class ReservationService {
  private reservationRepository: ReservationRepository;
  private caravanRepository: CaravanRepository;
  private userService: UserService;
  private paymentService: PaymentService;
  private reservationValidator: ReservationValidator;
  private reservationFactory: ReservationFactory;
  private discountStrategy: DiscountStrategy;
  private reservationEventSubject: ConcreteSubject<ReservationEvent>;

  constructor(
    reservationRepository: ReservationRepository,
    caravanRepository: CaravanRepository,
    userService: UserService,
    paymentService: PaymentService,
    reservationValidator: ReservationValidator,
    reservationFactory: ReservationFactory,
    discountStrategy: DiscountStrategy,
    notificationService: NotificationService
  ) {
    this.reservationRepository = reservationRepository;
    this.caravanRepository = caravanRepository;
    this.userService = userService;
    this.paymentService = paymentService;
    this.reservationValidator = reservationValidator;
    this.reservationFactory = reservationFactory;
    this.discountStrategy = discountStrategy;
    this.reservationEventSubject = new ConcreteSubject<ReservationEvent>();
    this.reservationEventSubject.attach(notificationService);
  }

  async createReservation(
    reservationData: Omit<Reservation, 'id' | 'status' | 'caravan' | 'guest' | 'payment' | 'created_at' | 'updated_at' | 'total_price'>
  ): Promise<Reservation> {
    const { caravan_id, guest_id } = reservationData;
    let { start_date, end_date } = reservationData;

    // Convert string dates to Date objects if they are not already
    const parsedStartDate = new Date(start_date);
    const parsedEndDate = new Date(end_date);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      throw new BadRequestError('Invalid date format provided for start_date or end_date');
    }

    // Assign parsed dates back to start_date and end_date for consistent use
    start_date = parsedStartDate;
    end_date = parsedEndDate;

    if (!caravan_id || !guest_id || !start_date || !end_date) {
      throw new BadRequestError('Missing required fields');
    }

    const caravan = await this.caravanRepository.findById(caravan_id);
    if (!caravan) {
      throw new NotFoundError('Caravan not found');
    }

    try {
      // Delegate date validation to ReservationValidator
      this.reservationValidator.validateReservationDates(start_date.toISOString().split('T')[0], end_date.toISOString().split('T')[0]); // Pass string dates

      // Delegate overlapping reservation check to ReservationValidator
      await this.reservationValidator.checkOverlappingReservations(
        caravan_id,
        start_date.toISOString().split('T')[0], // Convert Date to string
        end_date.toISOString().split('T')[0]    // Convert Date to string
      );

      const newStart = new Date(start_date);
      const newEnd = new Date(end_date);
      const durationInDays = Math.ceil(
        (newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const originalPrice = durationInDays * caravan.price_per_day; // Use price_per_day
      const total_price = this.discountStrategy.applyDiscount(originalPrice); // Use total_price

      const newReservation = this.reservationFactory.createReservation(
        caravan_id,
        guest_id,
        start_date.toISOString().split('T')[0], // Factory expects string dates
        end_date.toISOString().split('T')[0], // Factory expects string dates
        total_price,
        'pending' // Initial status
      );

      const createdReservation = await this.reservationRepository.create(newReservation);

      // Notify observers about new reservation
      this.reservationEventSubject.notify({
        type: 'new_reservation',
        reservationId: createdReservation.id,
        userId: createdReservation.guest_id,
        message: `새로운 예약이 접수되었습니다. 예약 ID: ${createdReservation.id}.`,
      });

      return createdReservation;
    } catch (error) {
      console.error(error instanceof Error ? error.stack : error);
      throw error; // Re-throw to be caught by controller
    }
  }

  async getMyReservations(guestId: string): Promise<Reservation[]> {
    if (!guestId) {
      throw new BadRequestError('Guest ID is required');
    }
    return this.reservationRepository.findByGuestId(guestId);
  }

  async getHostReservations(hostId: string): Promise<Reservation[]> {
    if (!hostId) {
      throw new BadRequestError('Host ID is required');
    }
    const hostCaravans = await this.caravanRepository.findByHostId(hostId); // Use findByHostId
    const hostCaravanIds = hostCaravans.map(c => c.id);

    if (hostCaravanIds.length === 0) {
        return [];
    }

    return this.reservationRepository.findByCaravanIds(hostCaravanIds);
  }

  async updateReservationStatus(
    id: string,
    status: 'approved' | 'rejected'
  ): Promise<Reservation> {
    if (!id || !status) {
      throw new BadRequestError('Reservation ID and status are required');
    }
    if (!['approved', 'rejected'].includes(status)) {
      throw new BadRequestError('Invalid status provided. Must be "approved" or "rejected"');
    }

    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    let newStatus: Reservation['status'];
    if (status === 'approved') {
      newStatus = 'awaiting_payment';
    } else {
      newStatus = 'rejected';
    }

    try {
      const updatedReservation = await this.reservationRepository.update(id, { status: newStatus });
      if (!updatedReservation) {
          throw new Error('Failed to update reservation status');
      }

      // Notify observers about status change
      this.reservationEventSubject.notify({
        type: 'status_change',
        reservationId: updatedReservation.id,
        userId: updatedReservation.guest_id, // Use guest_id
        newStatus: updatedReservation.status,
        message: `예약 ID ${updatedReservation.id}의 상태가 ${updatedReservation.status}로 변경되었습니다.`,
      });

      return updatedReservation;
    } catch (error) {
      console.error(error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async confirmPayment(id: string): Promise<Reservation> {
    if (!id) {
      throw new BadRequestError('Reservation ID is required');
    }

    try {
      const payment = await this.paymentService.processPayment(id);
      
      const updatedReservation = await this.reservationRepository.findById(id);
      if (!updatedReservation) {
        throw new Error('Confirmed reservation not found after payment processing');
      }

      await this.userService.recordReservationCompletion(updatedReservation.guest_id); // Use guest_id

      // Notify observers about payment confirmation
      this.reservationEventSubject.notify({
        type: 'payment_confirmed',
        reservationId: updatedReservation.id,
        userId: updatedReservation.guest_id, // Use guest_id
        message: `예약 ID ${updatedReservation.id}에 대한 결제가 확인되었습니다.`,
      });

      return updatedReservation;
    } catch (error) {
      console.error(error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async getPaymentHistory(userId: string): Promise<Payment[]> {
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }
    try {
      return this.paymentService.getPaymentHistoryByUserId(userId);
    } catch (error) {
      console.error(error instanceof Error ? error.stack : error);
      throw error;
    }
  }
}