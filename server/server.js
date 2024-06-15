const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const routes = require('./routes');
const socketHandlers = require('./socket');

app.use(express.static(path.join(__dirname, '../client/build')));
app.use(routes);

socketHandlers.initialize(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});