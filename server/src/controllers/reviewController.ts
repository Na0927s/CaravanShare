import { Request, Response } from 'express';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { CaravanRepository } from '../repositories/CaravanRepository';
import { UserRepository } from '../repositories/UserRepository'; // Required for UserService
import { UserService } from '../services/UserService';
import { ReviewService } from '../services/ReviewService';
import { AppError } from '../exceptions';

// Instantiate repositories and services
const reviewRepository = new ReviewRepository();
const caravanRepository = new CaravanRepository();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const reviewService = new ReviewService(reviewRepository, caravanRepository, userService);

export const createReview = async (req: Request, res: Response) => {
  try {
    const { caravan_id, guest_id, rating, comment } = req.body; // Changed caravanId to caravan_id, guestId to guest_id
    const newReview = await reviewService.createReview({ caravan_id, guest_id, rating, comment }); // Changed caravanId to caravan_id, guestId to guest_id
    res.status(201).json(newReview);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReviewsForCaravan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const caravanReviews = await reviewService.getReviewsForCaravan(id);
    res.json(caravanReviews);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReviewsByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userReviews = await reviewService.getReviewsByUserId(userId);
    res.json(userReviews);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
