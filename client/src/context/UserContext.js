import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [playerId, setPlayerId] = useState(localStorage.getItem('playerId'));
    const [username, setUsername] = useState(localStorage.getItem('username'));

    return (
        <UserContext.Provider value={{ playerId, setPlayerId, username, setUsername }}>
            {children}
        </UserContext.Provider>
    );
};
