import { Reservation } from '../models/Reservation';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { CaravanRepository } from '../repositories/CaravanRepository';
import { UserService } from './UserService';
import { PaymentService } from './PaymentService';
import { ReservationValidator } from './ReservationValidator';
import { ReservationFactory } from './ReservationFactory'; // Import ReservationFactory
import { BadRequestError, NotFoundError, ConflictError } from '../exceptions/index';
import { Payment } from '../models/Payment';

export class ReservationService {
  private reservationRepository: ReservationRepository;
  private caravanRepository: CaravanRepository;
  private userService: UserService;
  private paymentService: PaymentService;
  private reservationValidator: ReservationValidator;
  private reservationFactory: ReservationFactory; // Add ReservationFactory

  constructor(
    reservationRepository: ReservationRepository,
    caravanRepository: CaravanRepository,
    userService: UserService,
    paymentService: PaymentService,
    reservationValidator: ReservationValidator,
    reservationFactory: ReservationFactory // Inject ReservationFactory
  ) {
    this.reservationRepository = reservationRepository;
    this.caravanRepository = caravanRepository;
    this.userService = userService;
    this.paymentService = paymentService;
    this.reservationValidator = reservationValidator;
    this.reservationFactory = reservationFactory; // Assign
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
    const totalPrice = durationInDays * caravan.pricePerDay;

    // Use ReservationFactory to create the newReservation object
    const newReservation = this.reservationFactory.createReservation(
      caravanId,
      guestId,
      startDate,
      endDate,
      totalPrice,
      'pending' // Initial status
    );

    return this.reservationRepository.create(newReservation);
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
    // First, find all caravans owned by this host
    const hostCaravans = await this.caravanRepository.findAll();
    const hostCaravanIds = hostCaravans.filter(c => c.hostId === hostId).map(c => c.id);

    if (hostCaravanIds.length === 0) {
        return [];
    }

    // Then, find reservations for those caravans
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
        throw new Error('Failed to update reservation status'); // Should not happen
    }
    return updatedReservation;
  }

  async confirmPayment(id: string): Promise<Reservation> {
    if (!id) {
      throw new BadRequestError('Reservation ID is required');
    }

    // Process payment through PaymentService
    const payment = await this.paymentService.processPayment(id);
    
    // Fetch the updated reservation from the repository
    const updatedReservation = await this.reservationRepository.findById(id);
    if (!updatedReservation) {
      throw new Error('Confirmed reservation not found after payment processing'); // Should not happen
    }

    // Update guest's trust score for completing a reservation
    await this.userService.recordReservationCompletion(updatedReservation.guestId);

    return updatedReservation;
  }

  async getPaymentHistory(userId: string): Promise<Payment[]> {
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }
    // Delegate to PaymentService
    return this.paymentService.getPaymentHistoryByUserId(userId);
  }
}
