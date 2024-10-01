// src/controllers/AuthController.ts

import express, { Request, Response, RequestHandler } from 'express';
import { User } from '../models/User';

const users: User[] = []; // Temporary in-memory user store

export class AuthController {
    public router = express.Router();

    constructor() {
        this.router.post('/signup', this.signUp);
        this.router.post('/login', this.login);
        this.router.get('/logout', this.logout);
        this.router.get('/session', this.getSession); // Route to fetch session data
    }

    private signUp: RequestHandler = (req, res) => {
        const { username, password } = req.body;

        // Username validation
        if (!username || typeof username !== 'string' || username.trim().length < 3) {
            res.status(400).send('Username must be at least 3 characters long.');
            return;
        }

        // Check for unique username
        const userExists = users.find(user => user.username === username.trim());
        if (userExists) {
            res.status(400).send('Username is already taken.');
            return;
        }

        // Password validation
        if (!password || password.length < 6) {
            res.status(400).send('Password must be at least 6 characters long.');
            return;
        }

        const newUser = new User(username.trim(), password);
        users.push(newUser);

        req.session.userId = newUser.id;
        res.status(201).send('User registered successfully');
    };

    private login: RequestHandler = (req, res) => {
        const { username, password } = req.body;

        const user = users.find(user => user.username === username.trim());
        if (!user || !user.checkPassword(password)) {
            res.status(400).send('Invalid username or password');
            return;
        }

        req.session.userId = user.id;
        res.status(200).send('Logged in successfully');
    };

    private logout: RequestHandler = (req, res) => {
        req.session.destroy(err => {
            if (err) {
                res.status(500).send('Failed to log out');
                return;
            }
            res.clearCookie('connect.sid');
            res.status(200).send('Logged out successfully');
        });
    };

    // Method to fetch session data
    private getSession: RequestHandler = (req, res) => {
        if (req.session.userId) {
            const user = users.find(u => u.id === req.session.userId);
            if (user) {
                res.json({ userId: user.id, username: user.username });
                return;
            }
        }
        res.status(401).send('Unauthorized');
    };
}
