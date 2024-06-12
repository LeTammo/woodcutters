import React from 'react';
import { useParams } from 'react-router-dom';
import Game from './Game';

function Room() {
    const { roomId } = useParams();

    return (
        <Game roomId={roomId} username={sessionStorage.getItem('username')} />
    );
}

export default Room;