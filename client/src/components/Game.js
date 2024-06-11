import React, { useEffect, useState } from "react";
import { socket } from '../socket';

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
            setMessage(msg);
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
        <div>
            <p>Runde: {round}</p>
            <p>Bäume im Wald: {trees}</p>
            {!gameStarted ? (
                role === 'player' && <button onClick={handleReady} disabled={isReady}>Bereit</button>
            ) : !hasOrdered && !gameEnded && role === 'player' ? (
                <div>
                    <input
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        placeholder="Anzahl Bäume"
                    />
                    <button onClick={placeOrder}>Bestellung aufgeben</button>
                </div>
            ) : gameEnded ? (
                <p>Spiel vorbei. Keine Bestellungen mehr möglich.</p>
            ) : (
                <p>Du hast {order} Bäume bestellt</p>
            )}
            <p>{message}</p>
            <h2>Verbundene Benutzer:</h2>
            <ul>
                {connectedUsers.map((user, index) => (
                    <li key={index}>
                        {user.username} {orderStatus[user.username] ? '- Hat bestellt' : ''} ({user.role === 'player' ? 'Spieler' : 'Zuschauer'})
                    </li>
                ))}
            </ul>
            <h2>Rundenhistorie:</h2>
            <table>
                <thead>
                <tr>
                    <th>Runde</th>
                    {connectedUsers.filter(user => user.role === 'player').map((user, index) => (
                        <th key={index}>{user.username}</th>
                    ))}
                    <th>Summe bestellt</th>
                    <th>Summe gerodet</th>
                    <th>Übrige Bäume</th>
                    <th>Neue Bäume</th>
                    <th>Bäume im Wald</th>
                    <th>Reihenfolge</th>
                </tr>
                </thead>
                <tbody>
                {roundHistory.map((round, index) => (
                    <tr key={index}>
                        <td>{round.round}</td>
                        {connectedUsers.filter(user => user.role === 'player').map((user, userIndex) => {
                            const order = round.orders.find(o => o.username === user.username);
                            return (
                                <td key={userIndex}>
                                    {order ? `${order.ordered} (${order.received})` : '-'}
                                </td>
                            );
                        })}
                        <td>{round.totalOrdered}</td>
                        <td>{round.totalFelled}</td>
                        <td>{round.remainingTrees}</td>
                        <td>{round.newGrowth}</td>
                        <td>{round.remainingTrees + round.newGrowth}</td>
                        <td>{round.orderSequence.join(', ')}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Game;