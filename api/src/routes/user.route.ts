import { Router } from 'express';
import { register, login, getProfile, verifyEmail, deleteUser, recoverEmail, forgotPassword } from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.get('/verify-email', verifyEmail);
router.delete('/delete', deleteUser);
router.post('/recover-email', recoverEmail); 
router.post('/forgot-password', forgotPassword); 

export default router;
