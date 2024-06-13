import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import ShareLink from './ShareLink';
import RoundHistory from './RoundHistory';
import Chat from './Chat';
import GameControls from './GameControls';

function Game({ roomId, username }) {
    const [trees, setTrees] = useState(100);
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
        const playerId = sessionStorage.getItem('playerId');
        socket.emit('joinRoom', { roomId, username, playerId });
        socket.emit('requestGameState', { roomId, playerId });

        const updateHandler = (data) => {
            console.log(data)
            setTrees(data.trees);
            setRound(data.round);
            setHasOrdered(false);
            setOrderStatus({});
        };

        const gameStateHandler = (data) => {
            setTrees(data.trees);
            setRound(data.round);
            setHasOrdered(false);
            setOrderStatus({});
            setRoundHistory(data.roundHistory);
            setGameStarted(data.gameStarted);
            setGameEnded(data.gameEnded);
            setConnectedUsers(data.users);
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
            console.log(history)
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
        socket.on('gameState', gameStateHandler);
        socket.on('result', resultHandler);
        socket.on('updateUsers', updateUsersHandler);
        socket.on('orderStatus', orderStatusHandler);
        socket.on('roundHistory', roundHistoryHandler);
        socket.on('gameStarted', gameStartedHandler);
        socket.on('end', endHandler);

        return () => {
            socket.off('update', updateHandler);
            socket.off('gameState', gameStateHandler);
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
            const numTrees = parseInt(order);
            const playerId = sessionStorage.getItem('playerId');
            socket.emit('order', { numTrees, playerId });
            setHasOrdered(true);
        }
    };

    const handleReady = () => {
        socket.emit('setReady');
        setIsReady(true);
    };

    return (
        <div className="align-items-center g-lg-5 py-5">
            <div className="row p-4 p-md-5 border rounded-3 bg-body-tertiary">
                <div className="col-12 col-sm-6 col-md-4">
                    <GameControls
                        gameStarted={gameStarted}
                        role={role}
                        isReady={isReady}
                        handleReady={handleReady}
                        hasOrdered={hasOrdered}
                        gameEnded={gameEnded}
                        trees={trees}
                        order={order}
                        setOrder={setOrder}
                        placeOrder={placeOrder}
                        message={message}
                    />
                    <div className="mt-3">
                        <Chat users={connectedUsers} />
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-md-8">
                    {!gameStarted
                        ? (
                            <div>
                                <ShareLink />
                                <button className={`btn ${isReady ? 'btn-secondary' : 'btn-success'} mt-3`} onClick={handleReady} disabled={isReady}>
                                    {isReady ? 'Bereit' : 'Bereit'}
                                </button>
                                <div className="text-start p-5">
                                    <h4>Spielregeln</h4>
                                    <ul className="list-unstyled">
                                        <li className="pb-2">Der Wald hat maximal 100 Bäume.</li>
                                        <li className="pb-2">Du bist Holzfäller und bestellst jede Runde eine Anzahl an Bäumen. Deine
                                            Mitspieler auch.
                                        </li>
                                        <li className="pb-2">Die Försterei lost die Reihenfolge der Bestellungen aus und arbeitet sie ab.
                                        </li>
                                        <li className="pb-2">Sind nicht mehr genug Bäume für deine Bestellung übrig, gehst du leer aus.
                                        </li>
                                        <li className="pb-2">Nach jeder Runde wachsen Bäume nach:</li>
                                        <ul className="pb-2">
                                            <li>Bei 50 oder mehr Bäumen: Der Wald erholt sich komplett auf 100 Bäume.
                                            </li>
                                            <li>Bei weniger als 50 Bäumen: Es wächst für jeden Baum ein neuer nach
                                                (Verdoppelung).
                                            </li>
                                        </ul>
                                        <li>Das Spiel endet nach 5 Runden.</li>
                                    </ul>
                                </div>
                            </div>
                        )
                        : (
                            <RoundHistory
                                roundHistory={roundHistory}
                                users={connectedUsers}
                                orderStatus={orderStatus}
                                gameRunning={gameStarted && !gameEnded}
                            />
                        )
                    }
                </div>
            </div>
        </div>
    );
}

export default Game;