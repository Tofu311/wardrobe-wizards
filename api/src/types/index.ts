import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
    };
}

export interface WeatherData {
    location: {
        lat: number;
        lon: number;
    };
    current: {
        temp_c: number;
        temp_f: number;
        condition: {
            text: string;
            icon: string; // Fun lil weather icon, maybe useful in frontend?
        };
        wind_mph: number;
        wind_degree: number;
        humidity: number;
        cloud: number;
        feelslike_c: number;
        feelslike_f: number;
        uv: number;
    }
}

export interface UserDocument extends Document {
    name: {
        first: string;
        last: string;
    };
    username: string;
    password: string;
    email: string;
    geolocation: {
        type: string;
        coordinates: number[];
    };
    matchPassword(enteredPassword: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}

export interface ClothingItem {
    imagePath: string;
    type: string;
    primaryColor: string;
    secondaryColor?: string;
    otherColors?: string[];
    material: string;
    temperature: string;
    description?: string;
}

export interface ClothingDocument extends Document {
    imagePath: string;
    type: string;
    primaryColor: string;
    secondaryColor?: string;
    otherColors?: string[];
    material: string;
    temperature: string;
    description?: string;
}

export interface ClosetDocument extends Document {
    userId: Types.ObjectId;
    items: Types.ObjectId[];
}

