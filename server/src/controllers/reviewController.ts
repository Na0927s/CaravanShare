import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { Review } from '../models/Review';
import { v4 as uuidv4 } from 'uuid';

const reviewsDbPath = path.join(__dirname, '..', '..', 'db', 'reviews.json');

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

  res.status(201).json(newReview);
};

export const getReviewsForCaravan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const reviews = await readReviews();
  const caravanReviews = reviews.filter(r => r.caravanId === id);
  res.json(caravanReviews);
};
