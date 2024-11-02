import mongoose, { Model, Schema } from 'mongoose';
import { ClosetDocument, ClothingItem } from '../types';

const clothingItemSchema = new Schema<ClothingItem>({
    imagePath: { type: String, required: true },
    type: { type: String, required: true },
    primaryColor: { type: String, required: true },
    secondaryColor: { type: String },
    otherColors: [String],
    material: { type: String, required: true },
    temperature: { type: String, required: true },
    description: { type: String },
});

const closetSchema = new Schema<ClosetDocument>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [clothingItemSchema],
});

export const Closet = mongoose.model<ClosetDocument>('Closet', closetSchema);