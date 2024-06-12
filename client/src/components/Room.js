import React from 'react';
import { useParams } from 'react-router-dom';
import Game from './Game';

function Room() {
    const { roomId } = useParams();

    return (
        <div className="container mt-3">
            <Game roomId={roomId} username={sessionStorage.getItem('username')} />
        </div>
    );
}

export default Room;