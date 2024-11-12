import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { verifyToken } from '../middleware/auth.middleware';
import { addClothing, generateOutfit, getClosetItems } from '../controllers/clothing.controller';

const router = Router();

router.post('/', verifyToken, upload.single('image'), addClothing);

router.get('/', verifyToken, getClosetItems);

router.post('/generateOutfit', verifyToken, generateOutfit);

export default router;