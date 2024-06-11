import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

function Home() {
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    const createRoom = () => {
        const storedUsername = sessionStorage.getItem('username');
        const username = storedUsername || prompt("Geben Sie Ihren Benutzernamen ein:");
        if (!username) return;
        if (!storedUsername) {
            sessionStorage.setItem('username', username);
        }
        socket.emit('createRoom', username);
        socket.on('roomCreated', (id) => {
            navigate(`/${id}`);
        });
    };

    const joinRoom = () => {
        const storedUsername = sessionStorage.getItem('username');
        const username = storedUsername || prompt("Geben Sie Ihren Benutzernamen ein:");
        if (!username) return;
        if (!storedUsername) {
            sessionStorage.setItem('username', username);
        }
        if (roomId.trim() !== '') {
            navigate(`/${roomId}`);
        }
    };

    return (
        <div className="container col-xl-10 col-xxl-8 px-4 py-5">
            <div className="row align-items-center g-lg-5 py-5">
                <div className="col-md-10 mx-auto col-lg-5">
                    <div className="p-4 p-md-5 border rounded-3 bg-body-tertiary">
                        <div>
                            <button className="btn btn-success" onClick={createRoom}>Raum erstellen</button>
                        </div>
                        <div className="my-3">
                            oder
                        </div>
                        <div>
                            <input
                                type="text"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="form-control form-floating mb-3 my-5"
                                placeholder="Raum ID"
                            />
                        </div>
                        <div>
                            <button className="btn btn-primary" onClick={joinRoom}>Raum beitreten</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;