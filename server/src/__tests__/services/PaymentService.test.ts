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
    const reservationId = 'r1';
    const guestId = 'g1';
    const amount = 500;
    const mockReservation: Reservation = {
      id: reservationId,
      caravanId: 'c1',
      guestId: guestId,
      startDate: '2025-01-01',
      endDate: '2025-01-02',
      status: 'awaiting_payment',
      totalPrice: amount,
    };

    it('should process payment successfully and update reservation status', async () => {
      mockReservationRepository.findById.mockResolvedValue(mockReservation);
      mockPaymentRepository.create.mockResolvedValue({
        id: 'mock-uuid',
        reservationId: reservationId,
        amount: amount,
        paymentDate: expect.any(String),
        status: 'completed',
        transactionId: 'txn_mock-uuid',
      });
      mockReservationRepository.update.mockResolvedValue({ ...mockReservation, status: 'confirmed' });

      const payment = await paymentService.processPayment(reservationId);

      expect(mockReservationRepository.findById).toHaveBeenCalledWith(reservationId);
      expect(mockPaymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          reservationId: reservationId,
          amount: amount,
          status: 'completed',
        })
      );
      expect(mockReservationRepository.update).toHaveBeenCalledWith(reservationId, { status: 'confirmed' });
      expect(payment).toEqual(expect.objectContaining({ status: 'completed' }));
    });

    it('should throw BadRequestError if reservation ID is missing', async () => {
      await expect(paymentService.processPayment('')).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if reservation is not found', async () => {
      mockReservationRepository.findById.mockResolvedValue(undefined);

      await expect(paymentService.processPayment(reservationId)).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if reservation is not awaiting payment', async () => {
      const nonAwaitingReservation = { ...mockReservation, status: 'pending' };
      mockReservationRepository.findById.mockResolvedValue(nonAwaitingReservation);

      await expect(paymentService.processPayment(reservationId)).rejects.toThrow(BadRequestError);
    });
  });

  // --- getPaymentByReservationId tests ---
  describe('getPaymentByReservationId', () => {
    const reservationId = 'r1';
    const mockPayment: Payment = { id: 'p1', reservationId, amount: 100, paymentDate: '', status: 'completed' };

    it('should return payment by reservation ID', async () => {
      mockPaymentRepository.findByReservationId.mockResolvedValue(mockPayment);

      const payment = await paymentService.getPaymentByReservationId(reservationId);

      expect(mockPaymentRepository.findByReservationId).toHaveBeenCalledWith(reservationId);
      expect(payment).toEqual(mockPayment);
    });

    it('should throw BadRequestError if reservation ID is missing', async () => {
      await expect(paymentService.getPaymentByReservationId('')).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if payment is not found', async () => {
      mockPaymentRepository.findByReservationId.mockResolvedValue(undefined);

      await expect(paymentService.getPaymentByReservationId(reservationId)).rejects.toThrow(NotFoundError);
    });
  });

  // --- getPaymentHistoryByUserId tests ---
  describe('getPaymentHistoryByUserId', () => {
    const userId = 'u1';
    const mockUserReservations: Reservation[] = [
      { id: 'r1', guestId: userId, caravanId: 'c1', startDate: '', endDate: '', status: 'confirmed', totalPrice: 100 },
      { id: 'r2', guestId: userId, caravanId: 'c2', startDate: '', endDate: '', status: 'pending', totalPrice: 200 },
      { id: 'r3', guestId: 'u2', caravanId: 'c3', startDate: '', endDate: '', status: 'confirmed', totalPrice: 300 }, // Another user's reservation
    ];
    const mockAllPayments: Payment[] = [
      { id: 'p1', reservationId: 'r1', amount: 100, paymentDate: '', status: 'completed' },
      { id: 'p2', reservationId: 'r2', amount: 200, paymentDate: '', status: 'pending' },
      { id: 'p3', reservationId: 'r3', amount: 300, paymentDate: '', status: 'completed' },
    ];

    beforeEach(() => {
      mockReservationRepository.findByGuestId.mockResolvedValue([mockUserReservations[0], mockUserReservations[1]]);
      mockPaymentRepository.findAll.mockResolvedValue(mockAllPayments);
    });

    it('should return payment history for a specific user ID', async () => {
      const paymentHistory = await paymentService.getPaymentHistoryByUserId(userId);

      expect(mockReservationRepository.findByGuestId).toHaveBeenCalledWith(userId);
      expect(mockPaymentRepository.findAll).toHaveBeenCalledTimes(1);
      expect(paymentHistory).toEqual([mockAllPayments[0], mockAllPayments[1]]);
    });

    it('should return empty array if no reservations for the user are found', async () => {
      mockReservationRepository.findByGuestId.mockResolvedValue([]);

      const paymentHistory = await paymentService.getPaymentHistoryByUserId(userId);

      expect(paymentHistory).toEqual([]);
    });

    it('should throw BadRequestError if user ID is missing', async () => {
      await expect(paymentService.getPaymentHistoryByUserId('')).rejects.toThrow(BadRequestError);
    });
  });
});
