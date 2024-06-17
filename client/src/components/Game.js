import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import ShareRoom from './ShareRoom';
import RoundHistory from './RoundHistory';
import Sidebar from './Sidebar';
import GameControls from './GameControls';
import { useParams } from "react-router-dom";
import PrepareGame from "./PrepareGame";
import Rules from "./Rules";

function Game({ playerId, username }) {
    const { roomId } = useParams();

    const [trees, setTrees] = useState(100);
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
        socket.emit('joinRoom', { roomId, username, playerId });
        socket.emit('requestGameState', { roomId, playerId });

        const updateHandler = (data) => {
            setTrees(data.trees);
            setHasOrdered(false);
            setOrderStatus({});
        };

        const gameStateHandler = (data) => {
            setTrees(data.trees);
            setRoundHistory(data.roundHistory);
            setGameStarted(data.gameStarted);
            setGameEnded(data.gameEnded);
            setConnectedUsers(data.users);
            if (data.order !== undefined) {
                setOrder(data.order);
                setHasOrdered(true);
                setOrderStatus(prevStatus => ({...prevStatus, [playerId]: true}));
            }
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

        const playerOrderedHandler = (playerId) => {
            setOrderStatus(prevStatus => ({...prevStatus, [playerId]: true}));
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
        socket.on('gameState', gameStateHandler);
        socket.on('result', resultHandler);
        socket.on('updateUsers', updateUsersHandler);
        socket.on('playerOrdered', playerOrderedHandler);
        socket.on('roundHistory', roundHistoryHandler);
        socket.on('gameStarted', gameStartedHandler);
        socket.on('end', endHandler);

        return () => {
            socket.off('update', updateHandler);
            socket.off('gameState', gameStateHandler);
            socket.off('result', resultHandler);
            socket.off('updateUsers', updateUsersHandler);
            socket.off('playerOrdered', playerOrderedHandler);
            socket.off('roundHistory', roundHistoryHandler);
            socket.off('gameStarted', gameStartedHandler);
            socket.off('end', endHandler);
        };
    }, [roomId, playerId, username]);

    const placeOrder = () => {
        if (!gameEnded && role === 'player') {
            const numTrees = parseInt(order);
            socket.emit('order', { numTrees, playerId });
            setHasOrdered(true);
        }
    };

    const handleReady = () => {
        socket.emit('setReady', playerId);
        setIsReady(true);
    };

    return (
        <div className="align-items-center g-lg-5 py-5">
            <div className="row p-4 p-md-5 border rounded-3 bg-body-tertiary bg-opacity-92">
                <div className="col-12 col-sm-6 col-md-8">
                    {!gameStarted ? (<>
                        <ShareRoom/>
                        <PrepareGame isReady={isReady} handleReady={handleReady}/>
                        <Rules/>
                    </>) : (<>
                        <RoundHistory
                            roundHistory={roundHistory}
                            users={connectedUsers}
                            orderStatus={orderStatus}
                            gameRunning={gameStarted && !gameEnded}
                            gameEnded={gameEnded}
                            trees={trees}
                            order={order}
                            message={message}
                        />
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
                    </>)}
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                    <div className="mt-3">
                        <Sidebar users={connectedUsers} playerId={playerId} roundHistory={roundHistory}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game;