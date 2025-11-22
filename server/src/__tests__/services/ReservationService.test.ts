import { ReservationService } from '../../services/ReservationService';
import { ReservationRepository } from '../../repositories/ReservationRepository';
import { CaravanRepository } from '../../repositories/CaravanRepository';
import { UserService } from '../../services/UserService';
import { PaymentService } from '../../services/PaymentService'; // Import PaymentService
import { Reservation } from '../../models/Reservation';
import { Caravan } from '../../models/Caravan';
import { BadRequestError, NotFoundError, ConflictError } from '../../exceptions';
import { Payment } from '../../models/Payment'; // Import Payment model for type safety

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
};

type MockedUserService = {
  recordReservationCompletion: jest.Mock;
};

type MockedPaymentService = { // Define MockedPaymentService
  processPayment: jest.Mock;
  getPaymentHistoryByUserId: jest.Mock;
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
};

const mockUserService: MockedUserService = {
  recordReservationCompletion: jest.fn(),
};

const mockPaymentService: MockedPaymentService = { // Instantiate MockedPaymentService
  processPayment: jest.fn(),
  getPaymentHistoryByUserId: jest.fn(),
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
      mockPaymentService as unknown as PaymentService // Added mockPaymentService
    );
    jest.clearAllMocks();
    (global.crypto.randomUUID as jest.Mock).mockClear();
    (global.crypto.randomUUID as jest.Mock).mockImplementation(() => 'mock-uuid');
  });

  // --- createReservation tests ---
  describe('createReservation', () => {
    const caravanId = 'c1';
    const guestId = 'g1';
    const startDate = '2025-01-01';
    const endDate = '2025-01-05';
    const mockCaravan: Caravan = { id: caravanId, hostId: 'h1', name: 'Test', description: 'Desc', location: 'Loc', pricePerDay: 100, capacity: 4, amenities: [], imageUrl: 'url', status: 'available' };

    it('should create a reservation successfully', async () => {
      mockCaravanRepository.findById.mockResolvedValue(mockCaravan);
      mockReservationRepository.findOverlappingReservations.mockResolvedValue([]);
      mockReservationRepository.create.mockResolvedValue({
        id: 'mock-uuid',
        caravanId,
        guestId,
        startDate,
        endDate,
        status: 'pending',
        totalPrice: 4 * mockCaravan.pricePerDay, // 4 days * 100
      });

      const reservation = await reservationService.createReservation({ caravanId, guestId, startDate, endDate });

      expect(mockCaravanRepository.findById).toHaveBeenCalledWith(caravanId);
      expect(mockReservationRepository.findOverlappingReservations).toHaveBeenCalledWith(
        caravanId,
        new Date(startDate),
        new Date(endDate)
      );
      expect(global.crypto.randomUUID).toHaveBeenCalledTimes(1);
      expect(mockReservationRepository.create).toHaveBeenCalledTimes(1);
      expect(reservation.totalPrice).toBe(400); // 4 days * 100
    });

    it('should throw BadRequestError if required fields are missing', async () => {
      await expect(reservationService.createReservation({ caravanId, guestId, startDate: '', endDate })).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if caravan is not found', async () => {
      mockCaravanRepository.findById.mockResolvedValue(undefined);

      await expect(reservationService.createReservation({ caravanId, guestId, startDate, endDate })).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if start date is not before end date', async () => {
      mockCaravanRepository.findById.mockResolvedValue(mockCaravan); // Ensure caravan is found
      await expect(reservationService.createReservation({ caravanId, guestId, startDate: '2025-01-05', endDate: '2025-01-01' })).rejects.toThrow(BadRequestError);
      await expect(reservationService.createReservation({ caravanId, guestId, startDate: '2025-01-01', endDate: '2025-01-01' })).rejects.toThrow(BadRequestError);
    });

    it('should throw ConflictError if overlapping reservations exist', async () => {
      mockCaravanRepository.findById.mockResolvedValue(mockCaravan);
      mockReservationRepository.findOverlappingReservations.mockResolvedValue([{ id: 'r2', status: 'confirmed' }]);

      await expect(reservationService.createReservation({ caravanId, guestId, startDate, endDate })).rejects.toThrow(ConflictError);
    });
  });

  // --- getMyReservations tests ---
  describe('getMyReservations', () => {
    it('should return reservations for a guest', async () => {
      const guestId = 'g1';
      const mockReservations: Reservation[] = [{ id: 'r1', guestId, caravanId: 'c1', startDate: '', endDate: '', status: 'pending', totalPrice: 100 }];
      mockReservationRepository.findByGuestId.mockResolvedValue(mockReservations);

      const reservations = await reservationService.getMyReservations(guestId);

      expect(mockReservationRepository.findByGuestId).toHaveBeenCalledWith(guestId);
      expect(reservations).toEqual(mockReservations);
    });

    it('should throw BadRequestError if guest ID is missing', async () => {
      await expect(reservationService.getMyReservations('')).rejects.toThrow(BadRequestError);
    });
  });

  // --- getHostReservations tests ---
  describe('getHostReservations', () => {
    const hostId = 'h1';
    const mockCaravans: Caravan[] = [
      { id: 'c1', hostId, name: 'C1', description: 'Desc', location: 'Loc', pricePerDay: 100, capacity: 4, amenities: [], imageUrl: 'url', status: 'available' },
      { id: 'c2', hostId: 'h2', name: 'C2', description: 'Desc', location: 'Loc', pricePerDay: 200, capacity: 4, amenities: [], imageUrl: 'url', status: 'available' },
      { id: 'c3', hostId, name: 'C3', description: 'Desc', location: 'Loc', pricePerDay: 300, capacity: 4, amenities: [], imageUrl: 'url', status: 'available' },
    ];
    const mockReservations: Reservation[] = [
      { id: 'r1', caravanId: 'c1', guestId: 'g1', startDate: '', endDate: '', status: 'pending', totalPrice: 100 },
      { id: 'r2', caravanId: 'c2', guestId: 'g2', startDate: '', endDate: '', status: 'approved', totalPrice: 200 },
      { id: 'r3', caravanId: 'c3', guestId: 'g3', startDate: '', endDate: '', status: 'confirmed', totalPrice: 300 },
    ];

    beforeEach(() => {
      mockCaravanRepository.findAll.mockResolvedValue(mockCaravans);
      mockReservationRepository.findByCaravanIds.mockResolvedValue([mockReservations[0], mockReservations[2]]);
    });

    it('should return reservations for a host', async () => {
      const reservations = await reservationService.getHostReservations(hostId);

      expect(mockCaravanRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockReservationRepository.findByCaravanIds).toHaveBeenCalledWith(['c1', 'c3']);
      expect(reservations).toEqual([mockReservations[0], mockReservations[2]]);
    });

    it('should return empty array if host has no caravans', async () => {
      mockCaravanRepository.findAll.mockResolvedValue([{ id: 'c2', hostId: 'h2', name: 'C2', description: 'Desc', location: 'Loc', pricePerDay: 200, capacity: 4, amenities: [], imageUrl: 'url', status: 'available' }]); // Only other host's caravan
      const reservations = await reservationService.getHostReservations(hostId);
      expect(mockCaravanRepository.findAll).toHaveBeenCalledTimes(1);
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
    const mockReservation: Reservation = { id: reservationId, caravanId: 'c1', guestId: 'g1', startDate: '', endDate: '', status: 'pending', totalPrice: 100 };

    it('should update reservation status to awaiting_payment when approved', async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockReservationRepository.update.mockResolvedValue({ ...mockReservation, status: 'awaiting_payment' });

      const updated = await reservationService.updateReservationStatus(reservationId, 'approved');

      expect(mockReservationRepository.findById).toHaveBeenCalledWith(reservationId);
      expect(mockReservationRepository.update).toHaveBeenCalledWith(reservationId, { status: 'awaiting_payment' });
      expect(updated.status).toBe('awaiting_payment');
    });

    it('should update reservation status to rejected when rejected', async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockReservationRepository.update.mockResolvedValue({ ...mockReservation, status: 'rejected' });

      const updated = await reservationService.updateReservationStatus(reservationId, 'rejected');

      expect(mockReservationRepository.findById).toHaveBeenCalledWith(reservationId);
      expect(mockReservationRepository.update).toHaveBeenCalledWith(reservationId, { status: 'rejected' });
      expect(updated.status).toBe('rejected');
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
    const mockReservation: Reservation = { id: reservationId, caravanId: 'c1', guestId: 'g1', startDate: '', endDate: '', status: 'awaiting_payment', totalPrice: 100 };
    const mockPayment: Payment = { id: 'p1', reservationId, amount: 100, paymentDate: '', status: 'completed' };
    
    beforeEach(() => {
      mockPaymentService.processPayment.mockResolvedValue(mockPayment); // Mock PaymentService call
      mockReservationRepository.findById.mockResolvedValue({ ...mockReservation, status: 'confirmed' }); // After payment, reservation is confirmed
    });

    it('should confirm payment and update status to confirmed', async () => {
      mockUserService.recordReservationCompletion.mockResolvedValue(undefined);

      const confirmed = await reservationService.confirmPayment(reservationId);

      expect(mockPaymentService.processPayment).toHaveBeenCalledWith(reservationId);
      expect(mockReservationRepository.findById).toHaveBeenCalledWith(reservationId);
      expect(mockUserService.recordReservationCompletion).toHaveBeenCalledWith(mockReservation.guestId);
      expect(confirmed.status).toBe('confirmed');
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
    const userId = 'g1';
    const mockPayments: Payment[] = [
      { id: 'p1', reservationId: 'r1', amount: 100, paymentDate: '', status: 'completed' },
      { id: 'p3', reservationId: 'r3', amount: 300, paymentDate: '', status: 'completed' },
    ];

    it('should return payment history for a user', async () => {
      mockPaymentService.getPaymentHistoryByUserId.mockResolvedValue(mockPayments);

      const paymentHistory = await reservationService.getPaymentHistory(userId);

      expect(mockPaymentService.getPaymentHistoryByUserId).toHaveBeenCalledWith(userId);
      expect(paymentHistory).toEqual(mockPayments);
    });

    it('should throw BadRequestError if user ID is missing', async () => {
      await expect(reservationService.getPaymentHistory('')).rejects.toThrow(BadRequestError);
    });
  });
});