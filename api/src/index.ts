import express from 'express';
import mongoose from 'mongoose';
import { config } from './config';
import userRoutes from './routes/user.route';
import clothingRoutes from './routes/clothing.route';
import bodyParser from 'body-parser';

const app = express();
// Rerun workflow comment

app.use(bodyParser.json({ limit: '50mb' })); // Increase the JSON payload limit
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // For form data

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
    