import { Router } from 'express';
import { register, login, getProfile } from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth.middleware';
import cors from 'cors';

const router = Router();

router.post('/register', cors(), register);
router.post('/login', cors(), login);
router.get('/profile', cors(), verifyToken, getProfile);

export default router;