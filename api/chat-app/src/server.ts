// server.ts

import express from 'express';
import session from 'express-session';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { ChatController } from './controllers/ChatController';
import { AuthController } from './controllers/AuthController';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Use session middleware
app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize authentication routes
const authController = new AuthController();
app.use(authController.router);

// Serve public pages for signup and login
app.get('/signup.html', (req, res) => res.sendFile(path.join(__dirname, 'views/signup.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'views/login.html')));

// Serve static files (e.g., styles, scripts) in the views directory
app.use(express.static(path.join(__dirname, 'views')));

// Serve the home page (protected route)
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path.join(__dirname, 'views/index.html'));
    } else {
        res.redirect('/login.html');
    }
});

// Initialize ChatController for chat functionality
new ChatController(io);

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
