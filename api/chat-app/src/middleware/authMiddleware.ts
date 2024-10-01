// src/middleware/authMiddleware.ts

import { RequestHandler } from 'express';

export const isAuthenticated: RequestHandler = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        res.status(401).send('Unauthorized. Please log in.');
        return;
    }
    next();
};
