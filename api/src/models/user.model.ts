// src/models/user.model.ts
import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface UserDocument extends Document {
  name: {
    first: string;
    last: string;
  };
  username: string;
  password: string;
  email: string;
  verified: boolean; // New field for email verification
  geolocation: {
    type: string;
    coordinates: number[];
  };
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface UserModel extends Model<UserDocument> {}

const UserSchema = new mongoose.Schema(
  {
    name: {
      first: { type: String, required: true },
      last: { type: String, required: true },
    },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    verified: { type: Boolean, default: false }, // New field, default is false
    geolocation: {
      type: { type: String, default: "Point" },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Method to match passwords
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<UserDocument, UserModel>('User', UserSchema);
