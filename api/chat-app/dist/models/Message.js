"use strict";
// src/models/Message.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
class Message {
    constructor(text, from, channel, to) {
        this.text = text;
        this.timestamp = new Date();
        this.from = from;
        this.channel = channel;
        this.to = to;
    }
}
exports.Message = Message;
