import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { v4 as uuidv4 } from 'uuid';
import { updateTrustScore } from './userController';
import { Caravan } from '../models/Caravan';
import { readData, writeData } from '../db/utils';

const REVIEWS_FILE = 'reviews.json';
const CARAVANS_FILE = 'caravans.json';

export const createReview = async (req: Request, res: Response) => {
  const { caravanId, guestId, rating, comment } = req.body;

  if (!caravanId || !guestId || !rating || !comment) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const newReview: Review = {
    id: uuidv4(),
    caravanId,
    guestId,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };

  const reviews = await readData<Review>(REVIEWS_FILE);
  reviews.push(newReview);
  await writeData<Review>(REVIEWS_FILE, reviews);

  // Update trust scores
  // 1. Guest gets points for writing a review
  await updateTrustScore(guestId, 5);

  // 2. Host gets points based on the rating
  const caravans = await readData<Caravan>(CARAVANS_FILE);
  const caravan = caravans.find(c => c.id === caravanId);
  if (caravan) {
    if (rating === 5) {
      await updateTrustScore(caravan.hostId, 15);
    } else if (rating === 1) {
      await updateTrustScore(caravan.hostId, -10);
    }
  }

  res.status(201).json(newReview);
};

export const getReviewsForCaravan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const reviews = await readData<Review>(REVIEWS_FILE);
  const caravanReviews = reviews.filter(r => r.caravanId === id);
  res.json(caravanReviews);
};

export const getReviewsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const reviews = await readData<Review>(REVIEWS_FILE);
  const userReviews = reviews.filter(r => r.guestId === userId);

  res.json(userReviews);
};
