import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

function Home({ playerId, username }) {
    const [activeRooms, setActiveRooms] = useState([]);
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        socket.emit('getActiveRooms');

        socket.on('activeRooms', rooms => {
            if (Array.isArray(rooms)) {
                setActiveRooms(rooms);
            } else {
                console.error('Received data is not an array', rooms);
            }
        });

        return () => {
            socket.off('activeRooms');
        }
    }, []);

    const createRoom = () => {
        socket.emit('createRoom', playerId, username);
        socket.on('roomCreated', (roomId) => {
            navigate(`/${roomId}`);
        });
    };

    const joinRoom = () => {
        if (roomId.trim() !== '') {
            navigate(`/${roomId}`);
        }
    };

    return (
        <div className="row align-items-center g-lg-5 py-5">
            <div className="mx-auto col-sm-12 col-md-10 col-lg-8">
                <div className="p-4 p-md-5 border rounded-3 bg-body-tertiary bg-opacity-92">
                    <h5 className="text-center mb-5">Hallo {username}!</h5>
                    <div>
                        <button className="btn btn-success" onClick={createRoom}>Raum erstellen</button>
                    </div>
                    {activeRooms.length > 0 && (
                        <div className="mt-5">
                            <h5>Aktive Lobbies</h5>
                            {activeRooms.map(room => (
                                <div key={room.roomId} className="row p-2 px-0 mb-1 text-start bg-dark border rounded">
                                    <div className="col-4 m-auto text-start">
                                        {!room.gameStarted ? 'Warten in Lobby' : `Runde ${room.round + 1}`}
                                    </div>
                                    <div className="col-4 m-auto">
                                        {room.users.map((user, index) => (
                                            <span className={`px-1 ${!user.online && 'text-secondary'}`} key={user.playerId}>
                                                {user.username}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="col-4 text-end">
                                        <button className="btn btn-sm btn-primary"
                                                onClick={() => navigate(`/${room.roomId}`)}>
                                            Beitreten
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;