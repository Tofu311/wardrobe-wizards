import mongoose, { Model, Schema, Document, Types } from 'mongoose';
import { ClothingDocument } from '../types';

const clothingSchema = new Schema<ClothingDocument>({
    imagePath: { type: String, required: true },
    type: { type: String, required: true },
    primaryColor: { type: String, required: true },
    secondaryColor: { type: String },
    otherColors: [String],
    material: { type: String, required: true },
    temperature: { type: String, required: true },
    description: { type: String },
});

export const Clothing: Model<ClothingDocument> = mongoose.model<ClothingDocument>('Clothing', clothingSchema);
