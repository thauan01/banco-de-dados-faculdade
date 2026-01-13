import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
    };
}

interface TokenPayload extends JwtPayload {
    id: number;
    email: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido" });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
        return res.status(401).json({ error: "Token inválido" });
    }

    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ error: "Chave secreta não configurada" });
        }

        const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
        (req as AuthRequest).user = { id: decoded.id, email: decoded.email };
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido ou expirado" });
    }
}