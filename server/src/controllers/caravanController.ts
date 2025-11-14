import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { Caravan } from '../models/Caravan';

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
