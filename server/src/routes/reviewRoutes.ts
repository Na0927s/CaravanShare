import { Router } from 'express';
import { createReview, getReviewsByUserId } from '../controllers/reviewController';

const router = Router();

router.post('/', createReview);
router.get('/user/:userId', getReviewsByUserId); // New route to get reviews by user ID

export default router;
