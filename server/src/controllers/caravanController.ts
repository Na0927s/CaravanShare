import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { Caravan } from '../models/Caravan';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(__dirname, '..', '..', 'db', 'caravans.json');

const readCaravans = async (): Promise<Caravan[]> => {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading caravans:', error);
    return [];
  }
};

const writeCaravans = async (caravans: Caravan[]): Promise<void> => {
  try {
    await fs.writeFile(dbPath, JSON.stringify(caravans, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing caravans:', error);
  }
};

export const getCaravans = async (req: Request, res: Response) => {
  const caravans = await readCaravans();
  res.json(caravans);
};

export const getCaravanById = async (req: Request, res: Response) => {
  const caravans = await readCaravans();
  const caravan = caravans.find(c => c.id === req.params.id);
  if (caravan) {
    res.json(caravan);
  } else {
    res.status(404).json({ message: 'Caravan not found' });
  }
};

export const createCaravan = async (req: Request, res: Response) => {
  const { name, description, capacity, amenities, location, pricePerDay, imageUrl, hostId } = req.body;

  // Basic validation
  if (!name || !description || !capacity || !location || !pricePerDay || !hostId) {
    return res.status(400).json({ message: 'Missing required fields' });
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
  };

  const caravans = await readCaravans();
  caravans.push(newCaravan);
  await writeCaravans(caravans);

  res.status(201).json(newCaravan);
};

export const updateCaravan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const caravans = await readCaravans();
  const caravanIndex = caravans.findIndex(c => c.id === id);

  if (caravanIndex === -1) {
    return res.status(404).json({ message: 'Caravan not found' });
  }

  // In a real app, you should also verify that the user making the request is the owner of the caravan.
  
  const originalCaravan = caravans[caravanIndex];
  const updatedCaravan = { ...originalCaravan, ...req.body };
  caravans[caravanIndex] = updatedCaravan;

  await writeCaravans(caravans);

  res.status(200).json(updatedCaravan);
};

export const deleteCaravan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const caravans = await readCaravans();
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
  await writeCaravans(caravans);

  res.status(200).json({ message: 'Caravan deleted successfully' });
};
