import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import UserList from './UserList';
import RoundHistory from './RoundHistory';
import Chat from './Chat';

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
    const [copied, setCopied] = useState(false);

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

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="align-items-center g-lg-5 py-5">
            <div className="row p-4 p-md-5 border rounded-3 bg-body-tertiary">
                <div className="col-12 col-sm-6 col-md-4">
                    {gameStarted ? (
                        <p>Bäume im Wald: {trees}</p>
                    ) : (
                        <div>
                            <div>Share-Link:</div>
                            <button className="btn btn-dark" onClick={handleCopyLink}>
                                <span className="text-primary-emphasis">{window.location.href}</span> 📋
                            </button>
                            {copied && <span className="text-success">Copied!</span>} {/* Indicator */}
                        </div>
                    )}
                    {!gameStarted ? (
                        role === 'player' &&
                        <button className="btn btn-success mt-3" onClick={handleReady} disabled={isReady}>Bereit</button>
                    ) : !hasOrdered && !gameEnded && role === 'player' ? (
                        <div className="input-group mb-3">
                            <input
                                type="number" min={0} max={trees}
                                value={order}
                                onChange={(e) => setOrder(e.target.value)}
                                className="form-control"
                                placeholder="Anzahl"
                            />
                            <button className="btn btn-secondary" onClick={placeOrder}>Bestellen</button>
                        </div>
                    ) : gameEnded ? (
                        <p>Keine Bestellungen mehr möglich.</p>
                    ) : (
                        <p>Du hast {order} Bäume bestellt</p>
                    )}
                    <p className="d-none text-danger mt-3">{message}</p>
                    <div className="mt-3">
                        <UserList users={connectedUsers} orderStatus={orderStatus}/>
                    </div>
                    <div className="mt-3">
                        <Chat username={username} />
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-md-8">
                    <RoundHistory
                        roundHistory={roundHistory}
                        users={connectedUsers}
                        orderStatus={orderStatus}
                        gameRunning={gameStarted && !gameEnded}
                    />
                </div>
            </div>
        </div>
    );
}

export default Game;