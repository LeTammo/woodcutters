import React, { useEffect } from "react";
import { socket } from "../socket";
import { useUser } from "../context/UserContext";

function RegisterUser() {
    const { playerId, setPlayerId, username, setUsername } = useUser();

    useEffect(() => {
        const handlePlayerId = (id) => {
            setPlayerId(id);
            localStorage.setItem('playerId', id);
        };

        if (!playerId) {
            socket.emit('requestPlayerId');
            socket.on('playerId', handlePlayerId);
        }

        return () => {
            socket.off('playerId', handlePlayerId);
        };
    }, [playerId]);

    useEffect(() => {
        if (playerId && username) {
            socket.emit('registerUser', { playerId, username });
        }
    }, [playerId, username]);

    const handleSetUsername = () => {
        const input = document.querySelector('input');
        const userName = input.value.trim();
        if (userName !== '') {
            setUsername(userName);
            localStorage.setItem('username', userName);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSetUsername();
        }
    };

    return (
        <div className="row align-items-center g-lg-5 py-5">
            <div className="mx-auto col-sm-12 col-md-10 col-lg-6">
                <div className="p-4 p-md-5 border rounded-3 bg-opacity-92">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control shadow-none"
                            placeholder="Wie möchtest du heißen?"
                            onKeyUp={handleKeyPress}
                        />
                        <button className="btn btn-success" onClick={handleSetUsername}>
                            Starten
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterUser;