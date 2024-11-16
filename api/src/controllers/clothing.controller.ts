import { Request, Response } from 'express';
import { removeBackgroundFromImageFile } from 'remove.bg';
import path from 'path';
import fs from 'fs';
import { OpenAI } from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import mongoose from 'mongoose';
import { Closet } from '../models/closet.model';
import { Clothing } from '../models/clothing.model';
import { config } from '../config';
import { ClothingSchema, OutfitSchema } from '../schemas/clothing.schema';
import { AuthRequest, ClothingItem } from '../types';
import AWS from 'aws-sdk';
import { Outfit } from '../models/outfit.model';

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

interface OutfitGenerationBody extends Request {
    user?: {
        id: string;
        username: string;
    };
    body: {
        prompt: string;
    };
}

const processImage = async (
    file: Express.Multer.File,
    clothingId: mongoose.Types.ObjectId
): Promise<ProcessImageResult> => {
    // Ensure the uploads directory exists
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const localFilePath = path.join(uploadDir, `${clothingId}${path.extname(file.originalname)}`);
    const outputFilePath = path.join(uploadDir, `no-bg-${clothingId}${path.extname(file.originalname)}`);

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
            // Ensure closet.items is an array
            closet.items = closet.items || [];
            closet.items.push(clothingItem._id as mongoose.Types.ObjectId);
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
        if (!req.user?.id) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        const clothingType = req.query.type as string | undefined;
        const color = req.query.color as string | undefined; // Retrieve color from query

        const closet = await Closet.findOne({ userId: req.user?.id }).populate<{ items: ClothingItem[] }>('items');

        if (!closet) {
            res.status(404).json({ message: 'Closet not found' });
            return;
        }

        // Filter items by ClothingType and color if specified
        const items = closet.items.filter((item) => {
            const matchesType = clothingType ? item.type === clothingType.toUpperCase() : true;
            const matchesColor = color ? item.primaryColor.toLowerCase() === color.toLowerCase() : true;
            return matchesType && matchesColor;
        });

        res.status(200).json(items);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const generateOutfit = async (
    req: OutfitGenerationBody,
    res: Response
): Promise<void> => {
    if (!req.user?.id) {
        res.status(400).json({ message: 'User not authenticated' });
        return;
    }
    
    if (!req.body?.prompt) {
        res.status(400).json({ message: 'Prompt is required' });
        return;
    }

    try {
        const closet = await Closet.findOne({ userId: req.user.id });

        if (!closet) {
            res.status(400).json({ message: 'No clothing items found' });
            return;
        }

        const clothingItems = await Clothing.find({ _id: { $in: closet.items } });

        var clothingPrompt = "Here's a list of clothes in your closet:\n";
        for (const item of clothingItems) {
            clothingPrompt += `- Clothing ID: ${item.id}; ${item.type} in ${item.primaryColor} made of ${item.material} with description: ${item.description} \n`;
        }
        console.log(clothingPrompt);

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a fashion assistant, pick an outfit for the user based on the provided clothing items.',
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Generate an outfit from the provided clothing items, for this prompt: ' + req.body.prompt + "\n\n Using the following clothing items: \n" + clothingPrompt + "\n You should return an array of the clothing item ids. An outfit should bare minimum consist of a top, bottom, and shoes, but can also include outerwear, headwear, and more.",
                        }
                    ]
                },
            ],
            response_format: zodResponseFormat(OutfitSchema, "outfit")
        });

        res.status(200).json(JSON.parse(response.choices[0].message.content as string));
    } catch (error) {
        console.error('Error generating outfit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getClosetItems = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    if (!req.user?.id) {
        res.status(400).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const closet = await Closet.findOne({ userId: req.user.id });

        if (!closet) {
            res.status(400).json({ message: 'No clothing items found' });
            return;
        }

        const filters: any = { _id: { $in: closet.items } };

        if (req.query.type) {
            filters.type = req.query.type;
        }
        if (req.query.color) {
            filters.primaryColor = req.query.color;
        }
        if (req.query.material) {
            filters.material = req.query.material;
        }

        const clothingItems = await Clothing.find(filters);

        if (clothingItems.length === 0) {
            res.status(404).json({ message: 'No clothing items found matching the criteria' });
            return;
        }

        res.status(200).json(clothingItems);
    } catch (error) {
        console.error('Error fetching closet items:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteClothingItem = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    if (!req.params.id) {
        res.status(400).json({ message: 'Clothing item ID is required' });
        return;
    }

    try {
        const closet = await Closet.findOne({ userId: req.user?.id });

        if (!closet) {
            res.status(400).json({ message: 'No clothing items found' });
            return;
        }

        // Convert req.params.id to ObjectId
        const itemId = new mongoose.Types.ObjectId(req.params.id);

        const index = closet.items.findIndex(item => item.equals(itemId));

        if (index === -1) {
            res.status(404).json({ message: 'Clothing item not found in closet' });
            return;
        }

        // Remove the item from the closet
        closet.items.splice(index, 1);

        await closet.save();

        //also remove the item from the Clothing collection
        await Clothing.findByIdAndDelete(itemId);

        res.status(200).json({ message: 'Clothing deleted' });
    } catch (error) {
        console.error('Error deleting clothing item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete the outfit

export const deleteOutfit = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    if (!req.params.id) {
        res.status(400).json({ message: 'Outfit ID is required' });
        return;
    }

    try {
        const outfit = await Outfit.findOneAndDelete({ userId: req.user?.id, _id: req.params.id });

        if (!outfit) {
            res.status(404).json({ message: 'Outfit not found' });
            return;
        }

        res.status(200).json({ message: 'Outfit deleted' });
    } catch (error) {
        console.error('Error deleting outfit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const saveOutfit = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    if (!req.body.items) {
        res.status(400).json({ message: 'Items array is required' });
        return;
    }

    try {
        const outfit = await Outfit.create({
            userId: req.user?.id,
            items: req.body.items,
        });

        res.status(201).json(outfit);
    } catch (error) {
        console.error('Error saving outfit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getOutfits = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const outfits = await Outfit.find({ userId: req.user?.id });

        res.status(200).json(outfits);
    } catch (error) {
        console.error('Error fetching outfits:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
