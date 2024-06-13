import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

function Home() {
    const [activeRooms, setActiveRooms] = useState([]);
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        socket.emit('getActiveRooms');

        socket.on('activeRooms', rooms => {
            console.log(rooms);
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
        socket.emit('createRoom', sessionStorage.getItem('username'));
        socket.on('roomCreated', ({ roomId, playerId }) => {
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
                <div className="p-4 p-md-5 border rounded-3 bg-body-tertiary">
                    <h5 className="text-center mb-5">Hallo {sessionStorage.getItem('username')}!</h5>
                    <div>
                        <button className="btn btn-success" onClick={createRoom}>Raum erstellen</button>
                    </div>
                    {activeRooms.length > 0 && (
                        <div className="mt-5">
                            <h5>Aktive Lobbies</h5>
                            {activeRooms.map(room => (
                                <div key={room.roomId}
                                     className="p-2 mb-1 text-start bg-dark border rounded list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        {room.users.map((user, index) => (
                                            <span key={user.playerId}>
                                        {user.username}{index < room.users.length - 1 ? ', ' : ''}
                                    </span>
                                        ))}
                                    </div>
                                    <button className="btn btn-sm btn-primary"
                                            onClick={() => navigate(`/${room.roomId}`)}>Beitreten
                                    </button>
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