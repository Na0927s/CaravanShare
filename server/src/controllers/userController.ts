import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { UserService } from '../services/UserService';
import { AppError } from '../exceptions';

// Instantiate repositories and services (for now, direct instantiation; later can be managed by a DI container)
const userRepository = new UserRepository();
const userService = new UserService(userRepository);

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    const newUser = await userService.signup({ email, password, name, role });
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error); // Log unexpected errors
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userService.login(email, password);
    res.status(200).json({ message: 'Login successful', user: user });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error); // Log unexpected errors
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error); // Log unexpected errors
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contact } = req.body;
    const updatedUser = await userService.updateUser(id, { name, contact });
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error); // Log unexpected errors
    res.status(500).json({ message: 'Internal server error' });
  }
};

