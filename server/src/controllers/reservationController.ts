import { Request, Response } from 'express';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { CaravanRepository } from '../repositories/CaravanRepository';
import { UserRepository } from '../repositories/UserRepository';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { UserService } from '../services/UserService';
import { PaymentService } from '../services/PaymentService';
import { ReservationService } from '../services/ReservationService';
import { ReservationValidator } from '../services/ReservationValidator';
import { ReservationFactory } from '../services/ReservationFactory';
import { NoDiscountStrategy } from '../services/DiscountStrategy';
import { NotificationService } from '../services/NotificationService'; // Import NotificationService
import { AppError } from '../exceptions';

// Instantiate repositories and services
const userRepository = new UserRepository();
const userService = new UserService(userRepository);

const caravanRepository = new CaravanRepository();
const reservationRepository = new ReservationRepository();
const paymentRepository = new PaymentRepository();
const paymentService = new PaymentService(paymentRepository, reservationRepository);
const reservationValidator = new ReservationValidator(reservationRepository);
const reservationFactory = new ReservationFactory();
const noDiscountStrategy = new NoDiscountStrategy();
const notificationService = new NotificationService(); // Instantiate NotificationService

const reservationService = new ReservationService(
  reservationRepository,
  caravanRepository,
  userService,
  paymentService,
  reservationValidator,
  reservationFactory,
  noDiscountStrategy,
  notificationService // Inject notificationService
);

export const createReservation = async (req: Request, res: Response) => {
  try {
    const { caravan_id, guest_id, start_date, end_date } = req.body;
    const newReservation = await reservationService.createReservation({
      caravan_id,
      guest_id,
      start_date,
      end_date,
    });
    res.status(201).json(newReservation);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyReservations = async (req: Request, res: Response) => {
  try {
    const guestId = req.query.guestId as string;
    const myReservations = await reservationService.getMyReservations(guestId);
    res.json(myReservations);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getHostReservations = async (req: Request, res: Response) => {
  try {
    const hostId = req.query.hostId as string;
    const hostReservations = await reservationService.getHostReservations(hostId);
    res.json(hostReservations);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateReservationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // status will be 'approved' or 'rejected'
    const updatedReservation = await reservationService.updateReservationStatus(id, status);
    res.json(updatedReservation);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const confirmedReservation = await reservationService.confirmPayment(id);
    res.json(confirmedReservation);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const paymentHistory = await reservationService.getPaymentHistory(userId);
    res.json(paymentHistory);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
