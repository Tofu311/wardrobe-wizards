import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { verifyToken } from '../middleware/auth.middleware';
import { addClothing } from '../controllers/clothing.controller';

const router = Router();

router.post('/', verifyToken, upload.single('image'), addClothing);

export default router;