import { Response } from 'express';
import { removeBackgroundFromImageFile } from 'remove.bg';
import path from 'path';
import fs from 'fs';
import { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import mongoose from 'mongoose';
import { Closet } from '../models/closet.model';
import { Clothing } from '../models/clothing.model';
import { config } from '../config';
import { ClothingSchema } from '../schemas/clothing.schema';
import { AuthRequest, ClothingItem } from '../types';
import AWS from 'aws-sdk';

const openai = new OpenAI({
    apiKey: config.openAiKey,
});

const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: config.spacesEndpoint,
    accessKeyId: config.digitalOceanAccessKey,
    secretAccessKey: config.digitalOceanSecretKey,
    region: 'nyc3',
});

interface ProcessImageResult {
    imageUrl: string;
}

interface MulterRequest extends AuthRequest {
    file?: Express.Multer.File;
}

interface OutfitGenerationBody extends AuthRequest {
    prompt: string;
}

const processImage = async (
    file: Express.Multer.File,
    clothingId: mongoose.Types.ObjectId
): Promise<ProcessImageResult> => {
    const localFilePath = path.join(__dirname, '..', 'uploads', `${clothingId}${path.extname(file.originalname)}`);
    const outputFilePath = path.join(__dirname, '..', 'uploads', `no-bg-${clothingId}${path.extname(file.originalname)}`);

    fs.writeFileSync(localFilePath, file.buffer);

    try {
        // Remove background from the image
        const result = await removeBackgroundFromImageFile({
            path: localFilePath,
            apiKey: config.removeBgApiKey,
            size: "preview",
            type: "product",
            scale: "80%",
            crop: true,
        });

        // Save processed image to a local file
        fs.writeFileSync(outputFilePath, result.base64img, { encoding: 'base64' });

        // Upload to DigitalOcean Spaces
        const data = await s3.upload({
            Bucket: 'wardrobe-wizard', // Replace with your space name
            Key: `uploads/no-bg-${clothingId}${path.extname(file.originalname)}`,
            Body: fs.createReadStream(outputFilePath),
            ACL: 'public-read',
            ContentType: 'image/jpeg', // Adjust based on your image type
        }).promise();

        // Remove local files
        fs.unlinkSync(localFilePath);
        fs.unlinkSync(outputFilePath);

        return { imageUrl: data.Location };
    } catch (error) {
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
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

    console.log(response.choices[0].message.content);

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
        
        const { imageUrl } = await processImage(req.file, clothingId);

        console.log('Image URL:', imageUrl);

        const clothingData = await analyzeImage(req.file);

        console.log('Clothing data:', clothingData);

        // Create a new clothing item and save it to the Clothing collection with the image URL
        const clothingItem = new Clothing({
            ...clothingData,
            imagePath: imageUrl,
            _id: clothingId,
        });

        console.log('Clothing item:', clothingItem);

        await clothingItem.save();

        // Find or create a Closet for the user
        const closet = await Closet.findOne({ userId: req.user.id });
        if (!closet) {
            await Closet.create({
                userId: req.user.id,
                items: [clothingItem._id as mongoose.Types.ObjectId],
            });
        } else {
            closet.items.push(clothingItem._id as mongoose.Types.ObjectId);
            await closet.save();
        }

        res.status(201).json(clothingItem);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
