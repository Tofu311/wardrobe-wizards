import express from 'express';
import mongoose from 'mongoose';
import { config } from './config';
import userRoutes from './routes/user.route';
import clothingRoutes from './routes/clothing.route';

const app = express();
// Rerun workflow comment

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/clothing', clothingRoutes);

// hello world
app.get('/', (req, res) => {
    res.send('Hello World! This is the Wardrobe Wizard API.');
});

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
    