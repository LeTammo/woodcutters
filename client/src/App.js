import React, { useState } from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import Room from './components/Room';
import './styles/App.css';

function App() {
    const handleSetUsername = () => {
        const username = document.querySelector('input').value;
        if (username.trim() !== '') {
            sessionStorage.setItem('username', username);
            setUsername(username);
        }
    };

    const [username, setUsername] = useState(sessionStorage.getItem('username'));

    if (!username) {
        return (
            <div className="container col-xl-10 col-xxl-8 px-4 py-5">
                <div className="row align-items-center g-lg-5 py-5">
                    <div className="col-md-10 mx-auto col-lg-5">
                        <div className="p-4 p-md-5 border rounded-3 bg-body-tertiary">
                            <input
                                type="text"
                                className="form-control mb-2"
                                placeholder="Benutzername"
                            />
                            <button className="btn btn-primary" onClick={handleSetUsername}>Benutzername setzen</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/:roomId" element={<Room/>}/>
            </Routes>
        </Router>
    );
}

export default App;