import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

function Home() {
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

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
            <div className="mx-auto col-sm-12 col-md-10 col-lg-6">
                <div className="p-4 p-md-5 border rounded-3 bg-body-tertiary">
                    <h5 className="text-center mb-5">Hallo {sessionStorage.getItem('username')} :)</h5>
                    <div>
                        <button className="btn btn-success" onClick={createRoom}>Raum erstellen</button>
                    </div>
                    <div className="my-3">oder</div>
                    <div>
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="form-control form-floating mb-3 shadow-none"
                            placeholder="Raum ID"
                        />
                    </div>
                    <div>
                        <button className="btn btn-primary" onClick={joinRoom}>Raum beitreten</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;