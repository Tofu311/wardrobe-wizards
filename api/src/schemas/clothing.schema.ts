import { z } from 'zod';

export const ClothingType = z.enum(['HEADWEAR', 'TOP', 'OUTERWEAR', 'BOTTOM', 'FOOTWEAR']);
export const ClothingWeather = z.enum(['HOT', 'WARM', 'MILD', 'COLD', 'FREEZING']);

export const ClothingSchema = z.object({
    type: ClothingType,
    primaryColor: z.string(),
    secondaryColor: z.string().optional(),
    otherColors: z.array(z.string()).optional(),
    material: z.string(),
    temperature: ClothingWeather,
    description: z.string(),
});

export const OutfitSchema = z.object({
    outfitItemIds: z.array(z.string())
});

export type ClothingSchemaType = z.infer<typeof ClothingSchema>;

export type OutfitSchemaType = z.infer<typeof OutfitSchema>;