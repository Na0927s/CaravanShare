import { Request, Response } from 'express';
import { Reservation } from '../models/Reservation';
import { Caravan } from '../models/Caravan';
import { v4 as uuidv4 } from 'uuid';
import { updateTrustScore } from './userController'; // Import the function
import { readData, writeData } from '../db/utils';

const RESERVATIONS_FILE = 'reservations.json';
const CARAVANS_FILE = 'caravans.json';

export const createReservation = async (req: Request, res: Response) => {
  const { caravanId, guestId, startDate, endDate } = req.body;

  if (!caravanId || !guestId || !startDate || !endDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const caravans = await readData<Caravan>(CARAVANS_FILE);
  const caravan = caravans.find(c => c.id === caravanId);

  if (!caravan) {
    return res.status(404).json({ message: 'Caravan not found' });
  }

  const reservations = await readData<Reservation>(RESERVATIONS_FILE);

  // Check for overlapping reservations
  const existingReservations = reservations.filter(
    r =>
      r.caravanId === caravanId &&
      (r.status === 'confirmed' || r.status === 'pending' || r.status === 'awaiting_payment')
  );

  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);

  const isOverlapping = existingReservations.some(r => {
    const existingStart = new Date(r.startDate);
    const existingEnd = new Date(r.endDate);

    // Check for overlap. The new reservation cannot start or end inside an existing one.
    // Also, an existing reservation cannot start or end inside the new one.
    return (newStart < existingEnd && newEnd > existingStart);
  });

  if (isOverlapping) {
    return res.status(400).json({ message: 'The selected dates are not available for this caravan.' });
  }


  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (durationInDays <= 0) {
    return res.status(400).json({ message: 'End date must be after start date' });
  }

  const totalPrice = durationInDays * caravan.pricePerDay;

  const newReservation: Reservation = {
    id: uuidv4(),
    caravanId,
    guestId,
    startDate,
    endDate,
    status: 'pending',
    totalPrice,
  };

  reservations.push(newReservation);
  await writeData<Reservation>(RESERVATIONS_FILE, reservations);

  res.status(201).json(newReservation);
};

export const getMyReservations = async (req: Request, res: Response) => {
  // In a real app, you'd get the guestId from the authenticated user's token
  const guestId = req.query.guestId as string;

  if (!guestId) {
    return res.status(400).json({ message: 'Guest ID is required' });
  }

  const reservations = await readData<Reservation>(RESERVATIONS_FILE);
  const myReservations = reservations.filter(r => r.guestId === guestId);

  res.json(myReservations);
};

export const getHostReservations = async (req: Request, res: Response) => {
  const hostId = req.query.hostId as string;

  if (!hostId) {
    return res.status(400).json({ message: 'Host ID is required' });
  }

  const caravans = await readData<Caravan>(CARAVANS_FILE);
  const hostCaravanIds = caravans.filter(c => c.hostId === hostId).map(c => c.id);

  const reservations = await readData<Reservation>(RESERVATIONS_FILE);
  const hostReservations = reservations.filter(r => hostCaravanIds.includes(r.caravanId));

  res.json(hostReservations);
};

export const updateReservationStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  let { status } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  if (status === 'approved') {
    status = 'awaiting_payment';
  }

  const reservations = await readData<Reservation>(RESERVATIONS_FILE);
  const reservationIndex = reservations.findIndex(r => r.id === id);

  if (reservationIndex === -1) {
    return res.status(404).json({ message: 'Reservation not found' });
  }

  reservations[reservationIndex].status = status;
  await writeData<Reservation>(RESERVATIONS_FILE, reservations);

  res.json(reservations[reservationIndex]);
};

export const confirmPayment = async (req: Request, res: Response) => {
  const { id } = req.params;

  const reservations = await readData<Reservation>(RESERVATIONS_FILE);
  const reservationIndex = reservations.findIndex(r => r.id === id);

  if (reservationIndex === -1) {
    return res.status(404).json({ message: 'Reservation not found' });
  }

  const reservation = reservations[reservationIndex];

  if (reservation.status !== 'awaiting_payment') {
    return res.status(400).json({ message: 'Reservation is not awaiting payment' });
  }

  reservation.status = 'confirmed';
  await writeData<Reservation>(RESERVATIONS_FILE, reservations);

  // Update guest's trust score for completing a reservation
  await updateTrustScore(reservation.guestId, 10);

  res.json(reservation);
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  const { userId } = req.params; // Assuming userId is passed as a URL parameter

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const reservations = await readData<Reservation>(RESERVATIONS_FILE);
  const paymentHistory = reservations.filter(
    r => r.guestId === userId && r.status === 'confirmed'
  );

  res.json(paymentHistory);
};
