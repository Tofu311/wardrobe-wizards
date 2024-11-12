import mongoose, { Model, Schema } from 'mongoose';
import { ClosetDocument, ClothingItem } from '../types';

const closetSchema = new Schema<ClosetDocument>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [{ type: Schema.Types.ObjectId, ref: "Clothing" }],
});

export const Closet = mongoose.model<ClosetDocument>('Closet', closetSchema);