import { Router } from 'express';
import { getCaravans, getCaravanById, createCaravan, deleteCaravan, updateCaravan } from '../controllers/caravanController';

const router = Router();

router.get('/', getCaravans);
router.post('/', createCaravan);
router.get('/:id', getCaravanById);
router.put('/:id', updateCaravan); // Add PUT route for updates
router.delete('/:id', deleteCaravan);

export default router;
