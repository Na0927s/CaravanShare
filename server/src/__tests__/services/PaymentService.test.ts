import { PaymentService } from '../../services/PaymentService';
import { PaymentRepository } from '../../repositories/PaymentRepository';
import { ReservationRepository } from '../../repositories/ReservationRepository';
import { Payment } from '../../models/Payment';
import { Reservation } from '../../models/Reservation';
import { BadRequestError, NotFoundError } from '../../exceptions';

// Define types for mocked dependencies
type MockedPaymentRepository = {
  findById: jest.Mock;
  create: jest.Mock;
  findByReservationId: jest.Mock;
  findAll: jest.Mock;
  getPaymentHistoryByUserId: jest.Mock; // Added for testing getPaymentHistoryByUserId
};

type MockedReservationRepository = {
  findById: jest.Mock;
  update: jest.Mock;
  findByGuestId: jest.Mock;
};

const mockPaymentRepository: MockedPaymentRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  findByReservationId: jest.fn(),
  findAll: jest.fn(),
  getPaymentHistoryByUserId: jest.fn(), // Mocked for testing getPaymentHistoryByUserId
};

const mockReservationRepository: MockedReservationRepository = {
  findById: jest.fn(),
  update: jest.fn(),
  findByGuestId: jest.fn(),
};

// Mock crypto.randomUUID (part of globalThis)
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid'),
  },
  writable: true,
});

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService(
      mockPaymentRepository as unknown as PaymentRepository,
      mockReservationRepository as unknown as ReservationRepository
    );
    jest.clearAllMocks();
    (global.crypto.randomUUID as jest.Mock).mockClear();
    (global.crypto.randomUUID as jest.Mock).mockImplementation(() => 'mock-uuid');
  });

  // --- processPayment tests ---
  describe('processPayment', () => {
    const reservation_id = 'r1';
    const guest_id = 'g1';
    const amount = 500;
    const mockReservation: Reservation = {
      id: reservation_id,
      caravan_id: 'c1',
      guest_id: guest_id,
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-01-02'),
      status: 'awaiting_payment',
      total_price: amount,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should process payment successfully and update reservation status', async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockPaymentRepository.create.mockResolvedValue({
        id: 'mock-uuid',
        reservation_id: reservation_id,
        amount: amount,
        payment_date: new Date(),
        status: 'completed',
        transaction_id: 'txn_mock-uuid',
        created_at: new Date(),
        updated_at: new Date(),
      });
      mockReservationRepository.update.mockResolvedValue({ ...mockReservation, status: 'confirmed' });

      const payment = await paymentService.processPayment(reservation_id);

      expect(mockReservationRepository.findById).toHaveBeenCalledWith(reservation_id);
      expect(mockPaymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          reservation_id: reservation_id,
          amount: amount,
          status: 'completed',
        })
      );
      expect(mockReservationRepository.update).toHaveBeenCalledWith(reservation_id, { status: 'confirmed' });
      expect(payment).toEqual(expect.objectContaining({ status: 'completed' }));
    });

    it('should throw BadRequestError if reservation ID is missing', async () => {
      await expect(paymentService.processPayment('')).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if reservation is not found', async () => {
      mockReservationRepository.findById.mockResolvedValue(undefined);

      await expect(paymentService.processPayment(reservation_id)).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if reservation is not awaiting payment', async () => {
      const nonAwaitingReservation = { ...mockReservation, status: 'pending' };
      mockReservationRepository.findById.mockResolvedValue(nonAwaitingReservation);

      await expect(paymentService.processPayment(reservation_id)).rejects.toThrow(BadRequestError);
    });
  });

  // --- getPaymentByReservationId tests ---
  describe('getPaymentByReservationId', () => {
    const reservation_id = 'r1';
    const mockPayment: Payment = { id: 'p1', reservation_id, amount: 100, payment_date: new Date(), status: 'completed', created_at: new Date(), updated_at: new Date() };

    it('should return payment by reservation ID', async () => {
      mockPaymentRepository.findByReservationId.mockResolvedValue(mockPayment);

      const payment = await paymentService.getPaymentByReservationId(reservation_id);

      expect(mockPaymentRepository.findByReservationId).toHaveBeenCalledWith(reservation_id);
      expect(payment).toEqual(mockPayment);
    });

    it('should throw BadRequestError if reservation ID is missing', async () => {
      await expect(paymentService.getPaymentByReservationId('')).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if payment is not found', async () => {
      mockPaymentRepository.findByReservationId.mockResolvedValue(undefined);

      await expect(paymentService.getPaymentByReservationId(reservation_id)).rejects.toThrow(NotFoundError);
    });
  });

  // --- getPaymentHistoryByUserId tests ---
  describe('getPaymentHistoryByUserId', () => {
    const user_id = 'u1';
    const mockUserReservations: Reservation[] = [
      { id: 'r1', guest_id: user_id, caravan_id: 'c1', start_date: new Date(), end_date: new Date(), status: 'confirmed', total_price: 100, created_at: new Date(), updated_at: new Date() },
      { id: 'r2', guest_id: user_id, caravan_id: 'c2', start_date: new Date(), end_date: new Date(), status: 'pending', total_price: 200, created_at: new Date(), updated_at: new Date() },
      { id: 'r3', guest_id: 'u2', caravan_id: 'c3', start_date: new Date(), end_date: new Date(), status: 'confirmed', total_price: 300, created_at: new Date(), updated_at: new Date() }, // Another user's reservation
    ];
    const mockAllPayments: Payment[] = [
      { id: 'p1', reservation_id: 'r1', amount: 100, payment_date: new Date(), status: 'completed', created_at: new Date(), updated_at: new Date() },
      { id: 'p2', reservation_id: 'r2', amount: 200, payment_date: new Date(), status: 'pending', created_at: new Date(), updated_at: new Date() },
      { id: 'p3', reservation_id: 'r3', amount: 300, payment_date: new Date(), status: 'completed', created_at: new Date(), updated_at: new Date() },
    ];

    beforeEach(() => {
      mockReservationRepository.findByGuestId.mockResolvedValue([mockUserReservations[0], mockUserReservations[1]]);
      mockPaymentRepository.getPaymentHistoryByUserId.mockResolvedValue([mockAllPayments[0], mockAllPayments[1]]); // Mock the specific method
    });

    it('should return payment history for a specific user ID', async () => {
      const paymentHistory = await paymentService.getPaymentHistoryByUserId(user_id);

      expect(mockReservationRepository.findByGuestId).toHaveBeenCalledWith(user_id);
      expect(mockPaymentRepository.getPaymentHistoryByUserId).toHaveBeenCalledWith(user_id);
      expect(paymentHistory).toEqual([mockAllPayments[0], mockAllPayments[1]]);
    });

    it('should return empty array if no reservations for the user are found', async () => {
      mockReservationRepository.findByGuestId.mockResolvedValue([]);

      const paymentHistory = await paymentService.getPaymentHistoryByUserId(user_id);

      expect(paymentHistory).toEqual([]);
    });

    it('should throw BadRequestError if user ID is missing', async () => {
      await expect(paymentService.getPaymentHistoryByUserId('')).rejects.toThrow(BadRequestError);
    });
  });
});