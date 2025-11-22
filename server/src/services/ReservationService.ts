import { Reservation } from '../models/Reservation';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { CaravanRepository } from '../repositories/CaravanRepository';
import { UserService } from './UserService';
import { PaymentService } from './PaymentService';
import { ReservationValidator } from './ReservationValidator';
import { ReservationFactory } from './ReservationFactory';
import { DiscountStrategy } from './DiscountStrategy';
import { ConcreteSubject } from '../utils/ObserverPattern'; // Import ConcreteSubject
import { NotificationService } from './NotificationService'; // Import NotificationService
import { BadRequestError, NotFoundError, ConflictError } from '../exceptions/index';
import { Payment } from '../models/Payment';

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
  private reservationEventSubject: ConcreteSubject<ReservationEvent>; // Add Subject

  constructor(
    reservationRepository: ReservationRepository,
    caravanRepository: CaravanRepository,
    userService: UserService,
    paymentService: PaymentService,
    reservationValidator: ReservationValidator,
    reservationFactory: ReservationFactory,
    discountStrategy: DiscountStrategy,
    notificationService: NotificationService // Inject NotificationService
  ) {
    this.reservationRepository = reservationRepository;
    this.caravanRepository = caravanRepository;
    this.userService = userService;
    this.paymentService = paymentService;
    this.reservationValidator = reservationValidator;
    this.reservationFactory = reservationFactory;
    this.discountStrategy = discountStrategy;
    this.reservationEventSubject = new ConcreteSubject<ReservationEvent>(); // Instantiate Subject
    this.reservationEventSubject.attach(notificationService); // Attach NotificationService as observer
  }

  async createReservation(
    reservationData: Omit<Reservation, 'id' | 'status' | 'totalPrice'>
  ): Promise<Reservation> {
    const { caravanId, guestId, startDate, endDate } = reservationData;

    if (!caravanId || !guestId || !startDate || !endDate) {
      throw new BadRequestError('Missing required fields');
    }

    const caravan = await this.caravanRepository.findById(caravanId);
    if (!caravan) {
      throw new NotFoundError('Caravan not found');
    }

    // Delegate date validation to ReservationValidator
    this.reservationValidator.validateReservationDates(startDate, endDate);

    // Delegate overlapping reservation check to ReservationValidator
    await this.reservationValidator.checkOverlappingReservations(
      caravanId,
      startDate,
      endDate
    );

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    const durationInDays = Math.ceil(
      (newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const originalPrice = durationInDays * caravan.pricePerDay;
    const totalPrice = this.discountStrategy.applyDiscount(originalPrice);

    const newReservation = this.reservationFactory.createReservation(
      caravanId,
      guestId,
      startDate,
      endDate,
      totalPrice,
      'pending' // Initial status
    );

    const createdReservation = await this.reservationRepository.create(newReservation);

    // Notify observers about new reservation
    this.reservationEventSubject.notify({
      type: 'new_reservation',
      reservationId: createdReservation.id,
      userId: createdReservation.guestId,
      message: `새로운 예약이 접수되었습니다. 예약 ID: ${createdReservation.id}.`,
    });

    return createdReservation;
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
    const hostCaravans = await this.caravanRepository.findAll();
    const hostCaravanIds = hostCaravans.filter(c => c.hostId === hostId).map(c => c.id);

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

    const updatedReservation = await this.reservationRepository.update(id, { status: newStatus });
    if (!updatedReservation) {
        throw new Error('Failed to update reservation status');
    }

    // Notify observers about status change
    this.reservationEventSubject.notify({
      type: 'status_change',
      reservationId: updatedReservation.id,
      userId: updatedReservation.guestId, // Or hostId, depending on who gets notified
      newStatus: updatedReservation.status,
      message: `예약 ID ${updatedReservation.id}의 상태가 ${updatedReservation.status}로 변경되었습니다.`,
    });

    return updatedReservation;
  }

  async confirmPayment(id: string): Promise<Reservation> {
    if (!id) {
      throw new BadRequestError('Reservation ID is required');
    }

    const payment = await this.paymentService.processPayment(id);
    
    const updatedReservation = await this.reservationRepository.findById(id);
    if (!updatedReservation) {
      throw new Error('Confirmed reservation not found after payment processing');
    }

    await this.userService.recordReservationCompletion(updatedReservation.guestId);

    // Notify observers about payment confirmation
    this.reservationEventSubject.notify({
      type: 'payment_confirmed',
      reservationId: updatedReservation.id,
      userId: updatedReservation.guestId,
      message: `예약 ID ${updatedReservation.id}에 대한 결제가 확인되었습니다.`,
    });

    return updatedReservation;
  }

  async getPaymentHistory(userId: string): Promise<Payment[]> {
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }
    return this.paymentService.getPaymentHistoryByUserId(userId);
  }
}