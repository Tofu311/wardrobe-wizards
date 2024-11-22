import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { config } from '../config';
import { AuthRequest } from '../types';
import { WeatherData } from '../types';
import { z } from "zod";
import { sendVerificationEmail, sendPasswordRecoveryEmail } from '../services/email.service';

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

        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            geolocation,
            verified: false,
        });

        const verificationToken = jwt.sign(
            { id: user._id },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        const verificationLink = `https://wardrobewizard.fashion/verify-email?token=${verificationToken}`;

        await sendVerificationEmail(email, verificationLink);

        res.status(201).json({
            message: "Account created successfully. Please check your email to verify your account.",
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

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const resetToken = jwt.sign(
            { id: user._id },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        const resetLink = `https://wardrobewizard.fashion/reset-password?token=${resetToken}`;

        await sendPasswordRecoveryEmail(email, resetLink);

        res.status(200).json({
            message: "Password recovery email sent. Please check your email.",
        });
    } catch (error) {
        console.error("Error during forgot password:", error);
        res.status(500).json({ message: "Error occurred during password recovery." });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.query;
    const { newPassword } = req.body;

    try {
        if (!token) {
            res.status(400).json({ message: "Token is required" });
            return;
        }

        const decoded = jwt.verify(token as string, config.jwtSecret) as { id: string };

        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (req.method === "GET") {
            res.status(200).send(`
                <form method="POST" action="/api/users/reset-password?token=${token}">
                    <label for="newPassword">Enter New Password:</label>
                    <input type="password" id="newPassword" name="newPassword" required />
                    <button type="submit">Reset Password</button>
                </form>
            `);
        } else if (req.method === "POST") {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();

            res.status(200).json({ message: "Password reset successfully" });
        }
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(400).json({ message: "Invalid or expired token" });
    }
};


export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token as string, config.jwtSecret) as { id: string };

        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(404).send(`
                <div style="text-align: center; font-family: Arial, sans-serif;">
                    <h1>Email Verification Failed</h1>
                    <p>User not found.</p>
                    <a href="https://wardrobewizard.fashion" style="
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: purple;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    ">Go to Login</a>
                </div>
            `);
            return;
        }

        if (user.verified) {
            res.status(400).send(`
                <div style="text-align: center; font-family: Arial, sans-serif;">
                    <h1>Email Already Verified</h1>
                    <p>Your email has already been verified.</p>
                    <a href="https://wardrobewizard.fashion" style="
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: purple;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    ">Go to Login</a>
                </div>
            `);
            return;
        }

        user.verified = true;
        await user.save();

        res.send(`
            <div style="text-align: center; font-family: Arial, sans-serif;">
                <h1>Email Verified Successfully</h1>
                <p>Thank you for verifying your email. You can now log in.</p>
                <a href="https://wardrobewizard.fashion" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: purple;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                ">Go to Login</a>
            </div>
        `);
    } catch (error) {
        console.error("Error verifying email:", error);
        res.status(400).send(`
            <div style="text-align: center; font-family: Arial, sans-serif;">
                <h1>Email Verification Failed</h1>
                <p>The verification link is invalid or has expired.</p>
                <a href="https://wardrobewizard.fashion" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: purple;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
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

const editUserProfileSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z.string().min(3).max(20).optional(),
    email: z.string().email().optional(),
    password: z
    .string()
    .min(1, { message: "Please enter a password." })
    .regex(/(?=.*\d)(?=.*[A-Z]).{8,}/, {
      message:
        "Password must be at least 8 characters long and contain at least one uppercase letter and one digit.",
    }).optional(),
});

export const editProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        // Validate the request body
        const validatedData = editUserProfileSchema.parse(req.body);
        
        // Find user
        const user = await User.findById(req.user?.id);
        if(!user) {
            res.status(404).json({message: "User not found"});
            return;
        }

        // If the fields are provided, update them
        if (validatedData.firstName) user.name.first = validatedData.firstName;
        if (validatedData.lastName) user.name.last = validatedData.lastName;
        if (validatedData.username) user.username = validatedData.username;
        if (validatedData.email) user.email = validatedData.email;


        // If password is provided, hash it before saving it
        if(validatedData.password) {
            const hashedPassword = await bcrypt.hash(validatedData.password, 10);
            user.password = hashedPassword;
        }

        // Save user
        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                message: "Validation failed",
                errors: error.issues,
            });
        } else {
            console.error("Error updating profile:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username } = req.body;

        const user = await User.findOneAndDelete({ username });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Error occurred during deletion" });
    }
};

export const recoverEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({
            message: "Email associated with the account retrieved successfully.",
            email: user.email,
        });
    } catch (error) {
        console.error("Error during email recovery:", error);
        res.status(500).json({ message: "Error occurred during email recovery." });
    }
};
