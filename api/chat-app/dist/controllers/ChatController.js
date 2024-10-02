"use strict";
// src/controllers/ChatController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const Message_1 = require("../models/Message");
const users = {};
const channels = {};
const messages = {}; // Messages per channel
class ChatController {
    constructor(io) {
        this.io = io;
        this.initializeSocket();
    }
    initializeSocket() {
        this.io.on('connection', (socket) => {
            const sessionUserId = socket.handshake.query.userId;
            const username = socket.handshake.query.username;
            if (sessionUserId && username) {
                users[sessionUserId] = { socket, username };
                console.log(`User ${username} (${sessionUserId}) connected`);
                // Auto-join to 'General' channel
                if (!channels['General']) {
                    this.createChannel('System', 'General'); // 'System' as owner
                }
                if (!channels['General'].members.has(sessionUserId)) {
                    channels['General'].members.add(sessionUserId);
                }
                // Send list of channels the user is a member of
                this.sendChannelList(sessionUserId);
                // Broadcast updated list of users to all clients
                this.broadcastUserList();
                // Send message history for the 'General' channel
                socket.emit('message history', {
                    channel: 'General',
                    messages: messages['General'] || [],
                });
                // Notify the user that they joined 'General' channel
                socket.emit('joined channel', 'General');
            }
            else {
                socket.disconnect();
                console.log('User disconnected due to missing session or username');
                return;
            }
            // Handle joining a channel
            socket.on('join channel', (channelName) => {
                this.joinChannel(sessionUserId, channelName);
            });
            // Handle leaving a channel
            socket.on('leave channel', (channelName) => {
                this.leaveChannel(sessionUserId, channelName);
            });
            // Handle creating a new channel
            socket.on('create channel', (channelName) => {
                if (channels[channelName]) {
                    socket.emit('channel error', 'Channel already exists.');
                }
                else {
                    this.createChannel(sessionUserId, channelName);
                    this.joinChannel(sessionUserId, channelName);
                    this.sendChannelList(sessionUserId);
                }
            });
            // Handle inviting users to a channel
            socket.on('invite to channel', (data) => {
                const channel = channels[data.channelName];
                if (channel && channel.ownerId === sessionUserId) {
                    // Invite the user
                    if (users[data.inviteeId]) {
                        channel.members.add(data.inviteeId);
                        // Notify the invited user
                        users[data.inviteeId].socket.emit('invited to channel', data.channelName);
                        console.log(`User ${sessionUserId} invited ${data.inviteeId} to channel ${data.channelName}`);
                        // Update channel list for invited user
                        this.sendChannelList(data.inviteeId);
                    }
                    else {
                        socket.emit('invite error', 'User not found.');
                    }
                }
                else {
                    socket.emit('invite error', 'You are not the owner of this channel.');
                }
            });
            // Handle channel messages
            socket.on('channel message', (msg) => {
                const user = users[sessionUserId];
                const channel = channels[msg.channel];
                if (user && channel && channel.members.has(sessionUserId)) {
                    const message = new Message_1.Message(msg.text, user.username, msg.channel);
                    messages[msg.channel] = messages[msg.channel] || [];
                    messages[msg.channel].push(message);
            
                    // Emit message to all users in the channel
                    channel.members.forEach((userId) => {
                        if (users[userId]) { // Check if the user still exists
                            users[userId].socket.emit('channel message', message);
                        }
                    });
                }
            });
            
            // Private messaging
            socket.on('private message', (msg) => {
                const targetUser = users[msg.to];
                const senderUser = users[sessionUserId];
                if (targetUser && senderUser) {
                    const message = new Message_1.Message(msg.text, senderUser.username, undefined, targetUser.username);
                    // Send the message to the recipient
                    targetUser.socket.emit('private message', message);
                    // Optionally, send the message back to the sender as confirmation
                    socket.emit('private message', message);
                }
            });
            // Handle user disconnection
            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
                this.leaveAllChannels(sessionUserId);
                delete users[sessionUserId];
                this.broadcastUserList();
            });
            // Handle getting channel info
            socket.on('get channel info', (channelName) => {
                const channel = channels[channelName];
                if (channel) {
                    socket.emit('channel info', {
                        ownerId: channel.ownerId,
                        members: Array.from(channel.members),
                    });
                }
                else {
                    socket.emit('channel info error', 'Channel not found.');
                }
            });
        });
    }
    createChannel(ownerId, channelName) {
        const channel = {
            name: channelName,
            ownerId: ownerId,
            members: new Set([ownerId]),
        };
        channels[channelName] = channel;
        console.log(`Channel ${channelName} created by user ${ownerId}`);
    }
    joinChannel(userId, channelName) {
        const channel = channels[channelName];
        if (channel && channel.members.has(userId)) {
            const userSocket = users[userId].socket;
            userSocket.emit('joined channel', channelName);
            // Send message history
            userSocket.emit('message history', {
                channel: channelName,
                messages: messages[channelName] || [],
            });
            console.log(`User ${userId} joined channel ${channelName}`);
        }
        else {
            const userSocket = users[userId].socket;
            userSocket.emit('join channel error', 'You are not a member of this channel.');
            console.log(`User ${userId} attempted to join channel ${channelName} without membership.`);
        }
    }
    leaveChannel(userId, channelName) {
        const channel = channels[channelName];
        if (channel) {
            channel.members.delete(userId);
            if (channel.members.size === 0 && channelName !== 'General') {
                delete channels[channelName]; // Remove the channel if empty and not 'General'
            }
            // Notify the user
            const userSocket = users[userId].socket;
            userSocket.emit('left channel', channelName);
            console.log(`User ${userId} left channel ${channelName}`);
        }
    }
    leaveAllChannels(userId) {
        for (const channelName of Object.keys(channels)) {
            this.leaveChannel(userId, channelName);
        }
    }
    sendChannelList(userId) {
        const userChannels = Object.values(channels)
            .filter(channel => channel.members.has(userId))
            .map(channel => channel.name);
        users[userId].socket.emit('channel list', userChannels);
    }
    // Broadcast the list of connected users to all clients
    broadcastUserList() {
        const userList = Object.entries(users).map(([id, userInfo]) => ({
            userId: id,
            username: userInfo.username
        }));
        this.io.emit('user list', userList);
    }
}
exports.ChatController = ChatController;
