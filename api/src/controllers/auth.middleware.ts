import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest } from '../types';
import { User } from '../models/user.model';

interface JwtPayload {
    id: string;
    username: string;
}

export const verifyToken = async (
    req: AuthRequest, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'Access denied. No token provided.' });
            return;
        }

        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

        // Fetch the user from the database to check verification status
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (!user.verified) {
            res.status(403).json({
                message: 'Access denied. Please verify your email before accessing this resource.',
            });
            return;
        }

        // Attach the user to the request for further processing
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
