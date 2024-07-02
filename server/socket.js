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

        socket.on('checkRoom', (roomId, callback) => {
            const roomExists = rooms[roomId] !== undefined;
            callback(roomExists);
        });

        socket.on('requestPlayerId', () => {
            const playerId = nanoid();
            socket.emit('playerId', playerId);
        });

        socket.on('registerUser', ({ playerId, username }) => {
            users[playerId] = { socketId: socket.id, username };
        });

        socket.on('createRoom', (playerId, username) => {
            const roomId = nanoid();

            rooms[roomId] = {
                trees: maxTrees,
                currentRound: 0,
                users: [{ socketId: socket.id, playerId, username, online: true, ready: false, role: 'player' }],
                orders: [],
                roundHistory: [],
                gameStarted: false,
                gameEnded: false,
                lastActive: Date.now()
            };

            currentRoomId = roomId;
            socket.join(roomId);
            socket.emit('roomCreated', roomId);

            io.to(roomId).emit('updateUsers', rooms[roomId].users);
            io.emit('activeRooms', getActiveRooms());
        });

        socket.on('joinRoom', ({ roomId, username, playerId }) => {
            currentRoomId = roomId;

            if (!rooms[roomId]) {
                socket.emit('error', 'Der Raum existiert nicht.');
                return;
            }

            const room = rooms[roomId];
            if (!room.users.some(user => user.username === username && user.playerId === playerId)) {
                const role = room.gameStarted ? 'spectator' : 'player';
                room.users.push({ socketId: socket.id, playerId, username, online: true, ready: false, role });
            }

            socket.join(roomId);

            const user = room.users.find(user => user.playerId === playerId);
            if (user) user.online = true;
            if (user) user.socketId = socket.id;
            io.to(currentRoomId).emit('receiveMessage', {
                username: 'Server',
                message: `${user.username} ist beigetreten`,
                isSystem: true,
                color: 'success-emphasis'
            });

            io.to(roomId).emit('updateUsers', room.users);
            io.emit('activeRooms', getActiveRooms());

            updateRoomActivity(roomId);
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
                io.emit('activeRooms', getActiveRooms());
            }

            updateRoomActivity(currentRoomId);
        });

        socket.on('isReady', (playerId) => {
            if (!currentRoomId || !rooms[currentRoomId])
                return;

            const room = rooms[currentRoomId];

            const user = room.users.find(user => user.playerId === playerId);
            if (!user)
                return;

            if (user.ready) {
                socket.emit('isReady');
            }

            updateRoomActivity(currentRoomId);
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
                io.emit('activeRooms', getActiveRooms());
            }

            updateRoomActivity(currentRoomId);
        });

        socket.on('sendMessage', ({ playerId, message }) => {
            const user = rooms[currentRoomId].users.find(user => user.playerId === playerId);
            if (!user)
                return;

            io.to(currentRoomId).emit('receiveMessage', {
                username: user.username,
                message,
                isSystem: false,
                color: ''
            });

            updateRoomActivity(currentRoomId);
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
                order: room.orders[playerId],
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

            const user = rooms[currentRoomId].users.find(user => user.socketId === socket.id);
            if (user) {
                user.online = false;
                io.to(currentRoomId).emit('receiveMessage', {
                    username: 'Server',
                    message: `${user.username} ist gegangen`,
                    isSystem: true,
                    color: 'danger-emphasis'
                });
            }

            io.to(currentRoomId).emit('updateUsers', rooms[currentRoomId].users);

            io.emit('activeRooms', getActiveRooms());

            updateRoomActivity(currentRoomId);
        });
    });
}

function getActiveRooms() {
    const inactiveThreshold = Date.now() - 300000;
    const deleteThreshold   = Date.now() - 900000;

    let roomHasPlayers, roomIsInactive, roomIsRemovable;
    let activeRooms = [];

    Array.from(Object.keys(rooms)).forEach((roomId) => {
        const room = rooms[roomId];
        roomHasPlayers = room.users.some(user => user.online);
        roomIsInactive = room.lastActive < inactiveThreshold;
        roomIsRemovable = room.lastActive < deleteThreshold;

        if (roomIsRemovable && !roomHasPlayers) {
            console.log(`Deleting room ${roomId}`)
            delete rooms[roomId];
        } else if (!roomIsInactive || roomHasPlayers) {
            activeRooms.push({
                roomId: roomId,
                users: room.users,
                round: room.currentRound,
                gameStarted: room.gameStarted
            });
        }
    });

    return activeRooms;
}

function updateRoomActivity(roomId) {
    try {
        rooms[roomId].lastActive = Date.now();
    } catch (e) {
        console.error("UpdateRoomActivity: ", e.message);
    }
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
        orderSequence: [],
        points: []
    };

    Object.keys(room.orders).forEach(playerId => {
        const orderedTrees = room.orders[playerId];
        const user = room.users.find(user => user.playerId === playerId);
        roundDetails.orderSequence.push(user.username);

        let pointsSum = 0;
        room.roundHistory.forEach((round) => {
            round.orders.forEach((order) => {
                if (order.username === user.username) {
                    pointsSum += order.received;
                }
            });
        });
        if (room.trees >= orderedTrees) {
            room.trees -= orderedTrees;
            totalFelled += orderedTrees;
            roundDetails.orders.push({ username: user.username, ordered: orderedTrees, received: orderedTrees });
            roundDetails.points.push({ playerId: playerId, points: pointsSum + orderedTrees });
        } else {
            roundDetails.orders.push({ username: user.username, ordered: orderedTrees, received: 0 });
            roundDetails.points.push({ playerId: playerId, points: pointsSum });
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

    db.insertRound(
        roomId,
        room.currentRound,
        JSON.stringify(roundDetails.orders),
        totalOrdered,
        totalFelled,
        roundDetails.remainingTrees,
        roundDetails.newGrowth,
        roundDetails.orderSequence.join(', '),
        (err) => { if (err) console.error(err); }
    );

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