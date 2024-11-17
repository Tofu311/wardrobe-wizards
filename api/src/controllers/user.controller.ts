import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { config } from '../config';
import { AuthRequest } from '../types';
import { WeatherData } from '../types';
import axios from 'axios';

interface RegisterRequestBody {
    name: {
        first: string;
        last: string;
    };
    username: string;
    email: string;
    password: string;
    geolocation: {
        coordinates: number[];
    };
}

interface LoginRequestBody {
    username: string;
    password: string;
    geolocation: {
        coordinates: number[];
    };
}

export const fetchWeather = async (latitude: number, longitude: number): Promise<WeatherData> => {
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await axios.get(`https://api.weatherapi.com/v1/current.json`, {
        params: { key: apiKey, q: `${latitude},${longitude}` },
    });

    const weather = response.data;

    return {
        location: {
            lat: weather.location.lat,
            lon: weather.location.lon,
        },
        current: {
            temp_c: weather.current.temp_c,
            temp_f: weather.current.temp_f,
            condition: {
                text: weather.current.condition.text,
                icon: weather.current.condition.icon,
            },
            wind_mph: weather.current.wind_mph,
            wind_degree: weather.current.wind_degree,
            humidity: weather.current.humidity,
            cloud: weather.current.cloud,
            feelslike_c: weather.current.feelslike_c,
            feelslike_f: weather.current.feelslike_f,
            uv: weather.current.uv,
        }
    };
}

export const register = async (
    req: Request<{}, {}, RegisterRequestBody>,
    res: Response
): Promise<void> => {
    try {
        // const { name, username, email, password, geolocation } = req.body;
        const { name, username, email, password, geolocation } = req.body;

        console.log(name, username, email, password, geolocation);

        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        console.log(existingUser);

        if (existingUser) {
            res.status(409).json({ message: "Username or email already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            geolocation
        });

        const token = jwt.sign(
            { id: user._id, username: user.username },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        // const weather = await fetchWeather(geolocation.coordinates[0], geolocation.coordinates[1]);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            // weather
        });
    } catch (error) {
        // Log full error details to console
        console.error("Error in registration:", error);

        if (error instanceof Error) {
            res.status(500).json({ message: "Error occurred during registration",
                error: error.message
             });
        } else {
            res.status(500).json({
                message: "An error occurred during registration.",
                error: "Unknown error"
            });
        }
    }
};

export const login = async (
    req: Request<{}, {}, LoginRequestBody>,
    res: Response
): Promise<void> => {
    try {
        // const { username, password, geolocation } = req.body;
        const { username, password } = req.body;

        console.log(username, password);

        const user = await User.findOne({ username });

        console.log(user);
        
        if (!user || !(await user.matchPassword(password))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        console.log(token);
        
        // const weather = await fetchWeather(geolocation.coordinates[0], geolocation.coordinates[1]);

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            // weather
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during login' });
    }
};

export const getProfile = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const user = await User.findById(req.user?.id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
};
