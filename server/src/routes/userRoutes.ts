import { Router } from 'express';
import { signup, login, getUserById, updateUser, requestIdentityVerification, deleteUser, kakaoLogin, kakaoCallback } from '../controllers/userController';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);

// Kakao Auth
router.get('/auth/kakao', kakaoLogin);
router.get('/auth/kakao/callback', kakaoCallback);

router.post('/request-verification', requestIdentityVerification); // Route for user to request identity verification
router.get('/:id', getUserById); // Route to get user by ID
router.put('/:id', updateUser); // Route to update user by ID
router.delete('/:id', deleteUser); // Route to delete user by ID

export default router;
