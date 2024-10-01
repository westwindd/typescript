// src/models/Message.ts

export class Message {
    public text: string;
    public timestamp: Date;
    public from: string;
    public channel?: string; // Channel name
    public to?: string; // Recipient username for private messages

    constructor(text: string, from: string, channel?: string, to?: string) {
        this.text = text;
        this.timestamp = new Date();
        this.from = from;
        this.channel = channel;
        this.to = to;
    }
}
