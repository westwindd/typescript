"use strict";
// src/controllers/AuthController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const users = []; // Temporary in-memory user store
class AuthController {
    constructor() {
        this.router = express_1.default.Router();
        this.signUp = (req, res) => {
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
            const newUser = new User_1.User(username.trim(), password);
            users.push(newUser);
            req.session.userId = newUser.id;
            res.status(201).send('User registered successfully');
        };
        this.login = (req, res) => {
            const { username, password } = req.body;
            const user = users.find(user => user.username === username.trim());
            if (!user || !user.checkPassword(password)) {
                res.status(400).send('Invalid username or password');
                return;
            }
            req.session.userId = user.id;
            res.status(200).send('Logged in successfully');
        };
        this.logout = (req, res) => {
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
        this.getSession = (req, res) => {
            if (req.session.userId) {
                const user = users.find(u => u.id === req.session.userId);
                if (user) {
                    res.json({ userId: user.id, username: user.username });
                    return;
                }
            }
            res.status(401).send('Unauthorized');
        };
        this.router.post('/signup', this.signUp);
        this.router.post('/login', this.login);
        this.router.get('/logout', this.logout);
        this.router.get('/session', this.getSession); // Route to fetch session data
    }
}
exports.AuthController = AuthController;
