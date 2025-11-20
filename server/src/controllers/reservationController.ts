import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { Reservation } from '../models/Reservation';
import { Caravan } from '../models/Caravan';
import { v4 as uuidv4 } from 'uuid';

const reservationsDbPath = path.join(__dirname, '..', '..', 'db', 'reservations.json');
const caravansDbPath = path.join(__dirname, '..', '..', 'db', 'caravans.json');

const readReservations = async (): Promise<Reservation[]> => {
  try {
    const data = await fs.readFile(reservationsDbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading reservations:', error);
    return [];
  }
};

const writeReservations = async (reservations: Reservation[]): Promise<void> => {
  try {
    await fs.writeFile(reservationsDbPath, JSON.stringify(reservations, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing reservations:', error);
  }
};

const readCaravans = async (): Promise<Caravan[]> => {
  try {
    const data = await fs.readFile(caravansDbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading caravans:', error);
    return [];
  }
};

export const createReservation = async (req: Request, res: Response) => {
  const { caravanId, guestId, startDate, endDate } = req.body;

  if (!caravanId || !guestId || !startDate || !endDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const caravans = await readCaravans();
  const caravan = caravans.find(c => c.id === caravanId);

  if (!caravan) {
    return res.status(404).json({ message: 'Caravan not found' });
  }

  const reservations = await readReservations();

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
  await writeReservations(reservations);

  res.status(201).json(newReservation);
};

export const getMyReservations = async (req: Request, res: Response) => {
  // In a real app, you'd get the guestId from the authenticated user's token
  const guestId = req.query.guestId as string;

  if (!guestId) {
    return res.status(400).json({ message: 'Guest ID is required' });
  }

  const reservations = await readReservations();
  const myReservations = reservations.filter(r => r.guestId === guestId);

  res.json(myReservations);
};

export const getHostReservations = async (req: Request, res: Response) => {
  const hostId = req.query.hostId as string;

  if (!hostId) {
    return res.status(400).json({ message: 'Host ID is required' });
  }

  const caravans = await readCaravans();
  const hostCaravanIds = caravans.filter(c => c.hostId === hostId).map(c => c.id);

  const reservations = await readReservations();
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

  const reservations = await readReservations();
  const reservationIndex = reservations.findIndex(r => r.id === id);

  if (reservationIndex === -1) {
    return res.status(404).json({ message: 'Reservation not found' });
  }

  reservations[reservationIndex].status = status;
  await writeReservations(reservations);

  res.json(reservations[reservationIndex]);
};

export const confirmPayment = async (req: Request, res: Response) => {
  const { id } = req.params;

  const reservations = await readReservations();
  const reservationIndex = reservations.findIndex(r => r.id === id);

  if (reservationIndex === -1) {
    return res.status(404).json({ message: 'Reservation not found' });
  }

  if (reservations[reservationIndex].status !== 'awaiting_payment') {
    return res.status(400).json({ message: 'Reservation is not awaiting payment' });
  }

  reservations[reservationIndex].status = 'confirmed';
  await writeReservations(reservations);

  res.json(reservations[reservationIndex]);
};
