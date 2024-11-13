import mongoose, { Model, Schema } from 'mongoose';
import { OutfitDocument } from '../types';

const outfitSchema = new Schema<OutfitDocument>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [{ type: Schema.Types.ObjectId, ref: "Clothing" }],
});

export const Outfit = mongoose.model<OutfitDocument>('Outfit', outfitSchema);