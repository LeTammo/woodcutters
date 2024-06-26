import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { useUser } from "../context/UserContext";
import ActiveRooms from "./ActiveRooms";

function Home() {
    const { playerId, username } = useUser();
    const [activeRooms, setActiveRooms] = useState([]);
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

    return (
        <div className="row align-items-center g-lg-5 py-5">
            <div className="mx-auto col-sm-12 col-md-10 col-lg-8">
                <div className="p-4 p-md-5 border rounded-3 bg-body-tertiary bg-opacity-92">
                    <h5 className="text-center mb-5">Hallo {username}!</h5>
                    <div>
                        <button className="btn btn-success" onClick={createRoom}>Raum erstellen</button>
                    </div>
                    {activeRooms.length > 0 && <ActiveRooms rooms={activeRooms} />}
                </div>
            </div>
        </div>
    );
}

export default Home;