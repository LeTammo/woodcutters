import { useEffect, useState, useCallback } from 'react';
import { socket } from '../socket';

function useSocket() {
    const [activeRooms, setActiveRooms] = useState([]);
    const [roomId, setRoomId] = useState(null);

    useEffect(() => {
        const handleActiveRooms = rooms => {
            if (Array.isArray(rooms)) {
                setActiveRooms(rooms);
            } else {
                console.log('Received data is not an array', rooms);
            }
        };

        const handleRoomCreated = (roomId) => {
            setRoomId(roomId);
        }

        socket.on('activeRooms', handleActiveRooms);
        socket.on('roomCreated', handleRoomCreated);

        return () => {
            socket.off('activeRooms', handleActiveRooms);
            socket.off('roomCreated', handleRoomCreated);
        };
    }, []);

    const getActiveRooms = useCallback(() => {
        socket.emit('getActiveRooms');
    }, [socket]);

    const createRoom = useCallback((playerId, username) => {
        socket.emit('createRoom', playerId, username);
    }, []);

    return {
        activeRooms,
        setActiveRooms,
        getActiveRooms,
        roomId,
        createRoom
    };
}

export default useSocket;