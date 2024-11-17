import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest } from '../types';

interface JwtPayload {
    id: string;
    username: string;
}

export const verifyToken = (
    req: AuthRequest, 
    res: Response,
    next: NextFunction
): void => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'Access denied. No token provided.' });
            return;
        }

        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
