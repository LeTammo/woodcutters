import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import UserList from './UserList';
import RoundHistory from './RoundHistory';

function Game({ roomId, username }) {
    const [trees, setTrees] = useState(0);
    const [round, setRound] = useState(0);
    const [order, setOrder] = useState(0);
    const [message, setMessage] = useState('');
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [hasOrdered, setHasOrdered] = useState(false);
    const [orderStatus, setOrderStatus] = useState({});
    const [roundHistory, setRoundHistory] = useState([]);
    const [gameEnded, setGameEnded] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [role, setRole] = useState('player');

    useEffect(() => {
        socket.emit('joinRoom', { roomId, username });

        const updateHandler = (data) => {
            setTrees(data.trees);
            setRound(data.round);
            setHasOrdered(false);
            setOrderStatus({});
        };

        const resultHandler = (msg) => {
            setMessage(msg);
        };

        const updateUsersHandler = (users) => {
            setConnectedUsers(users);
            const currentUser = users.find(user => user.username === username);
            if (currentUser) {
                setRole(currentUser.role);
            }
        };

        const orderStatusHandler = (status) => {
            setOrderStatus(status);
        };

        const roundHistoryHandler = (history) => {
            setRoundHistory(history);
        };

        const gameStartedHandler = () => {
            setGameStarted(true);
        };

        const endHandler = (msg) => {
            setGameEnded(true);
            //setMessage(msg);
        };

        socket.on('update', updateHandler);
        socket.on('result', resultHandler);
        socket.on('updateUsers', updateUsersHandler);
        socket.on('orderStatus', orderStatusHandler);
        socket.on('roundHistory', roundHistoryHandler);
        socket.on('gameStarted', gameStartedHandler);
        socket.on('end', endHandler);

        return () => {
            socket.off('update', updateHandler);
            socket.off('result', resultHandler);
            socket.off('updateUsers', updateUsersHandler);
            socket.off('orderStatus', orderStatusHandler);
            socket.off('roundHistory', roundHistoryHandler);
            socket.off('gameStarted', gameStartedHandler);
            socket.off('end', endHandler);
        };
    }, [roomId, username]);

    const placeOrder = () => {
        if (!gameEnded && role === 'player') {
            socket.emit('order', parseInt(order));
            setHasOrdered(true);
        }
    };

    const handleReady = () => {
        socket.emit('setReady');
        setIsReady(true);
    };

    return (
        <div className="container mt-3">
            <p className="h5">Aktuelle Runde: {round}</p>
            <p className="h5">Bäume im Wald: {trees}</p>
            {!gameStarted ? (
                role === 'player' && <button className="btn btn-primary" onClick={handleReady} disabled={isReady}>Bereit</button>
            ) : !hasOrdered && !gameEnded && role === 'player' ? (
                <div>
                    <input
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        className="form-control mb-2"
                        placeholder="Anzahl Bäume"
                    />
                    <button className="btn btn-primary" onClick={placeOrder}>Bestellung aufgeben</button>
                </div>
            ) : gameEnded ? (
                <p>Keine Bestellungen mehr möglich.</p>
            ) : (
                <p>Du hast {order} Bäume bestellt</p>
            )}
            <p className="d-none text-danger mt-3">{message}</p>
            <UserList users={connectedUsers} orderStatus={orderStatus} />
            <RoundHistory roundHistory={roundHistory} users={connectedUsers} orderStatus={orderStatus} />
        </div>
    );
}

export default Game;