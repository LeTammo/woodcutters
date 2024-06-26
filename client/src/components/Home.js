import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import ActiveRooms from './ActiveRooms';
import useSocket from '../hooks/useSocket';

function Home() {
    const { playerId, username } = useUser();
    const { activeRooms, roomId, getActiveRooms, createRoom } = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        getActiveRooms();
    }, [getActiveRooms]);

    useEffect(() => {
        if (roomId) {
            navigate(`/${roomId}`);
        }
    }, [roomId, navigate]);

    const handleCreateRoom = () => {
        createRoom(playerId, username);
    }

    return (
        <div className="row align-items-center g-lg-5 py-5">
            <div className="mx-auto col-sm-12 col-md-10 col-lg-8">
                <div className="p-4 p-md-5 border rounded-3 bg-body-tertiary bg-opacity-92">
                    <h5 className="text-center mb-5">Hallo {username}!</h5>
                    <div>
                        <button className="btn btn-success" onClick={handleCreateRoom}>Raum erstellen</button>
                    </div>
                    {activeRooms.length > 0 && <ActiveRooms rooms={activeRooms} />}
                </div>
            </div>
        </div>
    );
}

export default Home;