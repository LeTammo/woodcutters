import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import RegisterUser from './components/RegisterUser';
import Home from './components/Home';
import Game from './components/Game';
import './styles/App.css';

function App() {
    const { playerId, username } = useUser();

    const isUserRegistered = playerId && username;

    return (
        <Router>
            <Routes>
                <Route path="/" element={isUserRegistered ? <Home /> : <RegisterUser />} />
                <Route path="/:roomId" element={isUserRegistered ? <Game /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default () => (
    <UserProvider>
        <App />
    </UserProvider>
);