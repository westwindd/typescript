"use strict";
// src/middleware/authMiddleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        res.status(401).send('Unauthorized. Please log in.');
        return;
    }
    next();
};
exports.isAuthenticated = isAuthenticated;
