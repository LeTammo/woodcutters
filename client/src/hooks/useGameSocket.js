import { useUser } from '../context/UserContext';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { socket } from '../socket';


function useGameSocket() {
    const { playerId, username } = useUser();
    const { roomId } = useParams();

    const [roomExists, setRoomExists] = useState(true);
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
        socket.emit('checkRoom', roomId, (exists) => {
            setRoomExists(exists);
        });

        if (!roomExists) return;

        socket.emit('joinRoom', { roomId, username, playerId });
        socket.emit('requestGameState', { roomId, playerId });
        socket.emit('isReady', playerId);

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
                setOrderStatus(prevStatus => ({ ...prevStatus, [playerId]: true }));
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
            setOrderStatus(prevStatus => ({ ...prevStatus, [playerId]: true }));
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

        function setIsReadyHandler() {
            setIsReady(true);
        }

        socket.on('update', updateHandler);
        socket.on('gameState', gameStateHandler);
        socket.on('result', resultHandler);
        socket.on('updateUsers', updateUsersHandler);
        socket.on('playerOrdered', playerOrderedHandler);
        socket.on('roundHistory', roundHistoryHandler);
        socket.on('gameStarted', gameStartedHandler);
        socket.on('end', endHandler);
        socket.on('isReady', setIsReadyHandler);

        return () => {
            socket.off('update', updateHandler);
            socket.off('gameState', gameStateHandler);
            socket.off('result', resultHandler);
            socket.off('updateUsers', updateUsersHandler);
            socket.off('playerOrdered', playerOrderedHandler);
            socket.off('roundHistory', roundHistoryHandler);
            socket.off('gameStarted', gameStartedHandler);
            socket.off('end', endHandler);
            socket.off('isReady', setIsReadyHandler);
        };
    }, [roomId, playerId, username, roomExists]);

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

    return {
        roomExists,
        trees,
        order,
        message,
        connectedUsers,
        hasOrdered,
        orderStatus,
        roundHistory,
        gameEnded,
        isReady,
        gameStarted,
        role,
        placeOrder,
        setOrder,
        handleReady,
    };
}

export default useGameSocket;