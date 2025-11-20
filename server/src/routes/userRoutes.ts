import { Router } from 'express';
import { signup, login, getUserById, updateUser } from '../controllers/userController';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/:id', getUserById); // Route to get user by ID
router.put('/:id', updateUser); // Route to update user by ID

export default router;
