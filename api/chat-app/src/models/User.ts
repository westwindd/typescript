// src/models/User.ts

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export class User {
    public id: string;
    public username: string;
    private passwordHash: string;

    constructor(username: string, password: string) {
        this.id = uuidv4(); // Generate a unique ID
        this.username = username;
        this.passwordHash = bcrypt.hashSync(password, 10);
    }

    // Verify password during login
    public checkPassword(password: string): boolean {
        return bcrypt.compareSync(password, this.passwordHash);
    }
}
