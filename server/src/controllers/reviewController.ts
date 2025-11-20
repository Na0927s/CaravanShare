import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { Review } from '../models/Review';
import { v4 as uuidv4 } from 'uuid';
import { updateTrustScore } from './userController';
import { Caravan } from '../models/Caravan';

const reviewsDbPath = path.join(__dirname, '..', '..', 'db', 'reviews.json');
const caravansDbPath = path.join(__dirname, '..', '..', 'db', 'caravans.json');

const readReviews = async (): Promise<Review[]> => {
  try {
    const data = await fs.readFile(reviewsDbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading reviews:', error);
    return [];
  }
};

const writeReviews = async (reviews: Review[]): Promise<void> => {
  try {
    await fs.writeFile(reviewsDbPath, JSON.stringify(reviews, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing reviews:', error);
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

  const reviews = await readReviews();
  reviews.push(newReview);
  await writeReviews(reviews);

  // Update trust scores
  // 1. Guest gets points for writing a review
  await updateTrustScore(guestId, 5);

  // 2. Host gets points based on the rating
  const caravans = await readCaravans();
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
  const reviews = await readReviews();
  const caravanReviews = reviews.filter(r => r.caravanId === id);
  res.json(caravanReviews);
};

export const getReviewsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const reviews = await readReviews();
  const userReviews = reviews.filter(r => r.guestId === userId);

  res.json(userReviews);
};
