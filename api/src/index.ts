import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { RemoveBgResult, removeBackgroundFromImageFile } from "remove.bg";
import { z } from 'zod';
import { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
// @ts-ignore
import { login, registerUser } from '../controllers/user.controller.js';

const Closet = require('../models/closet.model.js');
const User = require('../models/user.model.js');
const userRoute = require('../routes/user.route.js');

dotenv.config();

if (!process.env.OPENAI_API_KEY || !process.env.DATABASE_URL || !process.env.REMOVE_BG_API_KEY) {
    throw new Error('Environment variables are missing or empty. Please provide all required keys.');
}

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 3000;

app.use('/api/users', userRoute);

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const upload = multer({ storage: multer.memoryStorage() });

// Helper function to ensure apiKey is a string
const removeBgApiKey = process.env.REMOVE_BG_API_KEY || "";

const ClothingType = z.enum(['HEADWEAR', 'TOP', 'OUTERWEAR', 'BOTTOM', 'FOOTWEAR']);
const ClothingWeather = z.enum(['HOT', 'WARM', 'MILD', 'COLD', 'FREEZING']);

const ClothingSchema = z.object({
    type: ClothingType,
    primaryColor: z.string(),
    secondaryColor: z.string().optional(),
    otherColors: z.array(z.string()).optional(),
    material: z.string(),
    temperature: ClothingWeather,
    description: z.string(),
});

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

const newClothingHandler: RequestHandler = async (req: MulterRequest, res: Response): Promise<void> => {
    try {

        const userId = req.body.userId;
        if (!userId) {
            res.status(400).send('User ID is required');
            return;
        }

        if (!req.file) {
            res.status(400).send('No image uploaded');
            return;
        }

        const clothingId = new mongoose.Types.ObjectId();
        
        const localFolderPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(localFolderPath)) {
            fs.mkdirSync(localFolderPath, { recursive: true });
        }

        const fileExtension = path.extname(req.file.originalname);
        const newFileName = `${clothingId}${fileExtension}`;
        const localFilePath = path.join(localFolderPath, newFileName);

        fs.writeFileSync(localFilePath, req.file.buffer);

        const result = await removeBackgroundFromImageFile({
            path: localFilePath,
            apiKey: removeBgApiKey,
            size: "preview",
            type: "product",
            scale: "80%",
            crop: true,
        });

        const outputFilePath = path.join(localFolderPath, `no-bg-${newFileName}`);
        fs.writeFileSync(outputFilePath, result.base64img, { encoding: 'base64' });

        fs.unlink(localFilePath, (err) => { 
            if (err) console.error(`Error deleting file ${localFilePath}`, err); 
        });

        const response = await client.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a fashion assistant.',
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Classify this clothing item:',
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
                            },
                        },
                    ]
                },
            ],
            response_format: zodResponseFormat(ClothingSchema, "clothes")
        });

        const parsedResponse = JSON.parse(response.choices[0].message.content || '{}');

        const clothingData = {
            ...parsedResponse,
            imagePath: outputFilePath,
        };

        const closet = await Closet.findOne({ userId: userId });

        if (!closet) {
            const newCloset = new Closet({
                userId: userId,
                items: [clothingData],
            });
            await newCloset.save();
        } else{
            closet.items.push(clothingData);
            await closet.save();
        }      

        res.status(201).json(clothingData);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

app.post('/new-clothing', upload.single('image'), newClothingHandler);

// // Login and register endpoints
app.post('/login', (req: Request, res: Response) => login(req, res));
app.post('/register', (req: Request, res: Response) => registerUser(req, res));

// Database connection
mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log("Connected to MongoDB database");
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Connection to MongoDB database failed:", error);
    });