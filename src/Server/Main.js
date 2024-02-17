
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require("socket.io");
const cors = require('cors');

const io = new Server(server, {
    cors:{
        origin: [
            'http://82.165.183.133:3010',
            'http://17.21.0.22',
            'http://0.0.0.0:3000',
            'http://localhost:3000',
            'http://0.0.0.0:3010',
            'http://127.0.0.1:3010',
            'http://127.0.0.1:3000',
            'http://0.0.0.0:3001',
            'http://192.168.2.100:3001',
            'http://82.165.183.133:3010'
        ]
    }
});

module.exports = {
    app, server, io, cors
}
