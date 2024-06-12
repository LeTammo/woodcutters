import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSetUsername();
        }
    };

    const [username, setUsername] = useState(sessionStorage.getItem('username'));

    if (!username) {
        return (
            <div className="container px-4 py-5">
                <div className="row align-items-center g-lg-5 py-5">
                    <div className="mx-auto col-sm-12 col-md-10 col-lg-6">
                        <div className="p-4 p-md-5 border rounded-3 bg-body-tertiary">
                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
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