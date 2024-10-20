import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import {removeBackground} from "@imgly/background-removal-node";

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
            fs.mkdirSync(localFolderPath);
        }
        const localFilePath = path.join(localFolderPath, req.file.originalname);
        fs.writeFileSync(localFilePath, req.file.buffer);

        removeBackground(localFilePath).then(async (blob: Blob) => {
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.unlinkSync(localFilePath);
            res.contentType('image/png');
            res.send(buffer);
        }).catch((error: Error) => {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error: Failed to remove background');
        });
        
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
