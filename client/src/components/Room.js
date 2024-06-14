import React from 'react';
import { useParams } from 'react-router-dom';
import Game from './Game';

function Room({ playerId, username }) {
    const { roomId } = useParams();

    return (
        <Game roomId={roomId} playerId={playerId} username={username} />
    );
}

export default Room;