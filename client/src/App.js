import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Room from './components/Room';
import RegisterUser from './components/RegisterUser';
import './styles/App.css';

function App() {
    const [playerId, setPlayerId] = useState(localStorage.getItem('playerId'));
    const [username, setUsername] = useState(localStorage.getItem('username'));

    return (
        !username || !playerId
            ?
            <RegisterUser playerId={playerId} setPlayerId={setPlayerId} username={username} setUsername={setUsername} />
            :
            <Router>
                <Routes>
                    <Route path="/" element={<Home playerId={playerId} username={username} />} />
                    <Route path="/:roomId" element={<Room playerId={playerId} username={username} />} />
                </Routes>
            </Router>
    );
}

export default App;