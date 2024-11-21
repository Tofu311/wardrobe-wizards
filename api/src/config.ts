import dotenv from 'dotenv'; 

dotenv.config();

interface Config {
    port: number;
    databaseUrl: string;
    jwtSecret: string;
    openAiKey: string;
    removeBgApiKey: string;
    spacesEndpoint: string;
    digitalOceanAccessKey: string;
    digitalOceanSecretKey: string;
    emailUser: string;
    emailPass: string;
}

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL || !process.env.OPENAI_API_KEY || !process.env.REMOVE_BG_API_KEY || !process.env.SPACES_ENDPOINT || !process.env.DIGITAL_OCEAN_ACCESS_KEY || !process.env.DIGITAL_OCEAN_SECRET_KEY || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Missing required environment variables');
}


// Fill in the environment vars
export const config: Config = {
    port: parseInt(process.env.PORT || '3000', 10),
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    openAiKey: process.env.OPENAI_API_KEY,
    removeBgApiKey: process.env.REMOVE_BG_API_KEY,
    spacesEndpoint: process.env.SPACES_ENDPOINT,
    digitalOceanAccessKey: process.env.DIGITAL_OCEAN_ACCESS_KEY,
    digitalOceanSecretKey: process.env.DIGITAL_OCEAN_SECRET_KEY,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
};
