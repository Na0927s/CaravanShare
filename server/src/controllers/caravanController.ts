import { Request, Response } from 'express';
import { CaravanRepository } from '../repositories/CaravanRepository';
import { CaravanService } from '../services/CaravanService';
import { AppError } from '../exceptions';

// Instantiate repositories and services
const caravanRepository = new CaravanRepository();
const caravanService = new CaravanService(caravanRepository);

export const getCaravans = async (req: Request, res: Response) => {
  try {
    const caravans = await caravanService.getCaravans();
    res.json(caravans);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCaravanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const caravan = await caravanService.getCaravanById(id);
    res.json(caravan);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCaravan = async (req: Request, res: Response) => {
  try {
    const newCaravan = await caravanService.createCaravan(req.body);
    res.status(201).json(newCaravan);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCaravan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedCaravan = await caravanService.updateCaravan(id, req.body);
    res.status(200).json(updatedCaravan);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCaravan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await caravanService.deleteCaravan(id);
    res.status(200).json({ message: 'Caravan deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
