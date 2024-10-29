import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { RemoveBgResult, removeBackgroundFromImageFile } from "remove.bg";
import { z } from 'zod';

dotenv.config();

// Import JavaScript modules with TS ignore to bypass type errors
//@ts-ignore
import { login, registerUser } from '../controllers/user.controller.js';
//@ts-ignore
import userRoute from '../routes/user.route.js';

if (!process.env.OPENAI_API_KEY || !process.env.DATABASE_URL || !process.env.REMOVE_BG_API_KEY) {
    throw new Error('Environment variables are missing or empty. Please provide all required keys.');
}

const app = express();
const port = 3000;

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/users', userRoute);

const upload = multer({ storage: multer.memoryStorage() });

// Helper function to ensure apiKey is a string
const removeBgApiKey = process.env.REMOVE_BG_API_KEY || "";

// Define the handler function with explicit type casting to RequestHandler
const removeBackgroundHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
        res.status(400).send('No image uploaded');
        return;
    }

    const localFolderPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(localFolderPath)) {
        fs.mkdirSync(localFolderPath, { recursive: true });
    }

    const localFilePath = path.join(localFolderPath, req.file.originalname);
    fs.writeFileSync(localFilePath, req.file.buffer);

    try {
        const result: RemoveBgResult = await removeBackgroundFromImageFile({
            path: localFilePath,
            apiKey: removeBgApiKey,
            size: "preview",
            type: "product",
            scale: "80%",
            crop: true,
        });

        const outputFilePath = path.join(localFolderPath, `no-bg-${req.file.originalname}`);
        fs.writeFileSync(outputFilePath, result.base64img, { encoding: 'base64' });

        res.sendFile(outputFilePath);

        setTimeout(() => {
            fs.unlinkSync(localFilePath);
            fs.unlinkSync(outputFilePath);
        }, 1000);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Apply the handler with type casting to the route
app.post('/remove-background', upload.single('image'), removeBackgroundHandler);

// Login and register endpoints
app.post('/login', (req: Request, res: Response) => login(req, res));
app.post('/register', (req: Request, res: Response) => registerUser(req, res));

// Database connection
mongoose.connect(process.env.DATABASE_URL as string)
.then(() => {
    console.log("Connected to MongoDB database");
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
})
.catch((error) => {
    console.error("Connection to MongoDB database failed:", error);
});
