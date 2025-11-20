import { Request, Response } from 'express';
import { Caravan } from '../models/Caravan';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from '../db/utils';

const CARAVANS_FILE = 'caravans.json';

export const getCaravans = async (req: Request, res: Response) => {
  const caravans = await readData<Caravan>(CARAVANS_FILE);
  res.json(caravans);
};

export const getCaravanById = async (req: Request, res: Response) => {
  const caravans = await readData<Caravan>(CARAVANS_FILE);
  const caravan = caravans.find(c => c.id === req.params.id);
  if (caravan) {
    res.json(caravan);
  } else {
    res.status(404).json({ message: 'Caravan not found' });
  }
};

export const createCaravan = async (req: Request, res: Response) => {
  const { name, description, capacity, amenities, location, pricePerDay, imageUrl, hostId, status } = req.body;

  // Basic validation
  if (!name || !description || !capacity || !location || !pricePerDay || !hostId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (status && !['available', 'reserved', 'maintenance'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided' });
  }

  const newCaravan: Caravan = {
    id: uuidv4(),
    name,
    description,
    capacity,
    amenities: amenities || [],
    location,
    pricePerDay,
    imageUrl: imageUrl || `https://via.placeholder.com/300x200.png?text=${name.replace(/\s/g, '+')}`,
    hostId,
    status: status || 'available', // Set default status
  };

  const caravans = await readData<Caravan>(CARAVANS_FILE);
  caravans.push(newCaravan);
  await writeData<Caravan>(CARAVANS_FILE, caravans);

  res.status(201).json(newCaravan);
};

export const updateCaravan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // Extract status for validation

  if (status && !['available', 'reserved', 'maintenance'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status provided' });
  }

  const caravans = await readData<Caravan>(CARAVANS_FILE);
  const caravanIndex = caravans.findIndex(c => c.id === id);

  if (caravanIndex === -1) {
    return res.status(404).json({ message: 'Caravan not found' });
  }

  // In a real app, you should also verify that the user making the request is the owner of the caravan.
  
  const originalCaravan = caravans[caravanIndex];
  const updatedCaravan = { ...originalCaravan, ...req.body };
  caravans[caravanIndex] = updatedCaravan;

  await writeData<Caravan>(CARAVANS_FILE, caravans);

  res.status(200).json(updatedCaravan);
};

export const deleteCaravan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const caravans = await readData<Caravan>(CARAVANS_FILE);
  const caravanIndex = caravans.findIndex(c => c.id === id);

  if (caravanIndex === -1) {
    return res.status(404).json({ message: 'Caravan not found' });
  }

  // In a real app, you should also verify that the user making the request is the owner of the caravan.
  // const userId = req.user.id; // Assuming user info is attached to the request
  // if (caravans[caravanIndex].hostId !== userId) {
  //   return res.status(403).json({ message: 'You are not authorized to delete this caravan' });
  // }

  caravans.splice(caravanIndex, 1);
  await writeData<Caravan>(CARAVANS_FILE, caravans);

  res.status(200).json({ message: 'Caravan deleted successfully' });
};
