import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../socket';
import Game from './Game';

function Room() {
    const { roomId } = useParams();
    const [username, setUsername] = useState('');
    const [isUsernameSet, setIsUsernameSet] = useState(false);

    useEffect(() => {
        const savedUsername = sessionStorage.getItem('username');
        if (savedUsername) {
            setUsername(savedUsername);
            setIsUsernameSet(true);
            socket.emit('joinRoom', { roomId, username: savedUsername });
        }
    }, [roomId]);

    const handleSetUsername = () => {
        if (username.trim() !== '') {
            sessionStorage.setItem('username', username);
            setIsUsernameSet(true);
            socket.emit('joinRoom', { roomId, username });
        }
    };

    return (
        <div className="container mt-3">
            {!isUsernameSet ? (
                <div>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-control mb-2"
                        placeholder="Benutzername"
                    />
                    <button className="btn btn-primary" onClick={handleSetUsername}>Benutzername Setzen</button>
                </div>
            ) : (
                <Game roomId={roomId} username={username} />
            )}
        </div>
    );
}

export default Room;