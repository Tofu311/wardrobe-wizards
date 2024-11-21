import { Router } from 'express';
import { register, login, getProfile, editProfile, verifyEmail, deleteUser, recoverEmail, forgotPassword, resetPassword } from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, editProfile)
router.get('/verify-email', verifyEmail);
router.delete('/delete', deleteUser);
router.post('/recover-email', recoverEmail);
router.post('/forgot-password', forgotPassword);


router.route('/reset-password')
    .get(resetPassword) 
    .post(resetPassword); 

export default router;
