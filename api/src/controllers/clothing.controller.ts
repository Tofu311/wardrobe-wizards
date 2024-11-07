import { Response } from 'express';
import { removeBackgroundFromImageFile } from 'remove.bg';
import path from 'path';
import fs from 'fs';
import { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import mongoose from 'mongoose';
import { Closet } from '../models/closet.model';
import { config } from '../config';
import { ClothingSchema } from '../schemas/clothing.schema';
import { AuthRequest, ClothingItem } from '../types';

const openai = new OpenAI({
    apiKey: config.openAiKey,
});

interface ProcessImageResult {
    outputPath: string;
}

interface MulterRequest extends AuthRequest {
    file?: Express.Multer.File;
}

const processImage = async (
    file: Express.Multer.File,
    clothingId: mongoose.Types.ObjectId
): Promise<ProcessImageResult> => {
    const localFolderPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(localFolderPath)) {
        fs.mkdirSync(localFolderPath, { recursive: true });
    }

    const fileExtension = path.extname(file.originalname);
    const newFileName = `${clothingId}${fileExtension}`;
    const localFilePath = path.join(localFolderPath, newFileName);
    const outputFilePath = path.join(localFolderPath, `no-bg-${newFileName}`);

    fs.writeFileSync(localFilePath, file.buffer);

    try {
        const result = await removeBackgroundFromImageFile({
            path: localFilePath,
            apiKey: config.removeBgApiKey,
            size: "preview",
            type: "product",
            scale: "80%",
            crop: true,
        });

        fs.writeFileSync(outputFilePath, result.base64img, { encoding: 'base64' });
        fs.unlinkSync(localFilePath);

        return { outputPath: outputFilePath };
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw error;
    }
};

const analyzeImage = async (file: Express.Multer.File): Promise<ClothingItem> => {
    const response = await openai.chat.completions.create({
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
                            url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
                        },
                    },
                ]
            },
        ],
        response_format: zodResponseFormat(ClothingSchema, "clothes")
    });

    return JSON.parse(response.choices[0].message.content || '{}');
};

export const addClothing = async (
    req: MulterRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.file || !req.user?.id) {
            res.status(400).json({ message: 'No image uploaded or user not authenticated' });
            return;
        }

        const clothingId = new mongoose.Types.ObjectId();
        
        const { outputPath } = await processImage(req.file, clothingId);
        const clothingData = await analyzeImage(req.file);
        
        const closet = await Closet.findOne({ userId: req.user.id });
        const clothingItem = {
            ...clothingData,
            imagePath: outputPath,
        };

        if (!closet) {
            await Closet.create({
                userId: req.user.id,
                items: [clothingItem],
            });
        } else {
            closet.items.push(clothingItem);
            await closet.save();
        }

        res.status(201).json(clothingItem);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getClothing = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if(!req.user?.id) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const clothingType = req.query.type as String | undefined;
        const closet = await Closet.findOne({ userId: req.user?.id })

        if (!closet) {
            res.status(404).json({ message: 'Closet not found'});
            return;
        }

        // Filter items by ClothingType if specified
        const items = clothingType
            ? closet.items.filter(item => item.type === clothingType.toUpperCase())
            : closet.items;

        res.status(200).json(items);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}