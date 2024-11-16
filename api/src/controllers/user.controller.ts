import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { config } from '../config';
import { AuthRequest } from '../types';
import { WeatherData } from '../types';
import axios from 'axios';
import { sendVerificationEmail } from '../services/email.service';

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
        },
    };
};

export const register = async (
    req: Request<{}, {}, RegisterRequestBody>,
    res: Response
): Promise<void> => {
    try {
        const { name, username, email, password, geolocation } = req.body;

        const existingUser = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (existingUser) {
            res.status(409).json({ message: "Username or email already exists" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with "verified" set to false
        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            geolocation,
            verified: false,
        });

        // Generate a verification token
        const verificationToken = jwt.sign(
            { id: user._id },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        const verificationLink = `https://wardrobewizard.fashion/verify-email?token=${verificationToken}`;

        // Send verification email
        await sendVerificationEmail(email, verificationLink);

        res.status(201).json({
            message: "User registered successfully. Please check your email to verify your account.",
        });
    } catch (error) {
        console.error("Error in registration:", error);
        res.status(500).json({ message: "Error occurred during registration" });
    }
};

export const login = async (
    req: Request<{}, {}, LoginRequestBody>,
    res: Response
): Promise<void> => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user || !(await user.matchPassword(password))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Check if the user is verified
        if (!user.verified) {
            res.status(403).json({
                message: 'Email not verified. Please check your email to verify your account.',
            });
            return;
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'Error during login' });
    }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token as string, config.jwtSecret) as { id: string };

        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(404).send(`
                <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
                    <h1>Email Verification Failed</h1>
                    <p>User not found. Please try again or contact support.</p>
                    <a href="https://wardrobewizard.fashion" style="
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: purple;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                    ">Go to Login</a>
                </div>
            `);
            return;
        }

        if (user.verified) {
            res.status(400).send(`
                <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
                    <h1>Email Already Verified</h1>
                    <p>Your email has already been verified. You can log in now.</p>
                    <a href="https://wardrobewizard.fashion" style="
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: purple;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                    ">Go to Login</a>
                </div>
            `);
            return;
        }

        user.verified = true;
        await user.save();

        res.send(`
            <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
                <h1>Email Verified Successfully</h1>
                <p>Thank you for verifying your email. You can now log in.</p>
                <a href="https://wardrobewizard.fashion" style="
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: purple;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                ">Go to Login</a>
            </div>
        `);
    } catch (error) {
        console.error("Error verifying email:", error);
        res.status(400).send(`
            <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
                <h1>Email Verification Failed</h1>
                <p>The verification link is invalid or has expired. Please try again.</p>
                <a href="https://wardrobewizard.fashion" style="
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: purple;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                ">Go to Login</a>
            </div>
        `);
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
