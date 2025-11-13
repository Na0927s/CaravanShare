import { Router } from 'express';
import { getCaravans, getCaravanById } from '../controllers/caravanController';

const router = Router();

router.get('/', getCaravans);
router.get('/:id', getCaravanById);

export default router;
