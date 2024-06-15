const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvw', 7);
const db = require('./db/database');

let rooms = {};
let users = {};

const maxTrees = 100;
const minGrowth = 1;
const maxRounds = 5;

function initialize(io) {
    io.on('connection', (socket) => {
        let currentRoomId = null;

        socket.on('requestPlayerId', () => {
            socket.emit('playerId', nanoid());
        });

        socket.on('registerUser', ({ playerId, username }) => {
            users[socket.id] = { playerId, username };
        });

        socket.on('createRoom', (playerId, username) => {
            const roomId = nanoid();

            rooms[roomId] = {
                trees: maxTrees,
                currentRound: 0,
                users: [{ id: socket.id, playerId, username, online: true, ready: false, role: 'player' }],
                orders: [],
                roundHistory: [],
                gameStarted: false,
                gameEnded: false
            };

            currentRoomId = roomId;
            socket.join(roomId);
            socket.emit('roomCreated', roomId);

            const activeRooms = Object.entries(rooms)
                .filter(([roomId, room]) => room.users.length > 0 && !room.gameEnded)
                .map(([roomId, room]) => ({ roomId, users: room.users }));

            io.emit('activeRooms', activeRooms);
            io.to(roomId).emit('updateUsers', rooms[roomId].users);
        });

        socket.on('joinRoom', ({ roomId, username, playerId }) => {
            currentRoomId = roomId;

            if (!rooms[roomId]) {
                socket.emit('error', 'Room does not exist');
                return;
            }

            const room = rooms[roomId];
            if (room.users.some(user => user.username === username && user.playerId === playerId)) {
                // everything is fine
            } else if (!room.gameStarted) {
                room.users.push({ id: socket.id, playerId, username, ready: false, role: 'player' });
            } else {
                room.users.push({ id: socket.id, playerId, username, ready: true, role: 'spectator' });
            }

            io.emit('activeRooms', getActiveRooms());

            socket.join(roomId);
            io.to(roomId).emit('updateUsers', room.users);
        });

        socket.on('setReady', (playerId) => {
            if (!currentRoomId || !rooms[currentRoomId])
                return;

            const room = rooms[currentRoomId];

            const user = room.users.find(user => user.playerId === playerId);
            if (!user)
                return;

            user.ready = true;
            io.to(currentRoomId).emit('updateUsers', room.users);

            if (room.users.every(user => user.ready || user.role === 'spectator')) {
                room.gameStarted = true;
                io.to(currentRoomId).emit('gameStarted');
            }
        });

        socket.on('order', ({ numTrees, playerId }) => {
            if (!currentRoomId || !rooms[currentRoomId] || rooms[currentRoomId].gameEnded)
                return;

            const room = rooms[currentRoomId];
            room.orders[playerId] = numTrees;

            const user = room.users.find(user => user.playerId === playerId);
            if (!user)
                return;

            io.to(currentRoomId).emit('playerOrdered', playerId);

            if (Object.keys(room.orders).length === room.users.filter(user => user.role === 'player').length) {
                processOrders(io, currentRoomId);
            }
        });

        socket.on('sendMessage', ({ playerId, message }) => {
            const user = rooms[currentRoomId].users.find(user => user.playerId === playerId);
            if (!user)
                return;

            io.to(currentRoomId).emit('receiveMessage', { username: user.username, message });
        });

        socket.on('requestGameState', ({ roomId, playerId }) => {
            if (!currentRoomId || !rooms[currentRoomId])
                return;

            const user = rooms[currentRoomId].users.find(user => user.playerId === playerId);
            if (!user)
                return;

            const room = rooms[roomId];

            socket.emit('gameState', {
                trees: room.trees,
                round: room.currentRound,
                orders: room.orders,
                roundHistory: room.roundHistory,
                gameStarted: room.gameStarted,
                gameEnded: room.gameEnded,
                users: room.users
            });
        });

        socket.on('getActiveRooms', () => {
            io.emit('activeRooms', getActiveRooms());
        });

        socket.on('disconnect', () => {
            if (!currentRoomId || !rooms[currentRoomId])
                return;

            const user = rooms[currentRoomId].users.find(user => user.id === socket.id);
            if (!user)
                return;

            user.online = false;
            io.to(currentRoomId).emit('updateUsers', rooms[currentRoomId].users);
        });
    });
}

function getActiveRooms() {
    return Object.entries(rooms)
        .filter(([roomId, room]) => room.users.length > 0 && !room.gameEnded)
        .map(([roomId, room]) => ({ roomId, users: room.users }));
}

function processOrders(io, roomId) {
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

    Object.keys(room.orders).forEach(playerId => {
        const orderedTrees = room.orders[playerId];
        const user = room.users.find(user => user.playerId === playerId);
        roundDetails.orderSequence.push(user.username);

        if (room.trees >= orderedTrees) {
            room.trees -= orderedTrees;
            totalFelled += orderedTrees;
            roundDetails.orders.push({ username: user.username, ordered: orderedTrees, received: orderedTrees });
        } else {
            roundDetails.orders.push({ username: user.username, ordered: orderedTrees, received: 0 });
        }
        totalOrdered += orderedTrees;
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

    if (room.trees <= 0) {
        room.gameEnded = true;
        io.to(roomId).emit('end', 'Der Wald hat keine Bäume mehr. Das Spiel ist beendet.');
        return;
    }

    if (room.currentRound >= maxRounds) {
        room.gameEnded = true;
        io.to(roomId).emit('end', 'Alle Runden wurden gespielt. Das Spiel ist beendet.');
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

module.exports = { initialize };