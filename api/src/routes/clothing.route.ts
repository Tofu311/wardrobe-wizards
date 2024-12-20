import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { verifyToken } from '../middleware/auth.middleware';
import { addClothing, generateOutfit, getClosetItems, deleteClothingItem, saveOutfit, deleteOutfit, getOutfits, getClothing, reclassifyClothing } from '../controllers/clothing.controller';

const router = Router();

router.post('/', verifyToken, upload.single('image'), addClothing);

router.get('/', verifyToken, getClothing, getClosetItems);

router.put('/:clothingId/reclassify', verifyToken, reclassifyClothing)

router.get('/outfit', verifyToken, getOutfits);

router.delete('/:id', verifyToken, deleteClothingItem);

router.delete('/outfit/:id', verifyToken, deleteOutfit);

router.post('/generateOutfit', verifyToken, generateOutfit);

router.post('/saveOutfit', verifyToken, saveOutfit);

export default router;