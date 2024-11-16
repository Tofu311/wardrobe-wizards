import { Router } from 'express';
import { register, login, getProfile, verifyEmail } from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register); // User registration route
router.post('/login', login);       // User login route
router.get('/verify-email', verifyEmail); // Email verification route
router.get('/profile', verifyToken, getProfile); // Protected route for user profile

export default router;

