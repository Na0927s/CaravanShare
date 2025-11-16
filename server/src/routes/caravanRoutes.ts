import { Router } from 'express';
import { getCaravans, getCaravanById, createCaravan, deleteCaravan, updateCaravan } from '../controllers/caravanController';
import { getReviewsForCaravan } from '../controllers/reviewController';

const router = Router();

router.get('/', getCaravans);
router.post('/', createCaravan);
router.get('/:id', getCaravanById);
router.put('/:id', updateCaravan); // Add PUT route for updates
router.delete('/:id', deleteCaravan);
router.get('/:id/reviews', getReviewsForCaravan);

export default router;
