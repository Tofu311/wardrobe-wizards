import { Router } from 'express';
import { register, login, getProfile, verifyEmail } from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.get('/verify-email', verifyEmail);

export default router;
