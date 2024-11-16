import multer from 'multer';

//file upload 
export const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 // 5MB limit
    }
});