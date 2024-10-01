"use strict";
// src/models/User.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
class User {
    constructor(username, password) {
        this.id = (0, uuid_1.v4)(); // Generate a unique ID
        this.username = username;
        this.passwordHash = bcrypt_1.default.hashSync(password, 10);
    }
    // Verify password during login
    checkPassword(password) {
        return bcrypt_1.default.compareSync(password, this.passwordHash);
    }
}
exports.User = User;
