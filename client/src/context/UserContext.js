import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from "../socket";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [playerId, setPlayerId] = useState(localStorage.getItem('playerId'));
    const [username, setUsername] = useState(localStorage.getItem('username'));

    const isUserRegistered = playerId && username;

    useEffect(() => {
        const handlePlayerId = (id) => {
            setPlayerId(id);
            localStorage.setItem('playerId', id);
        };

        if (username && !playerId) {
            socket.emit('requestPlayerId', { username });
            socket.on('playerId', handlePlayerId);
        }

        return () => {
            socket.off('playerId', handlePlayerId);
        };
    }, [playerId, username]);

    useEffect(() => {
        if (playerId && username) {
            socket.emit('registerUser', { playerId, username });
        }
    }, [playerId, username]);

    return (
        <UserContext.Provider value={{
            playerId,
            setPlayerId,
            username,
            setUsername,
            isUserRegistered
        }}>
            {children}
        </UserContext.Provider>
    );
};