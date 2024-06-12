const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { customAlphabet } = require('nanoid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const db = new sqlite3.Database('./game.db');
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvw', 7)

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    trees INTEGER,
    current_round INTEGER
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    round INTEGER,
    orders TEXT,
    total_ordered INTEGER,
    total_felled INTEGER,
    remaining_trees INTEGER,
    new_growth INTEGER,
    order_sequence TEXT
  )`);
});

const maxTrees = 100;
const minGrowth = 1;
const maxRounds = 5;

app.use(express.static('client/build'));

let rooms = {};
const users = {};

app.get('/session/:sessionId', (req, res) => {
    const sessionId = req.params.sessionId;
    db.all("SELECT * FROM rounds WHERE session_id = ?", [sessionId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

io.on('connection', (socket) => {
    let currentRoomId = null;

    socket.on('createRoom', (username) => {
        const roomId = nanoid();
        rooms[roomId] = {
            trees: maxTrees,
            currentRound: 0,
            users: [{ id: socket.id, username, ready: false, role: 'player' }],
            orders: [],
            roundHistory: [],
            gameStarted: false,
            gameEnded: false
        };
        users[socket.id] = { username, roomId };
        currentRoomId = roomId;
        socket.join(roomId);
        socket.emit('roomCreated', roomId);
        io.to(roomId).emit('updateUsers', rooms[roomId].users);
    });

    socket.on('joinRoom', ({ roomId, username }) => {
        if (!rooms[roomId]) {
            socket.emit('error', 'Room does not exist');
            return;
        }

        const room = rooms[roomId];
        const isUserAlreadyInRoom = room.users.some(user => user.username === username);

        if (room.gameStarted && !isUserAlreadyInRoom) {
            room.users.push({ id: socket.id, username, ready: true, role: 'spectator' });
        } else if (!isUserAlreadyInRoom) {
            room.users.push({ id: socket.id, username, ready: false, role: 'player' });
        }

        users[socket.id] = { username, roomId };
        currentRoomId = roomId;
        socket.join(roomId);
        io.to(roomId).emit('updateUsers', room.users);
    });

    socket.on('setReady', () => {
        if (!currentRoomId || !rooms[currentRoomId]) return;

        const room = rooms[currentRoomId];
        const user = room.users.find(user => user.id === socket.id);
        if (user) {
            user.ready = true;
            io.to(currentRoomId).emit('updateUsers', room.users);

            if (room.users.every(user => user.ready || user.role === 'spectator')) {
                room.gameStarted = true;
                io.to(currentRoomId).emit('gameStarted');
            }
        }
    });

    socket.on('order', (numTrees) => {
        if (!currentRoomId || !rooms[currentRoomId] || rooms[currentRoomId].gameEnded) return;

        const room = rooms[currentRoomId];
        room.orders.push({ id: socket.id, numTrees });
        const user = room.users.find(user => user.id === socket.id);
        if (user) {
            io.to(currentRoomId).emit('orderStatus', { [user.username]: true });
        }
        if (room.orders.length === room.users.filter(user => user.role === 'player').length) {
            processOrders(currentRoomId);
        }
    });

    socket.on('sendMessage', ({ username, message }) => {
        const user = users[socket.id];
        if (user && rooms[user.roomId]) {
            const roomId = user.roomId;
            const room = rooms[roomId];
            io.to(roomId).emit('receiveMessage', { username, message });
        }
    });

    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            const { roomId } = user;
            if (rooms[roomId]) {
                rooms[roomId].users = rooms[roomId].users.filter(user => user.id !== socket.id);
                io.to(roomId).emit('updateUsers', rooms[roomId].users);
            }
            delete users[socket.id];
        }
    });
});

function processOrders(roomId) {
    const room = rooms[roomId];
    room.currentRound++;
    room.orders.sort(() => Math.random() - 0.5);

    let totalOrdered = 0;
    let totalFelled = 0;
    const roundDetails = {
        round: room.currentRound,
        orders: [],
        totalOrdered: 0,
        totalFelled: 0,
        remainingTrees: room.trees,
        newGrowth: 0,
        orderSequence: []
    };

    room.orders.forEach(order => {
        const user = room.users.find(user => user.id === order.id);
        roundDetails.orderSequence.push(user.username);

        if (room.trees >= order.numTrees) {
            room.trees -= order.numTrees;
            totalFelled += order.numTrees;
            roundDetails.orders.push({ username: user.username, ordered: order.numTrees, received: order.numTrees });
        } else {
            roundDetails.orders.push({ username: user.username, ordered: order.numTrees, received: 0 });
        }
        totalOrdered += order.numTrees;
    });

    roundDetails.totalOrdered = totalOrdered;
    roundDetails.totalFelled = totalFelled;
    roundDetails.remainingTrees = room.trees;

    growTrees(room);
    roundDetails.newGrowth = room.trees - roundDetails.remainingTrees;
    room.roundHistory.push(roundDetails);

    room.orders = [];
    io.to(roomId).emit('update', { trees: room.trees, round: room.currentRound });
    io.to(roomId).emit('roundHistory', room.roundHistory);

    db.run("INSERT INTO rounds (session_id, round, orders, total_ordered, total_felled, remaining_trees, new_growth, order_sequence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [roomId, room.currentRound, JSON.stringify(roundDetails.orders), totalOrdered, totalFelled, roundDetails.remainingTrees, roundDetails.newGrowth, roundDetails.orderSequence.join(', ')]);

    if (room.currentRound >= maxRounds) {
        room.gameEnded = true;
        io.to(roomId).emit('end');//, 'Das Spiel ist beendet.');
    }
}

function growTrees(room) {
    if (room.trees >= 50) {
        room.trees = maxTrees;
    } else {
        room.trees += room.trees * minGrowth;
        if (room.trees > maxTrees) {
            room.trees = maxTrees;
        }
    }
}

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});