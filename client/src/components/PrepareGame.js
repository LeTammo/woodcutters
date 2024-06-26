import React from 'react';

function PrepareGame({ isReady, handleReady }) {
    return (
        isReady ? (
            <div className="mt-3">Wartet, bis alle Spieler bereit sind...</div>
        ) : (
            <button className="btn btn-success mt-3" onClick={handleReady} disabled={isReady}>Bereit</button>
        )
    )
}

export default PrepareGame;