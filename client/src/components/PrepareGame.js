import React from "react";

function PrepareGame({ isReady, handleReady }) {
    return (
        <button className={`btn ${isReady ? 'btn-secondary' : 'btn-success'} mt-3`}
                onClick={handleReady} disabled={isReady}>
            {isReady ? 'Bereit' : 'Bereit'}
        </button>
    )
}

export default PrepareGame;