import { ReservationService } from '../../services/ReservationService';
import { ReservationRepository } from '../../repositories/ReservationRepository';
import { CaravanRepository } from '../../repositories/CaravanRepository';
import { UserService } from '../../services/UserService';
import { PaymentService } from '../../services/PaymentService'; // Import PaymentService
import { Reservation } from '../../models/Reservation';
import { Caravan } from '../../models/Caravan';
import { BadRequestError, NotFoundError, ConflictError } from '../../exceptions';
import { Payment } from '../../models/Payment'; // Import Payment model for type safety
import { ReservationValidator } from '../../services/ReservationValidator'; // Import ReservationValidator
import { ReservationFactory } from '../../services/ReservationFactory'; // Import ReservationFactory
import { NoDiscountStrategy } from '../../services/DiscountStrategy'; // Import NoDiscountStrategy
import { NotificationService } from '../../services/NotificationService'; // Import NotificationService


// Define types for mocked dependencies
type MockedReservationRepository = {
  findById: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  findOverlappingReservations: jest.Mock;
  findByGuestId: jest.Mock;
  findByCaravanIds: jest.Mock;
};

type MockedCaravanRepository = {
  findById: jest.Mock;
  findAll: jest.Mock;
  findByHostId: jest.Mock; // Added findByHostId
};

type MockedUserService = {
  recordReservationCompletion: jest.Mock;
};

type MockedPaymentService = { // Define MockedPaymentService
  processPayment: jest.Mock;
  getPaymentHistoryByUserId: jest.Mock;
};

type MockedReservationValidator = {
  validateReservationDates: jest.Mock;
  checkOverlappingReservations: jest.Mock;
};

type MockedReservationFactory = {
  createReservation: jest.Mock;
};

type MockedDiscountStrategy = {
  applyDiscount: jest.Mock;
};

type MockedNotificationService = {
  update: jest.Mock; // Observer pattern update method
};


const mockReservationRepository: MockedReservationRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findOverlappingReservations: jest.fn(),
  findByGuestId: jest.fn(),
  findByCaravanIds: jest.fn(),
};

const mockCaravanRepository: MockedCaravanRepository = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findByHostId: jest.fn(), // Initialize mock for findByHostId
};

const mockUserService: MockedUserService = {
  recordReservationCompletion: jest.fn(),
};

const mockPaymentService: MockedPaymentService = { // Instantiate MockedPaymentService
  processPayment: jest.fn(),
  getPaymentHistoryByUserId: jest.fn(),
};

const mockReservationValidator: MockedReservationValidator = {
  validateReservationDates: jest.fn(),
  checkOverlappingReservations: jest.fn(),
};

const mockReservationFactory: MockedReservationFactory = {
  createReservation: jest.fn(),
};

const mockDiscountStrategy: MockedDiscountStrategy = {
  applyDiscount: jest.fn(),
};

const mockNotificationService: MockedNotificationService = {
  update: jest.fn(),
};


// Mock crypto.randomUUID (part of globalThis)
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid'),
  },
  writable: true,
});


describe('ReservationService', () => {
  let reservationService: ReservationService;

  beforeEach(() => {
    reservationService = new ReservationService(
      mockReservationRepository as unknown as ReservationRepository,
      mockCaravanRepository as unknown as CaravanRepository,
      mockUserService as unknown as UserService,
      mockPaymentService as unknown as PaymentService, // Added mockPaymentService
      mockReservationValidator as unknown as ReservationValidator,
      mockReservationFactory as unknown as ReservationFactory,
      mockDiscountStrategy as unknown as NoDiscountStrategy,
      mockNotificationService as unknown as NotificationService
    );
    jest.clearAllMocks();
    (global.crypto.randomUUID as jest.Mock).mockClear();
    (global.crypto.randomUUID as jest.Mock).mockImplementation(() => 'mock-uuid');

    // Default mock for discount strategy
    mockDiscountStrategy.applyDiscount.mockImplementation((price) => price);
  });

  // --- createReservation tests ---
  describe('createReservation', () => {
    const caravan_id = 'c1';
    const guest_id = 'g1';
    const start_date = new Date('2025-01-01');
    const end_date = new Date('2025-01-05');
    const mockCaravan: Caravan = { id: caravan_id, host_id: 'h1', name: 'Test', description: 'Desc', location: 'Loc', price_per_day: 100, capacity: 4, amenities: [], image_url: 'url', status: 'available', created_at: new Date(), updated_at: new Date() };

    it('should create a reservation successfully', async () => {
      mockCaravanRepository.findById.mockResolvedValue(mockCaravan);
      mockReservationValidator.validateReservationDates.mockReturnValue(undefined); // Mock successful validation
      mockReservationValidator.checkOverlappingReservations.mockResolvedValue(undefined); // Mock no overlapping
      mockReservationFactory.createReservation.mockReturnValue({ // Mock factory return
        id: 'mock-uuid',
        caravan_id,
        guest_id,
        start_date,
        end_date,
        status: 'pending',
        total_price: 4 * mockCaravan.price_per_day,
      });
      mockReservationRepository.create.mockResolvedValue({
        id: 'mock-uuid',
        caravan_id,
        guest_id,
        start_date,
        end_date,
        status: 'pending',
        total_price: 4 * mockCaravan.price_per_day, // 4 days * 100
        created_at: new Date(), updated_at: new Date()
      });

      const reservation = await reservationService.createReservation({ caravan_id, guest_id, start_date, end_date });

      expect(mockCaravanRepository.findById).toHaveBeenCalledWith(caravan_id);
      expect(mockReservationValidator.validateReservationDates).toHaveBeenCalledWith(start_date.toISOString().split('T')[0], end_date.toISOString().split('T')[0]);
      expect(mockReservationValidator.checkOverlappingReservations).toHaveBeenCalledWith(
        caravan_id,
        start_date.toISOString().split('T')[0],
        end_date.toISOString().split('T')[0]
      );
      expect(mockDiscountStrategy.applyDiscount).toHaveBeenCalledTimes(1);
      expect(mockReservationFactory.createReservation).toHaveBeenCalledTimes(1);
      expect(mockReservationRepository.create).toHaveBeenCalledTimes(1);
      expect(reservation.total_price).toBe(400); // 4 days * 100
      expect(mockNotificationService.update).toHaveBeenCalledWith(expect.objectContaining({
        type: 'new_reservation',
        reservationId: 'mock-uuid',
        userId: guest_id,
      }));
    });

    it('should throw BadRequestError if required fields are missing', async () => {
      mockCaravanRepository.findById.mockResolvedValue(mockCaravan);
      await expect(reservationService.createReservation({ caravan_id, guest_id, start_date: undefined as any, end_date })).rejects.toThrow(BadRequestError);
      await expect(reservationService.createReservation({ caravan_id, guest_id: '', start_date, end_date })).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if caravan is not found', async () => {
      mockCaravanRepository.findById.mockResolvedValue(undefined);

      await expect(reservationService.createReservation({ caravan_id, guest_id, start_date, end_date })).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if start date is not before end date', async () => {
      mockCaravanRepository.findById.mockResolvedValue(mockCaravan); // Ensure caravan is found
      mockReservationValidator.validateReservationDates.mockImplementation(() => { throw new BadRequestError('Invalid date range'); });
      await expect(reservationService.createReservation({ caravan_id, guest_id, start_date: new Date('2025-01-05'), end_date: new Date('2025-01-01') })).rejects.toThrow(BadRequestError);
      await expect(reservationService.createReservation({ caravan_id, guest_id, start_date: new Date('2025-01-01'), end_date: new Date('2025-01-01') })).rejects.toThrow(BadRequestError);
    });

    it('should throw ConflictError if overlapping reservations exist', async () => {
      mockCaravanRepository.findById.mockResolvedValue(mockCaravan);
      mockReservationValidator.validateReservationDates.mockReturnValue(undefined); // Mock successful validation
      mockReservationValidator.checkOverlappingReservations.mockImplementation(() => { throw new ConflictError('Overlapping reservation'); });

      await expect(reservationService.createReservation({ caravan_id, guest_id, start_date, end_date })).rejects.toThrow(ConflictError);
    });
  });

  // --- getMyReservations tests ---
  describe('getMyReservations', () => {
    it('should return reservations for a guest', async () => {
      const guest_id = 'g1';
      const mockReservations: Reservation[] = [{ id: 'r1', guest_id, caravan_id: 'c1', start_date: new Date(), end_date: new Date(), status: 'pending', total_price: 100, created_at: new Date(), updated_at: new Date() }];
      mockReservationRepository.findByGuestId.mockResolvedValue(mockReservations);

      const reservations = await reservationService.getMyReservations(guest_id);

      expect(mockReservationRepository.findByGuestId).toHaveBeenCalledWith(guest_id);
      expect(reservations).toEqual(mockReservations);
    });

    it('should throw BadRequestError if guest ID is missing', async () => {
      await expect(reservationService.getMyReservations('')).rejects.toThrow(BadRequestError);
    });
  });

  // --- getHostReservations tests ---
  describe('getHostReservations', () => {
    const host_id = 'h1';
    const mockCaravans: Caravan[] = [
      { id: 'c1', host_id, name: 'C1', description: 'Desc', location: 'Loc', price_per_day: 100, capacity: 4, amenities: [], image_url: 'url', status: 'available', created_at: new Date(), updated_at: new Date() },
      { id: 'c3', host_id, name: 'C3', description: 'Desc', location: 'Loc', price_per_day: 300, capacity: 4, amenities: [], image_url: 'url', status: 'available', created_at: new Date(), updated_at: new Date() },
    ];
    const mockReservations: Reservation[] = [
      { id: 'r1', caravan_id: 'c1', guest_id: 'g1', start_date: new Date(), end_date: new Date(), status: 'pending', total_price: 100, created_at: new Date(), updated_at: new Date() },
      { id: 'r2', caravan_id: 'c2', guest_id: 'g2', start_date: new Date(), end_date: new Date(), status: 'approved', total_price: 200, created_at: new Date(), updated_at: new Date() },
      { id: 'r3', caravan_id: 'c3', guest_id: 'g3', start_date: new Date(), end_date: new Date(), status: 'confirmed', total_price: 300, created_at: new Date(), updated_at: new Date() },
    ];

    beforeEach(() => {
      mockCaravanRepository.findByHostId.mockResolvedValue(mockCaravans); // Changed to findByHostId
      mockReservationRepository.findByCaravanIds.mockResolvedValue([mockReservations[0], mockReservations[2]]);
    });

    it('should return reservations for a host', async () => {
      const reservations = await reservationService.getHostReservations(host_id);

      expect(mockCaravanRepository.findByHostId).toHaveBeenCalledWith(host_id); // Changed to findByHostId
      expect(mockReservationRepository.findByCaravanIds).toHaveBeenCalledWith(['c1', 'c3']);
      expect(reservations).toEqual([mockReservations[0], mockReservations[2]]);
    });

    it('should return empty array if host has no caravans', async () => {
      mockCaravanRepository.findByHostId.mockResolvedValue([]); // Changed to findByHostId
      const reservations = await reservationService.getHostReservations(host_id);
      expect(mockCaravanRepository.findByHostId).toHaveBeenCalledWith(host_id); // Changed to findByHostId
      expect(mockReservationRepository.findByCaravanIds).not.toHaveBeenCalled(); // Should NOT be called
      expect(reservations).toEqual([]);
    });

    it('should throw BadRequestError if host ID is missing', async () => {
      await expect(reservationService.getHostReservations('')).rejects.toThrow(BadRequestError);
    });
  });

  // --- updateReservationStatus tests ---
  describe('updateReservationStatus', () => {
    const reservationId = 'r1';
    const mockReservation: Reservation = { id: reservationId, caravan_id: 'c1', guest_id: 'g1', start_date: new Date(), end_date: new Date(), status: 'pending', total_price: 100, created_at: new Date(), updated_at: new Date() };

    it('should update reservation status to awaiting_payment when approved', async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockReservationRepository.update.mockResolvedValue({ ...mockReservation, status: 'awaiting_payment' });

      const updated = await reservationService.updateReservationStatus(reservationId, 'approved');

      expect(mockReservationRepository.findById).toHaveBeenCalledWith(reservationId);
      expect(mockReservationRepository.update).toHaveBeenCalledWith(reservationId, { status: 'awaiting_payment' });
      expect(updated.status).toBe('awaiting_payment');
      expect(mockNotificationService.update).toHaveBeenCalledWith(expect.objectContaining({
        type: 'status_change',
        reservationId: reservationId,
        userId: mockReservation.guest_id,
        newStatus: 'awaiting_payment',
      }));
    });

    it('should update reservation status to rejected when rejected', async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockReservationRepository.update.mockResolvedValue({ ...mockReservation, status: 'rejected' });

      const updated = await reservationService.updateReservationStatus(reservationId, 'rejected');

      expect(mockReservationRepository.findById).toHaveBeenCalledWith(reservationId);
      expect(mockReservationRepository.update).toHaveBeenCalledWith(reservationId, { status: 'rejected' });
      expect(updated.status).toBe('rejected');
      expect(mockNotificationService.update).toHaveBeenCalledWith(expect.objectContaining({
        type: 'status_change',
        reservationId: reservationId,
        userId: mockReservation.guest_id,
        newStatus: 'rejected',
      }));
    });

    it('should throw BadRequestError if ID or status is missing', async () => {
      await expect(reservationService.updateReservationStatus('', 'approved')).rejects.toThrow(BadRequestError);
      await expect(reservationService.updateReservationStatus(reservationId, '' as any)).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if reservation not found', async () => {
      mockReservationRepository.findById.mockResolvedValue(undefined);

      await expect(reservationService.updateReservationStatus(reservationId, 'approved')).rejects.toThrow(NotFoundError);
    });

    it('should throw Error if update fails', async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockReservationRepository.update.mockResolvedValue(undefined); // Simulate update failure

      await expect(reservationService.updateReservationStatus(reservationId, 'approved')).rejects.toThrow('Failed to update reservation status');
    });
  });

  // --- confirmPayment tests ---
  describe('confirmPayment', () => {
    const reservationId = 'r1';
    const mockReservation: Reservation = { id: reservationId, caravan_id: 'c1', guest_id: 'g1', start_date: new Date(), end_date: new Date(), status: 'awaiting_payment', total_price: 100, created_at: new Date(), updated_at: new Date() };
    const mockPayment: Payment = { id: 'p1', reservation_id: reservationId, amount: 100, payment_date: new Date(), status: 'completed', created_at: new Date(), updated_at: new Date() };
    
    beforeEach(() => {
      mockPaymentService.processPayment.mockResolvedValue(mockPayment); // Mock PaymentService call
      mockReservationRepository.findById.mockResolvedValue({ ...mockReservation, status: 'confirmed' }); // After payment, reservation is confirmed
    });

    it('should confirm payment and update status to confirmed', async () => {
      mockUserService.recordReservationCompletion.mockResolvedValue(undefined);

      const confirmed = await reservationService.confirmPayment(reservationId);

      expect(mockPaymentService.processPayment).toHaveBeenCalledWith(reservationId);
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(reservationId);
      expect(mockUserService.recordReservationCompletion).toHaveBeenCalledWith(mockReservation.guest_id);
      expect(confirmed.status).toBe('confirmed');
      expect(mockNotificationService.update).toHaveBeenCalledWith(expect.objectContaining({
        type: 'payment_confirmed',
        reservationId: reservationId,
        userId: mockReservation.guest_id,
      }));
    });

    it('should throw BadRequestError if ID is missing', async () => {
      await expect(reservationService.confirmPayment('')).rejects.toThrow(BadRequestError);
    });

    it('should throw Error if confirmed reservation not found after payment processing', async () => {
      mockReservationRepository.findById.mockResolvedValue(undefined); // Simulate reservation not found after payment
      await expect(reservationService.confirmPayment(reservationId)).rejects.toThrow('Confirmed reservation not found after payment processing');
    });
  });

  // --- getPaymentHistory tests ---
  describe('getPaymentHistory', () => {
    const user_id = 'g1';
    const mockPayments: Payment[] = [
      { id: 'p1', reservation_id: 'r1', amount: 100, payment_date: new Date(), status: 'completed', created_at: new Date(), updated_at: new Date() },
      { id: 'p3', reservation_id: 'r3', amount: 300, payment_date: new Date(), status: 'completed', created_at: new Date(), updated_at: new Date() },
    ];

    it('should return payment history for a user', async () => {
      mockPaymentService.getPaymentHistoryByUserId.mockResolvedValue(mockPayments);

      const paymentHistory = await reservationService.getPaymentHistory(user_id);

      expect(mockPaymentService.getPaymentHistoryByUserId).toHaveBeenCalledWith(user_id);
      expect(paymentHistory).toEqual(mockPayments);
    });

    it('should throw BadRequestError if user ID is missing', async () => {
      await expect(reservationService.getPaymentHistory('')).rejects.toThrow(BadRequestError);
    });
  });
});