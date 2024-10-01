"use strict";
// server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const ChatController_1 = require("./controllers/ChatController");
const AuthController_1 = require("./controllers/AuthController");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer);
// Use session middleware
app.use((0, express_session_1.default)({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Initialize authentication routes
const authController = new AuthController_1.AuthController();
app.use(authController.router);
// Serve public pages for signup and login
app.get('/signup.html', (req, res) => res.sendFile(path_1.default.join(__dirname, 'views/signup.html')));
app.get('/login.html', (req, res) => res.sendFile(path_1.default.join(__dirname, 'views/login.html')));
// Serve static files (e.g., styles, scripts) in the views directory
app.use(express_1.default.static(path_1.default.join(__dirname, 'views')));
// Serve the home page (protected route)
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.sendFile(path_1.default.join(__dirname, 'views/index.html'));
    }
    else {
        res.redirect('/login.html');
    }
});
// Initialize ChatController for chat functionality
new ChatController_1.ChatController(io);
const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
