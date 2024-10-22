import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { RemoveBgResult, RemoveBgError, removeBackgroundFromImageFile } from "remove.bg";

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
    throw new Error('The OPENAI_API_KEY environment variable is missing or empty. Please provide it to use the OpenAI client.');
}

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const port = 3000;

const upload = multer({ storage: multer.memoryStorage()});
const upload2 = multer({ storage: multer.memoryStorage() });

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

app.post('/remove-background', upload2.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).send('No image uploaded');
        }

        const localFolderPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(localFolderPath)) {
            fs.mkdirSync(localFolderPath, { recursive: true });
        }

        const localFilePath = path.join(localFolderPath, req.file.originalname);
        fs.writeFileSync(localFilePath, req.file.buffer);

        const result: RemoveBgResult = await removeBackgroundFromImageFile({
            path: localFilePath,
            apiKey: process.env.REMOVE_BG_API_KEY,
            size: "preview",
            type: "product",
            scale: "80%",
            crop: true,
        });

        const outputFilePath = path.join(localFolderPath, `no-bg-${req.file.originalname}`);
        fs.writeFileSync(outputFilePath, result.base64img, { encoding: 'base64' });

        res.sendFile(outputFilePath);

        setTimeout(() => {
            fs.unlink(localFilePath, err => { if (err) console.error(`Error deleting file ${localFilePath}`, err); });
            fs.unlink(outputFilePath, err => { if (err) console.error(`Error deleting file ${outputFilePath}`, err); });
        }, 1000);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/classify-clothing', upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).send('No image uploaded');
        }

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

        const parsedResponse = response.choices[0].message.content;
        
        res.json(parsedResponse);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

//login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    //login example till I find a real one
    const USER = 'admin';
    const PASS = 'password123';

    if (username === USER && password === PASS) {
        res.status(200).json({ message: 'Login successful!' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
