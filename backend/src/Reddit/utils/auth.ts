import { Response, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";

export function AuthMiddlware(req: any, res: Response, next: NextFunction) {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jsonwebtoken.verify(token, 'SECRET');
            req.user = decoded;

            next();
        } catch (error) {
            res.status(401).json({
                status: false,
                payload: "Not authorized, token failed."
            });
            return;
        }
    }
    if (!token) {
        res.status(401).json({
            status: false,
            payload: "Not authorized, no token provided."
        });
    }
}