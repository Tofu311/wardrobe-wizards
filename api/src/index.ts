import express from 'express';
import mongoose from 'mongoose';
import { config } from './config';
import userRoutes from './routes/user.route';
import clothingRoutes from './routes/clothing.route';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/clothing', clothingRoutes);

// Will this pipeline work?

mongoose.connect(config.databaseUrl)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
        process.exit(1);
    });