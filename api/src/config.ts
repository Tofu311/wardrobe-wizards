import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    databaseUrl: string;
    jwtSecret: string;
    openAiKey: string;
    removeBgApiKey: string;
}

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL || !process.env.OPENAI_API_KEY || !process.env.REMOVE_BG_API_KEY) {
    throw new Error('Missing required environment variables');
}

// Fill in the environment variables
export const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    openAiKey: process.env.OPENAI_API_KEY,
    removeBgApiKey: process.env.REMOVE_BG_API_KEY,
};