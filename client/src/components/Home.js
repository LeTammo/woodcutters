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
        <div className="container mt-5">
            <button className="btn btn-success" onClick={createRoom}>Neuen Raum erstellen</button>
            <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="form-control my-3"
                placeholder="Raum ID"
            />
            <button className="btn btn-primary" onClick={joinRoom}>Raum Beitreten</button>
        </div>
    );
}

export default Home;